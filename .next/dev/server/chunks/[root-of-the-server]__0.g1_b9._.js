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
"[project]/src/lib/ytdlp.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "YOUTUBE_CHANNEL_REGEX",
    ()=>YOUTUBE_CHANNEL_REGEX,
    "YOUTUBE_VIDEO_REGEX",
    ()=>YOUTUBE_VIDEO_REGEX,
    "YT_CLIENT_ARGS",
    ()=>YT_CLIENT_ARGS,
    "ensureTools",
    ()=>ensureTools,
    "getFfmpegPath",
    ()=>getFfmpegPath,
    "listChannel",
    ()=>listChannel
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$child_process__$5b$external$5d$__$28$node$3a$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:child_process [external] (node:child_process, cjs)");
;
// Shared helpers for yt-dlp + bundled ffmpeg across API routes.
let ready = null;
function ensureTools() {
    if (!ready) {
        ready = new Promise((resolve)=>{
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
    return ready;
}
function getFfmpegPath() {
    return new Promise((resolve)=>{
        const proc = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$child_process__$5b$external$5d$__$28$node$3a$child_process$2c$__cjs$29$__["spawn"])("python3", [
            "-c",
            "import imageio_ffmpeg,sys;sys.stdout.write(imageio_ffmpeg.get_ffmpeg_exe())"
        ]);
        let out = "";
        proc.stdout.on("data", (d)=>out += d.toString());
        proc.on("close", (code)=>resolve(code === 0 && out.trim() ? out.trim() : null));
        proc.on("error", ()=>resolve(null));
    });
}
const YT_CLIENT_ARGS = [
    "--extractor-args",
    "youtube:player_client=android"
];
const YOUTUBE_VIDEO_REGEX = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/live\/|music\.youtube\.com\/watch\?v=)[\w-]+/;
const YOUTUBE_CHANNEL_REGEX = /^(https?:\/\/)?(www\.)?(m\.)?youtube\.com\/(@[\w.-]+|channel\/[\w-]+|c\/[\w.-]+|user\/[\w.-]+)/;
function listChannel(url, limit = 30) {
    return new Promise((resolve, reject)=>{
        const args = [
            "-m",
            "yt_dlp",
            "--flat-playlist",
            "--no-warnings",
            ...YT_CLIENT_ARGS,
            "-J",
            "--playlist-end",
            String(limit),
            url
        ];
        const proc = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$child_process__$5b$external$5d$__$28$node$3a$child_process$2c$__cjs$29$__["spawn"])("python3", args);
        let out = "";
        let err = "";
        const timer = setTimeout(()=>{
            proc.kill("SIGKILL");
            reject(new Error("timeout"));
        }, 90000);
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
                const data = JSON.parse(out.trim());
                const rawEntries = Array.isArray(data.entries) ? data.entries : [];
                const entries = [];
                for (const e of rawEntries){
                    const item = e;
                    if (!item.id) continue;
                    entries.push({
                        id: item.id,
                        title: item.title || "Untitled",
                        url: `https://www.youtube.com/watch?v=${item.id}`
                    });
                }
                resolve({
                    channel: data.title || data.channel || data.uploader || "Channel",
                    channelUrl: data.channel_url || data.uploader_url || url,
                    thumbnail: (Array.isArray(data.thumbnails) && data.thumbnails.length ? data.thumbnails[data.thumbnails.length - 1].url : null) || null,
                    entries
                });
            } catch  {
                reject(new Error("Could not parse channel data"));
            }
        });
    });
}
}),
"[project]/src/app/api/channel/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST,
    "dynamic",
    ()=>dynamic,
    "maxDuration",
    ()=>maxDuration
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ytdlp$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ytdlp.ts [app-route] (ecmascript)");
;
const dynamic = "force-dynamic";
const maxDuration = 120;
async function POST(request) {
    try {
        const { url, limit } = await request.json();
        if (!url) {
            return Response.json({
                error: "Channel URL is required"
            }, {
                status: 400
            });
        }
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ytdlp$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["YOUTUBE_CHANNEL_REGEX"].test(url)) {
            return Response.json({
                error: "Please provide a valid YouTube channel URL (e.g., https://youtube.com/@name)."
            }, {
                status: 400
            });
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ytdlp$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureTools"])();
        const max = Math.min(Math.max(parseInt(String(limit)) || 20, 1), 50);
        let info;
        try {
            info = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ytdlp$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listChannel"])(url, max);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "";
            if (/timeout/i.test(msg)) {
                return Response.json({
                    error: "The channel took too long to load. Please try again."
                }, {
                    status: 504
                });
            }
            console.error("channel list error:", msg);
            return Response.json({
                error: "Could not load this channel. Please check the URL."
            }, {
                status: 422
            });
        }
        if (info.entries.length === 0) {
            return Response.json({
                error: "No videos found on this channel."
            }, {
                status: 404
            });
        }
        return Response.json({
            channel: info.channel,
            channelUrl: info.channelUrl,
            thumbnail: info.thumbnail,
            count: info.entries.length,
            videos: info.entries.map((e)=>({
                    id: e.id,
                    title: e.title,
                    url: e.url,
                    thumbnail: `https://i.ytimg.com/vi/${e.id}/mqdefault.jpg`
                }))
        });
    } catch (error) {
        console.error("channel error:", error);
        return Response.json({
            error: "An unexpected error occurred. Please try again."
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0.g1_b9._.js.map