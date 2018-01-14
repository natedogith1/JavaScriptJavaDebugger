//////////////////////////////////////////////////////
//
//  Program: an interactive interface for runing
//      javascript code.  Uses file for the interaction.
//      The files are expected to be pipes that will be
//      opened with fileShellClient.js
//
//  Expected Arguments Name: args
//
//  Arguments: inputPipe;outputPipe;libraryPath[;scriptFile[:scriptArgs] ...]
//      inputPipe is the file to read input from
//      outputPipe is the file to write output to
//      libraryPath is the path that
//          shell.loadLibrary uses
//      scriptFile is the name of a file to
//          run when the shell is made
//          if this file starts with a '!' then
//          the code is run before this script returns
//          otherwise the code is run after the console
//          is made
//      scriptArgs will be passed to the function
//          the script returns, if it returns a function
//      libraryPath, scriptFile, and scriptArgs can
//          escape characters using backslashes
//
//////////////////////////////////////////////////////

"use strict";

var shell = {
    libraryPath: "",
    loadedLibraries: {},
    getLibraryPath: function(name) {
        var File = Java.type("java.io.File");
        var arr = name.toString().split(".");
        arr[arr.length-1] += ".js";
        return arr.reduce(function(prev,cur) {
            return new File(prev, cur);
        }, new File(this.libraryPath)).getPath();
    },
    loadLibrary: function(name) {
        if ( ! (name in this.loadedLibraries) )
            this.loadedLibraries[name] = load(this.getLibraryPath(name));
        return this.loadedLibraries[name];
    },
    unloadLibrary: function(name) {
        delete this.loadedLibraries[name]
    },
    findNextNonEscaped: function(search, find, escape) {
        if ( arguments.length < 3 )
            escape = "\\";
        var curFind;
        var midFind = -1;
        while ( (curFind = search.indexOf(find, midFind+1)) >= 0 ) {
            var i = curFind - 1;
            for ( ; i >= 0 && search.charAt(i) === escape; i-- ) {
                // everything is handled in conditions
            }
            if ( (curFind - 1 - i) % 2 === 0 ) {
                // an even number of escapes
                return curFind;
            } else {
                // an odd number of escapes
                midFind = curFind;
            }
        }
        return -1;
    },
    parseEscapes: function(str, escape) {
        if ( arguments.length < 2 )
            escape = "\\";
        escape = escape.charCodeAt(0).toString(16);
        escape = "0000".substr(escape.length) + escape;
        return str.replace( RegExp("\\u" + escape + "(.)", "g"), "$1" );
    }
}
shell.loadLib = shell.loadLibrary;
shell.unloadLib = shell.unloadLibrary;


