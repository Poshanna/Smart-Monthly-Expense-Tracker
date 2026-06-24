@echo off
echo Starting git setup and push!

REM Initialize git
git init
if %errorlevel% neq 0 (
    echo Git not found! Please install git first from https://git-scm.com/download/win
    pause
    exit /b 1
)

REM Configure user (customize these!
set /p git_name="Enter your git name: "
set /p git_email="Enter your git email: "

git config user.name "%git_name%"
git config user.email "%git_email%"

REM Add and commit
git add .
git commit -m "Initial commit of Smart Expense Tracker"

REM Add remote and push
git remote add origin https://github.com/Poshanna/Travel-Expense-Predictor.git
git branch -M main

echo Now pushing to github...
echo If this fails because the repo isn't empty, pull first
echo If you have existing files, run: git pull origin main --allow-unrelated-histories
git push -u origin main

echo Done!
pause
