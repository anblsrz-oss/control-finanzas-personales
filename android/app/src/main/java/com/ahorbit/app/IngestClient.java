package com.ahorbit.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

// Lo común a los capturadores nativos (SmsReceiver, PaymentNotificationListener):
// leer la config que escribe el JS en Preferences, hacer POST a una Edge
// Function de ingesta y mostrar los avisos locales que devuelve.
final class IngestClient {
    private static final String TAG = "IngestClient";
    static final String PREFS = "CapacitorStorage";
    // Canal aparte y con más importancia: "te estás pasando del presupuesto"
    // merece verse más que "hay un movimiento por revisar", y así el usuario
    // puede silenciar uno sin perder el otro.
    private static final String BUDGET_CHANNEL_ID = "budget_alerts";

    final String url;
    final String anon;
    final String token;

    private IngestClient(String url, String anon, String token) {
        this.url = url;
        this.anon = anon;
        this.token = token;
    }

    /** Config de captura escrita por src/lib/smsSync.ts, o null si no está activada. */
    static IngestClient fromPrefs(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String token = prefs.getString("sms_ingest_token", null);
        String url = prefs.getString("sms_supabase_url", null);
        String anon = prefs.getString("sms_anon_key", null);
        if (token == null || url == null || anon == null) return null;
        return new IngestClient(url, anon, token);
    }

    /**
     * POST a /functions/v1/{function}. Devuelve el cuerpo si respondió 2xx
     * ("" si no se pudo leer), o null si falló (red o error del servidor).
     */
    String post(String function, JSONObject payload) {
        HttpURLConnection conn = null;
        try {
            payload.put("token", token);
            URL endpoint = new URL(url.replaceAll("/+$", "") + "/functions/v1/" + function);
            conn = (HttpURLConnection) endpoint.openConnection();
            conn.setConnectTimeout(8000);
            conn.setReadTimeout(8000);
            conn.setRequestMethod("POST");
            conn.setDoOutput(true);
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("apikey", anon);
            conn.setRequestProperty("Authorization", "Bearer " + anon);
            byte[] out = payload.toString().getBytes("UTF-8");
            try (OutputStream os = conn.getOutputStream()) {
                os.write(out);
            }
            int code = conn.getResponseCode();
            if (code < 200 || code >= 300) return null;
            try (InputStream is = conn.getInputStream()) {
                return readAll(is);
            } catch (Exception e) {
                // El movimiento ya se guardó; sin cuerpo solo perdemos los avisos.
                return "";
            }
        } catch (Exception e) {
            Log.w(TAG, "Fallo al llamar " + function, e);
            return null;
        } finally {
            if (conn != null) conn.disconnect();
        }
    }

    private static String readAll(InputStream is) throws Exception {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader r = new BufferedReader(new InputStreamReader(is, "UTF-8"))) {
            String line;
            while ((line = r.readLine()) != null) sb.append(line);
        }
        return sb.toString();
    }

    /** Cuántos movimientos nuevos se insertaron según la respuesta. */
    static int insertedCount(String response) {
        try {
            if (response == null || response.isEmpty()) return 0;
            return new JSONObject(response).optInt("inserted", 0);
        } catch (Exception e) {
            return 0;
        }
    }

    // Aviso de presupuesto que mandan ingest-sms / ingest-notification cuando
    // el gasto capturado acerca al usuario a su tope. Llega con la app CERRADA.
    static void notifyBudget(Context context, String response) {
        try {
            if (response == null || response.isEmpty()) return;
            JSONObject notice = new JSONObject(response).optJSONObject("budgetNotice");
            if (notice == null) return;
            String title = notice.optString("title", "");
            String text = notice.optString("body", "");
            if (title.isEmpty()) return;

            NotificationManager nm =
                (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                nm.createNotificationChannel(new NotificationChannel(
                    BUDGET_CHANNEL_ID, "Presupuestos", NotificationManager.IMPORTANCE_DEFAULT));
            }
            NotificationCompat.Builder b =
                new NotificationCompat.Builder(context, BUDGET_CHANNEL_ID)
                    .setSmallIcon(android.R.drawable.stat_notify_chat)
                    .setContentTitle(title)
                    .setContentText(text)
                    .setStyle(new NotificationCompat.BigTextStyle().bigText(text))
                    .setAutoCancel(true)
                    .setPriority(NotificationCompat.PRIORITY_DEFAULT);
            nm.notify((int) ((System.currentTimeMillis() + 1) & 0x7fffffff), b.build());
        } catch (Exception e) {
            Log.w(TAG, "No se pudo mostrar el aviso de presupuesto", e);
        }
    }

    // "Movimiento pendiente por revisar", en un canal de baja importancia.
    static void notifyPending(Context context, String channelId, String channelName, String text) {
        try {
            NotificationManager nm =
                (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                nm.createNotificationChannel(new NotificationChannel(
                    channelId, channelName, NotificationManager.IMPORTANCE_LOW));
            }
            NotificationCompat.Builder b = new NotificationCompat.Builder(context, channelId)
                .setSmallIcon(android.R.drawable.stat_notify_chat)
                .setContentTitle("Movimiento pendiente por revisar")
                .setContentText(text.length() > 80 ? text.substring(0, 80) + "…" : text)
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_LOW);
            nm.notify((int) (System.currentTimeMillis() & 0x7fffffff), b.build());
        } catch (Exception e) {
            Log.w(TAG, "No se pudo mostrar la notificación", e);
        }
    }
}
