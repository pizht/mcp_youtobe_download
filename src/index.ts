import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { validateYoutubeUrl } from './utils/validators.js';

const execAsync = promisify(exec);

const server = new Server(
  {
    name: 'youtube-downloader-mcp',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
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

server.setRequestHandler(CallToolRequestSchema, async (request) => {
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
    } catch (error) {
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
    const url = request.params.arguments?.url as string;
    const isValid = validateYoutubeUrl(url);
    
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

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('YouTube Downloader MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
