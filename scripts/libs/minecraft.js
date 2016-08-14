"use strict";

var minecraft = {
  fields: null, // contains srg field -> name field mapping
  revFields: null, // contains name field -> srg field[]
  methods: null, // contains srg method -> name method mapping
  revMethods: null, // contains name mehtod -> srg method[]
  wrapedName: "wrapedMinecraftObject", // name of the field that the object is stored when using minecraft.to(object)
  from: null, // unwraps object
  to: null, //wraps object
};

(function(){
  var mcpLocation = "C:\\Users\\Nathan\\Desktop\\mcp\\";
  
  var File = Java.type("java.io.File");
  var Files = Java.type("java.nio.file.Files");
  
  var targetVersion = Java.type("net.minecraftforge.common.ForgeVersion").mcVersion;
  
  var folders = new File(mcpLocation).listFiles();
  folders.removeIf(function(element) {
    var lines = Files.readAllLines(element.toPath().resolve("conf").resolve("versions.cfg"));
    lines.removeIf(function(line){
      var result = /^(?:ClientVersion|ServerVersion) = (.*)$/.exec(line);
      return result == null || result[2] != targetVersion;
    });
    return lines.size() <= 0;
  });
  if ( folder.length <= 0 )
    throw "no mcp version found";
  if ( folder.length > 1 )
    print("too many mcp versions found, using " + folders[0].getName());
  
  var conf = foldres[0].toPath.resolve("conf");
  minecraft.fields = {};
  minecraft.revFields = {};
  var fields = Files.readAllLines(conf.resolve("fields.csv"))
  fields.remove(0); // first line is user-centric text that tells us what each column means
  fields.forEach(function(line) {
    var parts = line.split(",");
    minecraft.fields[parts[0]] = parts[1];
    if ( typeof minecraft.revFields[parts[1]] == "undefined" )
      minecraft.revFields[parts[1]] = [];
    minecraft.revFields[parts[1]].push(parts[0]);
  });
  
  minecraft.methods = {};
  minecraft.revMethods = {};
  var methods = Files.readAllLines(conf.resolve("methods.csv"));
  methods.remove(0);
  methods.forEach(function(line) {
    var parts = line.split(",");
    minecraft.methods[parts[0]] = parts[1];
    if ( typeof minecraft.revMethods[parts[1]] == "undefined" )
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
    return new JSAdapter({
      getRealKey: function(key) {
        var tmp;
        if ( typeof obj[key] == "undefined") {
          if ( typeof minecraft.revFields[key] != "undefined" ) {
            tmp = minecraft.revFields[key].filter(function(key2){
              return typeof obj[key2] != "undefined";
            });
            if ( tmp.length > 1 )
              print("Found multiple mappings for " + key);
            if ( tmp.length > 0 )
              return tmp[0]
          }
          if ( typeof minecraft.revMethods[key] != "undefined" ) {
            tmp = minecraft.revMethods[key].filter(function(key2){
              return typeof obj[key2] != "undefined";
            });
            if ( tmp.length > 1 )
              print("Found multiple mappings for " + key);
            if ( tmp.length > 0 )
              return tmp[0]
          }
        }
        return key;
      },
      __get__ : function(key) {
        if ( key == minecraft.wrapedName )
          return obj;
        return minecraft.from(obj[this.getRealKey(key)]);
      },
      __put__ : function(key, value, strict) {
        return minecraft.from(obj[this.getRealKey(key)] = value);
      },
      __call__ : function(name) {
        // use, apply.call, because I don't know what the underlaying value is
        return minecraft.from(Function.prototype.apply.call(obj[this.getRealKey(name)],obj,Array.from(arguments).shift()));
      },
      __new__ : function() {
        // yay funkiness, this seems to be the easiest way to get new.
        return minecraft.from(new (Function.prototype.bind.apply(obj[this.getRealKey(name)], arguments)));
      },
      __getIds__ : function() {
        var arr = [];
        for ( key in obj ) {
          if ( typeof minecraft.fields[key] != "undefined" ) {
            arr.push(minecraft.fields[key]);
          } else if ( typeof minecraft.methods[key] != "undefined" ) {
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
        return typeof this.getRealKey(key) != "undefined";
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
  }
  minecraft.to = function(obj) {
    if ( primitiveTypes[typeof obj] || obj === null )
      return obj; // return primitives unmodified
    return obj[minecraft.wrapedName];
  }
})();