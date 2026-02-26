"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const child_process_1 = require("child_process");
const util_1 = require("util");
const validators_js_1 = require("./utils/validators.js");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
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
        ],
    };
});
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    if (request.params.name === 'check_ytdlp') {
        try {
            const { stdout, stderr } = await execAsync('yt-dlp --version');
            const version = stdout.trim() || stderr.trim();
            return {
                content: [
                    {
                        type: 'text',
                        text: `yt-dlp version: ${version}`,
                    },
                ],
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                content: [
                    {
                        type: 'text',
                        text: `Failed to check yt-dlp version: ${errorMessage}. Please ensure yt-dlp is installed and available in PATH.`,
                    },
                ],
                isError: true,
            };
        }
    }
    if (request.params.name === 'validate_youtube_url') {
        const url = request.params.arguments?.url;
        const isValid = (0, validators_js_1.validateYoutubeUrl)(url);
        return {
            content: [
                {
                    type: 'text',
                    text: isValid ? 'Valid YouTube URL' : 'Invalid YouTube URL',
                },
            ],
        };
    }
    return {
        content: [
            {
                type: 'text',
                text: `Unknown tool: ${request.params.name}`,
            },
        ],
        isError: true,
    };
});
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error('YouTube Downloader MCP Server running on stdio');
}
main().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map