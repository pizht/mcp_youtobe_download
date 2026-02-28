# YouTube MCP Server - ModelScope 魔搭平台发布指南

## 📦 发布到魔搭 MCP 广场

### 前置条件

1. **发布到 npm**
   ```bash
   npm login
   npm publish
   ```

2. **在魔搭平台注册 MCP 服务**
   - 访问 https://www.modelscope.cn/mcp/servers
   - 点击"发布 MCP 服务"
   - 填写服务信息

### 魔搭平台配置信息

**服务名称**: YouTube MCP Server
**服务描述**: 下载 YouTube 视频和音频的 MCP 服务器
**标签**: youtube, video, audio, download, mcp

**一键配置 JSON**:
```json
{
  "mcpServers": {
    "youtube-mcp": {
      "command": "npx",
      "args": [
        "youtube-mcp-server@latest"
      ]
    }
  }
}
```

**环境要求**:
- Node.js >= 18
- yt-dlp 已安装并在 PATH 中

**安装说明**:
```bash
# Windows
choco install yt-dlp

# macOS
brew install yt-dlp

# Linux
sudo apt install yt-dlp
```

**使用示例**:
```bash
# 直接使用 npx
npx youtube-mcp-server@latest

# 或使用 uvx (Python 用户)
uvx youtube-mcp-server@latest
```

**可用工具**:
1. `check_ytdlp` - 检查 yt-dlp 安装状态
2. `validate_youtube_url` - 验证 YouTube URL
3. `download_youtube_video` - 下载视频
4. `download_youtube_audio` - 提取音频

**安全限制**:
- 最大视频时长: 2 小时
- 不支持播放列表
- 下载超时: 5 分钟

**许可证**: ISC

**项目地址**: [填写你的 GitHub 仓库地址]

**作者**: [填写你的名字]

### 发布检查清单

- [ ] 已发布到 npm
- [ ] package.json 配置正确
- [ ] README.md 包含完整使用说明
- [ ] 一键配置 JSON 已测试
- [ ] 安全限制已说明
- [ ] 法律声明已添加
