package com.ahorbit.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.provider.Telephony;
import android.telephony.SmsMessage;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.TimeZone;

// Recibe los SMS entrantes (app abierta o CERRADA) y los reenvía a la Edge
// Function ingest-sms, que parsea e inserta la transacción pendiente. La config
// (token, URL, anon key, remitentes) la escribe el JS en Preferences
// (@capacitor/preferences -> SharedPreferences "CapacitorStorage").
public class SmsReceiver extends BroadcastReceiver {
    private static final String TAG = "SmsReceiver";
    private static final String PREFS = "CapacitorStorage";
    private static final String CHANNEL_ID = "sms_capture";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (!Telephony.Sms.Intents.SMS_RECEIVED_ACTION.equals(intent.getAction())) return;

        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        final String token = prefs.getString("sms_ingest_token", null);
        final String url = prefs.getString("sms_supabase_url", null);
        final String anon = prefs.getString("sms_anon_key", null);
        final String sendersCsv = prefs.getString("sms_senders", "");
        // Sin captura activada no hacemos nada.
        if (token == null || url == null || anon == null) return;

        // Reconstruir el mensaje (los SMS largos llegan en varias partes).
        SmsMessage[] parts = Telephony.Sms.Intents.getMessagesFromIntent(intent);
        if (parts == null || parts.length == 0) return;
        StringBuilder bodyBuilder = new StringBuilder();
        String address = null;
        long date = System.currentTimeMillis();
        for (SmsMessage p : parts) {
            if (p == null) continue;
            if (address == null) address = p.getOriginatingAddress();
            bodyBuilder.append(p.getMessageBody());
            date = p.getTimestampMillis();
        }
        final String body = bodyBuilder.toString();
        final String sender = address == null ? "" : address;

        // Filtrar por remitentes configurados (si hay lista).
        if (!senderMatches(sender, sendersCsv)) return;

        final int tzOffsetMin = -TimeZone.getDefault().getOffset(date) / 60000;
        final PendingResult pending = goAsync();
        new Thread(() -> {
            try {
                boolean ok = post(url, anon, token, sender, body, date, tzOffsetMin);
                if (ok) notify(context, body);
            } catch (Exception e) {
                Log.w(TAG, "Fallo al enviar SMS a ingest-sms", e);
            } finally {
                pending.finish();
            }
        }).start();
    }

    private boolean senderMatches(String sender, String sendersCsv) {
        if (sendersCsv == null || sendersCsv.trim().isEmpty()) return true; // sin filtro
        String low = sender.toLowerCase();
        for (String s : sendersCsv.split(",")) {
            String t = s.trim().toLowerCase();
            if (!t.isEmpty() && low.contains(t)) return true;
        }
        return false;
    }

    private boolean post(String url, String anon, String token, String sender,
                         String body, long date, int tzOffsetMin) throws Exception {
        JSONObject msg = new JSONObject();
        msg.put("address", sender);
        msg.put("body", body);
        msg.put("date", date);
        JSONArray messages = new JSONArray();
        messages.put(msg);
        JSONObject payload = new JSONObject();
        payload.put("token", token);
        payload.put("tzOffsetMinutes", tzOffsetMin);
        payload.put("messages", messages);

        URL endpoint = new URL(url.replaceAll("/+$", "") + "/functions/v1/ingest-sms");
        HttpURLConnection conn = (HttpURLConnection) endpoint.openConnection();
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
        conn.disconnect();
        return code >= 200 && code < 300;
    }

    private void notify(Context context, String body) {
        try {
            NotificationManager nm =
                (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                NotificationChannel ch = new NotificationChannel(
                    CHANNEL_ID, "Captura de SMS", NotificationManager.IMPORTANCE_LOW);
                nm.createNotificationChannel(ch);
            }
            NotificationCompat.Builder b = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.stat_notify_chat)
                .setContentTitle("Movimiento pendiente por revisar")
                .setContentText(body.length() > 80 ? body.substring(0, 80) + "…" : body)
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_LOW);
            nm.notify((int) (System.currentTimeMillis() & 0x7fffffff), b.build());
        } catch (Exception e) {
            Log.w(TAG, "No se pudo mostrar la notificación", e);
        }
    }
}
