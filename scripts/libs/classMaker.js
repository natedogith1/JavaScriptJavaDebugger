"use strict";

(function(){
    var classMaker = {
        getClassBytes: null, // function that returns the bytes of a class, given description and a class name re-mapping function
    };
    /*
    // function arguments:
    
    
    // description object:
    {
        name: string, the name of the class in java format (default: "createdPackage.CreatedClass" followed by random numbers)
        versionMajor: int, the major version of the class (default: 52)
        versionMinor: int, the minor version of the class (default: 0)
        accessFlags: int, the OR'd together access flags for the class (look in java.lang.reflect.Modifier and the JVM specifiaction) (default: ACC_SUPER | ACC_PUBLIC)
        superClass: class object, the super class of this class (default: java.lang.Object)
        interfaces: array of class objects, the interfaces this class implements (default: empty array)
        fields: array of the following complex type (default: empty array)
        {
            accessFlags: int, the OR'd together access flags for this method (look in java.lang.reflect.Modifier and the JVM specifiaction) (default: PUBLIC)
            name: string, the name of this field (default: no default)
            type: class object, the type of this field (default: no default)
            attributes: following complex object of attributs for this field, look at the Java Virtual Machine Specification (default: object with specified default values)
            {
                constantValue: appropriate type, the value to set the field to uppon class creation (default: not set, attribute won't be included)
                synthetic: boolean, seems equivalent to the synthetic access flag (default: false, attribute won't be included)
                deprecated: boolean, marks this field as deprecated (default: false, attribute won't be included)
                signature: signature complex object (see bellow), this specifies the generic parts of this field (default: not set, attribute won't be included)
                runtimeAnnotations: an array of the annotation complex type (see bellow), the annotations visible at run time (default: not set, attribute won't be included)
                compiletimeAnnotations: an array of the annotation complex type (see bellow), the annotations not visible at run time (default: not set, attribute won't be included)
                runtimeTypeAnnotations: an array of the typeAnnotation complex type (see bellow), the type annotations visible at run time (default: not set, attribute won't be included)
                compiletimeTypeAnnotations: an array of the typeAnnotation complex type (see bellow), the type annotations not visible at run time (default: not set, attribute won't be included)
            }
            customAttributes: array of customAttribute objects, custom attributes to add (default: empty array)
        }
        methods: array of the following complex type (default: empty array)
        {
            accessFlags: int, the int value of the access flags for this method (look in java.lang.reflect.Modifier and the JVM specifiaction) (default: PUBLIC)
            name: string, method name (default: no default)
            parameters: array of class objects, the arguments to this function (if vararg, the last argument should be an array type) (default: empty array)
            returnType: class object, the return type of this method (default: null, void return type)
            attributes: following complex object of attributes for this method, look at the Java Virtual Machine Specification (default: object with specified default values)
            {
                code: following complex type, describes the code for this object (default: not set, attribute won't be included)
                {
                    maxStack: int, the largest size the stack reaches (default: no default)
                    maxLocals: int, the largest local value used (default: no default)
                    code: arbitraryData object, the bytecode for this method (default: no default)
                    exceptionHandlers: array of following complex type, describes the try/catch clauese (default: empty array)
                    {
                        startIndex: int, the index of the first opcode this handler covers (default: no default)
                        endIndex: int, the inex of the opcode after the last one this handler coveres (or the byte after the end of the code) (default: no default)
                        handlerIndex: int, the index of the opcode to jump to on a thrown eception (default: no default)
                        catchType: class object, the type of exception to catch (default: not set, all exceptions will be caught)
                    }
                    attributes: following complex object of attributes for this code, look at the Java Virtual Machine Specification (default: object with specified default values)
                    {
                        lineNumbers: map from opcode indexes to line numbers, describes the mapping form code indexes to line numbers
                            (see JVM specifiaction for more information) (default: not set, attribute won't be included)
                        localVarialbes: array of following complex type, holds local variable names and types (default: not set, attribute won't be included)
                        {
                            startIndex: int, the index of the first opcode referenced by this entry (default: no default)
                            length: int, how many indexes this entry is valid for (indexes, not opcodes) (default: no default)
                            name: string, the name of this local variable (default: no default)
                            signature: signature complex object (see bellow), this specifies the type of this local, including generic parts (default: no default)
                            index: the index of the local variable (default: no default)
                        }
                        stackMap: array of following complex type, specifies the types of local variables and objects on the stack at various points in the code,
                            this will be turned into an attribute using the shortest forms possible(default: not set, attribute won't be included)
                        {
                            offsetDelta: int, the difference between the first instruction this describes and the first instruction the previous entry describes minus 1 (see Java Virtual Machine Specification section 4.7.4) (default: no default)
                            locals: array of verificationType objects, describes the types of locals, nulls will be treated as unchanged from previous frame, a shorter array will be treated as removed locals (default: same as previous entry)
                            stack: array of verificationType objects, describes the types of objects on the stack, nulls will be treated as unchanged from previous frame, a shorter array will be treated as removed stack objects (default: same as previous entry)
                        }
                    }
                    customAttributes: array of customAttribute objects, custom attributes to add (default: empty array)
                }
                exceptions: array of class objects, the checked exceptions that might be thrown (default: not set, attribute won't be included)
                runtimeParameterAnnotations: array of arrays of annotation complex type, runtime visible annotation associated with arguments, ith entry in the outer array coresponds to the ith argument (default: not set, attribute won't be included)
                compiletimeParameterAnnotations: array of arrays of annotation complex type, see runtimeParameterAnnocations (default: not set, attribute won't be included)
                annotationDefault: an annotationValue object, the default value for this method when used as an annotation (default: not set, attribute won't be included)
                methodParameters: array of the following complex type, holds the names and access flags of arguments, ith entry coresponds to the ith argument (default: not set, attribute won't be included)
                {
                    name: string, the name of the parameter (default: not set, parameter is a formal parameter with no name (according to JVM specification))
                    accessFlags: int, the OR'd together access flags for this parameter (default: no flags set)
                }
                synthetic: boolean, seems equivalent to the synthetic access flag (default: false, attribute won't be included)
                deprecated: boolean, marks this method as deprecated (default: false, attribute won't be included)
                signature: following complex object, this specifies the generic parts of this method (default: not set, attribute won't be included)
                {
                    indexes: map from strings to arrays of signature objects.  in an array, they're can only be one non-interface.  (this is used for generic classes (<K> would be {K:java.lang.Object}) (default: not set)
                    parameters: array of signature objects, the signatures of the arguments (default: array of class objects of the arguments)
                    returnType: signature object, the signature of the return type, null maps to void (default: class object of returnType)
                    exceptions: array of signature objects, the signatures of the throwable exceptions (default: array of class objects of declared exceptions)
                }
                runtimeAnnotations: an array of the annotation complex type (see bellow), the annotations visible at run time (default: not set, attribute won't be included)
                compiletimeAnnotations: an array of the annotation complex type (see bellow), the annotations not visible at run time (default: not set, attribute won't be included)
                runtimeTypeAnnotations: an array of the typeAnnotation complex type (see bellow), the type annotations visible at run time (default: not set, attribute won't be included)
                compiletimeTypeAnnotations: an array of the typeAnnotation complex type (see bellow), the type annotations not visible at run time (default: not set, attribute won't be included)
            }
            customAttributes: array of customAttribute objects, custom attributes to add (default: empty array)
        }
        attributes: following complex object of attributes for this class object, for more extensive descriptions check the Java Virtual Machine Specification (default: object with specified default values)
        {
            sourceFile: string, the source file for this (would normally be a .java file for java source code) (default: not set, attribute won't be included)
            innerClasses: array of the following complex type (default: not set, attribute won't be included)
            {
                innerClass: class object, class this is refering to (default: no default)
                outerClass: class object, the outer class of this inner class (default: not set, no outer class (see JVM specification))
                name: string, original name of this inner class (default: not set, no name)
                accessFlags: int, the OR'd together access flags for this inner class (look in java.lang.reflect.Modifier and the JVM specification) (default: no default)
            }
            enclosingMethod: following complex object, indicating the enclosing method of this class (default: not set, attribute won't be included)
            {
                clazz: class object, class containing the enclosing method (default: no default)
                method: method object, the enclosing method (default: no set, enclosing method is an initializer (see JVM specification))
            }
            sourceDebugExtension: string, arbitrary string with no effect (default: not set, attribute won't be included)
            bootstrapMethods: array of following complex type, used for invokeDynamic instructions (default: not set, attribute won't be included)
            {
                this has the parameters of a constant object with type "methodHandle" (minus the "type" parameter), along with the following aditional parameter (default: no default)
                bootstrapArguments: array of constant objects, static arguments for this bootstrap method (default: empty array)
            }
            synthetic: boolean, seems equivalent to the synthetic access flag (default: false, attribute won't be included)
            deprecated: boolean, marks this class as deprecated (default: false, attribute won't be included)
            signature: following complex object, this specifies the generic parts of this class (default: not set, attribute won't be included)
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
        customAttributes: array of customAttribute objects, custom attributes to add (default: empty array)
    }
    
    // class object:
    java Class<?> object or
    nashorn static class object or
    string matching a java-format (not internal format) class name
    
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
        type: class object, the type of the annotation (the annotation class) (default: no default)
        values: map from name of value to the following complex type, the value of the annotation attributes (defaeult: not set)
    }
    
    // annotationValue object:
    a number or
    a character or
    a string or
    an enum or
    a class object or
    null (the void class object) or
    an annotation object or
    an array of annotation values or
    {
        typeOveride: class object, the type of this value, necessary for when the type is ambigious
        value: an annotationValue object not of this type
    }
    
    //typeAnnotation object:
    one of the following objects
    {
        targetType: "class" string, a generic parameter on the class (public class Example <@A K>)
        parameterIndex: int, the index of the parameter (default: 0)
    }
    {
        targetType: "method" string, a generic parameter on a method (public <A@ K> K method())
        parameterIndex: int, the index of the parameter (default: 0)
    }
    {
        targetType: "super" string, an extended class or interface (public class Example extends @A Object)
        interfaceIndex: int, the index of the implemented interface, or -1 for super class (default: -1)
    }
    {
        targetType: "classBound" string, the wildcard on a class generic parameter (public class Example <K extends @A Object> {})
        genericIndex: int, the index of the generic (in <K,T>, K would be 0, T would be 1) (default: 0)
        boundIndex: int, which entry in the bound (in <K extends Object & Iterable<K>>, Object would be 0, Iterable<K> would be 1) (default: 0)
    }
    {
        targetType: "methodBound" string, the wildcard on a method generic parameter (public <K extends @A Object> K method(){return null;})
        genericIndex: int, the index of the generic (in <K,T>, K would be 0, T would be 1) (default: 0)
        boundIndex: int, which entry in the bound (in <K extends Object & Iterable<K>>, Object would be 0, Iterable<K> would be 1) (default: 0)
    }
    {
        targetType: "field" string, a field descriptor (public @A Object field;)
    }
    {
        targetType: "methodReturn" string, a method return type (public @A Object method(){return null;})
    }
    {
        targetType: "methodThis" string or "methodReciever" string, the this of a method (public void method(@A Example this){})
    }
    {
        targetType: "methodParameter" string, a method's argument (public void method(@Test arg0){})
        parameterIndex: int, the index of the parameter (default: 0)
    }
    {
        targetType: "methodThrows" string, a class in the throws clause of a method (public void method() throws @A Throwable {})
        exceptionIndex: int, the index
    }
    {
        targetType: "localVariable" string, a variable in a method (@A Object local; local.hashCode();)
        startIndex: int, the index of the first opcode where this local variable has a value (default: no default)
        length: int, how many indexes this local variable is vlaid for (indexes, not opcodes) (default: no default)
        index: the index of the local variable (default: no default)
    }
    {
        targetType: "resourceVariable" string, a variable declared in a try-with-resources statement (try(@A AutoCloseable resource = arg){})
        startIndex: int, the index of the first opcode where this local variable has a value (default: no default)
        length: int, how many indexes this local variable is vlaid for (indexes, not opcodes) (default: no default)
        index: the index of the local variable (default: no default)
    }
    {
        targetType: "exceptionParameter" string, a variable declared in a catch clause (try{arg.hashCode();}catch(@A Throwable e){e.hashCode();})
        exceptionIndex: int, an index into the exceptionHandlers of this method's code specifying which catch clause this belongs to (default: no default)
    }
    {
        targetType: "instanceof", a type used as part of instanceof (if(arg instanceof @A Object){})
        index: int, index into code array specifying the instruction this is part of (default: no default)
    }
    {
        targetType: "new" string, a type that new is called on (new @A Object();)
        index: int, index into code array specifying the instruction this is part of (default: no default)
    }
    {
        targetType: "dynamicNew" string, ::new as used as part of lambdas (java.util.function.Supplier<Object> local = @A Object::new)
        index: int, index into code array specifying the instruction this is part of (default: no default)
    }
    {
        targetType: "dynamicMethod" string, ::method as used as part of lambdas (java.util.function.Supplier<?> local = @A java.util.function.UnaryOperator::identity;)
        index: int, index into code array specifying the instruction this is part of (default: no default)
    }
    {
        targetType: "cast" string, a type used in casting (arg = (@A Object) arg;)
        index: int, index into code array specifying the instruction this is part of (default: no default)
        typeIndex: int, which type to target (in (Object & Cloneable), Object would be 0, Cloneable would be 1) (default: 0)
    }
    {
        targetType: "newType" string, the type specifier for a constructor method call (new <@A Object> java.util.LinkedList<Object>(null);)
        index: int, index into code array specifying the instruction this is part of (default: no default)
        typeIndex: int, which type to target (in (Object & Cloneable), Object would be 0, Cloneable would be 1) (default: 0)
    }
    {
        targetType: "methodType" string, the type specifier for a method call (java.util.Arrays.<@A Object> asList();)
        index: int, index into code array specifying the instruction this is part of (default: no default)
        typeIndex: int, which type to target (in (Object & Cloneable), Object would be 0, Cloneable would be 1) (default: 0)
    }
    {
        targetType: "dynamicNewType" string, the type specifier for a ::new (java.util.function.Supplier<Object> local = java.util.LinkedList<Object>::<@A Object> new;)
        index: int, index into code array specifying the instruction this is part of (default: no default)
        typeIndex: int, which type to target (in (Object & Cloneable), Object would be 0, Cloneable would be 1) (default: 0)
    }
    {
        targetType: "dynamicMethodType" string, the type specifier for a ::method (java.util.function.Supplier<?> local = java.util.function.UnaryOperator::<@A Object>identity;)
        index: int, index into code array specifying the instruction this is part of (default: no default)
        typeIndex: int, which type to target (in (Object & Cloneable), Object would be 0, Cloneable would be 1) (default: 0)
    }
    
    // verificationType object:
    one of the following:
    "top" string, the other half of a double or long
    "int" string
    "float" string
    "null" string
    "uninitializedThis" string
    {
        type: "object" string
        value: class object, the type of the object
    }
    {
        type: "uninitialized" string
        newOffset: int, the index of the 'new' instruction that created this
    }
    "long" string
    "double" string
    
    // arbitraryData object:
    one of
    {
        array: byte array, the data for this entry (default: no default)
        constants:  array of following complex type, maps where to place indexes of constants into the attribute (default: empty array)
        {
            address: the address to write the 2-byte index of the constant (default: no default)
            constant: a constant object, the constant to reference (default: no default)
        }
    }
    {
        size: size of this entry (up to 2^32 - 1)
        stream: stream to read this entry from, will read size bytes
        constants:  array of following complex type, maps where to place indexes of constants into the attribute (default: empty array)
        {
            address: the address to write the 2-byte index of the constant (default: no default)
            constant: a constant object, the constant to reference (default: no default)
        }
    }
    
    // customAttribute object:
    {
        name: string, the name of this attribute (default: no default)
        data: a arbitraryData object, the data of this attribute (default: 0-length data)
    }
    
    // constant object:
    one of the following complex types
    {
        type: "class" string
        value: class object, the class referenced
    }
    {
        type: "field" string
        clazz: class object, the class that contains the field
        name: string, the name of the field
        type: class object, the type of the field
    }
    {
        type: "method" string or "interfaceMethod" string
        clazz: class object, the class that contains this method
        name: string, the name of this method
        parameters: array of class objects, the argument types of this method
        returnType: class object, the return type of this method, null maps to void
    }
    {
        type: "string" start
        value: string, the value of this string
    }
    {
        type: string, one of "integer" or "int", "float", "long", "double"
        value: number, the value of this number
    }
    {
        type: "nameAndType" string
        name: string, the name associated with this constant
        descriptor: class object (for fields) or the following complex type, the type of this name and type
        {
            parameters: array of class objects, the argument types of this descriptor
            returnType: class object, the return type of this descriptor, null maps to void
        }
    }
    {
        type: "utf8" string
        value: string, the value of this utf8 constant
    }
    {
        type: "methodHandle" string
        kind: string, one of "getField", "getStatic", "putField", "putStatic"
        clazz: class object, the class that contains the target field
        name: string, the name of the target field
        descriptor: class object, the type of the target field
    }
    {
        type: "methodHandle" string
        kind: string, one of "invokeVirtual", "invokeStatic", "invokeSpecial", "newInvokeSpecial", "invokeInterface"
        isInterface: boolean, true if this references an interface, false if it doesn't; will only be used if the kind is ambiguous (default: not set)
        clazz: class object, the class that contains the method
        name: string, the name of the method
        parameters: array of class objects, the argument types of the method
        returnType: class object, the return type of the method, null maps to void
    }
    {
        type: "methodType" string
        parameters: array of class objects, the argument types of this method type
        returnType: class object, the return type of this method type, null maps to void
    }
    {
        type: "invokeDynamic" string
        bootstrapIndex: int, index into the bootstrap method table attribute of the class
        name: string, the name of the method
        parameters: array of class objects, the argument types of the method
        returnType: class object, the return type of the method, null maps to void
    }
    */
    
    var ClassLoader = Java.type("java.lang.ClassLoader");
    var DataOutputStream = Java.type("java.io.DataOutputStream");
    var ByteArrayOutputStream = Java.type("java.io.ByteArrayOutputStream");
    var Base64 = Java.type("java.util.Base64");
    var javaObject = Java.type("java.lang.Object");
    var javaClass = Java.type("java.lang.Class");
    var HashMap = Java.type("java.util.HashMap");
    var nashornClass = Java.type("jdk.internal.dynalink.beans.StaticClass");
    var javaByteType = Java.type("byte").class
    var javaCharType = Java.type("char").class
    var javaDoubleType = Java.type("double").class
    var javaFloatType = Java.type("float").class
    var javaIntType = Java.type("int").class
    var javaLongType = Java.type("long").class
    var javaShortType = Java.type("short").class
    var javaBooleanType = Java.type("boolean").class
    var javaVoidType = Java.type("java.lang.Void").TYPE
    
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
    
    function getClassObject(obj) {
        if ( obj instanceof javaClass ) {
            return obj;
        } else if ( obj instanceof nashornClass ) {
            return obj.class;
        } else {
            return null;
        }
    }
    
    function getClassName(obj) {
        if ( obj instanceof javaClass ) {
            return obj.getName();
        } else if ( obj instanceof nashornClass ) {
            return obj.class.getName();
        } else if ( typeof obj === "string" ) {
            return obj;
        } else {
            return null;
        }
    }
    
    var methodHandleKindMapping = {
        "getField": 1,
        "getStatic": 2,
        "putField": 3,
        "putStatic": 4,
        "invokeVirtual": 5,
        "invokeStatic": 6,
        "invokeSpecial": 7,
        "newInvokeSpecial": 8,
        "invokeInterface": 9,
    }
    
    function toDescriptor(obj){
        var clazz = getClassObject(obj);
        if ( clazz !== null ) {
            switch ( clazz ) {
                case javaByteType:
                    return "B";
                case javaCharType:
                    return "C";
                case javaDoubleType:
                    return "D";
                case javaFloatType:
                    return "F";
                case javaIntType:
                    return "I";
                case javaLongType:
                    return "J";
                case javaShortType:
                    return "S";
                case javaBooleanType:
                    return "Z";
                case javaVoidType:
                case null:
                    return "V";
                default:
                    if ( clazz.getName()[0] === "[" ) {
                        return clazz.getName().replace(/\./g, "/");
                    } else {
                        return "L" + clazz.getName().replace(/\./g, "/") + ";";
                    }
            }
        } else if ( obj instanceof Array ) {
            return obj.map(toDescriptor).join();
        } else if ( typeof obj === "string" ) {
            return "L" + obj.replace(/\./g, "/"); + ";"
        } else {
            return "(" + toDescriptor(obj.parameters) + ")" + toDescriptor(obj.returnType);
        }
    }
    
    function isSet(name, obj) {
        return obj in name && (obj[name] !== null && obj[name] !== undefined);
    }
    
    function getFieldWithDefault(name, obj, def) {
        return isSet(name, obj) ? obj[name] : def;
    }
    
    function requireField(name, obj, where) {
        if ( ! isSet(name, obj) ) {
            throw "missing field [" + name + "] in " + where;
        }
        return obj[name];
    }
    
    function classMaker.getClassBytes(description) {
        var constants = {}
        var constantRefs = {
            classes: {}
        }
        var constantId = 1;
        
        var constantData = new ByteArrayOutputStream();
        var constantStream = new DataOutputStream(constantData);
        
        var constants = {
            classes: {},
            fields: {},
            methods: {},
            strings: {},
            integers: {},
            floats: {},
            longs: {},
            doubles: {},
            nameAndTypes: {},
            utf8s: {},
            methodHandles: {},
            methodTypes: {},
            invokeDynamics: {},
        }
        
        function getConstantIndexUTF8(str) {
            var mappedName = str;
            if ( ! (mappedName in constants.utf8s) ) {
                constantStream.writeByte(1);
                constantStream.writeUTF(constant.value);
                constants.utf8s[mappedName] = constantId++;
            }
            return constants.utf8s[mappedName];
        }
        
        function getConstantIndex(constant) {
            var mappingName;
            switch ( constant.type ) {
                case "class":
                    mappedName = getClassName(constant.value)
                    if ( ! (mappedName in constants.classes) ) {
                        var value = getConstantIndexUTF8(mappedName);
                        constantStream.writeByte(7);
                        constantStream.writeShort(value);
                        constants.classes[mappedName] = constantId++;
                    }
                    return constants.classes[mappedName];
                case "field":
                    mappedName = [getClassName(constant.clazz), constant.name, toDescriptor(constant.type)].join(";");
                    if ( ! (mappedName in constants.fields) ) {
                        var clazz = getConstantIndex({type:"class", name:constant.clazz});
                        var nameAndType = getConstantIndex({type:"nameAndType", name:constant.name, descriptor:constant.type});
                        constantStream.writeByte(9);
                        constantStream.writeShort(clazz);
                        constantStream.writeShort(nameAndType);
                        constants.fields[mappedName] = constantId++;
                    }
                    return constants.fields[mappedName];
                case "method":
                case "interfaceMethod":
                    mappedName = [getClassName(constant.clazz), constant.name, toDescriptor(constant.parameters), toDescriptor(constant.returnType)].join(";");
                    if ( ! (mappedName in constants.methods) ) {
                        var clazz = getConstantIndex({type:"class", name:constant.clazz});
                        var nameAndType = getConstantIndex({type:"nameAndType", name:constant.name, descriptor:{parameters:constant.parameters, returnType:constant.returnType}});
                        constantStream.writeByte(constant.type === "method" ? 10 : 11);
                        constantStream.writeShort(clazz);
                        constantStream.writeShort(nameAndType);
                        constants.methods[mappedName] = constantId++;
                    }
                    return constants.methods[mappedName];
                case "string":
                    mappedName = "" + constant.value;
                    if ( ! (mappedName in constans.strings) ) {
                        var value = getConstantIndexUTF8(constant.value);
                        constantStream.writeByte(8);
                        constantStream.writeShort(value);
                        constants.strings[mappedName] = constantId++;
                    }
                    return constants.strings[mappedName];
                case "integer":
                case "int":
                    mappedName = constant.value;
                    if ( ! (mappedName in constants.integers) ) {
                        constantStream.writeByte(3);
                        constantStream.writeInt(constant.value);
                        constants.integers[mappedName] = constantId++;
                    }
                    return constants.integers[mappedName];
                case "float":
                    mappedName = constant.value;
                    if ( ! (mappedName in constants.floats) ) {
                        constantStream.writeByte(4);
                        constantStream.writeFloat(constant.value);
                        constants.floats[mappedName] = constantId++;
                    }
                    return constants.floats[mappedName];
                case "long":
                    mappedName = constant.value;
                    if ( ! (mappedName in constants.longs) ) {
                        constantStream.writeByte(5);
                        constantStream.writeLong(constant.value);
                        constants.longs[mappedName] = constantId++;
                    }
                    return constants.longs[mappedName];
                case "double":
                    mappedName = constant.value;
                    if ( ! (mappedName in constants.doubles) ) {
                        constantStream.writeByte(6);
                        constantStream.writeDouble(constant.value);
                        constants.doubles[mappedName] = constantId++;
                    }
                    return constants.doubles[mappedName];
                case "nameAndType":
                    mappedName = [constant.name, toDescriptor(constant.descriptor)];
                    if ( ! (mappedName in constants.nameAndTypes) ) {
                        var name = getConstantIndexUTF8(constant.name);
                        var descriptor = getConstantIndexUTF8(toDescriptor(constant.descriptor));
                        constantStream.writeByte(12);
                        constantStream.writeShort(name);
                        constantStream.writeShort(descriptor);
                        constants.nameAndTypes[mappedName] = constantId++;
                    }
                    return constants.nameAndType[mappedName];
                case "utf8":
                    return getConstantIndexUTF8(constant.value);
                case "methodHandle":
                    var clazzObject = getClassObject(constant.clazz);
                    var isInterface = (contant.kind === "invokeStatic" || constant.kind === "invokeSpecial") ? (clazzObject ? clazzObject.isInterface() : !!constant.isInterface) : constant.kind === "invokeInterface";
                    mappedName = [constant.kind, isInterface, getClassName(constant.clazz), constant.name, toDescriptor(constant.fieldType),
                                  toDescriptor(constant.parameters), toDescriptor(constant.returnType)].join(";");
                    if ( ! (mappedName in constants.methodHandles) ) {
                        var ref;
                        switch ( constant.kind ) {
                            case "getField":
                            case "getStatic":
                            case "putField":
                            case "putStatic":
                                ref = getConstantIndex({type:"field", clazz:constant.clazz, name:constant.name, type:constant.fieldType});
                                break;
                            case "invokeVirtual":
                            case "invokeStatic":
                            case "newInvokeSpecial":
                            case "invokeInterface":
                                ref = getConstantIndex({type:(isInterface?"interfaceMethod":"method"), clazz:constant.clazz, name:constant.name, parameters:constant.parameters, returnType:constant.returnType});
                                break;
                            default:
                                throw "unknown methodHandle kind [" + constant.kind + "]";
                        }
                        constantStream.writeByte(15);
                        constantStream.writeByte(methodHandleKindMapping[constant.kind]);
                        constantStream.writeShort(ref);
                        constants.methodHandles[mappedName] = constantId++;
                    }
                    return constants.methodHandles[mappedName];
                case "methodType":
                    mappedName = [toDescriptor(constant.parameters), toDescriptor(constant.returnType)].join(";");
                    if ( ! (mappedName in constants.methodTypes) ) {
                        var descriptor = getConstantIndexUTF8(toDescriptor({parameters:constant.parameters, returnType:constant.returnType}));
                        constantStream.writeByte(16);
                        constantStream.writeShort(descriptor);
                        constants.methodTypes[mappedName] = constantId++;
                    }
                    return constants.methodTypes[mappedName];
                case "invokeDynamic":
                    mappedName = [constant.bootstrapIndex, constant.name, toDescriptor(constant.parameters), toDescriptor(constant.returnType)];
                    if ( ! (mappedName in constants.invokeDynamics) ) {
                        var nameAndType = getConstantIndex({type:"nameAndType", name:constant.name, descriptor:{parameters:constant.parameters, returnType:constant.returnType}});
                        constantStream.writeByte(18);
                        constantStream.writeShort(constant.bootstrapIndex);
                        constantStream.writeShort(nameAndType);
                        constants.invokeDynamics[mappedName] = constantId++;
                    }
                    return constants.invokeDynamics[mappedName];
                default:
                    throw "unknown constant type [" + constant.type + "]";
            }
        }
        
        
        
        
        var postConstantData = new ByteArrayOutputStream();
        var postConstantStream = new DataOutputStream(constantData);
        
        function writeCustomData(stream, obj) {
            // TODO implement
        }
        
        function doWriteAttributes(stream, obj) {
            var supportedAttributes = {
                constantValue: true, synthetic: true, deprecated: true, signature: true, runtimeAnnotation: true, compiletimeAnnotations: true, runtimeTypeAnnotations: true,
                compiletimeTypeAnnotations: true, code: true, lineNumbers: true, localVariables: true, stackMap:true, exceptions: true, runtimeParameterAnnotations: true,
                compiletimeParametersAnnotations: true, annotationDefault: true, methodParameters: true, runtimeAnnotations: true, compiletimeAnnotations: true, sourceFile: true,
                innerClasses: true, enclosingMethod: true, sourceDebugExtension: true, bootstrapMethods: true,
            }
            var count = getFieldWithDefault("customAttributes", obj, []).length;
            if ( obj.attributes ) {
                for ( var name of obj.attributes ) {
                    if ( name in supportedAttributes ) {
                        count++;
                    }
                }
            }
            stream.writeShort(count);
            if ( obj.attributes ) {
                var attributeData;
                var attributeStream;
                if ( isSet("constantValue", obj.attributes) ) {
                    stream.writeShort(getConstantIndexUTF8("ConstantValue"));
                    stream.writeInt(2);
                    var ref;
                    switch ( getClassObject(obj.type) ) {
                        case javaLongType:
                            ref = getConstantIndex({type:"long", value:obj.attributes.constantValue});
                            break;
                        case javaFloatType:
                            ref = getConstantIndex({type:"float", value:obj.attributes.constantValue});
                            break;
                        case javaDoubleType:
                            ref = getConstantIndex({type:"double", value:obj.attributes.constantValue});
                            break;
                        case javaIntType:
                        case javaShortType:
                        case javaCharType:
                        case javaByteType:
                        case javaBooleanType:
                            ref = getConstantIndex({type:"integer", value:obj.attributes.constantValue});
                            break;
                        case javaString:
                            ref = getConstantIndex({type:"string", value:obj.attributes.constantValue});
                            break;
                        default:
                            throw "invalid constanValue type [" + obj.type + "]";
                    }
                    stream.writeShort(ref);
                }
                if ( isSet("code", obj.attributes) ) {
                    attributeData = new ByteArrayOutputStream();
                    attributeStream = new DataOutputStream(attributeData);
                    
                    attributeStream.writeShort(requireField("maxStack", obj.attributes.code, "code attribute"));
                    attributeStream.writeShort(requireField("maxLocals", obj.attributes.code, "code attribute"));
                    writeCustomData(attributeStream, requireField("code", obj.attributes.code, "code attribute"));
                    if ( ! isSet("exceptionHandlers", obj.attributes.code) ) {
                        attributeStream.writeShort(0);
                    } else {
                        attributeStream.writeShort(obj.attributes.code.length;
                        for each ( var exceptionHandler in obj.attributes.code.exceptionHandlers ) {
                            attributeStream.writeShort(requireField("startIndex", exceptionHandler, "exceptionHandler attribute"));
                            attributeStream.writeShort(requireField("endIndex", exceptionHandler, "exceptionHandler attribute"));
                            attributeStream.writeShort(requireField("handlerIndex", exceptionHandler, "exceptionHandler attribute"));
                            attributeStream.writeShort(isSet("catchType", exceptionHandler) ? getConstantIndex({type:"class", value:exceptionHandler.catchType}) : 0);
                        }
                    }
                    doWriteAttributes(attributeStream, obj.attributes.code);
                    
                    stream.writeShort(getConstantIndexUTF8("Code"));
                    stream.writeInt(attributeData.size());
                    attributeData.writeTo(stream);
                    attributeStream.close();
                }
                if ( isSet("stackMap", obj.attributes) ) {
                    attributeData = new ByteArrayOutputStream();
                    attributeStream = new DataOutputStream(attributeData);
                    
                    attributeStream.writeShort(obj.attributes.stackMap.length);
                    // TODO implement
                    
                    stream.writeShort(getConstantIndexUTF8("StackMapTable"));
                    stream.writeInt(attributeData.size());
                    attributeData.writeTo(stream);
                    attributeStream.close();
                }
                if ( isSet("exceptions", obj.attributes) ) {
                    stream.writeShort(getConstantIndexUTF8("Exceptions"));
                    stream.writeInt(2 + 2 * obj.attributes.exceptions.length);
                    for each ( var clazz in obj.attributes.exceptions ) {
                        stream.writeShort(getConstantIndex({type:"class", value:clazz}));
                    }
                }
                if ( isSet("innerClasses", obj.attributes) ) {
                    stream.writeShort(getConstantIndexUTF8("InnerClasses"));
                    stream.writeInt(2 + 8 * obj.attributes.innerClasses.length)
                    for each ( var innerClass in obj.attributes.innerClasses ) {
                        stream.writeShort(getConstantIndex({type:"class", value:requiredField("innerClass", innerClass, "innerClass attribute")}));
                        stream.writeShort(isSet("outerClass", innerClass) ? getConstantIndex({type:"class", value:innerClass.outerClass}) : 0);
                        stream.writeShort(isSet("name", innerClass) ? getConstantIndexUTF8(clazz) : 0);
                        stream.writeShort(requireField("accessFlags", innerClass, "innerClass attribute");
                    }
                }
                if ( isSet("enclosingMethod", obj.attributes) ) {
                    stream.writeShort(getConstantIndexUTF8("EnclosingMethod"));
                    stream.writeInt(4);
                    stream.writeShort(getConstantIndex({type:"class", value:requireField("clazz", obj.attribtues.enclosingMethod, "enclosingMethod attribute")}));
                    // TODO figure out method is represented
                }
                if ( getFieldWithDefault("synthetic", obj.attributes, false) ) {
                    stream.writeShort(getConstantIndexUTF8("Synthetic"));
                    stream.writeInt(0);
                }
                if ( isSet("signature", obj.attributes) ) {
                    stream.writeShort(getConstantIndexUTF8("Signature"));
                    stream.writeInt(2);
                    // TODO parse all types of signatures
                }
                if ( isSet("sourceFile", obj.attributes) ) {
                    stream.writeShort(getConstantIndexUTF8("SourceFile"));
                    stream.writeInt(2);
                    stream.writeShort(getConstantIndexUTF8(obj.attribtues.sourceFile));
                }
                if ( isSet("sourceDebugExtension", obj.attributes) ) {
                    stream.writeShort(getConstantIndexUTF8("SourceDebugExtension"));
                    stream.writeUTF(obj.attributes.sourceDebugExtension);
                }
                if ( isSet("lineNumbers", obj.attributes) ) {
                    stream.writeShort(getConstantIndexUTF8("LineNumberTable"));
                    stream.writeInt(2 + 4 * Object.keys(obj.attributes.lineNumbers).length);
                    for each ( var index in Object.keys(obj.attributes.lineNumbers).map(function(x){return parseInt(x);}).sort() ) {
                        stream.writeShort(index);
                        stream.writeShort(obj.attributes.lineNumbers[index]);
                    }
                }
                if ( isSet("localVariables", obj.attributes) ) {
                    stream.writeShort(getConstantIndexUTF8("LocalVariableTable"));
                    stream.writeInt(2 + 10 * obj.attributes.localVariables.length);
                    for each ( var localVariable in obj.attributes.localVariables ) {
                        stream.writeShort(requireField("startIndex", localVariable, "localVariable attribute"));
                        stream.writeShort(requireField("length", localVariable, "localVariable attribute"));
                        stream.writeShort(getConstantIndexUTF8(requireField("name", localVariable, "localVariable attribute")));
                        // TODO parse signature
                        stream.writeShort(requireField("index", localVariable, "localVariable attribute"));
                    }
                    
                    stream.writeShort(getConstantIndexUTF8("LocalVariableTable"));
                    stream.writeInt(2 + 10 * obj.attributes.localVariables.length);
                    for each ( var localVariable in obj.attributes.localVariables ) {
                        stream.writeShort(requireField("startIndex", localVariable, "localVariable attribute"));
                        stream.writeShort(requireField("length", localVariable, "localVariable attribute"));
                        stream.writeShort(getConstantIndexUTF8(requireField("name", localVariable, "localVariable attribute")));
                        // TODO parse signature
                        stream.writeShort(requireField("index", localVariable, "localVariable attribute"));
                    }
                }
                if ( getFieldWithDefault("deprecated", obj.attributes, false) ) {
                    stream.writeShort(getConstantIndexUTF8("Deprecated"));
                    stream.writeInt(0);
                }
                if ( isSet("runtimeAnnotations", obj.attributes) ) {
                    stream.writeShort(getConstantIndexUTF8("RuntimeVisibleAnnotations"));
                    // TODO implement
                }
                if ( isSet("compiletimeAnnotations", obj.attributes) ) {
                    stream.writeShort(getConstantIndexUTF8("RuntimeInvisibleAnnotations"));
                    // TODO implement
                }
                if ( isSet("runtimeParameterAnnotations", obj.attributes) ) {
                    stream.writeShort(getConstantIndexUTF8("RuntimeVisibleParameterAnnotations"));
                    // TODO implement
                }
                if ( isSet("compiletimeParameterAnnotations", obj.attributes) ) {
                    stream.writeShort(getConstantIndexUTF8("RuntimeInvisibleParameterAnnotations"));
                    // TODO implement
                }
                if ( isSet("runtimeTypeAnnotations", obj.attributes) ) {
                    stream.writeShort(getConstantIndexUTF8("RuntimeVisibleTypeAnnotations"));
                    // TODO implement
                }
                if ( isSet("compiletimeTypeAnnotations", obj.attributes) ) {
                    stream.writeShort(getConstantIndexUTF8("RuntimeInvisibleTypeAnnotations"));
                    // TODO implement
                }
                if ( isSet("annotationDefault", obj.attributes) ) {
                    stream.writeShort(getConstantIndexUTF8("AnnotationDefault"));
                    // TODO implement
                }
                if ( isSet("bootstrapMethods", obj.attributes) ) {
                    stream.writeShort(getConstantIndexUTF8("BootstrapMethods"));
                    // TODO implement
                }
                if ( isSet("methodParameters", obj.attributes) ) {
                    stream.writeShort(getConstantIndexUTF8("MethodParameters"));
                    stream.writeInt(1 + 4 * obj.attributes.methodParameters.length);
                    for each ( var parameter in obj.attribtues.methodParameters ) {
                        stream.writeShort(isSet("name", parameter) ? getConstantIndexUTF8(parameter.name) : 0);
                        stream.writeShort(getFieldWithDefault("accessFlags", description, 0x0000));
                    }
                }
            }
            for each ( var customAttribtue in getFieldWithDefault("customAttributes", obj, []) ) {
                stream.writeShort(getConstantIndexUTF8(requireField("name", customAttribute, "custom attribute"));
                writeCustomData(requireField("data", customAttribute, "custom attribute"));
            }
            // TODO implement
        }
        
        postConstantStream.writeShort(getFieldWithDefault("accessFlags", description, 0x0021));
        postConstantStream.writeShort(getConstantIndex({type:"class", value:(isSet("value", description) ? description.value : "createPackage.CreatedClass" + Math.random().toString().substring(2))}));
        postConstantStream.writeShort(getConstantIndex({type:"class", value:getFieldWithDefault("superClass", description, javaObject)}));
        if ( ! isSet("interfaces", description) {
            postConstantStream.writeShort(0);
        } else {
            postConstantStream.writeShort(description.interfaces.length);
            for each ( var iface in description.interfaces.length ) {
                postConstantStream.writeShort(getConstantIndex({type:"class", value:iface}));
            }
        }
        if ( ! isSet("fields", description) ) {
            postConstantStream.writeShort(0);
        } else {
            postConstantStream.writeShort(description.fields.length);
            for each ( var field in description.fields.length ) {
                postConstantStream.writeShort(getFieldWithDefault("accessFlags", fields, 0x0001));
                postConstantStream.writeShrot(getConstantIndexUTF8(requireField("name", field, "field")));
                postConstantStream.writeShort(getConstantIndexUTF8(toDescriptor(field.type)));
                doWriteAttributes(postConstantStream, field);
            }
        }
        if ( ! isSet("methods", description) ) {
            postConstantStream.writeShort(0);
        } else {
            postConstantStream.writeShort(description.methods.length);
            for each ( var method in description.methods ) {
                postConstantStream.writeShort(getFieldWithDefault("accessFlags", method, 0x0001));
                postConstantStream.writeShort(getConstantIndexUTF8(requireField("name", method, "method")));
                postConstantStream.writeShort(getConstantIndex({type:"utf8", value:toDescriptor({
                    parameters: getFieldWithDefault("parameters", method, []),
                    returnType: getFieldWithDefault("returnType", method, null),
                })})));
                doWriteAttributes(postConstantStrema, method);
            }
        }
        doWriteAttributes(postConstantStream, description);
        
        
        
        var classData = new ByteArrayOutputStream();
        var classStream = new DataOutputStream(classData);
        
        classStream.writeInt(0xCAFEBABE);
        classStream.writeShort(getFieldWithDefault("versionMinor", description, 0));
        classStream.writeShort(getFieldWithDefault("versionMajor", description, 52));
        classStream.writeShort(constantId); // this will always be last index + 1, which is what we want
        constantData.writeTo(classStream);
        postConstantData.writeTo(classStream);
        
        constantStream.close();
        postConstantStream.close();
        classStream.close();
        
        return classData.toByteArray();
    }
    
    return classMaker;
})();