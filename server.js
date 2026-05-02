// RTMP Bridge für html-obs-rtmp-bridge.html
// Voraussetzungen:
//   1) Node.js installieren
//   2) FFmpeg installieren und im PATH verfügbar machen
//   3) npm init -y
//   4) npm install ws
//   5) node server.js
//
// Danach in der HTML ws://localhost:8080 eintragen und verbinden.

const WebSocket = require("ws");
const { spawn } = require("child_process");

const wss = new WebSocket.Server({ port: 8080 });
console.log("RTMP Bridge läuft auf ws://localhost:8080");

wss.on("connection", (ws) => {
  let ffmpeg = null;
  let started = false;

  function stopFFmpeg() {
    if (ffmpeg) {
      ffmpeg.stdin.end();
      ffmpeg.kill("SIGINT");
      ffmpeg = null;
    }
    started = false;
  }

  ws.on("message", (message, isBinary) => {
    if (!isBinary) {
      let data;
      try {
        data = JSON.parse(message.toString());
      } catch {
        ws.send("Ungültige Steuer-Nachricht.");
        return;
      }

      if (data.type === "start") {
        stopFFmpeg();

        const target = `${data.rtmpUrl}/${data.streamKey}`;
        const bitrate = data.bitrate || "4500k";
        const fps = String(data.fps || 30);

        const args = [
          "-hide_banner",
          "-loglevel", "warning",
          "-fflags", "+genpts",
          "-f", "webm",
          "-i", "pipe:0",
          "-r", fps,
          "-c:v", "libx264",
          "-preset", "veryfast",
          "-tune", "zerolatency",
          "-b:v", bitrate,
          "-maxrate", bitrate,
          "-bufsize", "9000k",
          "-pix_fmt", "yuv420p",
          "-g", String((Number(fps) || 30) * 2),
          "-c:a", "aac",
          "-b:a", "160k",
          "-ar", "44100",
          "-f", "flv",
          target
        ];

        ffmpeg = spawn("ffmpeg", args, { stdio: ["pipe", "pipe", "pipe"] });
        started = true;

        ffmpeg.stderr.on("data", (chunk) => {
          const text = chunk.toString().trim();
          if (text) console.log("[ffmpeg]", text);
        });

        ffmpeg.on("close", (code) => {
          console.log("FFmpeg beendet:", code);
          started = false;
          ffmpeg = null;
        });

        ws.send("FFmpeg gestartet. RTMP-Ziel wird bespielt.");
      }

      if (data.type === "stop") {
        stopFFmpeg();
        ws.send("Stream gestoppt.");
      }

      return;
    }

    if (started && ffmpeg && ffmpeg.stdin.writable) {
      ffmpeg.stdin.write(message);
    }
  });

  ws.on("close", stopFFmpeg);
  ws.on("error", stopFFmpeg);
});
