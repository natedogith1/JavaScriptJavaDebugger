#!/bin/bahs

if [ ! -p ./pipein.ignore ]
then
    mkfifo ./pipein.ignore
fi

if [ ! -p ./pipeout.ignore ]
then
    mkfifo ./pipeout.ignore
fi

java -jar debugger.jar "./scripts/fileShellClient.js;inst:args:;./pipein.ignore;./pipeout.ignore"
