package com.ahorbit.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Registrar los plugins propios (permisos de SMS y acceso a
        // notificaciones) antes de crear el bridge.
        registerPlugin(SmsCapturePlugin.class);
        registerPlugin(NotificationCapturePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
