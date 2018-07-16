//////////////////////////////////////////////////////
//
//  Program: an interactive interface for runing
//      javascript code
//
//  Expected Arguments Name: args
//
//  Arguments: libraryPath[;scriptFile[:scriptArgs] ...]
//      libraryPath is the path that
//        shell.loadLibrary uses
//      scriptFile is the name of a file to
//        run when the shell is made
//        if this file starts with a '!' then it is a file path
//        if it doesn't, this is a library
//        if the script returns a function, it will be called with scriptArgs
//        if the script returns an object with an init_shell function, it will
//        be called with scriptArgs
//      scriptArgs will be passed to the scriptFile
//      libraryPath, scriptFile, and scriptArgs can
//        escape characters using backslashes
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
	},
	printException: function(e) {
		var stack;
		if ( e instanceof Error ) {
			print(e.stack);
		} else if ( typeof e == "string" ) {
			print("Got exception: " + e);
		} else {
			e.printStackTrace(new java.io.PrintWriter(context.getWriter()));
			//print(e + "\n" + Java.type("jdk.nashorn.api.scripting.NashornException").getScriptStackString(e));
		}
	},
}
shell.loadLib = shell.loadLibrary;
shell.unloadLib = shell.unloadLibrary;
if ( shell.findNextNonEscaped(args,";") >= 0 )
	shell.libraryPath = args.substring(0, shell.findNextNonEscaped(args,";"));
else
	shell.libraryPath = args;
args = args.substr(shell.libraryPath.length + 1);
shell.libraryPath = shell.parseEscapes(shell.libraryPath);



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
		//scriptName = java.nio.file.Paths.get(shell.libraryPath).resolve(scriptName).toString();
		//print(scriptName);
		//script = load(scriptName.substring(1));
		//script = shell.loadLib('swingShell');
		script = load(shell.getLibraryPath('swingShell'))
		if ( typeof script == "function" )
			script(scriptArgs);
	}
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
		} else {
			script = shell.loadLib(scriptName);
		}
		if ( typeof script == "function" ) {
			script(scriptArgs);
		} else if ( typeof script == "object" && typeof script.initShell == "function" ) {
			script.initShell(scriptArgs);
		}
	}
})();
