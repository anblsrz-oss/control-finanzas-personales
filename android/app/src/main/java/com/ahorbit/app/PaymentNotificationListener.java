package com.ahorbit.app;

import android.app.Notification;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;

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
// parece hablar de dinero (tiene un monto). Nada se guarda en el teléfono salvo
// la cola de reintento cuando no hay red.
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
        Log.i(TAG, "onListenerConnected"); // DIAGNÓSTICO TEMPORAL
        // Al (re)conectarse, mandar lo que quedó pendiente sin red.
        final Context ctx = getApplicationContext();
        EXECUTOR.execute(() -> flushQueueBlocking(ctx));
    }

    @Override
    public void onListenerDisconnected() {
        super.onListenerDisconnected();
        Log.w(TAG, "onListenerDisconnected"); // DIAGNÓSTICO TEMPORAL
    }

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        try {
            handle(sbn);
        } catch (Exception e) {
            Log.w(TAG, "No se pudo procesar la notificación", e);
        }
    }

    private void handle(StatusBarNotification sbn) throws Exception {
        final Context ctx = getApplicationContext();
        String pkg = sbn.getPackageName();
        // DIAGNÓSTICO TEMPORAL (quitar cuando se confirme la causa de que
        // Mercado Pago/Nu no se capturan): confirma en logcat que el sistema
        // SÍ nos está entregando cada notificación, sin importar el filtro.
        Log.i(TAG, "onNotificationPosted pkg=" + pkg);
        if (pkg == null || pkg.equals(ctx.getPackageName())) return;

        SharedPreferences prefs = ctx.getSharedPreferences(IngestClient.PREFS, MODE_PRIVATE);
        if (!"true".equals(prefs.getString("notif_capture_on", null))) {
            Log.i(TAG, "descartada (" + pkg + "): captura apagada");
            return;
        }
        if (!csvContains(prefs.getString("notif_packages", ""), pkg)) {
            Log.i(TAG, "descartada (" + pkg + "): app no marcada");
            return;
        }

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

        Bundle extras = n.extras;
        if (extras == null) {
            Log.i(TAG, "descartada (" + pkg + "): sin extras");
            return;
        }
        // DIAGNÓSTICO TEMPORAL: algunas apps (Mercado Pago, wallets) arman su
        // notificación con un layout propio (RemoteViews/estilo personalizado)
        // y NO llenan EXTRA_TITLE/EXTRA_TEXT como una notificación normal — en
        // ese caso el texto sale vacío aquí aunque en pantalla se vea bien.
        // Dump completo de llaves+tipos+valor para confirmarlo o descartarlo.
        StringBuilder dump = new StringBuilder();
        for (String k : extras.keySet()) {
            Object v = extras.get(k);
            dump.append(k).append('=')
                .append(v == null ? "null" : (v.getClass().getSimpleName() + ":" + v))
                .append(" | ");
        }
        Log.i(TAG, "extras (" + pkg + "): " + dump);

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
        Log.i(TAG, "texto extraido (" + pkg + "): \"" + full.replace("\n", "\\n") + "\"");
        if (full.isEmpty() || !MONEY.matcher(full).find()) {
            Log.i(TAG, "descartada (" + pkg + "): sin texto o sin monto detectable");
            return;
        }

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
            Log.i(TAG, "respuesta del servidor: " + response);
            if (IngestClient.insertedCount(response) > 0) {
                IngestClient.notifyPending(ctx, CHANNEL_ID, "Captura de notificaciones", preview);
            }
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

    /** Pide al sistema reconectar el servicio si algún fabricante lo mató. */
    static void requestRebindIfNeeded(Context ctx) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            try {
                requestRebind(new ComponentName(ctx, PaymentNotificationListener.class));
            } catch (Exception e) {
                Log.w(TAG, "requestRebind falló", e);
            }
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
