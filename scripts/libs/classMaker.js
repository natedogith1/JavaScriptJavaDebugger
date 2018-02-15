"use strict";

(function(){
    var classMaker = {
        createClass: null, // function that makes class from description, argument is the description object, which will be modified to fill in optional values
    };
    /*
    // function arguments:
    
    
    // description object:
    {
        name: string, the name of the class in internal format (default: "createdPackage/CreatedClass" followed by random numbers)
        accessFlags: int, the OR'd together access flags for the class (look in java.lang.reflect.Modifier), ACC_SUPER (0x0020) will be added to this (default: ACC_SUPER | PUBLIC)
        superClass: class object, the super class of this class, abstract methods will be auto-added (default: java.lang.Object)
        interfaces: array of class objects, the interfaces this class implements, methods will be auto-added (default: empty array)
        fields: array of the following complex type (default: empty array)
        {
            accesFlags: int, the OR'd together access flags for this method (look in java.lang.reflect.Modifier) (default: PUBLIC)
            name: string, the name of this field (default: no default)
            type: class object, the type of this field
            attributes: following complex object of attributs for this field, look at the Java Virtual Machine Specification (default: object with specified default values)
            {
                constantValue: the value to set the field to uppon class creation (default: not set, attribute won't be included)
                synthetic: boolean, seems equivalent to the synthetic access flag (default: false, attribute won't be included)
                deprecated: boolean, marks this field as deprecated (default: false, attribute won't be included)
                signature: signature complex object (see bellow), this specifies the generic parts of this field (default: not set, attribtue won't be included)
                runtimeAnnotations: an array of the annotation complex type (see bellow), the annotations visible at run time (default: not set, attribute won't be included)
                compiletimeAnnotations: an array of the annotation complex type (see bellow), the annotations not visible at run time (default: not set, attribute won't be included)
                runtimeTypeAnnotations: an array of the typeAnnotation complex type (see bellow), the type annotations visible at run time (default: not set, attribute won't be included)
                compiletimeTypeAnnotations: an array of the typeAnnotation complex type (see bellow), the type annotations not visible at run time (default: not set, attribute won't be included)
            }
        }
        methods: array of the following complex type (default: empty array)
        {
            accessFlags: int, the int value of the access flags for this method (look in java.lang.reflect.Modifier) (default: PUBLIC)
            name: string, method name (default: no default)
            parameters: array of class objects, the arguments to this function (if vararg, the last argument should be an array type) (default: empty array)
            returnType: class object, the return type of this method (default: null, void return type)
            attributes: following complex object of attributes for this method, look at the Java Virtual Machine Specification (default: object with specified default values)
            {
                exceptions: array of class objects, the checked exceptions that might be thrown (default: not set, attribute won't be included)
                runtimeParameterAnnotations: array of arrays of annotation complex type, runtime visible annotation associated with arguments, ith entry in the outer array coresponds to the ith argument (default: not set, attribute won't be included)
                compiletimeParameterAnnotations: array of arrays of annotation complex type, see runtimeParameterAnnocations (default: not set, attribute won't be included)
                methodParameters: array of the following complex type, holds the names and access flags of arguments, ith entry coresponds to the ith argument, setting this to null will prevent this attribute form being included
                    (default: array with length equal to numer of arguments and with appropriate default values, if there are no arguments, this defaults to unset)
                {
                    name: string, the name of the parameter (default: argi, where i is the index of the parameter)
                    accessFlags: int, the OR'd together access flags for this parameter (default: no flags set)
                }
                synthetic: boolean, seems equivalent to the synthetic access flag (default: false, attribute won't be included)
                deprecated: boolean, marks this method as deprecated (default: false, attribute won't be included)
                signature: following complex object (see bellow), this specifies the generic parts of this method (default: not set, attribtue won't be included)
                {
                    indexes: map from strings to arrays of signature objects.  in an array, they're can only be one non-interface.  (this is used for generic classes (<K> would be {K:java.lang.Object}) (default: not set)
                    parameters: array of signature objects, the signatures of the arguments (default: array of class objects of the arguments)
                    returnType: signature object, the signature of the return type (default: class object of returnType)
                    exceptions: array of signature objects, the signatures of the throwable exceptions (default: array of class objects of declared exceptions)
                }
                runtimeAnnotations: an array of the annotation complex type (see bellow), the annotations visible at run time (default: not set, attribute won't be included)
                compiletimeAnnotations: an array of the annotation complex type (see bellow), the annotations not visible at run time (default: not set, attribute won't be included)
                runtimeTypeAnnotations: an array of the typeAnnotation complex type (see bellow), the type annotations visible at run time (default: not set, attribute won't be included)
                compiletimeTypeAnnotations: an array of the typeAnnotation complex type (see bellow), the type annotations not visible at run time (default: not set, attribute won't be included)
            }
        }
        attributes: following complex object of attributes for this class object, for more extensive descriptions check the Java Virtual Machine Specification (default: object with specified default values)
        {
            sourceFile: string, the source file for this (would normally be a .jar file) (default: not set, attribute won't be included)
            innerClasses: array of the following complex type (default: not set, attribute won't be included)
            {
                innerClass: class object, class this is refering to (default: no default)
                outerClass: class object, the outer class of this inner class (default: no default)
                name: string, original name of this inner class (default: no default)
                accessFlags: int, the OR'd together access flags for this inner class (look in java.lang.reflect.Modifier) (default: no default)
            }
            enclosingMethod: following complex object, indicating the enclosing method of this class (default: not set, attribute won't be included)
            {
                enclosingClass: class object, class containing the enclosing method (default: no default)
                method: method object, the enclosing method
            }
            sourceDebugExtension: string, arbitrary string with no effect (default: not set, attribute won't be included)
            synthetic: boolean, seems equivalent to the synthetic access flag (default: false, attribute won't be included)
            deprecated: boolean, marks this class as deprecated (default: false, attribute won't be included)
            signature: following complex object, this specifies the generic parts of this class (default: not set, attribtue won't be included)
            {
                indexes: map from strings to arrays of signature objects.  in an array, they're can only be one non-interface.  (this is used for generic classes (<K> would be {K:java.lang.Object}) (default: not set)
                superClass: signature object for super class (default: class object of super class)
                interfaces: array of objects in the same format as this object (default: array of class objects of interfaces)
            }
            runtimeAnnotations: an array of the annotation complex type (see bellow), the annotations visible at run time (default: not set, attribute won't be included)
            compiletimeAnnotations: an array of the annotation complex type (see bellow), the annotations not visible at run time (default: not set, attribute won't be included)
            runtimeTypeAnnotations: an array of the typeAnnotation complex type (see bellow), the type annotations visible at run time (default: not set, attribute won't be included)
            compiletimeTypeAnnotations: an array of the typeAnnotation complex type (see bellow), the type annotations not visible at run time (default: not set, attribute won't be included)
        }
    }
    
    // class object:
    java Class<?> object or
    nashorn static class object
    
    // signature object:
    class object or
    "*" or
    a string in the indexes map (see users of this)
    {
        super: boolean, true if this is a super wildcard (default: false)
        extends: boolean, true if this is a (default: false)
        type: class object, the base class object (default: no default)
        signatures: array of signature objects describing this (default: empty array)
    }
    
    // annotation object:
    {
        
    }
    
    //typeAnnotation object:
    {
        
    }
    */
    
    var ClassLoader = Java.type("java.lang.ClassLoader");
    var DataOutputStream = Java.type("java.io.DataOutputStream");
    var ByteArrayOutputStream = Java.type("java.io.ByteArrayOutputStream");
    var Base64 = Java.type("java.util.Base64");
    var javaObject = Java.type("java.lang.Object");
    var javaClass = Java.type("java.lang.Class");
    
    var rootClassLoader = new (Java.extend(ClassLoader))({});
    var rootClassLoaderSuper = Java.super(rootClassLoader);
    
    // compiled from this code
    /*
    import java.util.function.Function;
    import java.util.Map;
    public class GeneratingClassLoader extends ClassLoader{
        private Function<Object[],Object> methodImpl;
        private Map<String,Class<?>> classMapping;
        public GeneratingClassLoader(ClassLoader parent, Map<String,Class<?>> classMapping, Function<Object[],Object> methodImpl) {
            super(parent);
            this.classMapping = classMapping;
            this.methodImpl = methodImpl;
        }
        public Function<Object[],Object> getMethodImpl() {
            return methodImpl;
        }
        public Class<?> loadClass(String name, boolean resolve) throws ClassNotFoundException {
            Class<?> result = classMapping.get(name);
            if ( result == null ) {
                throw new ClassNotFoundException("[" + name + "] is not a class registered in this loader");
            }
            return result;
        }
    }
    */
    
    // '"' + btoa(str.split(" ").map(x=>String.fromCharCode(parseInt(x,16))).join("")).match(/.{1,64}/g).join('" +\n"') + '"'
    
    var GeneratingClassLoaderBytes = Base64.getDecoder().decode(
        "yv66vgAAADQAQQoADwAnCQAOACgJAA4AKQsAKgArBwAsBwAtBwAuCgAHAC8IADAK" +
        "AAcAMQgAMgoABwAzCgAGADQHADUHADYBAAptZXRob2RJbXBsAQAdTGphdmEvdXRp" +
        "bC9mdW5jdGlvbi9GdW5jdGlvbjsBAAlTaWduYXR1cmUBAERMamF2YS91dGlsL2Z1" +
        "bmN0aW9uL0Z1bmN0aW9uPFtMamF2YS9sYW5nL09iamVjdDtMamF2YS9sYW5nL09i" +
        "amVjdDs+OwEADGNsYXNzTWFwcGluZwEAD0xqYXZhL3V0aWwvTWFwOwEAN0xqYXZh" +
        "L3V0aWwvTWFwPExqYXZhL2xhbmcvU3RyaW5nO0xqYXZhL2xhbmcvQ2xhc3M8Kj47" +
        "PjsBAAY8aW5pdD4BAEYoTGphdmEvbGFuZy9DbGFzc0xvYWRlcjtMamF2YS91dGls" +
        "L01hcDtMamF2YS91dGlsL2Z1bmN0aW9uL0Z1bmN0aW9uOylWAQAEQ29kZQEAD0xp" +
        "bmVOdW1iZXJUYWJsZQEAlShMamF2YS9sYW5nL0NsYXNzTG9hZGVyO0xqYXZhL3V0" +
        "aWwvTWFwPExqYXZhL2xhbmcvU3RyaW5nO0xqYXZhL2xhbmcvQ2xhc3M8Kj47PjtM" +
        "amF2YS91dGlsL2Z1bmN0aW9uL0Z1bmN0aW9uPFtMamF2YS9sYW5nL09iamVjdDtM" +
        "amF2YS9sYW5nL09iamVjdDs+OylWAQANZ2V0TWV0aG9kSW1wbAEAHygpTGphdmEv" +
        "dXRpbC9mdW5jdGlvbi9GdW5jdGlvbjsBAEYoKUxqYXZhL3V0aWwvZnVuY3Rpb24v" +
        "RnVuY3Rpb248W0xqYXZhL2xhbmcvT2JqZWN0O0xqYXZhL2xhbmcvT2JqZWN0Oz47" +
        "AQAJbG9hZENsYXNzAQAmKExqYXZhL2xhbmcvU3RyaW5nO1opTGphdmEvbGFuZy9D" +
        "bGFzczsBAA1TdGFja01hcFRhYmxlBwAsAQAKRXhjZXB0aW9ucwEAKShMamF2YS9s" +
        "YW5nL1N0cmluZztaKUxqYXZhL2xhbmcvQ2xhc3M8Kj47AQAKU291cmNlRmlsZQEA" +
        "GkdlbmVyYXRpbmdDbGFzc0xvYWRlci5qYXZhDAAXADcMABQAFQwAEAARBwA4DAA5" +
        "ADoBAA9qYXZhL2xhbmcvQ2xhc3MBACBqYXZhL2xhbmcvQ2xhc3NOb3RGb3VuZEV4" +
        "Y2VwdGlvbgEAF2phdmEvbGFuZy9TdHJpbmdCdWlsZGVyDAAXADsBAAFbDAA8AD0B" +
        "ACpdIGlzIG5vdCBhIGNsYXNzIHJlZ2lzdGVyZWQgaW4gdGhpcyBsb2FkZXIMAD4A" +
        "PwwAFwBAAQAVR2VuZXJhdGluZ0NsYXNzTG9hZGVyAQAVamF2YS9sYW5nL0NsYXNz" +
        "TG9hZGVyAQAaKExqYXZhL2xhbmcvQ2xhc3NMb2FkZXI7KVYBAA1qYXZhL3V0aWwv" +
        "TWFwAQADZ2V0AQAmKExqYXZhL2xhbmcvT2JqZWN0OylMamF2YS9sYW5nL09iamVj" +
        "dDsBAAMoKVYBAAZhcHBlbmQBAC0oTGphdmEvbGFuZy9TdHJpbmc7KUxqYXZhL2xh" +
        "bmcvU3RyaW5nQnVpbGRlcjsBAAh0b1N0cmluZwEAFCgpTGphdmEvbGFuZy9TdHJp" +
        "bmc7AQAVKExqYXZhL2xhbmcvU3RyaW5nOylWACEADgAPAAAAAgACABAAEQABABIA" +
        "AAACABMAAgAUABUAAQASAAAAAgAWAAMAAQAXABgAAgAZAAAANAACAAQAAAAQKiu3" +
        "AAEqLLUAAiottQADsQAAAAEAGgAAABIABAAAAAcABQAIAAoACQAPAAoAEgAAAAIA" +
        "GwABABwAHQACABkAAAAdAAEAAQAAAAUqtAADsAAAAAEAGgAAAAYAAQAAAAwAEgAA" +
        "AAIAHgABAB8AIAADABkAAABmAAQABAAAADQqtAACK7kABAIAwAAFTi3HACO7AAZZ" +
        "uwAHWbcACBIJtgAKK7YAChILtgAKtgAMtwANvy2wAAAAAgAaAAAAEgAEAAAADwAO" +
        "ABAAEgARADIAEwAhAAAACAAB/AAyBwAiACMAAAAEAAEABgASAAAAAgAkAAEAJQAA" +
        "AAIAJg=="
    );
    
    var GeneratingClassLoader = rootClassLoaderSuper.defineClass("GeneratingClassLoader", GeneratingClassLoaderBytes, 0, GeneratingClassLoaderBytes.length).static;
    
    function convertToClass(obj) {
        if ( obj instanceof javaClass ) {
            return obj;
        } else {
            return obj.class;
        }
    }
    
    function isSet(name, obj) {
        return obj in name && (obj[name] !== null && obj[name] !== undefined);
    }
    
    function classMaker.createClass(description) {
        if ( isSet(description, "name") ) {
            description.name = description.name.toString();
        } else {
            description.name = "createdPackage/CreatedClass" + Math.random().toString().substring(2);
        }
        if ( isSet(description, "accessFlags") ) {
            description.accessFlags |= 0x0020 // add ACC_SUPER
        } else {
            description.accessFlags = 0x0021 // set to ACC_SUPER | ACC_PUBLIC
        }
        if ( ! isSet(description, superClass)) {
            description.superClass = javaObject;
        }
        if ( ! isSet(description, interfaces) ) {
            description.interfaces = [];
        }
        
        var constants = {}
        var constantRefs = {
            classes: {}
        }
        var constantCount = 0;
        
        var classData = new ByteArrayOutputStream();
        var classStream = new DataOutputStream(classData);
        
        
        classStream.writeInt(0xCAFEBABE); // magic
        classStream.writeShort(00); // minor_version
        classStream.writeShort(52); // major_version, we're targeting version 52.0
        
        classStream.writeShort(constantCount + 1);
        // TODO write constant data
        
        classStream.writeShort(description.accessFlags);
        classStream.writeShort(constantRefs.thisClass);
        classStream.writeShort(constantRefs.superClass);
        
        classStream.writeShort(description.interfaces.length);
        for ( var i = 0; i < description.interfaces.length; i++ ) {
            classStream.writeShort(constantRefs.classes[description.interfaces[i].getName()])
        }
        
        classStream.writeShort(description.methods.length);
        for ( var i = 0; i < description.methods.length; i++ ) {
            //TODO write method data
        }
        
        classStream.writeShort(description.attributes.length);
        for ( var i = 0; i < description.attributes.length; i++ ) {
            //TODO write attribute data
        }
        
        
        
    }
    
    return classMaker;
})();