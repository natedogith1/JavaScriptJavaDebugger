echo -sourcepath src -d bin > javac-args.ignore
dir /s /B src\*.java >> javac-args.ignore
if not exist bin mkdir bin
javac @javac-args.ignore
if %ERRORLEVEL% GEQ 1 pause
