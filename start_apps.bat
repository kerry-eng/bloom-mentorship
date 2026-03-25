@echo off
echo Starting Mentor Portal (Port 4174)...
start cmd /k "cd /d \"C:\Users\glori\OneDrive\Desktop\Mentorship\" && npm run mentor:dev"

echo Starting Mentorship (Port 5173)...
start cmd /k "cd /d \"C:\Users\glori\OneDrive\Desktop\Mentorship\" && npm run dev"

echo.
echo Both applications are starting in separate windows.
echo Mentor Portal: http://localhost:4174
echo Mentorship: http://localhost:5173
echo.
pause
