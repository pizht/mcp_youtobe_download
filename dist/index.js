#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const child_process_1 = require("child_process");
const util_1 = require("util");
const validators_js_1 = require("./utils/validators.js");
const ytdlpManager_js_1 = require("./utils/ytdlpManager.js");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let ytDlpPath;
const MAX_VIDEO_DURATION_SECONDS = 7200;
const DOWNLOAD_TIMEOUT_MS = 300000;
function log(level, message, data) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        level,
        message,
        ...(data ? { data } : {}),
    };
    console.error(JSON.stringify(logEntry));
}
function sanitizeError(error) {
    if (error instanceof Error) {
        return error.message.replace(/[\\/:*?"<>|]/g, '');
    }
    return String(error);
}
function createErrorResponse(message, originalError) {
    const sanitizedMessage = sanitizeError(message);
    log('error', sanitizedMessage, originalError ? { error: sanitizeError(originalError) } : undefined);
    return {
        content: [
            {
                type: 'text',
                text: sanitizedMessage,
            },
        ],
        isError: true,
    };
}
async function execWithTimeout(command, timeoutMs) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error(`Command timed out after ${timeoutMs}ms`));
        }, timeoutMs);
        (0, child_process_1.exec)(command, (error, stdout, stderr) => {
            clearTimeout(timeout);
            if (error) {
                reject(error);
            }
            else {
                resolve({ stdout, stderr });
            }
        });
    });
}
async function getVideoDuration(url) {
    try {
        const command = `"${ytDlpPath}" --get-duration "${url}"`;
        const { stdout } = await execWithTimeout(command, 30000);
        const durationStr = stdout.trim();
        const parts = durationStr.split(':').map(Number);
        if (parts.length === 3) {
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
        else if (parts.length === 2) {
            return parts[0] * 60 + parts[1];
        }
        else {
            return parts[0];
        }
    }
    catch {
        return 0;
    }
}
const server = new index_js_1.Server({
    name: 'youtube-downloader-mcp',
    version: '0.1.0',
}, {
    capabilities: {
        tools: {},
    },
});
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'check_ytdlp',
                description: 'Check if yt-dlp is installed and get its version',
                inputSchema: {
                    type: 'object',
                    properties: {},
                },
            },
            {
                name: 'validate_youtube_url',
                description: 'Validate if a URL is a valid YouTube URL',
                inputSchema: {
                    type: 'object',
                    properties: {
                        url: {
                            type: 'string',
                            description: 'The URL to validate',
                        },
                    },
                    required: ['url'],
                },
            },
            {
                name: 'download_youtube_video',
                description: 'Download a YouTube video to the downloads directory',
                inputSchema: {
                    type: 'object',
                    properties: {
                        url: {
                            type: 'string',
                            description: 'The YouTube video URL to download',
                        },
                        format: {
                            type: 'string',
                            enum: ['mp4', 'webm'],
                            description: 'Video format (default: mp4)',
                        },
                        resolution: {
                            type: 'string',
                            enum: ['best', '720p', '1080p'],
                            description: 'Video resolution (default: best)',
                        },
                    },
                    required: ['url'],
                },
            },
            {
                name: 'download_youtube_audio',
                description: 'Download audio from a YouTube video to the downloads directory',
                inputSchema: {
                    type: 'object',
                    properties: {
                        url: {
                            type: 'string',
                            description: 'The YouTube video URL to extract audio from',
                        },
                        audio_format: {
                            type: 'string',
                            enum: ['mp3', 'm4a', 'opus'],
                            description: 'Audio format (default: mp3)',
                        },
                    },
                    required: ['url'],
                },
            },
        ],
    };
});
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    try {
        if (request.params.name === 'check_ytdlp') {
            try {
                const version = await (0, ytdlpManager_js_1.getYtDlpVersion)();
                log('info', 'yt-dlp version check successful', { version, path: ytDlpPath });
                return {
                    content: [
                        {
                            type: 'text',
                            text: `yt-dlp version: ${version}\nPath: ${ytDlpPath}`,
                        },
                    ],
                };
            }
            catch (error) {
                return createErrorResponse('Failed to check yt-dlp version. Please ensure yt-dlp is installed and available in PATH.', error);
            }
        }
        if (request.params.name === 'validate_youtube_url') {
            const url = request.params.arguments?.url;
            const isValid = (0, validators_js_1.validateYoutubeUrl)(url);
            log('info', 'URL validation', { url, isValid });
            return {
                content: [
                    {
                        type: 'text',
                        text: isValid ? 'Valid YouTube URL' : 'Invalid YouTube URL',
                    },
                ],
            };
        }
        if (request.params.name === 'download_youtube_video') {
            const args = request.params.arguments;
            const url = args?.url;
            const format = args?.format || 'mp4';
            const resolution = args?.resolution || 'best';
            if (!url || !(0, validators_js_1.validateYoutubeUrl)(url)) {
                log('warn', 'Invalid YouTube URL provided', { url });
                return createErrorResponse('Invalid YouTube URL. Please provide a valid YouTube video URL.');
            }
            if (url.includes('list=')) {
                log('warn', 'Playlist URL rejected', { url });
                return createErrorResponse('Playlist downloads are not supported. Please provide a single video URL.');
            }
            const duration = await getVideoDuration(url);
            if (duration > MAX_VIDEO_DURATION_SECONDS) {
                const hours = Math.floor(duration / 3600);
                const minutes = Math.floor((duration % 3600) / 60);
                log('warn', 'Video duration exceeds limit', { url, duration, hours, minutes });
                return createErrorResponse(`Video duration (${hours}h ${minutes}m) exceeds maximum allowed duration of 2 hours. Please provide a shorter video.`);
            }
            const formatMap = {
                mp4: 'mp4',
                webm: 'webm',
            };
            const resolutionMap = {
                best: 'best',
                '720p': '720',
                '1080p': '1080',
            };
            const selectedFormat = formatMap[format] || 'mp4';
            const selectedResolution = resolutionMap[resolution] || 'best';
            const formatFlag = selectedFormat === 'mp4' ? 'mp4' : 'webm';
            const resolutionFlag = selectedResolution === 'best' ? 'best' : `res:${selectedResolution}`;
            try {
                const command = `"${ytDlpPath}" -f "bestvideo[ext=${formatFlag}][height<=${selectedResolution === 'best' ? 9999 : selectedResolution}]+bestaudio[ext=m4a]/best[ext=${formatFlag}][height<=${selectedResolution === 'best' ? 9999 : selectedResolution}]/best" -o "./downloads/%(title)s.%(ext)s" "${url}"`;
                const { stdout, stderr } = await execWithTimeout(command, DOWNLOAD_TIMEOUT_MS);
                log('info', 'Video download successful', { url, format: selectedFormat, resolution: selectedResolution });
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Video downloaded successfully to ./downloads directory.\n${stdout}`,
                        },
                    ],
                };
            }
            catch (error) {
                return createErrorResponse('Failed to download video', error);
            }
        }
        if (request.params.name === 'download_youtube_audio') {
            const args = request.params.arguments;
            const url = args?.url;
            const audioFormat = args?.audio_format || 'mp3';
            if (!url || !(0, validators_js_1.validateYoutubeUrl)(url)) {
                log('warn', 'Invalid YouTube URL provided', { url });
                return createErrorResponse('Invalid YouTube URL. Please provide a valid YouTube video URL.');
            }
            if (url.includes('list=')) {
                log('warn', 'Playlist URL rejected', { url });
                return createErrorResponse('Playlist downloads are not supported. Please provide a single video URL.');
            }
            const duration = await getVideoDuration(url);
            if (duration > MAX_VIDEO_DURATION_SECONDS) {
                const hours = Math.floor(duration / 3600);
                const minutes = Math.floor((duration % 3600) / 60);
                log('warn', 'Video duration exceeds limit', { url, duration, hours, minutes });
                return createErrorResponse(`Video duration (${hours}h ${minutes}m) exceeds maximum allowed duration of 2 hours. Please provide a shorter video.`);
            }
            const formatMap = {
                mp3: 'mp3',
                m4a: 'm4a',
                opus: 'opus',
            };
            const selectedFormat = formatMap[audioFormat] || 'mp3';
            try {
                const command = `"${ytDlpPath}" -x --audio-format ${selectedFormat} -o "./downloads/%(title)s.%(ext)s" "${url}"`;
                const { stdout, stderr } = await execWithTimeout(command, DOWNLOAD_TIMEOUT_MS);
                log('info', 'Audio download successful', { url, format: selectedFormat });
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Audio downloaded successfully to ./downloads directory in ${selectedFormat} format.\n${stdout}`,
                        },
                    ],
                };
            }
            catch (error) {
                return createErrorResponse('Failed to download audio', error);
            }
        }
        log('warn', 'Unknown tool requested', { toolName: request.params.name });
        return createErrorResponse(`Unknown tool: ${request.params.name}`);
    }
    catch (error) {
        log('error', 'Unhandled error in tool handler', { error: sanitizeError(error), toolName: request.params.name });
        return createErrorResponse('An unexpected error occurred while processing your request', error);
    }
});
async function main() {
    console.error('[yt-dlp-mcp] Initializing...');
    try {
        ytDlpPath = await (0, ytdlpManager_js_1.ensureYtDlpInstalled)();
        console.error(`[yt-dlp-mcp] Using yt-dlp at: ${ytDlpPath}`);
    }
    catch (error) {
        console.error('[yt-dlp-mcp] Failed to ensure yt-dlp installation:', error);
        process.exit(1);
    }
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error('YouTube Downloader MCP Server running on stdio');
}
main().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map