(function(){
    if ( shell.findNextNonEscaped(args, ";") >= 0 ) {
        inputPipe = args.substring(0, shell.findNextNonEscaped(args, ";"));
    } else {
        inputPipe = args;
    }
    args = args.substr(inputPipe.length + 1);
    inputPipe = shell.parseEscapes(inputPipe);
    if ( shell.findNextNonEscaped(args, ";") >= 0 ) {
        outputPipe = args.substring(0, shell.findNextNonEscaped(args, ";"));
    } else {
        outputPipe = args;
    }
    args = args.substr(outputPipe.length + 1);
    outputPipe = shell.parseEscapes(outputPipe);

    if ( shell.findNextNonEscaped(args,";") >= 0 )
        shell.libraryPath = args.substring(0, shell.findNextNonEscaped(args,";"));
    else
        shell.libraryPath = args;
    args = args.substr(shell.libraryPath.length + 1);
    shell.libraryPath = shell.parseEscapes(shell.libraryPath);
    
    
    var FileReader = Java.type("java.io.FileReader");
    var FileWriter = Java.type("java.io.FileWriter");
    var javaString = Java.type("java.lang.String");
    var Thread = Java.type("java.lang.Thread");
    var ThreadGroup = Java.type("java.lang.ThreadGroup");
    var StringBuilder = Java.type("java.lang.StringBuilder");
    var Writer = Java.type("java.io.Writer");
    var Reader = Java.type("java.io.Reader");
    var PipedWriter = Java.type("java.io.PipedWriter");
    var PipedReader = Java.type("java.io.PipedReader");
    
    var inputPipe;
    var outputPipe;
    
    var mainThread = new Thread(function() {
        var inFileReader;
        var outFileWriter;
        
        function resetFiles() {
            if ( inFileReader )
                inFileReader.close();
            if ( outFileWriter )
                outFileWriter.close();
            inFileReader = new FileReader(inputPipe);
            outFileWriter = new FileWriter(outputPipe);
        }
        resetFiles();

        function safeCall(obj, funcname, a, b, c) {
            var argCount = arguments.length - 2;
            try {
                if ( argCount == 0 ) {
                    return obj[funcname]();
                } else if ( argCount == 1 ) {
                    return obj[funcname](a);
                } else if ( argCount == 3 ) {
                    return obj[funcname](a,b,c);
                } else {
                    throw "invalid argument count[" + arguments.length +"]";
                }
            } catch ( e ) {
                if ( e instanceof java.io.IOException ) {
                    if ( e.getMessage() == "Broken pipe" ) {
                        e = undefined;
                        resetFiles();
                        if ( argCount == 0 ) {
                            return obj[funcname]();
                        } else if ( argCount == 1 ) {
                            return obj[funcname](a);
                        } else if ( argCount == 3 ) {
                            return obj[funcname](a,b,c);
                        }
                    }
                }
                if ( e !== undefined ) {
                    throw e;
                }
            }
        }

        var inStream_super;
        var inStream = new (Java.extend(Reader)){
            close: function() {
                return safeCall(inFileReader, "close()");
            },
            read: function(a, b, c) {
                if ( arguments.length == 0 ) {
                    return safeCall(inFileReader, "read()");
                } else if ( arguments.length == 1 ) {
                    return inStream_super.read(a);
                } else if ( arguments.lenght == 3 ){
                    return safeCall(inFileReader, "read(char[],int,int)", a, b, c);
                }
            },
            ready: function() {
                return safeCall(inFileReader, "ready()");
            }
        };
        inStream_super = Java.super(inStream);

        var outStream_super;
        var outStream = new (Java.extend(Writer)){
            write: function(a, b, c) {
                if ( arguments.length == 1 ) {
                    return outStream_super.write(a);
                } else if ( arguments.length == 3 ) {
                    if ( a instanceof java.lang.String ) {
                        return safeCall(outFileWriter, "write(java.lang.String,int,int)", a, b, c);
                    } else { 
                        return safeCall(outFileWriter, "write(char[],int,int)", a, b, c);
                    }
                }
            },
            flush: function() {
                return safeCall(outFileWriter, "flush()");
            },
            close: function() {
                return safeCall(outFileWriter, "close()");
            }
        };
        outStream_super = Java.super(outStream);

        var curText = new StringBuilder();
        var inWriter = new PipedWriter();
        var codeThread = null;
        var codeThreadGroup = new ThreadGroup("Javascript File Shell Code");

        function outputText(text) {
            outStream.write(text);
            outStream.flush();
        }

        function resetReader() {
            var inReader = new PipedReader();
            inWriter = new PipedWriter(inReader);
            context.setReader(inReader);
        }

        function runFunction(func) {
            codeThread = new Thread(codeThreadGroup, function() {
                try {
                    func();
                } finally {
                    curText.setLength(0);
                    codeThread = null;
                    inWriter.close();
                    outputText("> ");
                }
            });
            resetReader();
            codeThread.setName("javascript code: " + curText);
            codeThread.start();
        }

        var inputThread = new Thread(function() {
            while ( true ) {
                var curChar = inStream.read();
                if ( curChar == -1 ) {
                    // the other end of the pipe was closed
                    // so re-open the pipe
                    resetFiles();
                } else if ( curChar == 0x1B /*escape*/ ) {
                    codeThread.interrupt();
                } else if ( curChar == "\n".charCodeAt(0) ) {
                    if ( ! codeThread ) {
                        runFunction(function(){
                            try {
                                var tmp = eval;
                                // give eval a different name, so that it
                                // executes in the global context
                                var res = tmp(curText.toString());
                                if ( typeof res != "undefined" ) {
                                    print(res);
                                }
                            } catch( e ) {
                                print(e);
                            }
                        });
                    } else {
                        inWriter.write("" + curText + "\n");
                    }
                    //java.lang.System.out.println();
                } else {
                    curText["append(char)"](curChar);
                    //java.lang.System.out["print(char)"](curChar);
                }
            }
        });
        inputThread.start();

        var outWriter_super;
        var outWriter = new (Java.extend(Writer)){
            write: function(a,b,c) {
                if ( arguments.length == 1 ) {
                    outWriter_super.write(a);
                } else {
                    if ( a instanceof javaString ) {
                        outWriter_super.write(a, b, c);
                    } else {
                        outputText(new javaString(a,b,c));
                    }
                }
            },
            flush: function(){},
            close: function(){}
        }
        outWriter_super = Java.super(outWriter);
        context.setWriter(outWriter);
        context.setErrorWriter(outWriter);
        resetReader();

        runFunction(function(){
            var scripts = args;
            var scriptName;
            var scriptArgs;
            var script;
            while ( scripts.length > 0 ) {
                if ( shell.findNextNonEscaped(scripts, ";") >= 0 )
                    scriptArgs = scripts.substring(0, shell.findNextNonEscaped(scripts, ";"));
                else
                    scriptArgs = scripts;
                scripts = scripts.substr(scriptArgs.length + 1);
                if ( shell.findNextNonEscaped(scriptArgs, ":") >= 0 )
                    scriptName = scriptArgs.substring(0, shell.findNextNonEscaped(scriptArgs, ":"));
                else
                    scriptName = scriptArgs;
                scriptArgs = scriptArgs.substr(scriptName.length+1);
                scriptName = shell.parseEscapes(scriptName);
                scriptArgs = shell.parseEscapes(scriptArgs);
                if ( ! scriptName.startsWith("!") ) {
                    script = load(scriptName);
                    if ( typeof script == "function" )
                        script(scriptArgs);
                }
            }
        });
    });
    mainThread.start();
})();

