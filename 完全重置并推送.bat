@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo ==========================================
echo Git 完全重置和推送脚本
echo ==========================================
echo.
echo 警告: 此操作将：
echo 1. 清空所有Git历史记录
echo 2. 创建全新的初始提交
echo 3. 强制推送到新仓库
echo.
echo 新仓库地址: https://github.com/DPXJ/TYKJ_AI-price.git
echo.
pause
echo.

echo [步骤 1/8] 删除 .git 文件夹，清空历史记录...
if exist ".git" (
    rd /s /q ".git"
    echo .git 文件夹已删除
) else (
    echo .git 文件夹不存在，跳过
)
echo.

echo [步骤 2/8] 初始化新的 Git 仓库...
git init
echo.

echo [步骤 3/8] 设置默认分支为 main...
git branch -M main
echo.

echo [步骤 4/8] 添加所有文件到暂存区...
git add .
echo.

echo [步骤 5/8] 创建初始提交...
git commit -m "初始提交: AI价格智能体项目 - UI风格统一完成"
echo.

echo [步骤 6/8] 添加远程仓库...
git remote add origin https://github.com/DPXJ/TYKJ_AI-price.git
echo.

echo [步骤 7/8] 验证远程仓库配置...
git remote -v
echo.

echo [步骤 8/8] 推送到远程仓库...
git push -u origin main --force
echo.

echo ==========================================
echo 完成！代码已推送到新仓库
echo ==========================================
echo.
echo 新仓库地址: https://github.com/DPXJ/TYKJ_AI-price.git
echo.
pause
