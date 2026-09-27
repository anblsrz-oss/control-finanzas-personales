package com.ahorbit.app;

import android.app.Notification;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.Normalizer;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.TimeZone;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Pattern;

// Lee las notificaciones de las apps que el usuario marcó en
// /captura-notificaciones (banco, fintech, wallet, tiendas) y las reenvía a la
// Edge Function ingest-notification, que decide si es un movimiento y lo
// deduplica contra lo que ya llegó por SMS/correo. Requiere que el usuario dé
// "Acceso a notificaciones" en los Ajustes de Android (permiso especial; no se
// pide con un diálogo normal). Ver src/lib/notificationSync.ts.
//
// Privacidad: solo sale del teléfono el texto de las apps marcadas y solo si
// parece hablar de dinero (tiene un monto o confirma un envío/pago, como el
// "¡Enviamos tu transferencia!" de Mercado Pago, que no trae monto). Nada se
// guarda en el teléfono salvo la cola de reintento cuando no hay red.
public class PaymentNotificationListener extends NotificationListenerService {
    private static final String TAG = "PaymentNotifListener";
    private static final String CHANNEL_ID = "notif_capture";
    private static final String QUEUE_PREFS = "finzen_notif_queue";
    private static final String QUEUE_KEY = "queue";
    private static final int QUEUE_MAX = 200;
    private static final long DEDUPE_WINDOW_MS = 5 * 60_000L;

    // Monto: "$250", "$ 1,299.50", "250.00 MXN", "USD 12.99", "359,00".
    private static final Pattern MONEY = Pattern.compile(
        "(\\$|mxn|usd|eur|pesos)\\s?\\d|\\d[\\d.,]*\\s?(mxn|usd|eur|pesos)|\\d+[.,]\\d{2}\\b",
        Pattern.CASE_INSENSITIVE);

    // Salidas que no dicen cuánto (se comparan sin acentos). El servidor las
    // registra como "falta el monto" y aquí se avisa para completarlas.
    private static final Pattern SENT_NO_AMOUNT = Pattern.compile(
        "enviamos tu transferencia|transferencia (enviada|realizada|exitosa)|tu transferencia"
            + "|transferiste|enviaste|spei enviado|pagaste|pago (realizado|exitoso|aprobado|enviado)"
            + "|tu pago (fue|se)",
        Pattern.CASE_INSENSITIVE);

    // ¿El sistema tiene conectado este servicio? Lo apagan a veces los
    // fabricantes (Xiaomi al limpiar recientes, reinstalar, ahorro de batería):
    // el permiso sigue "concedido" pero no llega ninguna notificación.
    private static volatile boolean connected = false;
    private static volatile long lastRebindAt = 0L;
    private static final long REBIND_MIN_INTERVAL_MS = 10 * 60_000L;
    private static final long REBIND_GRACE_MS = 8_000L;

    // Avisos ya procesados (no repetir al repasar la barra al reconectar). Se
    // guarda en disco porque el proceso puede morir y el repaso corre en cada
    // conexión del servicio.
    private static final String SEEN_PREFS = "finzen_notif_seen";
    private static final String SEEN_KEY = "ids";
    private static final String SEEN_INIT_KEY = "init";
    private static final int SEEN_MAX = 300;
    // Al reconectar solo se repasan avisos recientes (los viejos ya no importan).
    private static final long BACKFILL_MAX_AGE_MS = 24L * 60 * 60_000L;

    // Un solo hilo: los envíos y la cola se procesan en orden, sin carreras.
    private static final ExecutorService EXECUTOR = Executors.newSingleThreadExecutor();

    // Android re-publica la misma notificación cuando la app la actualiza
    // (progreso, agrupación): ignorar el mismo texto de la misma app por 5 min.
    private static final Map<String, Long> RECENT = new LinkedHashMap<String, Long>() {
        @Override
        protected boolean removeEldestEntry(Map.Entry<String, Long> eldest) {
            return size() > 100;
        }
    };

    @Override
    public void onListenerConnected() {
        super.onListenerConnected();
        Log.i(TAG, "onListenerConnected");
        connected = true;
        // Al (re)conectarse, mandar lo que quedó pendiente sin red.
        final Context ctx = getApplicationContext();
        EXECUTOR.execute(() -> {
            flushQueueBlocking(ctx);
            backfillActive(ctx);
        });
    }

