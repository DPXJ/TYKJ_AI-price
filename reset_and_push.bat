@echo off
chcp 65001 > nul
echo ==========================================
echo Git 仓库重置和推送脚本
echo ==========================================
echo.

echo [1] 当前远程仓库地址:
git remote -v
echo.

echo [2] 当前 Git 状态:
git status
echo.

echo [3] 添加所有更改到暂存区...
git add .
echo.

echo [4] 创建新的初始提交...
git commit -m "初始提交: AI价格智能体项目"
echo.

echo [5] 移除旧的远程仓库...
git remote remove origin
echo.

echo [6] 添加新的远程仓库: https://github.com/DPXJ/TYKJ_AI-price.git
git remote add origin https://github.com/DPXJ/TYKJ_AI-price.git
echo.

echo [7] 强制推送到新仓库 (main分支)...
git push -u origin main --force
echo.

echo ==========================================
echo 完成！
echo ==========================================
pause
