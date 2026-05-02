HTML OBS RTMP Bridge Edition
============================

Diese Datei ist kein vollständiges OBS, aber eine realistische Browser-Version:

- Kamera/Mikro im Browser
- Szenen/Overlay
- lokale Aufnahme
- RTMP-Einstellungen
- WebSocket-Verbindung zu einer lokalen Node.js-Bridge
- Bridge nutzt FFmpeg, um WebM aus dem Browser zu RTMP/Twitch umzuwandeln

Start:

1. FFmpeg installieren.
2. Node.js installieren.
3. In diesem Ordner ausführen:

   npm init -y
   npm install ws
   node server.js

4. html-obs-rtmp-bridge.html im Browser öffnen.
5. Kamera/Mikro starten.
6. RTMP URL und Twitch Stream-Key eintragen.
7. Bridge verbinden.
8. RTMP Stream starten.

Wichtige Sicherheit:
- Stream-Key niemals veröffentlichen.
- Diese Demo ist für lokale Nutzung gedacht.
- Für stabilen Produktivbetrieb ist OBS weiterhin besser.
