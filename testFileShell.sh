#!/bin/bahs

if [ ! -p ./pipein.ignore ]
then
    mkfifo ./pipein.ignore
fi

if [ ! -p ./pipeout.ignore ]
then
    mkfifo ./pipeout.ignore
fi

java -javaagent:"debugger.jar=./scripts/shell.js;inst:args:;./scripts/libs/;fileShell:./pipein.ignore\\;./pipeout.ignore\\;false" -jar debugger.jar "./scripts/nothing.js;inst:args:;"
