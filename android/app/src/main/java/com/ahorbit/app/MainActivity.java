package com.ahorbit.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Registrar el plugin propio de permisos de SMS antes de crear el bridge.
        registerPlugin(SmsCapturePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
