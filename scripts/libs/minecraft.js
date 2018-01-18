"use strict";

(function(){
  var vanilla = {
    forward: {}, // contains srg -> entry
    backward: {}, // contains name -> entry
    params: {}, // contains srg method parameter -> entry
    wrapedName: "wrapedMinecraftObject", // name of the field that the object is stored when using vanilla.wrap(object)
    unwrap: null, // unwraps object
    wrap: null, // wraps object
    getDescription: null, // getDescription(object, field or method name), returns the descriptive text for a method or field fo an object
    translate: null, // translates the string into human-intended text
  };
  var debugUtils = shell.loadLib("debugUtils");
  var minecraftVersion;
  
  var RealmsSharedConstants = debugUtils.findClass("net.minecraft.realms.RealmsSharedConstants");
  var MinecraftForge = debugUtils.findClass("net.minecraftforge.common.MinecraftForge");
  if ( RealmsSharedConstants ) {
    minecraftVersion = RealmsSharedConstants.static.VERSION_STRING;
  } else if ( MinecraftForge ) {
      minecraftVersion = MinecraftForge.static.MC_VERSION;
  } else {
    throw "could not find class net.minecraft.realms.RealmsSharedConstants or net.minecraftforge.common.MinecraftForge";
  }
  var Class = Java.type("java.lang.Class");
  var StatCollector = debugUtils.findClass("net.minecraft.util.StatCollector").static;
  var URL = Java.type("java.net.URL");
  var InputStreamReader = Java.type("java.io.InputStreamReader");
  var StringBuilder = Java.type("java.lang.StringBuilder");
  var charArray = Java.type("char[]");
  var ZipInputStream = Java.type("java.util.zip.ZipInputStream");
  var byteArray = Java.type("byte[]");
  var javaString = Java.type("java.lang.String");
  var Modifier = Java.type("java.lang.reflect.Modifier");
  var MinecraftServer = debugUtils.findClass("net.minecraft.server.MinecraftServer").static;
  var DimensionManager = debugUtils.findClass("net.minecraftforge.common.DimensionManager").static;
  
  // based on https://github.com/bspkrs/MCPMappingViewer/
  var versionURL = new URL("http://export.mcpbot.bspk.rs/versions.json");
  var versionConnection = versionURL.openConnection();
  var reader = new InputStreamReader(versionConnection.getInputStream());
  var charBuffer = new charArray(1024);
  var builder = new StringBuilder();
  var charsRead;
  while ( (charsRead = reader.read(charBuffer)) >= 0 ) {
    builder.append(charBuffer, 0, charsRead);
  }
  reader.close();
  
  var channel = "stable";
  
  var versions = JSON.parse(builder.toString())[minecraftVersion][channel]
  var version = versions.sort()[versions.length-1];
  
  var mappingURL = new URL("http://export.mcpbot.bspk.rs/mcp_" + channel + "/" + version + "-" + minecraftVersion + "/mcp_" + channel + "-" + version + "-" + minecraftVersion + ".zip");
  var mappingConnection = mappingURL.openConnection();
  var mappingZipStream = new ZipInputStream(mappingConnection.getInputStream());
  
  var zipEntry;
  while ( (zipEntry = mappingZipStream.getNextEntry()) != null ) {
    if ( ! zipEntry.getName().endsWith(".csv") ) {
      continue;
    }
    var byteBuffer = new byteArray(1024);
    var stringBuilder = new StringBuilder();
    var pos = 0;
    while ( pos < zipEntry.getSize() ) {
        var countRead = mappingZipStream.read(byteBuffer);
        stringBuilder.append(new javaString(byteBuffer, 0, countRead));
        pos += countRead;
    }
    var str = stringBuilder.toString();
    var strChars = str.split("");
    var lines = [[]];
    var curSegment = "";
    var inQuoted = false;
    for ( var i = 0; i < str.length; i++ ) {
      if ( strChars[i] == '"' ) {
        if ( curSegment.length <= 0 ) {
          inQuoted = true;
        } else if ( i+1 < strChars.length && strChars[i+1] == '"' ) {
          curSegment += '"';
          i++;
        } else {
            inQuoted = false;
        }
      } else if ( strChars[i] == "," && ! inQuoted ) {
        lines[lines.length-1].push(curSegment);
        curSegment = "";
      } else if ( strChars[i] == "\r" && i+1 < strChars.length && strChars[i+1] == "\n" && !inQuoted ) {
        lines[lines.length-1].push(curSegment);
        curSegment = "";
        lines.push([]);
        i++;
      } else {
        curSegment += strChars[i];
      }
    }
    for ( var i = 1; i < lines.length; i++ ) { // first line is header
      var line = lines[i];
      var entry = {};
      for ( var j = 0; j < lines[0].length; j++ ) {
        entry[lines[0][j]] = line[j];
      }
      if ( zipEntry.getName() == "fields.csv" || zipEntry.getName() == "methods.csv" ) {
        vanilla.forward[entry.searge] = entry;
        if ( ! (entry.name in vanilla.backward) ) {
          vanilla.backward[entry.name] = [];
        }
        vanilla.backward[entry.name].push(entry);
      } else if ( zipEntry.getName() == "params.csv" ) {
        if ( ! (entry.param in vanilla.params) ) {
          vanilla.params[entry.param] = entry;
        }
      }
    }
  }
  mappingZipStream.close();
  
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
        "object"+(arity<=0?"":","+args),
        "return new object(" + args + ");");
    }
    return newWrapperCache[arity];
  };
  var hasKey = function(obj, key) {
      return Object.prototype.hasOwnProperty.call(obj,key);
  };
  var getRealKeys = function(obj, key) {
    var tmp;
    if ( hasKey(vanilla.backward, key) ) {
      tmp = vanilla.backward[key].map(function(entry){
        return entry.searge;
      })
    } else {
      tmp = [];
    }
    tmp.unshift(key);
    return tmp.filter(function(searge){
      try { 
        return obj.getField(searge);
      } catch (e) {
        return obj[searge] != null;
      }
    });
  }
  var getRealKeyRaw = function(obj, key) {
    var keys = getRealKeys(obj, key);
    if ( keys.length > 1 ) {
      print("Found multiple mappings for " + key);
    } else if ( keys.length > 0 ) {
      return keys[0];
    } else {
      return undefined;
    }
  };
  var getRealKey = function(obj, key) {
      var realKey = getRealKeyRaw(obj, key);
      if ( realKey === undefined ) {
        throw new Error(key + " does not exist");
      }
      return realKey;
  }
  vanilla.wrap = function(obj) {
    if ( primitiveTypes[typeof obj] || obj === null )
      return obj; // return primitives unmodified
    if ( vanilla.unwrap(obj) != obj ) //this is already a wraped object
      return obj; // don't wrap a wraper
    return new JSAdapter({
      __get__ : function(key) {
        if ( key == vanilla.wrapedName )
          return obj;
        return vanilla.wrap(obj[getRealKey(obj, key)]);
      },
      __put__ : function(key, value, strict) {
        return vanilla.wrap(obj[getRealKey(obj, key)] = value);
      },
      __call__ : function(name) {
        if ( name == "toString" ) {
          // Java Class wrappers don't have a toString, so we give them one
          if ( typeof obj.class != "undefined" && obj.class instanceof Class && obj.class.static == obj ) {
            return function(){"[adapted]" + obj};
          }
        }
        var keys = getRealKeys(obj, name);
        if ( keys.length <= 0 )
          throw new Error(name + " does not exist");
        var args = [obj,keys[0]];
        for ( var i = 1; i < arguments.length; i++ )
          args.push(vanilla.unwrap(arguments[i]));
        var firstErr = null;
        for ( var i = 0; i < keys.length; i++ ) {
          args[1] = keys[i];
          try {
            return vanilla.wrap(getFunctionWrapper(arguments.length-1).apply(null,args));
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
          args.push(vanilla.unwrap(arguments[i]));
        return vanilla.wrap(getNewWrapper(arguments.length).apply(null,args));
      },
      __getIds__ : function() {
        var arr = [];
        for ( key in obj ) {
          if ( hasKey(vanilla.forward, key) ) {
            arr.push(vanilla.forward[key].name);
          } else {
            arr.push(key);
          }
        }
        return arr;
      },
      /*__getKeys__ : function() {
        
      },*/ // same as __getIds__, but __getIds__ takes precidence
      __getValues__ : function() {
        var arr = [];
        for each ( e in obj ) {
          arr.push(vanilla.wrap(e));
        }
        return e;
      },
      __has__ : function(key) {
        return getRealKeyRaw(obj, key) in obj;
      },
      __delete__ : function(key, strict) {
        return delete obj[getRealKeyRaw(obj, key)]
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
  vanilla.unwrap = function(obj) {
    if ( primitiveTypes[typeof obj] || obj === null )
      return obj; // return primitives unmodified
    if ( typeof obj[vanilla.wrapedName] != "undefined" && obj[vanilla.wrapedName] != null )
      return obj[vanilla.wrapedName];
    return obj
  };
  vanilla.getDescription = function(obj, key) {
    var realObj = vanilla.unwrap(obj);
    var entry = vanilla.forward[getRealKey(realObj, key)];
    if ( entry.searge.startsWith("field_") ) {
      return entry.name + ": " + entry.desc;
    } else if ( entry.searge.startsWith("func_") ) {
      var methods = realObj.class.getMethods()
      var method;
      for each ( var m in methods ) {
          if ( m.getName() == entry.searge ) {
              method = m;
              break;
          }
      }
      var paramBase = "p_" + /\d+/.exec(entry.searge) + "_";
      var args = [];
      var offset = 1;
      if ( Modifier.isStatic(m.getModifiers()) ) {
          offset = 0;
      }
      var argTypes = m.getParameterTypes();
      for ( var i = 0; i < argTypes.length; i++ ) {
        if ( vanilla.params[paramBase+(i+offset)+"_"].name ) {
          args.push(argTypes[i].getName() + " " + vanilla.params[paramBase+(i+offset)+"_"].name);
        } else {
          args.push(argTypes[i].getName());
        }
      }
      return m.getReturnType().getName() + " " + entry.name + "(" + args.join(", ") + "): " + entry.desc;
    }
  }
  vanilla.translate = function(str) {
    return vanilla.unwrap(vanilla.wrap(StatCollector).translateToLocal(str));
  }
  vanilla.getPlayer = function(str) {
      return vanilla.wrap(MinecraftServer).getServer().getConfigurationManager().getPlayerByUsername(str);
  }
  vanilla.getWorld = function(id) {
      return vanilla.wrap(DimensionManager).getWorld(id);
  }
  vanilla.runOnMainThread = function(func) {
      return vanilla.wrap(MinecraftServer).getServer().addScheduledTask(func);
  }
  return vanilla;
})();