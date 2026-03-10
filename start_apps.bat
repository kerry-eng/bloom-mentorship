@echo off
echo Starting Admin Panel (Port 5174)...
start cmd /k "cd /d \"C:\Users\glori\OneDrive\Desktop\Admin Panel\" && npm run dev"

echo Starting Mentorship (Port 5173)...
start cmd /k "cd /d \"C:\Users\glori\OneDrive\Desktop\Mentorship\" && npm run dev"

echo.
echo Both applications are starting in separate windows.
echo Admin Panel: http://localhost:5174
echo Mentorship: http://localhost:5173
echo.
pause
