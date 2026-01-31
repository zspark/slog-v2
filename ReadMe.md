# 运行步骤：
* 安装nodejs: `winget install --id OpenJS.NodeJS -s winget`
* 下载依赖库: `npm install`
* 启动typeserver，编译.ts文件为.js `npx tsc -w`
* 构建系统：`node build.cjs`
* 前往**deployment**目录，启动服务：`node server.bundle.cjs`