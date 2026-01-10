@echo off
echo 正在启动移动端原型演示系统...
echo.
echo 请选择启动方式：
echo 1. 使用Python启动服务器（推荐）
echo 2. 使用Node.js启动服务器
echo 3. 直接打开HTML文件
echo.
set /p choice=请输入选择 (1-3): 

if "%choice%"=="1" (
    echo 正在使用Python启动服务器...
    python -m http.server 8000
    if errorlevel 1 (
        echo Python未安装或命令失败，尝试使用python3...
        python3 -m http.server 8000
        if errorlevel 1 (
            echo Python启动失败，请安装Python或选择其他方式
            pause
            exit /b 1
        )
    )
    echo.
    echo 服务器启动成功！
    echo 请在浏览器中访问: http://localhost:8000
    echo 按Ctrl+C停止服务器
    pause
) else if "%choice%"=="2" (
    echo 正在使用Node.js启动服务器...
    npx http-server
    if errorlevel 1 (
        echo Node.js启动失败，请安装Node.js或选择其他方式
        pause
        exit /b 1
    )
) else if "%choice%"=="3" (
    echo 正在打开HTML文件...
    start index.html
    echo HTML文件已打开
    pause
) else (
    echo 无效选择，请重新运行脚本
    pause
    exit /b 1
) 