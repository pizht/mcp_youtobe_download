# YouTube MCP Server

A Model Context Protocol (MCP) server for downloading YouTube videos and audio.

## ⚠️ Legal Notice

**This tool is intended for legitimate use only.** Users are responsible for ensuring they have the right to download content and comply with all applicable laws and YouTube's Terms of Service. Unauthorized downloading of copyrighted content is prohibited.

## Features

- Download YouTube videos in MP4 or WebM format
- Extract audio in MP3, M4A, or Opus format
- Validate YouTube URLs
- Check yt-dlp installation
- Security limits:
  - Maximum video duration: 2 hours
  - Playlist downloads are not supported
  - Download timeout: 5 minutes

## Requirements

- Node.js >= 18
- yt-dlp installed and available in PATH
- npm

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```

## Usage

### Running the Server

```bash
npm start
```

Or directly with Node.js:
```bash
node dist/index.js
```

### MCP Configuration

See [mcp.config.example.json](./mcp.config.example.json) for MCP client configuration.

Copy the example file to `mcp.config.json` and update `${workspacePath}` with your actual project path.

## Available Tools

### check_ytdlp
Check if yt-dlp is installed and get its version.

**Parameters:** None

### validate_youtube_url
Validate if a URL is a valid YouTube URL.

**Parameters:**
- `url` (string, required): The URL to validate

### download_youtube_video
Download a YouTube video to the downloads directory.

**Parameters:**
- `url` (string, required): The YouTube video URL to download
- `format` (string, optional): Video format - `mp4` or `webm` (default: `mp4`)
- `resolution` (string, optional): Video resolution - `best`, `720p`, or `1080p` (default: `best`)

**Security Limits:**
- Maximum duration: 2 hours
- Playlists are not supported
- Download timeout: 5 minutes

### download_youtube_audio
Download audio from a YouTube video to the downloads directory.

**Parameters:**
- `url` (string, required): The YouTube video URL to extract audio from
- `audio_format` (string, optional): Audio format - `mp3`, `m4a`, or `opus` (default: `mp3`)

**Security Limits:**
- Maximum duration: 2 hours
- Playlists are not supported
- Download timeout: 5 minutes

## Development

### Build
```bash
npm run build
```

### Watch Mode
```bash
npm run dev
```

## Project Structure

```
mcp_youtobe_new/
├── src/
│   ├── index.ts          # Main MCP server entry point
│   └── utils/
│       └── validators.ts  # URL validation utilities
├── dist/                 # Compiled JavaScript output
├── downloads/             # Downloaded files directory
├── package.json
├── tsconfig.json
├── mcp.config.example.json
└── README.md
```

## License

ISC

## Disclaimer

This project is provided as-is for educational and legitimate use purposes. The developers are not responsible for any misuse of this software. Users must comply with all applicable laws and YouTube's Terms of Service.
