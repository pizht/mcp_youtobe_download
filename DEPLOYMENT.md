# 部署指南

本指南帮助你将 YouTube MCP 服务器部署到 Railway 或 Render 平台。

## 📋 部署前准备

### 1. 本地构建项目

在部署之前，先在本地构建项目：

```bash
npm install
npm run build
```

### 2. 确认文件结构

确保你的项目包含以下文件：

```
mcp_youtobe_new/
├── dist/                    # 编译后的代码（必须提交到 Git）
│   ├── index.js
│   └── utils/
│       └── validators.js
├── Dockerfile              # Docker 配置
├── railway.json            # Railway 配置
├── render.yaml             # Render 配置
├── package.json
├── .dockerignore
└── .gitignore
```

### 3. 提交到 Git

```bash
git add .
git commit -m "Add deployment configuration"
git push
```

## 🚀 Railway 部署

### 步骤 1：创建 Railway 账户

访问 https://railway.app 并创建账户。

### 步骤 2：创建新项目

1. 登录后点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 授权 Railway 访问你的 GitHub 仓库
4. 选择 `mcp_youtobe_new` 仓库

### 步骤 3：配置项目

Railway 会自动检测到你的项目配置。如果需要手动配置：

1. 点击项目设置
2. 确认以下设置：
   - **Build Command**: `npm install --omit=dev`
   - **Start Command**: `node dist/index.js`

### 步骤 4：设置环境变量

在项目设置中添加以下环境变量：

| 变量名 | 值 |
|--------|-----|
| `NODE_ENV` | `production` |
| `TRANSPORT_TYPE` | `sse` |
| `PORT` | `3000` |

### 步骤 5：部署

点击 "Deploy" 按钮，Railway 会自动：
1. 克隆你的代码
2. 安装依赖
3. 启动服务器
4. 分配一个 HTTPS URL

### 步骤 6：获取部署 URL

部署完成后，Railway 会提供一个类似这样的 URL：
```
https://your-app-name.up.railway.app
```

你的 SSE 端点将是：
```
https://your-app-name.up.railway.app/sse
```

## 🚀 Render 部署

### 步骤 1：创建 Render 账户

访问 https://render.com 并创建账户。

### 步骤 2：创建 Web Service

1. 登录后点击 "New +"
2. 选择 "Web Service"
3. 连接你的 GitHub 仓库
4. 选择 `mcp_youtobe_new` 仓库

### 步骤 3：配置服务

填写以下信息：

- **Name**: `youtube-mcp-server`（或自定义）
- **Runtime**: `Node`
- **Build Command**: `npm install --omit=dev`
- **Start Command**: `node dist/index.js`
- **Instance Type**: `Free`

### 步骤 4：设置环境变量

在 "Environment" 部分添加以下环境变量：

| 变量名 | 值 |
|--------|-----|
| `NODE_ENV` | `production` |
| `TRANSPORT_TYPE` | `sse` |
| `PORT` | `3000` |

### 步骤 5：高级配置

在 "Advanced" 部分：
- **Health Check Path**: `/health`
- 勾选 "Auto-Deploy" 以在代码更新时自动部署

### 步骤 6：部署

点击 "Create Web Service"，Render 会自动部署你的应用。

### 步骤 7：获取部署 URL

部署完成后，Render 会提供一个类似这样的 URL：
```
https://your-app-name.onrender.com
```

你的 SSE 端点将是：
```
https://your-app-name.onrender.com/sse
```

## 🔍 验证部署

部署完成后，你可以通过以下方式验证：

### 1. 健康检查

访问健康检查端点：
```bash
curl https://your-app-name.up.railway.app/health
```

应该返回：
```json
{"status":"healthy","transport":"sse"}
```

### 2. 测试 SSE 连接

使用浏览器或 curl 测试 SSE 端点：
```bash
curl https://your-app-name.up.railway.app/sse
```

## 📝 MCP 客户端配置

部署成功后，更新你的 MCP 客户端配置：

### Railway 配置示例

```json
{
  "mcpServers": {
    "youtube-mcp": {
      "transport": "sse",
      "url": "https://your-app-name.up.railway.app/sse",
      "messageUrl": "https://your-app-name.up.railway.app/message"
    }
  }
}
```

### Render 配置示例

```json
{
  "mcpServers": {
    "youtube-mcp": {
      "transport": "sse",
      "url": "https://your-app-name.onrender.com/sse",
      "messageUrl": "https://your-app-name.onrender.com/message"
    }
  }
}
```

## ⚠️ 注意事项

### Render 免费版限制

- **休眠**: 免费版服务在 15 分钟无活动后会休眠
- **冷启动**: 休眠后首次请求需要 30-60 秒冷启动时间
- **月度限制**: 每月 750 小时的免费额度

### Railway 免费版限制

- **月度额度**: $5/月的免费额度
- **资源限制**: CPU 和内存有限
- **计费**: 超出免费额度后按使用量计费

## 🛠️ 故障排查

### 问题 1: 部署失败

**症状**: 构建失败或服务无法启动

**解决方案**:
1. 检查 Railway/Render 的日志
2. 确认 `dist/` 目录已提交到 Git
3. 确认 `package.json` 中的脚本正确
4. 检查环境变量是否正确设置

### 问题 2: yt-dlp 未找到

**症状**: 日志显示 `yt-dlp: command not found`

**解决方案**:
1. 确认 Dockerfile 正确安装了 yt-dlp
2. 检查 Railway/Render 的构建日志
3. 如果使用 Railway，可能需要重启服务

### 问题 3: SSE 连接失败

**症状**: 客户端无法连接到 SSE 端点

**解决方案**:
1. 检查防火墙设置
2. 确认 URL 正确（使用 HTTPS）
3. 检查 CORS 设置
4. 查看服务器日志

### 问题 4: 下载失败

**症状**: 视频下载失败或超时

**解决方案**:
1. 检查 yt-dlp 版本是否最新
2. 确认视频 URL 有效
3. 检查服务器存储空间
4. 查看服务器日志中的错误信息

## 📊 监控和日志

### Railway

- 访问项目页面查看实时日志
- 使用 "Metrics" 查看性能指标
- 设置告警通知

### Render

- 访问服务页面查看日志
- 使用 "Metrics" 查看性能数据
- 配置告警规则

## 🔄 更新部署

当你更新代码后：

1. 本地构建：
   ```bash
   npm run build
   ```

2. 提交到 Git：
   ```bash
   git add .
   git commit -m "Update code"
   git push
   ```

3. Railway/Render 会自动检测到更新并重新部署

## 💡 优化建议

### 1. 使用 CDN

如果下载的文件需要公开访问，考虑使用 CDN 服务。

### 2. 添加缓存

为频繁访问的视频添加缓存机制。

### 3. 限制并发

添加并发下载限制，防止资源耗尽。

### 4. 监控使用量

定期监控 API 调用量和下载量，避免超出免费额度。

## 📞 支持

如果遇到问题：

- **Railway 文档**: https://docs.railway.app
- **Render 文档**: https://render.com/docs
- **GitHub Issues**: 在项目仓库提交问题

## 🎉 完成！

现在你的 YouTube MCP 服务器已经部署到云端，可以通过互联网访问了！
