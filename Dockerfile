# 使用官方 Node.js 镜像
FROM node:18-alpine

# 安装 yt-dlp 和依赖
RUN apk add --no-cache python3 py3-pip ffmpeg && \
    pip3 install --no-cache-dir yt-dlp

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 只安装生产依赖（不需要 devDependencies）
RUN npm ci --omit=dev

# 复制预编译的代码
COPY dist ./dist

# 创建下载目录
RUN mkdir -p /app/downloads

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV TRANSPORT_TYPE=sse
ENV PORT=3000

# 启动应用
CMD ["node", "dist/index.js"]
