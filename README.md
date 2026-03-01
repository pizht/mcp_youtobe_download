# YouTube MCP Server

A Model Context Protocol (MCP) server for downloading YouTube videos and audio.

## ⚠️ Legal Notice

**This tool is intended for legitimate use only.** Users are responsible for ensuring they have the right to download content and comply with all applicable laws and YouTube's Terms of Service. Unauthorized downloading of copyrighted content is prohibited.

## Features

- Download YouTube videos in MP4 or WebM format
- Extract audio in MP3, M4A, or Opus format
- Validate YouTube URLs
- **Auto-download yt-dlp** - No manual installation required!
- Security limits:
  - Maximum video duration: 2 hours
  - Playlist downloads are not supported
  - Download timeout: 5 minutes

## Requirements

- Node.js >= 18
- npm

> **Note:** yt-dlp is automatically downloaded on first run. No manual installation needed!

## Quick Start

### One-Click Configuration

**Copy the following JSON configuration** to your MCP client (e.g., Cherry Studio, Claude Desktop, etc.):
```json
{
  "mcpServers": {
    "yt-dlp-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "yt-dlp-mcp"
      ]
    }
  }
}
```

**That's it!** On first run, yt-dlp will be automatically downloaded and the MCP server will start.

### Manual Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Run the server:
   ```bash
   npm start
   ```

## How It Works

When you first run the MCP server:

1. **Auto-detect platform** - Windows, macOS, or Linux
2. **Download yt-dlp** - Automatically fetches the latest yt-dlp binary from GitHub
3. **Cache locally** - Saves to `./bin/` directory for future use
4. **Ready to use** - No additional setup required!

## Usage

### Running the Server

```bash
npm start
```

Or directly with Node.js:
```bash
node dist/index.js
```

## Available Tools

### check_ytdlp
Check if yt-dlp is installed and get its version.

**Parameters:** None

**Returns:** yt-dlp version and installation path

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
│   ├── index.ts              # Main MCP server entry point
│   └── utils/
│       ├── validators.ts     # URL validation utilities
│       └── ytdlpManager.ts   # yt-dlp auto-download manager
├── dist/                     # Compiled JavaScript output
├── bin/                      # Auto-downloaded yt-dlp binary
├── downloads/                # Downloaded files directory
├── package.json
├── tsconfig.json
└── README.md
```

## Troubleshooting

### yt-dlp download fails
If the automatic download fails (e.g., due to network issues), you can:
1. Manually download yt-dlp from [GitHub Releases](https://github.com/yt-dlp/yt-dlp/releases)
2. Place it in the `bin/` directory:
   - Windows: `bin/yt-dlp.exe`
   - macOS: `bin/yt-dlp_macos`
   - Linux: `bin/yt-dlp`

### Update yt-dlp
To update yt-dlp to a newer version:
1. Delete the `bin/` directory
2. Restart the MCP server - it will download the latest version

## License

ISC

## Disclaimer

This project is provided as-is for educational and legitimate use purposes. The developers are not responsible for any misuse of this software. Users must comply with all applicable laws and YouTube's Terms of Service.
