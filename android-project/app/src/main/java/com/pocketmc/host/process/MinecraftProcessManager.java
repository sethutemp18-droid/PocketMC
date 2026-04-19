package com.pocketmc.host.process;

import android.content.Context;
import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;

/**
 * Manages the execution of the Java process for Minecraft.
 * Handles stdout/stderr redirection and command injection.
 */
public class MinecraftProcessManager {
    private Process minecraftProcess;
    private final Context context;
    private StatusListener listener;

    public interface StatusListener {
        void onStatusUpdate(String status);
    }

    public MinecraftProcessManager(Context context) {
        this.context = context;
    }

    public synchronized void startServer(String serverPath, int ramMb, StatusListener listener) {
        this.listener = listener;
        if (minecraftProcess != null) {
            listener.onStatusUpdate("Already Running");
            return;
        }

        new Thread(() -> {
            try {
                File workDir = new File(serverPath);
                
                // Path to embedded JRE (this would need to be extracted from assets/jni)
                String javaBinary = context.getApplicationInfo().nativeLibraryDir + "/libjava.so";
                
                List<String> command = new ArrayList<>();
                command.add(javaBinary);
                command.add("-Xmx" + ramMb + "M");
                command.add("-Xms" + ramMb + "M");
                command.add("-jar");
                command.add("server.jar");
                command.add("nogui");

                ProcessBuilder pb = new ProcessBuilder(command);
                pb.directory(workDir);
                pb.redirectErrorStream(true);

                minecraftProcess = pb.start();
                listener.onStatusUpdate("Running");

                BufferedReader reader = new BufferedReader(new InputStreamReader(minecraftProcess.getInputStream()));
                String line;
                while ((line = reader.readLine()) != null) {
                    // Send this line to the Flutter UI via MethodChannel or EventChannel
                    System.out.println("[PocketMC Log] " + line);
                }

                int exitCode = minecraftProcess.waitFor();
                minecraftProcess = null;
                listener.onStatusUpdate("Stopped (Exit: " + exitCode + ")");

            } catch (Exception e) {
                listener.onStatusUpdate("Error: " + e.getMessage());
                minecraftProcess = null;
            }
        }).start();
    }

    public void sendCommand(String cmd) {
        if (minecraftProcess != null) {
            try {
                OutputStream os = minecraftProcess.getOutputStream();
                os.write((cmd + "\n").getBytes());
                os.flush();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    public void stopServer() {
        if (minecraftProcess != null) {
            sendCommand("stop");
            // Optionally force kill if it doesn't stop after timeout
        }
    }
}
