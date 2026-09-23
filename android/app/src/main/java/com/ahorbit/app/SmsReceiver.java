package com.ahorbit.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.provider.Telephony;
import android.telephony.SmsMessage;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.TimeZone;

// Recibe los SMS entrantes (app abierta o CERRADA) y los reenvía a la Edge
// Function ingest-sms, que parsea e inserta la transacción pendiente. La config
// (token, URL, anon key, remitentes) la escribe el JS en Preferences
// (@capacitor/preferences -> SharedPreferences "CapacitorStorage").
public class SmsReceiver extends BroadcastReceiver {
    private static final String CHANNEL_ID = "sms_capture";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (!Telephony.Sms.Intents.SMS_RECEIVED_ACTION.equals(intent.getAction())) return;

        // Sin captura activada no hacemos nada.
        final IngestClient client = IngestClient.fromPrefs(context);
        if (client == null) return;
        android.content.SharedPreferences prefs =
            context.getSharedPreferences(IngestClient.PREFS, Context.MODE_PRIVATE);
        // El token también lo usa la captura de notificaciones: si el usuario
        // apagó solo la de SMS, el token sigue pero este flag queda en "false".
        if ("false".equals(prefs.getString("sms_capture_on", null))) return;
        String sendersCsv = prefs.getString("sms_senders", "");

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
        final long smsDate = date;

        // Filtrar por remitentes configurados (si hay lista).
        if (!senderMatches(sender, sendersCsv)) return;

        final int tzOffsetMin = -TimeZone.getDefault().getOffset(smsDate) / 60000;
        final PendingResult pending = goAsync();
        new Thread(() -> {
            try {
                JSONObject msg = new JSONObject();
                msg.put("address", sender);
                msg.put("body", body);
                msg.put("date", smsDate);
                JSONObject payload = new JSONObject();
                payload.put("tzOffsetMinutes", tzOffsetMin);
                payload.put("messages", new JSONArray().put(msg));

                String response = client.post("ingest-sms", payload);
                // Solo avisar si de verdad entró algo nuevo: si el cargo ya había
                // llegado por notificación/correo se fusionó y no hay nada que revisar.
                if (IngestClient.insertedCount(response) > 0) {
                    IngestClient.notifyPending(context, CHANNEL_ID, "Captura de SMS", body);
                }
                IngestClient.notifyBudget(context, response);
            } catch (Exception ignored) {
                // IngestClient ya registra el error; el fallback es el re-sync del inbox.
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
}
