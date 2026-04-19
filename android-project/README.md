# PocketMC Host - Deployment Guide

This project contains the full source code structure and logic for a production-ready Minecraft mobile host.

## 1. Web Dashboard (Live Preview)
The main web dashboard included in this applet serves as a high-fidelity prototype of the mobile interface. It uses React + Tailwind CSS with a "Hardware Specialist" aesthetic.

## 2. Android Native Logic
The `/android-project` folder contains the critical native components:
- `MinecraftHostService.java`: A Foreground Service that ensures the server remains active even when the screen is off or the app is in the background.
- `MinecraftProcessManager.java`: The core Java logic to spawn the Minecraft server process using an embedded JRE.

## 3. How to Bunlde OpenJDK 17 for Android
To run PaperMC, you need a Java Runtime Environment. Since Android does not include a full JDK, you must bundle one:
1. Obtain an ARM64 build of OpenJDK 17 (e.g., from the Termux packages or a custom build like "Jre4Android").
2. Place the shared libraries (`.so` files) in `src/main/jniLibs/arm64-v8a/`.
3. The `MinecraftProcessManager` will locate the `libjava.so` binary and use it to execute the server JAR.

## 4. Networking & 24/7 Uptime
- **Ngrok Tunneling**: Use the Ngrok Android SDK or run the ngrok binary as a separate process to create a public tunnel.
- **WakeLock**: The Android service implements a WakeLock (in a production build) to prevent the CPU from entering deep sleep.
- **Battery Optimization**: Users must disable battery optimization for PocketMC Host in Android settings to ensure 24/7 reliability.

## 5. Pro-Tip: Optimized Configs
The provided `templates/server.properties.optimized` reduces `view-distance` and `simulation-distance` to minimize CPU/RAM strain, which is critical for mobile hardware.