    @Override
    public void onListenerDisconnected() {
        super.onListenerDisconnected();
        Log.w(TAG, "onListenerDisconnected");
        connected = false;
    }

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        try {
            handle(sbn, false);
        } catch (Exception e) {
            Log.w(TAG, "No se pudo procesar la notificación", e);
        }
    }

    // baselineOnly: solo marca el aviso como ya visto, sin enviarlo (ver backfillActive).
    private void handle(StatusBarNotification sbn, boolean baselineOnly) throws Exception {
        final Context ctx = getApplicationContext();
        String pkg = sbn.getPackageName();
        if (pkg == null || pkg.equals(ctx.getPackageName())) return;

        SharedPreferences prefs = ctx.getSharedPreferences(IngestClient.PREFS, MODE_PRIVATE);
        if (!"true".equals(prefs.getString("notif_capture_on", null))) return;
        // Apps no marcadas: se ignoran sin dejar rastro (ni su nombre en el log).
        if (!csvContains(prefs.getString("notif_packages", ""), pkg)) return;

        Notification n = sbn.getNotification();
        if (n == null) {
            Log.i(TAG, "descartada (" + pkg + "): sin Notification");
            return;
        }
        if ((n.flags & Notification.FLAG_ONGOING_EVENT) != 0) {
            Log.i(TAG, "descartada (" + pkg + "): FLAG_ONGOING_EVENT");
            return;
        }
        if ((n.flags & Notification.FLAG_GROUP_SUMMARY) != 0) {
            Log.i(TAG, "descartada (" + pkg + "): FLAG_GROUP_SUMMARY");
            return;
        }

        // Los Log.i de aquí en adelante solo aplican a apps que el usuario
        // marcó y nunca escriben el texto de la notificación (privacidad);
        // sirven para diagnosticar con `adb logcat -s PaymentNotifListener`.
        Bundle extras = n.extras;
        if (extras == null) {
            Log.i(TAG, "descartada (" + pkg + "): sin extras");
            return;
        }
        String title = str(extras.getCharSequence(Notification.EXTRA_TITLE));
        String text = str(extras.getCharSequence(Notification.EXTRA_BIG_TEXT));
        if (text.isEmpty()) text = str(extras.getCharSequence(Notification.EXTRA_TEXT));
        if (text.isEmpty()) {
            CharSequence[] lines = extras.getCharSequenceArray(Notification.EXTRA_TEXT_LINES);
            if (lines != null) {
                StringBuilder sb = new StringBuilder();
                for (CharSequence l : lines) if (l != null) sb.append(l).append('\n');
                text = sb.toString().trim();
            }
        }
        // Respaldo para notificaciones de estilo personalizado sin EXTRA_TEXT:
        // EXTRA_SUB_TEXT/EXTRA_SUMMARY_TEXT a veces sí traen el monto aunque
        // el cuerpo principal esté vacío.
        if (text.isEmpty()) {
            text = str(extras.getCharSequence(Notification.EXTRA_SUB_TEXT));
        }
        if (text.isEmpty()) {
            text = str(extras.getCharSequence("android.summaryText")); // EXTRA_SUMMARY_TEXT
        }
        String full = (title + "\n" + text).trim();
        if (full.isEmpty()
            || (!MONEY.matcher(full).find() && !SENT_NO_AMOUNT.matcher(stripAccents(full)).find())) {
            Log.i(TAG, "descartada (" + pkg + "): sin texto o sin monto detectable");
            return;
        }

        // Un mismo aviso no se procesa dos veces aunque el servicio se reconecte.
        String seenId = pkg + "|" + full.hashCode() + "|" + sbn.getPostTime();
        if (baselineOnly) {
            markSeen(ctx, seenId);
            return;
        }
        if (!markSeen(ctx, seenId)) return;

        long now = System.currentTimeMillis();
        String key = pkg + "|" + full;
        synchronized (RECENT) {
            Long last = RECENT.get(key);
            if (last != null && now - last < DEDUPE_WINDOW_MS) return;
            RECENT.put(key, now);
        }

        long postedAt = sbn.getPostTime() > 0 ? sbn.getPostTime() : now;
        JSONObject item = new JSONObject();
        item.put("package", pkg);
        item.put("appName", appLabel(ctx, pkg));
        item.put("title", title);
        item.put("text", text);
        item.put("postedAt", postedAt);

        Log.i(TAG, "encolando (" + pkg + ")");
        final String preview = text.isEmpty() ? title : text;
        EXECUTOR.execute(() -> {
            enqueue(ctx, item);
            String response = flushQueueBlocking(ctx);
            if (response == null) Log.w(TAG, "envio fallido, queda en cola (" + pkg + ")");
            if (IngestClient.insertedCount(response) > 0) {
                IngestClient.notifyPending(ctx, CHANNEL_ID, "Captura de notificaciones", preview, response);
            }
            IngestClient.notifyAmountless(ctx, CHANNEL_ID, "Captura de notificaciones", response);
            IngestClient.notifyBudget(ctx, response);
        });
    }

    // --- Cola de reintento ---------------------------------------------------

    private static void enqueue(Context ctx, JSONObject item) {
        SharedPreferences q = ctx.getSharedPreferences(QUEUE_PREFS, MODE_PRIVATE);
        JSONArray arr = readQueue(q);
        arr.put(item);
        // Si se acumula demasiado (sin red por días), se tiran los más viejos.
        while (arr.length() > QUEUE_MAX) arr.remove(0);
        q.edit().putString(QUEUE_KEY, arr.toString()).apply();
    }

    private static JSONArray readQueue(SharedPreferences q) {
        try {
            return new JSONArray(q.getString(QUEUE_KEY, "[]"));
        } catch (Exception e) {
            return new JSONArray();
        }
    }

    /**
     * Envía toda la cola en un solo POST. Si responde 2xx la vacía y devuelve
     * la respuesta; si falla la conserva para el siguiente intento y devuelve null.
     * Debe correr en EXECUTOR (o en un hilo de fondo).
     */
    static String flushQueueBlocking(Context ctx) {
        IngestClient client = IngestClient.fromPrefs(ctx);
        if (client == null) return null;
        SharedPreferences q = ctx.getSharedPreferences(QUEUE_PREFS, MODE_PRIVATE);
        JSONArray arr = readQueue(q);
        if (arr.length() == 0) return null;
        try {
            JSONObject payload = new JSONObject();
            payload.put("tzOffsetMinutes",
                -TimeZone.getDefault().getOffset(System.currentTimeMillis()) / 60000);
            payload.put("notifications", arr);
            String response = client.post("ingest-notification", payload);
            if (response == null) return null;
            // Solo quitar lo enviado: pudo entrar algo nuevo mientras tanto.
            JSONArray current = readQueue(q);
            JSONArray rest = new JSONArray();
            for (int i = arr.length(); i < current.length(); i++) rest.put(current.get(i));
            q.edit().putString(QUEUE_KEY, rest.toString()).apply();
            return response;
        } catch (Exception e) {
            Log.w(TAG, "No se pudo vaciar la cola", e);
            return null;
        }
    }

    /** Para el plugin: vacía la cola en segundo plano y avisa cuántos quedan. */
    static void flushQueueAsync(Context ctx, Runnable done) {
        EXECUTOR.execute(() -> {
            flushQueueBlocking(ctx);
            if (done != null) done.run();
        });
    }

    static int queueSize(Context ctx) {
        return readQueue(ctx.getSharedPreferences(QUEUE_PREFS, MODE_PRIVATE)).length();
    }

    // --- Repaso de la barra al conectar ---------------------------------------

    /**
     * Al (re)conectarse el servicio, procesa los avisos que YA estaban en la
     * barra y no se habían visto (llegaron mientras el servicio estaba caído).
     * La primera vez solo marca lo que hay como visto (línea base), para no
     * reenviar avisos que se capturaron antes de que existiera este registro.
     */
    private void backfillActive(Context ctx) {
        SharedPreferences prefs = ctx.getSharedPreferences(IngestClient.PREFS, MODE_PRIVATE);
        if (!"true".equals(prefs.getString("notif_capture_on", null))) return;
        SharedPreferences seen = ctx.getSharedPreferences(SEEN_PREFS, MODE_PRIVATE);
        boolean baseline = !seen.getBoolean(SEEN_INIT_KEY, false);
        StatusBarNotification[] active;
        try {
            active = getActiveNotifications();
        } catch (Exception e) {
            Log.w(TAG, "no se pudo leer la barra al conectar", e);
            return;
        }
        if (active == null) return;
        long now = System.currentTimeMillis();
        int count = 0;
        for (StatusBarNotification sbn : active) {
            try {
                if (!baseline && now - sbn.getPostTime() > BACKFILL_MAX_AGE_MS) continue;
                handle(sbn, baseline);
                count++;
            } catch (Exception e) {
                Log.w(TAG, "repaso: no se pudo procesar un aviso", e);
            }
        }
        if (baseline) seen.edit().putBoolean(SEEN_INIT_KEY, true).apply();
        Log.i(TAG, (baseline ? "línea base de avisos: " : "repaso de avisos: ") + count + " revisados");
    }

    /** true si el id era nuevo (y queda registrado); false si ya se había procesado. */
    private static synchronized boolean markSeen(Context ctx, String id) {
        SharedPreferences p = ctx.getSharedPreferences(SEEN_PREFS, MODE_PRIVATE);
        JSONArray arr;
        try {
            arr = new JSONArray(p.getString(SEEN_KEY, "[]"));
        } catch (Exception e) {
            arr = new JSONArray();
        }
        for (int i = 0; i < arr.length(); i++) {
            if (id.equals(arr.optString(i))) return false;
        }
        arr.put(id);
        while (arr.length() > SEEN_MAX) arr.remove(0);
        p.edit().putString(SEEN_KEY, arr.toString()).apply();
        return true;
    }

    /** ¿El sistema tiene conectado el servicio en este momento? */
    static boolean isConnected() {
        return connected;
    }

    /**
     * Pide al sistema reconectar el servicio si algún fabricante lo mató.
     * requestRebind() solo sirve si el sistema ya lo había desconectado; cuando
     * el proceso murió (p. ej. al limpiar recientes en Xiaomi) el servicio se
     * queda sin conectar aunque el permiso siga concedido. Si tras unos segundos
     * sigue sin conectar, apagar y volver a encender el componente fuerza al
     * sistema a enlazarlo de nuevo (la espera evita enlazarlo dos veces cuando
     * el sistema ya lo estaba conectando). Máximo una vez cada 10 min.
     */
    static void requestRebindIfNeeded(final Context ctx) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) return;
        try {
            requestRebind(new ComponentName(ctx, PaymentNotificationListener.class));
        } catch (Exception e) {
            Log.w(TAG, "requestRebind falló", e);
        }
        if (connected) return;
        new Handler(Looper.getMainLooper()).postDelayed(
            () -> forceRebindIfStillDown(ctx), REBIND_GRACE_MS);
    }

    private static void forceRebindIfStillDown(Context ctx) {
        if (connected) return;
        long now = System.currentTimeMillis();
        if (now - lastRebindAt < REBIND_MIN_INTERVAL_MS) return;
        lastRebindAt = now;
        try {
            ComponentName cn = new ComponentName(ctx, PaymentNotificationListener.class);
            PackageManager pm = ctx.getPackageManager();
            pm.setComponentEnabledSetting(cn, PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                PackageManager.DONT_KILL_APP);
            pm.setComponentEnabledSetting(cn, PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
                PackageManager.DONT_KILL_APP);
            Log.i(TAG, "reconexión forzada del servicio");
        } catch (Exception e) {
            Log.w(TAG, "no se pudo forzar la reconexión", e);
        }
    }

    // --- Utilidades --------------------------------------------------------

    private static boolean csvContains(String csv, String value) {
        if (csv == null || csv.isEmpty()) return false;
        for (String s : csv.split(",")) {
            if (s.trim().equalsIgnoreCase(value)) return true;
        }
        return false;
    }

    private static String stripAccents(String s) {
        return Normalizer.normalize(s, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
    }

    private static String str(CharSequence cs) {
        return cs == null ? "" : cs.toString().trim();
    }

    private static String appLabel(Context ctx, String pkg) {
        try {
            PackageManager pm = ctx.getPackageManager();
            ApplicationInfo ai = pm.getApplicationInfo(pkg, 0);
            return pm.getApplicationLabel(ai).toString();
        } catch (Exception e) {
            return pkg;
        }
    }

}
