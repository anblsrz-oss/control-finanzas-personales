package com.ahorbit.app;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import android.os.Build;
import android.provider.Settings;
import android.util.Base64;

import androidx.core.app.NotificationManagerCompat;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.ByteArrayOutputStream;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

// Puente JS <-> PaymentNotificationListener: saber si el usuario ya dio
// "Acceso a notificaciones", abrir esa pantalla de Ajustes, listar las apps
// instaladas para que elija cuáles escuchar y vaciar la cola de reintento.
@CapacitorPlugin(name = "NotificationCapture")
public class NotificationCapturePlugin extends Plugin {

    @PluginMethod
    public void isAccessGranted(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("granted", accessGranted());
        call.resolve(ret);
    }

    @PluginMethod
    public void openAccessSettings(PluginCall call) {
        Context ctx = getContext();
        Intent intent;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // Android 11+: directo a la ficha de ESTA app en la lista.
            intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_DETAIL_SETTINGS);
            intent.putExtra(Settings.EXTRA_NOTIFICATION_LISTENER_COMPONENT_NAME,
                new ComponentName(ctx, PaymentNotificationListener.class).flattenToString());
        } else {
            intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
        }
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            ctx.startActivity(intent);
        } catch (Exception e) {
            // Algunas ROMs no tienen la pantalla de detalle: lista general.
            Intent fallback = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
            fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            ctx.startActivity(fallback);
        }
        call.resolve();
    }

    @PluginMethod
    public void listInstalledApps(PluginCall call) {
        new Thread(() -> {
            try {
                Context ctx = getContext();
                PackageManager pm = ctx.getPackageManager();
                Intent launcher = new Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER);
                List<ResolveInfo> infos = pm.queryIntentActivities(launcher, 0);
                Set<String> seen = new HashSet<>();
                JSArray apps = new JSArray();
                for (ResolveInfo ri : infos) {
                    String pkg = ri.activityInfo.packageName;
                    if (pkg.equals(ctx.getPackageName()) || !seen.add(pkg)) continue;
                    JSObject app = new JSObject();
                    app.put("packageName", pkg);
                    app.put("label", ri.loadLabel(pm).toString());
                    app.put("icon", iconBase64(ri.loadIcon(pm)));
                    apps.put(app);
                }
                JSObject ret = new JSObject();
                ret.put("apps", apps);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("No se pudo listar las apps instaladas", e);
            }
        }).start();
    }

    @PluginMethod
    public void flushQueue(PluginCall call) {
        Context ctx = getContext();
        if (accessGranted()) PaymentNotificationListener.requestRebindIfNeeded(ctx);
        PaymentNotificationListener.flushQueueAsync(ctx, () -> {
            JSObject ret = new JSObject();
            ret.put("pending", PaymentNotificationListener.queueSize(ctx));
            call.resolve(ret);
        });
    }

    private boolean accessGranted() {
        Context ctx = getContext();
        return NotificationManagerCompat.getEnabledListenerPackages(ctx)
            .contains(ctx.getPackageName());
    }

    // Ícono pequeño (48 px) en PNG base64 para la lista de la página.
    private static String iconBase64(Drawable d) {
        try {
            int size = 48;
            Bitmap bmp = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888);
            Canvas canvas = new Canvas(bmp);
            d.setBounds(0, 0, size, size);
            d.draw(canvas);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            bmp.compress(Bitmap.CompressFormat.PNG, 100, out);
            return "data:image/png;base64," + Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP);
        } catch (Exception e) {
            return null;
        }
    }
}
