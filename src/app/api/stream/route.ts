import { spawn } from "node:child_process";
import { createReadStream } from "node:fs";
import { mkdtemp, rm, readdir, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Resolve the bundled ffmpeg binary path (from imageio-ffmpeg).
function getFfmpegPath(): Promise<string | null> {
  return new Promise((resolve) => {
    const proc = spawn("python3", [
      "-c",
      "import imageio_ffmpeg,sys;sys.stdout.write(imageio_ffmpeg.get_ffmpeg_exe())",
    ]);
    let out = "";
    proc.stdout.on("data", (d) => (out += d.toString()));
    proc.on("close", (code) => resolve(code === 0 && out.trim() ? out.trim() : null));
    proc.on("error", () => resolve(null));
  });
}

// Streams a YouTube video/audio through our own server using yt-dlp + ffmpeg.
// Works with NO size limits and merges hi-res (720p/1080p) video+audio.
//
// Query params:
//   url    - YouTube video URL (required)
//   fmt    - "audio" for MP3, otherwise merged video
//   height - target video height (e.g. 1080, 720, 480, 360, 240)
//   title  - optional filename base
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const fmt = searchParams.get("fmt") || "video";
  const height = parseInt(searchParams.get("height") || "0", 10);
  const titleParam = searchParams.get("title") || "video";

  if (!url) return new Response("Missing url", { status: 400 });

  const youtubeRegex =
    /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/live\/|music\.youtube\.com\/watch\?v=)[\w-]+/;
  if (!youtubeRegex.test(url)) return new Response("Invalid URL", { status: 400 });

  const isAudio = fmt === "audio";
  const ffmpeg = await getFfmpegPath();

  const safeTitle =
    titleParam.replace(/[^a-zA-Z0-9-_ ]/g, "").trim().slice(0, 80) || "video";
  const ext = isAudio ? "mp3" : "mp4";

  // Build a temp working directory so ffmpeg can seek during muxing.
  const workDir = await mkdtemp(join(tmpdir(), "vidgrab-"));
  const outTemplate = join(workDir, "out.%(ext)s");

  // Build the format selector once.
  const formatArgs: string[] = [];
  if (isAudio) {
    if (ffmpeg) {
      formatArgs.push("-f", "bestaudio/best", "-x", "--audio-format", "mp3");
    } else {
      formatArgs.push("-f", "bestaudio[ext=m4a]/bestaudio");
    }
  } else {
    const h = height > 0 ? height : 1080;
    if (ffmpeg) {
      formatArgs.push(
        "-f",
        `bestvideo[height<=${h}]+bestaudio/best[height<=${h}]/best`,
        "--merge-output-format",
        "mp4"
      );
    } else {
      formatArgs.push("-f", "best[ext=mp4][acodec!=none][vcodec!=none]/best");
    }
  }

  // Try clients in order: "default" (web) gives full quality up to 4K; "tv"
  // and "android" are fallbacks that survive bot checks. First success wins.
  const runWithClient = (client: string): Promise<boolean> =>
    new Promise((resolve) => {
      const args: string[] = [
        "-m",
        "yt_dlp",
        "--no-warnings",
        "--no-playlist",
        "--no-check-certificate",
        "--extractor-args",
        `youtube:player_client=${client}`,
        "-o",
        outTemplate,
      ];
      if (ffmpeg) args.push("--ffmpeg-location", ffmpeg);
      args.push(...formatArgs, url);

      const proc = spawn("python3", args);
      const timer = setTimeout(() => {
        proc.kill("SIGKILL");
        resolve(false);
      }, 280000);
      proc.stderr.on("data", () => {});
      proc.stdout.on("data", () => {});
      proc.on("error", () => {
        clearTimeout(timer);
        resolve(false);
      });
      proc.on("close", (code) => {
        clearTimeout(timer);
        resolve(code === 0);
      });
    });

  const clients = ["default", "tv", "android"];
  let finished = false;
  for (const client of clients) {
    finished = await runWithClient(client);
    if (finished) break;
  }

  if (!finished) {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
    return new Response("Failed to prepare download. Please try again.", {
      status: 502,
    });
  }

  // Find the produced file.
  let produced: string | null = null;
  try {
    const files = await readdir(workDir);
    const match =
      files.find((f) => f.endsWith(`.${ext}`)) ||
      files.find((f) => f.startsWith("out."));
    if (match) produced = join(workDir, match);
  } catch {
    /* noop */
  }

  if (!produced) {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
    return new Response("Download not found. Please try again.", { status: 502 });
  }

  let fileSize = 0;
  try {
    fileSize = (await stat(produced)).size;
  } catch {
    /* noop */
  }

  // Stream the file to the client, then clean up the temp directory.
  const nodeStream = createReadStream(produced);
  const webStream = new ReadableStream({
    start(controller) {
      nodeStream.on("data", (chunk: string | Buffer) => {
        const buf = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
        controller.enqueue(new Uint8Array(buf));
      });
      nodeStream.on("end", () => {
        controller.close();
        rm(workDir, { recursive: true, force: true }).catch(() => {});
      });
      nodeStream.on("error", () => {
        try {
          controller.error(new Error("read failed"));
        } catch {
          /* noop */
        }
        rm(workDir, { recursive: true, force: true }).catch(() => {});
      });
    },
    cancel() {
      nodeStream.destroy();
      rm(workDir, { recursive: true, force: true }).catch(() => {});
    },
  });

  const headers: Record<string, string> = {
    "Content-Type": isAudio ? "audio/mpeg" : "video/mp4",
    "Content-Disposition": `attachment; filename="${safeTitle}.${ext}"`,
    "Cache-Control": "no-store",
  };
  if (fileSize > 0) headers["Content-Length"] = String(fileSize);

  return new Response(webStream, { headers });
}
