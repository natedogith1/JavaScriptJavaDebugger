"use strict";

(function() {
	var baseShell = {}

	baseShell.runArguments = function(args) {
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
			} else if ( typeof script == "object" && script.init_shell == "function" ) {
				script.init_shell(scriptArgs);
			}
		}
	}

	baseShell.stringToFunction = function(str) {
		return shell.wrapInExceptionPrinter(function(){
			var tmp = eval;
			// give eval a different name, so that it
			// executes in the global context
			var res = tmp(str);
			if ( typeof res != "undefined" ) {
				print(res);
			}
		})
	}

	return {baseShell: baseShell};
})();