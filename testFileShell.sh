#!/bin/bahs

if [ ! -p ./pipein.ignore ]
then
    mkfifo ./pipein.ignore
fi

if [ ! -p ./pipeout.ignore ]
then
    mkfifo ./pipeout.ignore
fi

java -javaagent:"debugger.jar=./scripts/fileShell.js;inst:args:;./pipein.ignore;./pipeout.ignore;false;./scripts/libs" -jar debugger.jar "./scripts/nothing.js;inst:args:;"
