console.log('YouTube MCP Server is starting...');

async function main(): Promise<void> {
  console.log('YouTube MCP Server initialized');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
