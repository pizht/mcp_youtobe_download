# MCP Configuration Example

This file demonstrates how to configure the youtube-mcp server for MCP clients.

## Usage

1. Copy this file to `mcp.config.json` in your MCP client's configuration directory
2. Replace `${workspacePath}` with the actual path to your youtube-mcp project
3. Restart your MCP client to load the new configuration

## Configuration Fields

- `command`: The Node.js executable
- `args`: Array of arguments to pass to Node.js
  - `${workspacePath}`: Replace this with the absolute path to your project directory
  - `dist/index.js`: The compiled entry point of the MCP server
- `env`: Optional environment variables
  - `NODE_ENV`: Set to "production" for production use

## Example Paths

Windows:
```
"C:/Users/YourName/Documents/trae_projects/mcp_youtobe_new/dist/index.js"
```

Linux/Mac:
```
"/home/yourname/projects/mcp_youtobe_new/dist/index.js"
```

## Notes

- The MCP server uses stdio (standard input/output) for communication
- Ensure Node.js (>=18) is installed on your system
- Ensure yt-dlp is installed and available in your system PATH
