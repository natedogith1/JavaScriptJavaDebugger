"use strict";
var classInfo = {
  getInfo: null, // getInfo(Class<?>), returns an object contaning: entry.pool, entry.rawPool
  infos: null, // the map used internally to store the info
};

(function () {
  var DataInputStream = Java.type("java.io.DataInputStream");
  var ByteArrayInputStream = Java.type("java.io.ByteArrayInputStream");
  var WeakHashMap = Java.type("java.util.WeakHashMap");
  var PrintStream = Java.type("java.io.PrintStream");
  var OutputStream = Java.type("java.io.OutputStream");
  
  var tagMap = {
    Class: 7,
    Fieldref: 9,
    Methodref: 10,
    InterfaceMethodref: 11,
    String: 8,
    Integer: 3,
    Float: 4,
    Long: 5,
    Double: 6,
    NameAndType: 12,
    Utf8: 1,
    MethodHandle: 15,
    MethodType: 16,
    InvokeDynamic: 18,
    Module: 19,
    Package: 20,
  };
  
  var reverseTagMap = {};
  for ( var name in tagMap ) {
    reverseTagMap[tagMap[name]] = name;
  }
  
  var handleKindMap = {
    getField: 1,
    getStatic: 2,
    putField: 3,
    putStatic: 4,
    invokeVirtual: 5,
    invokeStatic: 6,
    invokeSpecial: 7,
    newInvokeSpecial: 8,
    inbokeInterface: 9,
  }
  
  var reverseHandleKindMap = {};
  for ( var name in handleKindMap ) {
    reverseHandleKindMap[handleKindMap[name]] = name;
  }
  
  var infos = java.util.Collections.synchronizedMap(new WeakHashMap());
  classInfo.infos = infos;
  
  inst.addTransformer(function(loader, className, classBeingRedefined, protectionDomain, classfileBuffer){
    try{
      var entry = {
        rawPool: [],
        pool: [],
      };
      
      var input = new DataInputStream(new ByteArrayInputStream(classfileBuffer));
      input.readInt(); // magic
      input.readUnsignedShort(); // major_version
      input.readUnsignedShort(); // minor_version
      var count = input.readUnsignedShort(); // constant_pool_count
      for ( var i = 1; i < count; i++ ) {
        entry.rawPool[i] = {};
        entry.rawPool[i].tag = input.readUnsignedByte();
        switch ( entry.rawPool[i].tag ) {
          case tagMap.Class:
            entry.rawPool[i].name_index = input.readUnsignedShort();
            break;
          case tagMap.Fieldref:
          case tagMap.Methodref:
          case tagMap.InterfaceMethodref:
            entry.rawPool[i].class_index = input.readUnsignedShort();
            entry.rawPool[i].name_and_type_index = input.readUnsignedShort();
            break;
          case tagMap.String:
            entry.rawPool[i].string_index = input.readUnsignedShort();
            break;
          case tagMap.Integer:
            entry.rawPool[i].value = input.readInt();
            break;
          case tagMap.Float:
            entry.rawPool[i].value = input.readFloat();
            break;
          case tagMap.Long:
            entry.rawPool[i].value = input.readLong();
            i++;
            break;
          case tagMap.Double:
            entry.rawPool[i].value = input.readDouble();
            i++;
            break;
          case tagMap.NameAndType:
            entry.rawPool[i].name_index = input.readUnsignedShort();
            entry.rawPool[i].descriptor_index = input.readUnsignedShort();
            break;
          case tagMap.Utf8:
            entry.rawPool[i].value = input.readUTF();
            break;
          case tagMap.MethodHandle:
            entry.rawPool[i].reference_kind = input.readUnsignedByte();
            entry.rawPool[i].reference_index = input.readUnsignedShort();
            break;
          case tagMap.MethodType:
            entry.rawPool[i].descriptor_index = input.readUnsignedShort();
            break;
          case tagMap.InvokeDynamic:
            entry.rawPool[i].bootstrap_method_attr_index = input.readUnsignedShort();
            entry.rawPool[i].name_and_type_index = input.readUnsignedShort();
            break;
          case tagMap.Module:
            entry.rawPool[i].name_index = input.readUnsignedShort();
            break;
          case tagMap.Package:
            entry.rawPool[i].name_index = input.readUnsignedShort();
            break;
          default:
            throw "Unknown tag type: " + entry.rawPool[i].tag;
            break;
        }
      }
      
      // first pass on pool
      for ( var i = 1; i < entry.rawPool.length; i++ ) {
        entry.pool[i] = {};
        entry.pool[i].tag = reverseTagMap[entry.rawPool[i].tag];
        switch ( entry.rawPool[i].tag ) {
          case tagMap.Class:
            entry.pool[i].name = entry.rawPool[entry.rawPool[i].name_index].value;
            break;
          case tagMap.Fieldref:
          case tagMap.Methodref:
          case tagMap.InterfaceMethodref:
            //entry.rawPool[i].class_index = input.readUnsignedShort();
            //entry.rawPool[i].name_and_type_index = input.readUnsignedShort();
            break;
          case tagMap.String:
            entry.pool[i].value = entry.rawPool[entry.rawPool[i].string_index].value;
            break;
          case tagMap.Integer:
            entry.pool[i].value = entry.rawPool[i].value;
            break;
          case tagMap.Float:
            entry.pool[i].value = entry.rawPool[i].value;
            break;
          case tagMap.Long:
            entry.pool[i].value = entry.rawPool[i].value;
            i++;
            break;
          case tagMap.Double:
            entry.pool[i].value = entry.rawPool[i].value;
            i++;
            break;
          case tagMap.NameAndType:
            entry.pool[i].name = entry.rawPool[entry.rawPool[i].name_index].value;
            entry.pool[i].descriptor = entry.rawPool[entry.rawPool[i].descriptor_index].value;
            break;
          case tagMap.Utf8:
            entry.pool[i].value = entry.rawPool[i].value;
            break;
          case tagMap.MethodHandle:
            entry.pool[i].reference_kind = reverseHandleKindMap[entry.rawPool[i].reference_kind];
            //entry.rawPool[i].reference_index = input.readUnsignedShort();
            break;
          case tagMap.MethodType:
            entry.pool[i].descriptor = entry.rawPool[entry.rawPool[i].descriptor_index].value;
            break;
          case tagMap.InvokeDynamic:
            entry.pool[i].bootstrap_method_attr_index = entry.rawPool[i].bootstrap_method_attr_index;
            //entry.rawPool[i].name_and_type_index = input.readUnsignedShort();
            break;
          case tagMap.Module:
            entry.pool[i].name = entry.rawPool[entry.rawPool[i].name_index].value;
            break;
          case tagMap.Package:
            entry.pool[i].name = entry.rawPool[entry.rawPool[i].name_index].value;
            break;
        }
      }
      
      // second pass on pool
      for ( var i = 1; i < entry.rawPool.length; i++ ) {
        switch ( entry.rawPool[i].tag ) {
          case tagMap.Class:
            break;
          case tagMap.Fieldref:
          case tagMap.Methodref:
          case tagMap.InterfaceMethodref:
            entry.pool[i].clazz = entry.pool[entry.rawPool[i].class_index];
            entry.pool[i].name_and_type = entry.pool[entry.rawPool[i].name_and_type_index];
            break;
          case tagMap.String:
            break;
          case tagMap.Integer:
            break;
          case tagMap.Float:
            break;
          case tagMap.Long:
            i++;
            break;
          case tagMap.Double:
            i++;
            break;
          case tagMap.NameAndType:
            break;
          case tagMap.Utf8:
            break;
          case tagMap.MethodHandle:
            entry.pool[i].reference = entry.pool[entry.rawPool[i].reference_index];
            break;
          case tagMap.MethodType:
            break;
          case tagMap.InvokeDynamic:
            entry.pool[i].name_and_type = entry.pool[entry.rawPool[i].name_and_type_index];
            break;
          case tagMap.Module:
            break;
          case tagMap.Package:
            break;
        }
      }
      
      var storage = infos.get(loader);
      if ( storage == null ) {
        storage = {};
        infos.put(loader, storage);
      }
      storage[className] = entry;
    } catch (e) {
      if ( e.printStackTrace ) {
        e.printStackTrace();
      } else {
        java.lang.System.out.println(e);
      }
    }
  }, true);
  
  classInfo.getInfo = function(clazz) {
    if ( ! ( clazz instanceof java.lang.Class ) ) {
      clazz = clazz.class;
    }
    var loaderEntry = infos.get(clazz.getClassLoader());
    if ( loaderEntry == null ) {
      return null;
    }
    return loaderEntry[clazz.getName().replace(/\./g,"/")];
  }
})();