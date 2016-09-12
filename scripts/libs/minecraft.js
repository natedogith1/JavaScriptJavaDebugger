"use strict";

(function(){
  var minecraft = {
    fields: null, // contains srg field -> name field mapping
    revFields: null, // contains name field -> srg field[]
    methods: null, // contains srg method -> name method mapping
    revMethods: null, // contains name mehtod -> srg method[]
    wrapedName: "wrapedMinecraftObject", // name of the field that the object is stored when using minecraft.to(object)
    from: null, // unwraps object
    to: null, //wraps object
  };
  var mcpLocation = "C:\\Users\\Nathan\\Desktop\\mcp\\";
  
  var File = Java.type("java.io.File");
  var Files = Java.type("java.nio.file.Files");
  
  var targetVersion = Java.type("net.minecraftforge.common.MinecraftForge").MC_VERSION;
  
  var folders = Java.from(new File(mcpLocation).listFiles());
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
  var count = 0;
  fields.forEach(function(line) {
    count++;
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
    minecraft.methods[parts[0]] = parts[1];
    if ( ! (parts[1] in minecraft.revMethods) )
      minecraft.revMethods[parts[1]] = [];
    minecraft.revMethods[parts[1]].push(parts[0]);
  });
  
  var primitiveTypes = {};
  primitiveTypes["undefined"] = true,
  primitiveTypes["boolean"] = true;
  primitiveTypes["number"] = true;
  primitiveTypes["string"] = true;
  minecraft.from = function(obj) {
    if ( primitiveTypes[typeof obj] || obj === null )
      return obj; // return primitives unmodified
    if ( minecraft.to(obj) != obj ) //this is already a wraped object
      return obj; // don't wrap a wraper
    var hasKey = function(obj,key) {
      return Object.prototype.hasOwnProperty.call(obj,key);
    }
    var getRealKey = function(key) {
      var tmp;
      if ( typeof obj[key] == "undefined" || obj[key] == null ) {
        if ( hasKey(minecraft.revFields, key) ) {
          tmp = minecraft.revFields[key].filter(function(key2){
            return typeof obj[key2] != "undefined" && obj[key2] != null;
          });
          if ( tmp.length > 1 )
            print("Found multiple mappings for " + key);
          if ( tmp.length > 0 )
            return tmp[0];
        }
        if ( hasKey(minecraft.revMethods, key) ) {
          tmp = minecraft.revMethods[key].filter(function(key2){
            return typeof obj[key2] != "undefined" && obj[key2] != null;
          });
          if ( tmp.length > 1 )
            print("Found multiple mappings for " + key);
          if ( tmp.length > 0 )
            return tmp[0];
        }
      }
      return key;
    };
    return new JSAdapter({
      __get__ : function(key) {
        if ( key == minecraft.wrapedName )
          return obj;
        return minecraft.from(obj[getRealKey(key)]);
      },
      __put__ : function(key, value, strict) {
        return minecraft.from(obj[getRealKey(key)] = value);
      },
      __call__ : function(name) {
        var args = [];
        for ( var i = 1; i < arguments.length; i++ )
          args[i-1] = arguments[i];
        // use, apply.call, because I don't know what the underlaying value is
        return minecraft.from(Function.prototype.apply.call(obj[getRealKey(name)],obj,args));
      },
      __new__ : function() {
        // yay funkiness, this seems to be the easiest way to get new.
        return minecraft.from(new (Function.prototype.bind.apply(obj[getRealKey(name)], arguments)));
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
        return getRealKey(key) in obj;
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
  minecraft.to = function(obj) {
    if ( primitiveTypes[typeof obj] || obj === null )
      return obj; // return primitives unmodified
    if ( typeof obj[minecraft.wrapedName] != "undefined" && obj[minecraft.wrapedName] != null )
      return obj[minecraft.wrapedName];
    return obj
  };
  return minecraft;
})();