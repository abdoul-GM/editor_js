@echo off
echo ========================================
echo   Serveur Web Local pour Viewer.html
echo ========================================
echo.
echo Demarrage du serveur sur http://localhost:8000
echo.
echo Ouvrez votre navigateur et allez sur:
echo   http://localhost:8000/viewer.html
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo ========================================
echo.

REM Vérifier si Python est installé
python --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Python n'est pas installe ou n'est pas dans le PATH
    echo.
    echo Telechargez Python depuis: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

REM Lancer le serveur Python
python -m http.server 8000

pause