(function(){
    var scripts = args;
    var scriptName;
    var scriptArgs;
    var script;
    while ( scripts.length > 0 ) {
        if ( shell.findNextNonEscaped(scripts, ";") >= 0 )
            scriptArgs = scripts.substring(0, shell.findNextNonEscaped(scripts, ";"));
        else
            scriptArgs = scripts;
        scripts = scripts.substr(scriptArgs.length + 1);
        if ( shell.findNextNonEscaped(scriptArgs, ":") >= 0 )
            scriptName = scriptArgs.substring(0, shell.findNextNonEscaped(scriptArgs, ":"));
        else
            scriptName = scriptArgs;
        scriptArgs = scriptArgs.substr(scriptName.length+1);
        scriptName = shell.parseEscapes(scriptName);
        scriptArgs = shell.parseEscapes(scriptArgs);
        if ( scriptName.startsWith("!") ) {
            script = load(scriptName.substring(1));
            if ( typeof script == "function" )
                script(scriptArgs);
        }
    }
})();

/*
var FileReader = Java.type("java.io.FileReader");
var FileWriter = Java.type("java.io.FileWriter");

var inStream = new FileReader("./pipein.ignore");
var outStream = new FileWriter("./pipeout.ignore");

var inBuff = new (Java.type("char[]"))(1024);
var sysIn = new (Java.type("java.io.InputStreamReader"))(java.lang.System.in);
var sysOut = new (Java.type("java.io.OutputStreamWriter"))(java.lang.System.out);

print("ready");

while(true) {
    if ( inStream.ready() ) {
        var count = inStream.read(inBuff);
        sysOut.write(inBuff, 0, count);
        sysOut.flush();
    }
    if ( sysIn.ready() ) {
        var count = sysIn.read(inBuff);
        outStream.write(inBuff, 0, count);
        outStream.flush();
    }
}
*/
