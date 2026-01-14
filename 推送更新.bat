@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo ==========================================
echo Git 推送和 GitHub Pages 部署脚本
echo ==========================================
echo.

echo [步骤 1/6] 检查 Git 状态...
git status
echo.

echo [步骤 2/6] 添加所有更改的文件...
git add .
echo.

echo [步骤 3/6] 提交更改...
git commit -m "优化: 价格智能体UI优化更新 - 修复弹窗定位、添加分享功能、优化卡片留白"
echo.

echo [步骤 4/6] 推送到远程仓库...
git push origin main
echo.

echo [步骤 5/6] 推送到 GitHub Pages...
git push origin main:gh-pages
echo.

echo [步骤 6/6] 完成！
echo ==========================================
echo 代码已推送到 GitHub
echo GitHub Pages 已更新
echo ==========================================
echo.
pause
