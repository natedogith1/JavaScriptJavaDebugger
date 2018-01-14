//////////////////////////////////////////////////////
//
//  Program: a conventient interface to fileShell.js,
//      writes stdin to outputPipe, write inputPipe to
//      stdout
//
//  Expected Argumetns Name: args
//
//  Arguments: outputPipe;inputPipe[;ignored]
//      outputPipe is the file to write output to
//      inputPipe is the file to read input from
//      ignored is ignored by the program, it exists
//          to allow args to be coppied from fileShell.js
//          
//
//////////////////////////////////////////////////////
"use strict";

function findNextNonEscaped(search, find, escape) {
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
}

function parseEscapes(str, escape) {
    if ( arguments.length < 2 )
        escape = "\\";
    escape = escape.charCodeAt(0).toString(16);
    escape = "0000".substr(escape.length) + escape;
    return str.replace( RegExp("\\u" + escape + "(.)", "g"), "$1" );
}

var FileReader = Java.type("java.io.FileReader");
var FileWriter = Java.type("java.io.FileWriter");

var inputPipe;
var outputPipe;

if ( findNextNonEscaped(args, ";") >= 0 ) {
    outputPipe = args.substring(0, findNextNonEscaped(args, ";"));
} else {
    outputPipe = args;
}
args = args.substr(outputPipe.length + 1);
outputPipe = parseEscapes(outputPipe);
if ( findNextNonEscaped(args, ";") >= 0 ) {
    inputPipe = args.substring(0, findNextNonEscaped(args, ";"));
} else {
    inputPipe = args;
}
args = args.substr(inputPipe.length + 1);
inputPipe = parseEscapes(inputPipe);

// these need to be flipped from fileShell.js, so that 
// the files are opened in the same order (otherwise
// we'll deadlock on pipes)
var outStream = new FileWriter(outputPipe);
var inStream = new FileReader(inputPipe);

var inBuff = new (Java.type("char[]"))(1024);
var sysIn = new (Java.type("java.io.InputStreamReader"))(java.lang.System.in);
var sysOut = new (Java.type("java.io.OutputStreamWriter"))(java.lang.System.out);

print("ready");

try {
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
} catch ( e ) {
    if ( e instanceof java.io.IOException ) {
        if ( e.getMessage() == "Broken pipe" ) {
            e = undefined;
        }
    }
    if ( e !== undefined ) {
        throw e;
    }
}
