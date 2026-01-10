# GitHub Pages 部署指南

## 快速部署步骤

### 1. 创建GitHub仓库
1. 在GitHub上创建一个新的仓库
2. 仓库名称建议：`ai-voice-repair-demo` 或 `mobile-prototype-demo`

### 2. 上传代码
```bash
# 初始化Git仓库
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit: AI语音报修移动端原型"

# 添加远程仓库（替换为您的仓库地址）
git remote add origin https://github.com/[您的用户名]/[仓库名].git

# 推送到GitHub
git push -u origin main
```

### 3. 启用GitHub Pages
1. 进入GitHub仓库页面
2. 点击 "Settings" 标签
3. 在左侧菜单中找到 "Pages"
4. 在 "Source" 部分选择 "GitHub Actions"
5. 保存设置

### 4. 自动部署
- 代码推送后，GitHub Actions会自动运行部署流程
- 部署完成后，您的网站将在以下地址可用：
  `https://[您的用户名].github.io/[仓库名]/`

## 部署配置说明

### GitHub Actions工作流
- 文件位置：`.github/workflows/deploy.yml`
- 触发条件：推送到 `main` 或 `master` 分支
- 部署方式：使用GitHub Pages官方Actions

### 项目结构
```
├── index.html              # 主页面
├── styles/main.css         # 样式文件
├── scripts/main.js         # JavaScript文件
├── .github/workflows/      # GitHub Actions配置
└── README.md              # 项目说明
```

## 常见问题

### Q: 部署失败怎么办？
A: 检查以下几点：
1. 确保仓库是公开的（免费账户）
2. 检查GitHub Actions是否有权限
3. 查看Actions日志中的错误信息

### Q: 网站无法访问？
A: 可能的原因：
1. 部署还未完成（等待几分钟）
2. 仓库设置中的Pages配置错误
3. 域名拼写错误

### Q: 如何更新网站？
A: 只需要推送新的代码到main分支，GitHub Actions会自动重新部署。

## 自定义域名（可选）

如果您有自己的域名，可以在仓库设置的Pages部分配置自定义域名。

## 技术支持

如果遇到部署问题，可以：
1. 查看GitHub Actions的运行日志
2. 检查GitHub Pages的文档
3. 在GitHub社区寻求帮助
