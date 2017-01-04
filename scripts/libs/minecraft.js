"use strict";

(function(){
  if ( typeof minecraft === "undefined" || typeof minecraft.mcpLocation === "undefined" )
    throw "minecraft.mcpLocation must be defined before loading this library";
  var minecraft = {
    fields: null, // contains srg field -> name field mapping
    revFields: null, // contains name field -> srg field[]
    methods: null, // contains srg method -> name method mapping
    revMethods: null, // contains name mehtod -> srg method[]
    wrapedName: "wrapedMinecraftObject", // name of the field that the object is stored when using minecraft.to(object)
    from: null, // unwraps object
    to: null, // wraps object
    translate: null, // translates the string into human-intended text
  };
  var debugUtils = shell.loadLib("debugUtils");
  
  var File = Java.type("java.io.File");
  var Files = Java.type("java.nio.file.Files");
  var DynamicMethod = Java.type("jdk.internal.dynalink.beans.DynamicMethod"); // Java method representation
  var Class = Java.type("java.lang.Class");
  var StatCollector = debugUtils.findClass("net.minecraft.util.StatCollector").static;
  
  var targetVersion = Java.type("net.minecraftforge.common.MinecraftForge").MC_VERSION;
  
  var folders = Java.from(new File(minecraft.mcpLocation).listFiles());
  folders = folders.filter(function(element) {
    if ( ! element.isDirectory() )
      return false;
    if ( ! element.getName().startsWith("mcp") )
      return false;
    var lines = Files.readAllLines(element.toPath().resolve("conf").resolve("version.cfg"));
    lines.removeIf(function(line){
      var result = /^(?:ClientVersion|ServerVersion) = (.*)$/.exec(line);
      return result == null || result[1] != targetVersion;
    });
    return lines.size() > 0;
  });
  if ( folders.length <= 0 )
    throw "no mcp version found";
  if ( folders.length > 1 )
    print("too many mcp versions found [" + folders.map(function(element){return element.getName()}).join(",") + "], using " + folders[0].getName());
  
  var conf = folders[0].toPath().resolve("conf");
  minecraft.fields = {};
  minecraft.revFields = {};
  var fields = Files.readAllLines(conf.resolve("fields.csv"))
  fields.remove(0); // first line is user-centric text that tells us what each column means
  fields.forEach(function(line) {
    var parts = line.split(",");
    if ( ! (parts[0] in minecraft.fields) ) { // because some things have entries for both client and server side
      minecraft.fields[parts[0]] = parts[1];
      if ( ! (parts[1] in minecraft.revFields) )
        minecraft.revFields[parts[1]] = [];
      minecraft.revFields[parts[1]].push(parts[0]);
    }
  });
  
  minecraft.methods = {};
  minecraft.revMethods = {};
  var methods = Files.readAllLines(conf.resolve("methods.csv"));
  methods.remove(0);
  methods.forEach(function(line) {
    var parts = line.split(",");
    if ( ! (parts[0] in minecraft.methods) ) { // because some things have entries for both client and server side
      minecraft.methods[parts[0]] = parts[1];
      if ( ! (parts[1] in minecraft.revMethods) )
        minecraft.revMethods[parts[1]] = [];
      minecraft.revMethods[parts[1]].push(parts[0]);
    }
  });
  
  var primitiveTypes = {};
  primitiveTypes["undefined"] = true,
  primitiveTypes["boolean"] = true;
  primitiveTypes["number"] = true;
  primitiveTypes["string"] = true;
  // because we can't Function.call.apply(JS Java Class Wrapper Method)
  // Function.call.apply(java.lang.Object.class.toString()) will sometimes work
  // and sometimes not
  var functionWrapperCache = {};
  var getFunctionWrapper = function(arity) {
    if ( ! (arity in functionWrapperCache) ) {
      var args = ""
      for ( var i = 0; i < arity; i++ ) {
        if ( i != 0 )
          args += ",";
        args += "a" + i;
      }
      functionWrapperCache[arity] = new Function(
        "object,methodName"+(arity<=0?"":","+args),
        "return object[methodName](" + args + ");");
    }
    return functionWrapperCache[arity];
  }
  var newWrapperCache = {};
  var getNewWrapper = function(arity) {
    if ( ! (arity in newWrapperCache) ) {
      var args = ""
      for ( var i = 0; i < arity; i++ ) {
        if ( i != 0 )
          args += ",";
        args += "a" + i;
      }
      newWrapperCache[arity] = new Function(
        "object,methodName"+(arity<=0?"":","+args),
        "return new object(" + args + ");");
    }
    return newWrapperCache[arity];
  }
  minecraft.to = function(obj) {
    if ( primitiveTypes[typeof obj] || obj === null )
      return obj; // return primitives unmodified
    if ( minecraft.from(obj) != obj ) //this is already a wraped object
      return obj; // don't wrap a wraper
    var hasKey = function(obj,key) {
      return Object.prototype.hasOwnProperty.call(obj,key);
    };
    var getRealFieldKey = function(key) {
      if ( hasKey(minecraft.revFields, key) ) {
        var tmp = minecraft.revMethods[key].filter(function(key2){
          return typeof obj[key2] != "undefined" && obj[key2] != null;
        });
        if ( tmp.length > 1 )
          print("Found multiple mappings for " + key);
        if ( tmp.length > 0 )
          return tmp[0];
      }
      return key;
    }
    var getRealMethodKeys = function(key) {
      var result = [];
      if ( hasKey(minecraft.revMethods, key) ) {
        minecraft.revMethods[key].forEach(function(key2){
          if ( typeof obj[key2] != "undefined" && obj[key2] != null )
            result.push(key2);
        });
      }
      if ( typeof obj[key] != "undefined" && obj[key] != null )
        result.push(key);
      return result;
    };
    return new JSAdapter({
      __get__ : function(key) {
        if ( key == minecraft.wrapedName )
          return obj;
        return minecraft.to(obj[getRealFieldKey(key)]);
      },
      __put__ : function(key, value, strict) {
        return minecraft.to(obj[getRealFieldKey(key)] = value);
      },
      __call__ : function(name) {
        if ( name == "toString" ) {
          // Java Class wrapepr don't have a toString, so we give them one
          if ( typeof obj.class != "undefined" && obj.class instanceof Class && obj.class.static == obj ) {
            return "[adapted]" + obj;
          }
        }
        var keys = getRealMethodKeys(name);
        if ( keys.length <= 0 )
          throw new TypeError(name + " is not a function");
        var args = [obj,keys[0]];
        for ( var i = 1; i < arguments.length; i++ )
          args.push(minecraft.from(arguments[i]));
        var firstErr = null;
        for ( var i = 0; i < keys.length; i++ ) {
          args[1] = keys[i];
          try {
            return minecraft.to(getFunctionWrapper(arguments.length-1).apply(null,args));
          }catch(e){
            if ( e instanceof TypeError ) {
              if ( ! firstErr )
                firstErr = e;
            }else{
              throw e;
            }
          }
        }
        // we'll only get here if every attempted method threw a TypeError
        throw new TypeError("issue on all keys [" + keys + "]");
      },
      __new__ : function() {
        var args = [obj];
        for ( var i = 1; i < arguments.length; i++ )
          args.push(minecraft.from(arguments[i]));
        return minecraft.to(getNewWrapper(arguments.length).apply(null,args));
      },
      __getIds__ : function() {
        var arr = [];
        for ( key in obj ) {
          if ( hasKey(minecraft.fields, key) ) {
            arr.push(minecraft.fields[key]);
          } else if ( hasKey(minecraft.methods, key) ) {
            arr.push(minecraft.methods[key]);
          } else {
            arr.push(key);
          }
        }
        return arr;
      },
      /*__getKeys__ : function() {
        
      },*/ // same as __getIds__, but __getIds__ takes precidence
      __getValues__ : function() {
        var arr = []
        for each ( e in obj ) {
          arr.push(e);
        }
        return e;
      },
      __has__ : function(key) {
        return getRealFieldKey(key) in obj;
      },
      __delete__ : function(key, strict) {
        return delete obj[key]
      },
      __preventExtensions__ : function() {
        return obj.preventExtensions.apply(obj, arguments);
      },
      __isExtensible__ : function() {
        return obj.isExtensible.apply(obj, arguments);
      },
      __seal__ : function() {
        return obj.seal.apply(obj, arguments);
      },
      __isSealed__ : function() {
        return obj.isSealed.apply(obj, arguments);
      },
      __freeze__ : function() {
        return obj.freeze.apply(obj, arguments);
      },
      __isFrozen__ : function() {
        return obj.isFrozen.apply(obj, arguments);
      }
    });
  };
  minecraft.from = function(obj) {
    if ( primitiveTypes[typeof obj] || obj === null )
      return obj; // return primitives unmodified
    if ( typeof obj[minecraft.wrapedName] != "undefined" && obj[minecraft.wrapedName] != null )
      return obj[minecraft.wrapedName];
    return obj
  };
  minecraft.translate = function(str) {
    return minecraft.from(minecraft.to(StatCollector).translateToLocal(str));
  }
  return minecraft;
});