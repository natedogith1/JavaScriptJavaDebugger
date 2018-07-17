//////////////////////////////////////////////////////
//
//  Program: an interactive interface for runing
//      javascript code.  Uses file for the interaction.
//      The files are expected to be pipes that will be
//      opened with fileShellClient.js
//
//  Expected Arguments Name: args
//
//  Arguments: inputPipe;outputPipe;daemon[;scriptFile[:scriptArgs] ...]
//      inputPipe is the file to read input from
//      outputPipe is the file to write output to
//      daemon is whether or not threads should be
//          spawner as daemon threads. This should
//          either be "true" or "false"
//      scriptFile is the name of a file to
//        run when the shell is made
//        if this file starts with a '!' then it is a file path
//        if it doesn't, this is a library
//        if the script returns a function, it will be called with scriptArgs
//        if the script returns an object with an init_shell function, it will
//        be called with scriptArgs
//      scriptArgs will be passed to the scriptFile
//      scriptFile, and scriptArgs can escape characters using backslashes
//
//////////////////////////////////////////////////////


"use strict";

(function(){
	var fileShell = {};

	fileShell.initShell = function(args) {
		var resultShell = Object.create(shell.loadLib("baseShell").baseShell);

		(function(){
			var inputPipe;
			var outputPipe;
			var daemon;
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

			if ( shell.findNextNonEscaped(args, ";") >= 0 ) {
				daemon = args.substring(0, shell.findNextNonEscaped(args, ";"));
			} else {
				daemon = args;
			}
			args = args.substr(daemon.length + 1);
			daemon = shell.parseEscapes(daemon);
			if ( daemon.toLowerCase() == "true" ) {
				daemon = true;
			} else if ( daemon.toLowerCase() == "false" ) {
				daemon = false;
			} else {
				throw "bad daemon value: " + daemon;
			}

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
					codeThread.setDaemon(daemon);
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
                            if ( codeThread != null ) {
    							codeThread.interrupt();
                            }
						} else if ( curChar == "\n".charCodeAt(0) ) {
							if ( ! codeThread ) {
								runFunction(resultShell.stringToFunction(curText.toString()));
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
                inputThread.setName("javascript input thread");
				inputThread.setDaemon(daemon);
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
					resultShell.runArguments(args);
				});
			});
			mainThread.setDaemon(daemon);
			mainThread.start();
		})();

		return resultShell;
	}

	return fileShell;
})();
