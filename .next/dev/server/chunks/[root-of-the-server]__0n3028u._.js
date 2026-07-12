module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:child_process [external] (node:child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:child_process", () => require("node:child_process"));

module.exports = mod;
}),
"[project]/src/app/api/download/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST,
    "dynamic",
    ()=>dynamic,
    "maxDuration",
    ()=>maxDuration
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$child_process__$5b$external$5d$__$28$node$3a$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:child_process [external] (node:child_process, cjs)");
;
const dynamic = "force-dynamic";
const maxDuration = 120;
const YTDLP_ARGS_BASE = [
    "-j",
    "--no-warnings",
    "--no-playlist",
    "--no-check-certificate"
];
// Try clients in order: "default" (web) exposes full quality up to 4K but can
// hit bot checks; "android" is more resilient but caps around 360p. We prefer
// the highest-quality one that succeeds.
const CLIENT_PRIORITY = [
    "default",
    "tv",
    "android"
];
// Ensure yt-dlp AND a bundled ffmpeg are available; install once if missing.
// ffmpeg (via imageio-ffmpeg) is required to merge high-res video+audio
// (720p/1080p+) which YouTube serves as separate streams.
let ytdlpReady = null;
function ensureYtDlp() {
    if (!ytdlpReady) {
        ytdlpReady = new Promise((resolve)=>{
            const install = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$child_process__$5b$external$5d$__$28$node$3a$child_process$2c$__cjs$29$__["spawn"])("pip3", [
                "install",
                "--break-system-packages",
                "--quiet",
                "yt-dlp",
                "imageio-ffmpeg"
            ]);
            install.on("close", ()=>resolve());
            install.on("error", ()=>resolve());
        });
    }
    return ytdlpReady;
}
function runYtDlpWithClient(url, client) {
    return new Promise((resolve, reject)=>{
        const args = [
            "-m",
            "yt_dlp",
            ...YTDLP_ARGS_BASE,
            "--extractor-args",
            `youtube:player_client=${client}`,
            url
        ];
        const proc = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$child_process__$5b$external$5d$__$28$node$3a$child_process$2c$__cjs$29$__["spawn"])("python3", args);
        let out = "";
        let err = "";
        const timer = setTimeout(()=>{
            proc.kill("SIGKILL");
            reject(new Error("timeout"));
        }, 60000);
        proc.stdout.on("data", (d)=>out += d.toString());
        proc.stderr.on("data", (d)=>err += d.toString());
        proc.on("error", (e)=>{
            clearTimeout(timer);
            reject(e);
        });
        proc.on("close", (code)=>{
            clearTimeout(timer);
            if (code !== 0 || !out.trim()) {
                reject(new Error(err || "yt-dlp failed"));
                return;
            }
            try {
                resolve(JSON.parse(out.trim().split("\n")[0]));
            } catch  {
                reject(new Error("Could not parse video data"));
            }
        });
    });
}
// Try clients in priority order; return the first that yields real formats.
async function runYtDlp(url) {
    let lastErr = "";
    for (const client of CLIENT_PRIORITY){
        try {
            const info = await runYtDlpWithClient(url, client);
            if (info.formats && info.formats.length > 0) return info;
        } catch (e) {
            lastErr = e instanceof Error ? e.message : String(e);
            // Only keep trying on bot/format errors; abort on private/age issues.
            if (/private|age/i.test(lastErr)) throw new Error(lastErr);
        }
    }
    throw new Error(lastErr || "yt-dlp failed");
}
function sizeToMB(f) {
    const bytes = f.filesize ?? f.filesize_approx ?? null;
    if (!bytes) return "N/A";
    return `${(bytes / 1048576).toFixed(1)} MB`;
}
async function POST(request) {
    try {
        const { url } = await request.json();
        if (!url) {
            return Response.json({
                error: "URL is required"
            }, {
                status: 400
            });
        }
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/live\/|music\.youtube\.com\/watch\?v=)[\w-]+/;
        if (!youtubeRegex.test(url)) {
            return Response.json({
                error: "Please provide a valid YouTube URL"
            }, {
                status: 400
            });
        }
        await ensureYtDlp();
        let info;
        try {
            info = await runYtDlp(url);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "";
            if (/private/i.test(msg)) {
                return Response.json({
                    error: "This video is private and cannot be downloaded."
                }, {
                    status: 422
                });
            }
            if (/age/i.test(msg)) {
                return Response.json({
                    error: "This video is age-restricted and cannot be downloaded."
                }, {
                    status: 422
                });
            }
            if (/timeout/i.test(msg)) {
                return Response.json({
                    error: "The request timed out. Please try again."
                }, {
                    status: 504
                });
            }
            console.error("yt-dlp error:", msg);
            return Response.json({
                error: "Could not fetch this video. Please try another URL."
            }, {
                status: 422
            });
        }
        const formats = info.formats || [];
        const links = [];
        // Best audio-only size (used to estimate merged sizes).
        const audioFormats = formats.filter((f)=>f.acodec && f.acodec !== "none" && (!f.vcodec || f.vcodec === "none")).sort((a, b)=>(b.abr || 0) - (a.abr || 0));
        const bestAudio = audioFormats.find((f)=>f.ext === "m4a") || audioFormats[0];
        const audioBytes = bestAudio?.filesize ?? bestAudio?.filesize_approx ?? 0;
        // All video streams (progressive OR video-only) — we merge with audio
        // on the fly for the ones missing audio, so 720p/1080p work too.
        const videoStreams = formats.filter((f)=>f.vcodec && f.vcodec !== "none" && (f.height || 0) > 0);
        // Pick the best stream per standard height tier.
        const TIERS = [
            1080,
            720,
            480,
            360,
            240
        ];
        const progressive = formats.filter((f)=>f.vcodec && f.vcodec !== "none" && f.acodec && f.acodec !== "none");
        for (const tier of TIERS){
            // Prefer a candidate exactly at this height.
            const candidates = videoStreams.filter((f)=>f.height === tier);
            if (candidates.length === 0) continue;
            // Does a progressive (already-merged) stream exist at this tier?
            const prog = progressive.find((f)=>f.height === tier);
            const chosen = prog || candidates.sort((a, b)=>(b.filesize ?? b.filesize_approx ?? 0) - (a.filesize ?? a.filesize_approx ?? 0))[0];
            const videoBytes = chosen.filesize ?? chosen.filesize_approx ?? 0;
            const totalBytes = prog ? videoBytes : videoBytes + audioBytes;
            const sizeStr = totalBytes > 0 ? `${(totalBytes / 1048576).toFixed(1)} MB` : "N/A";
            links.push({
                quality: `${tier}p`,
                format: "mp4",
                size: sizeStr,
                height: tier,
                isAudio: false,
                // Direct URL only usable for playback when it's progressive.
                directUrl: prog?.url
            });
        }
        // Always add a best audio-only (MP3) option — small, works on everything.
        if (bestAudio) {
            links.push({
                quality: "Audio Only",
                format: "mp3",
                size: audioBytes > 0 ? `${(audioBytes / 1048576).toFixed(1)} MB` : "N/A",
                height: 0,
                isAudio: true
            });
        }
        if (links.length === 0) {
            return Response.json({
                error: "No downloadable formats were found for this video. Try another video."
            }, {
                status: 422
            });
        }
        const playable = links.find((l)=>!l.isAudio);
        const safeTitle = encodeURIComponent(info.title || "video");
        // Route every download through our own /api/stream proxy so it works with
        // NO size limits, merges hi-res video+audio, and avoids IP-bound failures.
        const proxied = (l)=>{
            const kind = l.isAudio ? "audio" : "video";
            const h = l.isAudio ? "" : `&height=${l.height}`;
            return `/api/stream?url=${encodeURIComponent(url)}&fmt=${kind}${h}&title=${safeTitle}`;
        };
        // Prefer a progressive stream for smooth in-browser playback.
        const directPlayable = links.find((l)=>!l.isAudio && l.directUrl);
        const result = {
            title: info.title || "YouTube Video",
            thumbnail: info.thumbnail || (info.id ? `https://i.ytimg.com/vi/${info.id}/maxresdefault.jpg` : null),
            duration: info.duration ?? null,
            channel: info.channel || info.uploader || "YouTube",
            channelUrl: info.channel_url || info.uploader_url || null,
            views: info.view_count ?? null,
            likes: info.like_count ?? null,
            resolution: playable ? playable.quality : null,
            fps: info.fps ?? null,
            // Direct URL for in-browser playback; fall back to proxied 360p stream.
            videoUrl: directPlayable ? directPlayable.directUrl : playable ? `/api/stream?url=${encodeURIComponent(url)}&fmt=video&height=${playable.height}&title=${safeTitle}` : null,
            downloadLinks: links.map((l)=>({
                    quality: l.quality,
                    url: proxied(l),
                    format: l.format,
                    size: l.size
                }))
        };
        return Response.json(result);
    } catch (error) {
        console.error("Download error:", error);
        return Response.json({
            error: "An unexpected error occurred. Please try again."
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0n3028u._.js.map