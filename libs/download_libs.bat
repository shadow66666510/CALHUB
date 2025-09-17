@echo off
echo Downloading JavaScript libraries...

:: Create libs folder if it doesn't exist
if not exist libs mkdir libs

:: Download math.js
curl -L -o libs\maths.min.js https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.8.0/math.min.js

:: Download html2canvas
curl -L -o libs\html2canvas.min.js https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js

:: Download jsPDF
curl -L -o libs\jspdf.umd.min.js https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js

echo.
echo ✅ All libraries downloaded successfully into the "libs" folder.
pause
