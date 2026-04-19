package com.pocketmc.host.service;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import com.pocketmc.host.MainActivity;
import com.pocketmc.host.R;
import com.pocketmc.host.process.MinecraftProcessManager;

/**
 * Foreground service to keep the Minecraft server running 24/7.
 * Prevents Android from killing the Java process when the app is in background.
 */
public class MinecraftHostService extends Service {
    private static final String CHANNEL_ID = "MinecraftHostChannel";
    private static final int NOTIFICATION_ID = 101;
    private MinecraftProcessManager processManager;

    @Override
    public void onCreate() {
        super.onCreate();
        processManager = new MinecraftProcessManager(this);
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String action = intent.getAction();
        
        if ("START_SERVER".equals(action)) {
            String serverPath = intent.getStringExtra("SERVER_PATH");
            int ramMb = intent.getIntExtra("RAM_MB", 1024);
            startForeground(NOTIFICATION_ID, getNotification("Server: Starting..."));
            processManager.startServer(serverPath, ramMb, status -> {
                updateNotification("Server: " + status);
            });
        } else if ("STOP_SERVER".equals(action)) {
            processManager.stopServer();
            stopForeground(true);
            stopSelf();
        }

        return START_STICKY;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Minecraft Host Service Channel",
                    NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(serviceChannel);
        }
    }

    private Notification getNotification(String text) {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this,
                0, notificationIntent, PendingIntent.FLAG_IMMUTABLE);

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("PocketMC Host")
                .setContentText(text)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentIntent(pendingIntent)
                .build();
    }

    private void updateNotification(String text) {
        NotificationManager manager = getSystemService(NotificationManager.class);
        manager.notify(NOTIFICATION_ID, getNotification(text));
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
