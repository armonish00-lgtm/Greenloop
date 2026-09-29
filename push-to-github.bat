@echo off
cd /d "C:\Users\armon\.gemini\antigravity\scratch\greenloop"
set PATH=C:\Users\armon\.gemini\antigravity\scratch\mingit\cmd;%PATH%
echo =======================================================
echo   Pushing GreenLoop to https://github.com/armonish00-lgtm/Greenloop
echo =======================================================
git push -u -f origin main
echo.
echo =======================================================
echo   Done! You can close this window now.
echo =======================================================
pause
