package com.ahorbit.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

// Plugin propio para gestionar los permisos de la captura automática de SMS:
// READ_SMS (leer inbox de respaldo), RECEIVE_SMS (que dispare SmsReceiver en
// tiempo real) y POST_NOTIFICATIONS (aviso local en Android 13+). El plugin
// capacitor-sms-inbox solo pide READ_SMS, así que aquí pedimos las tres juntas.
@CapacitorPlugin(
    name = "SmsCapture",
    permissions = {
        @Permission(alias = "sms", strings = {
            Manifest.permission.RECEIVE_SMS,
            Manifest.permission.READ_SMS
        }),
        @Permission(alias = "notifications", strings = {
            Manifest.permission.POST_NOTIFICATIONS
        })
    }
)
public class SmsCapturePlugin extends Plugin {

    @PluginMethod
    public void hasPermissions(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("granted", smsGranted());
        call.resolve(ret);
    }

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        if (smsGranted()) {
            JSObject ret = new JSObject();
            ret.put("granted", true);
            call.resolve(ret);
            return;
        }
        // Pide primero SMS; el callback pide notificaciones y resuelve.
        requestPermissionForAlias("sms", call, "smsPermsCallback");
    }

    @PermissionCallback
    private void smsPermsCallback(PluginCall call) {
        boolean granted = smsGranted();
        // Notificaciones solo aplica en Android 13+ (no bloquea la captura).
        if (granted && Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU
            && getPermissionState("notifications") != com.getcapacitor.PermissionState.GRANTED) {
            requestPermissionForAlias("notifications", call, "notifCallback");
            return;
        }
        JSObject ret = new JSObject();
        ret.put("granted", granted);
        call.resolve(ret);
    }

    @PermissionCallback
    private void notifCallback(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("granted", smsGranted());
        call.resolve(ret);
    }

    private boolean smsGranted() {
        return ContextCompat.checkSelfPermission(getContext(), Manifest.permission.RECEIVE_SMS)
                == PackageManager.PERMISSION_GRANTED
            && ContextCompat.checkSelfPermission(getContext(), Manifest.permission.READ_SMS)
                == PackageManager.PERMISSION_GRANTED;
    }
}
