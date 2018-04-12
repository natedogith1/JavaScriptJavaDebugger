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
            parameters: array of class objects, the arguments to this method (if vararg, the last argument should be an array type) (default: empty array)
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
                            signature: signature complex object (see bellow), this specifies the type of this local, including generic parts (class objects will prevent
                                the associated entry from being included in LocalVariableTypeTable, nothing but class objects will prevent the LocalVariableTypeTable attribute
                                from being included)(default: no default)
                            index: the index of the local variable (default: no default)
                        }
                        stackMap: array of stackFrame objects, specifies the types of local variables and objects on the stack at various points in the code,
                            there is an implicit -1st filled from the descriptor (default: not set, attribute won't be included)
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
                    types: map from strings to arrays of signature objects.  the 0th array index must be a non-interface or null.
                        the array is the types the generic type extends (<K extends Object & Cloneable> would have Object as the 0th index and Cloneable as the 1st) (default: empty map)
                    parameters: array of signature objects, the signatures of the arguments (unset entries deafult to the implemented interface object that matches that index, extra
                        entries will be ignored) (default: array of class objects of the arguments)
                    returnType: signature object, the signature of the return type, null maps to void (default: class object of returnType)
                    exceptions: array of signature objects, the signatures of the throwable exceptions (unset entries deafult to the implemented interface object that matches that index,
                        extra entries will be ignored)(default: array of class objects of declared exceptions)
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
                name: string, the name of this method (default: no default)
                parameters: array of class objects, the arguments to this method (default: empty array)
                returnType: class object, the return type of this method (default: null, void return type)
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
                types: map from strings to arrays of signature objects.  the 0th array index must be a non-interface or null.
                    the array is the types the generic type extends (<K extends Object & Cloneable> would have Object as the 0th index and Cloneable as the 1st) (default: empty map)
                superClass: signature object for super class (should be type "class" signature object) (default: class object of super class)
                interfaces: array of signature objects for implemented interfaces (should be type "class" signature objects)
                    (unset entries deafult to the implemented interface object that matches that index, extra entries will be ignored) (default: array of class objects of interfaces)
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
    one of the following
    class object
    {
        type: "class" string, (types not set + subClazz not set is the same as just a class object of clazz)
        clazz: class object, the class this describes (default: no default)
        types: array of following complex type, the generic sub-types (default: empty array)
        {
            wild: "*" string or "wild" string or "extends" string or "super" string or "exact", the type of wildness, "*" and "wild" are the same and ignore signature (default: "exact")
            signature: signature object, the signature to match against (default: no default, ignored when wild is "*")
        }
        subClazz: a "class" type signature object, the sub-class referenced (default: not set)
    }
    {
        type: "type" string, (for example the K from <K>)
        identifier: string, should match a generic type (such as K for <K>)
    }
    {
        type: "array" string, for arrays of generic types
        signature: signature object, the type of the array component (default: not set)
    }
    
    // annotation object:
    {
        type: class object, the type of the annotation (the annotation class) (default: no default)
        values: map from name of value to annotationValue objects, the value of the annotation attributes (default: not set/empty map)
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
        typeOverride: class object, the type of this value, necessary for when the type is ambiguous
        value: an annotationValue object not of this type
    }
    
    // typeAnnotation object:
    {
        target: typeAnnotationTarget object, the location of the type this applies to (default: no default)
        targetPath: array of the following complex types (or strings of the kind), specifies where in the type the annotation is, each entry is a level of depth, see the JVM specification for examples (default: empty array)
        {
            kind: one of the following strings, specifies how this path entry drills down a layer
                "array", is an array type (@A String[])
                "nested", is a neested type (Foo.@A Bar]
                "bound", is the bounds of a generic (Generic<? extends @A Object>]
                "parameter", is the parameter of a generic (Generic<@A ?>)
            index: int, only meaningful for "parameter" kind, inidicates the index of the parameter (in <K,T>, K would be 0, T would be 1) (default: 0)
        }
        annotation: an annotation object, the actual annotation this represents (default: no default)
    }
    
    
    // typeAnnotationTarget object:
    one of the following objects
    {
        type: "class" string, a generic parameter on the class (public class Example <@A K>)
        genericIndex: int, the index of the generic (in <K,T>, K would be 0, T would be 1) (default: 0)
    }
    {
        type: "method" string, a generic parameter on a method (public <A@ K> K method())
        genericIndex: int, the index of the generic (in <K,T>, K would be 0, T would be 1) (default: 0)
    }
    {
        type: "super" string, an extended class or interface (public class Example extends @A Object)
        interfaceIndex: int, the index of the implemented interface, or -1 for super class (default: -1)
    }
    {
        type: "classBound" string, the wildcard on a class generic parameter (public class Example <K extends @A Object> {})
        genericIndex: int, the index of the generic (in <K,T>, K would be 0, T would be 1) (default: 0)
        boundIndex: int, which entry in the bound (in <K extends Object & Cloneable>, Object would be 0, Cloneable would be 1) (default: 0)
    }
    {
        type: "methodBound" string, the wildcard on a method generic parameter (public <K extends @A Object> K method(){return null;})
        genericIndex: int, the index of the generic (in <K,T>, K would be 0, T would be 1) (default: 0)
        boundIndex: int, which entry in the bound (in <K extends Object & Cloneable>, Object would be 0, Cloneable would be 1) (default: 0)
    }
    {
        type: "field" string, a field descriptor (public @A Object field;)
    }
    {
        type: "methodReturn" string, a method return type (public @A Object method(){return null;})
    }
    {
        type: "methodThis" string or "methodReciever" string, the this of a method (public void method(@A Example this){})
    }
    {
        type: "methodParameter" string, a method's argument (public void method(@Test arg0){})
        parameterIndex: int, the index of the parameter (default: 0)
    }
    {
        type: "methodThrows" string, a class in the throws clause of a method (public void method() throws @A Throwable {})
        exceptionIndex: int, the index
    }
    {
        type: "localVariable" string, a variable in a method (@A Object local; local.hashCode();)
        locations: array of the following complex type, the locations this local variable has a value (default: no default)
        {
            startIndex: int, the index of the first opcode covered by this entry (default: no default)
            length: int, how many indexes this entry covers (indexes, not opcodes) (default: no default)
            index: the index of the local variable (default: no default)
        }
    }
    {
        type: "resourceVariable" string, a variable declared in a try-with-resources statement (try(@A AutoCloseable resource = arg){})
        locations: array of the following complex type, the locations this local variable has a value (default: no default)
        {
            startIndex: int, the index of the first opcode covered by this entry (default: no default)
            length: int, how many indexes this entry covers (indexes, not opcodes) (default: no default)
            index: the index of the local variable (default: no default)
        }
    }
    {
        type: "exceptionParameter" string, a variable declared in a catch clause (try{arg.hashCode();}catch(@A Throwable e){e.hashCode();})
        exceptionIndex: int, an index into the exceptionHandlers of this method's code specifying which catch clause this belongs to (default: no default)
    }
    {
        type: "instanceof", a type used as part of instanceof (if(arg instanceof @A Object){})
        index: int, index into code array specifying the instruction this is part of (default: no default)
    }
    {
        type: "new" string, a type that new is called on (new @A Object();)
        index: int, index into code array specifying the instruction this is part of (default: no default)
    }
    {
        type: "dynamicNew" string, ::new as used as part of lambdas (java.util.function.Supplier<Object> local = @A Object::new)
        index: int, index into code array specifying the instruction this is part of (default: no default)
    }
    {
        type: "dynamicMethod" string, ::method as used as part of lambdas (java.util.function.Supplier<?> local = @A java.util.function.UnaryOperator::identity;)
        index: int, index into code array specifying the instruction this is part of (default: no default)
    }
    {
        type: "cast" string, a type used in casting (arg = (@A Object) arg;)
        index: int, index into code array specifying the instruction this is part of (default: no default)
        typeIndex: int, which type to target (in (Object & Cloneable), Object would be 0, Cloneable would be 1) (default: 0)
    }
    {
        type: "newType" string, the type specifier for a constructor method call (new <@A Object> java.util.LinkedList<Object>(null);)
        index: int, index into code array specifying the instruction this is part of (default: no default)
        typeIndex: int, which type to target (in (Object & Cloneable), Object would be 0, Cloneable would be 1) (default: 0)
    }
    {
        type: "methodType" string, the type specifier for a method call (java.util.Arrays.<@A Object> asList();)
        index: int, index into code array specifying the instruction this is part of (default: no default)
        typeIndex: int, which type to target (in (Object & Cloneable), Object would be 0, Cloneable would be 1) (default: 0)
    }
    {
        type: "dynamicNewType" string, the type specifier for a ::new (java.util.function.Supplier<Object> local = java.util.LinkedList<Object>::<@A Object> new;)
        index: int, index into code array specifying the instruction this is part of (default: no default)
        typeIndex: int, which type to target (in (Object & Cloneable), Object would be 0, Cloneable would be 1) (default: 0)
    }
    {
        type: "dynamicMethodType" string, the type specifier for a ::method (java.util.function.Supplier<?> local = java.util.function.UnaryOperator::<@A Object>identity;)
        index: int, index into code array specifying the instruction this is part of (default: no default)
        typeIndex: int, which type to target (in (Object & Cloneable), Object would be 0, Cloneable would be 1) (default: 0)
    }
    
    // stackFrame object:
    one of the following:
    {
        type: "same" string, a frame where none of the locals/stack have changed
        offset: int < 0x10000, this frame's location - previous frame's location - 1
    }
    {
        type: "setStack1" string, a frame where the locals haven't changed and the stack has one item
        offset: int < 64, this frame's location - previous frame's location - 1
        stack: verificationType object, the single item on the stack
    }
    {
        type "growStack1" string or "extendStack1" string, a frame where the locals haven't changed and the stack has grown by one item
        offset: int < 0x10000, this frame's location - previous frame's location - 1
        stack: verificationType object, the item added to the stack
    }
    {
        type: "reduceStack" string or "chop" string, a frame where the stack has reduced in size
        offset: int < 0x10000, this frame's location - previous frame's location - 1
        count: int >= 1 and <= 3, the number of stack items removed
    }
    {
        type: "addLocals" string or "append" string, a frame where locals have been added
        offset: int < 0x10000, this frame's location - previous frame's location - 1
        locals: array of vertificationType objects, length must be >= 1 and <= 3, the locals added
    }
    {
        type: "full" string, a frame that defines the entire stack and all of the locals
        offset: int < 0x10000, this frame's location - previous frame's location - 1
        locals: array of verificationType objects, the locals
        stack: array of verificationType objects, the stack, ordered from bottom to top
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
    {
        type: string, any of the above strings, works the same as specifying just the strings
    }
    
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
        parameters: array of class objects, the argument types of this method (default: empty array)
        returnType: class object, the return type of this method, null maps to void (default: null, void return type)
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
            parameters: array of class objects, the argument types of this descriptor (default: empty array)
            returnType: class object, the return type of this descriptor, null maps to void (default: null, void return type)
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
        parameters: array of class objects, the argument types of the method (default: empty array)
        returnType: class object, the return type of the method, null maps to void (default: null, void return type)
    }
    {
        type: "methodType" string
        parameters: array of class objects, the argument types of this method type (default: empty array)
        returnType: class object, the return type of this method type, null maps to void (default: null, void return type)
    }
    {
        type: "invokeDynamic" string
        bootstrapIndex: int, index into the bootstrap method table attribute of the class
        name: string, the name of the method
        parameters: array of class objects, the argument types of the method (default: empty array)
        returnType: class object, the return type of the method, null maps to void (default: null, void return type)
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
    var byteArray = Java.type("byte[]");
    var NoSuchMethodException = Java.type("java.lang.NoSuchMethodException");
    var javaEnum = Java.type("java.lang.Enum");
    var javaArray = Java.type("java.lang.reflect.Array");
    var Annotation = Java.type("java.lang.annotation.Annotation");
    var javaString = Java.type("java.lang.String");
    var javaInt = Java.type("int");
    
    var rootClassLoader = new (Java.extend(ClassLoader))(){};
    var rootClassLoaderSuper = Java.super(rootClassLoader);
    var methodDefineClass = ClassLoader.class.getDeclaredMethod("defineClass", javaString.class, byteArray.class, javaInt.class, javaInt.class);
    methodDefineClass.setAccessible(true);
    
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
    
    var GeneratingClassLoader = methodDefineClass.invoke(rootClassLoader, "GeneratingClassLoader", GeneratingClassLoaderBytes, 0, GeneratingClassLoaderBytes.length).static;
    
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
            return obj.getName().replace(/\./g,"/");
        } else if ( obj instanceof nashornClass ) {
            return obj.class.getName().replace(/\./g,"/");
        } else if ( typeof obj === "string" ) {
            return obj.replace(/\./g,"/");
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
    
    var typePathKindMapping = {
        "array": 0,
        "nested": 1,
        "bound": 2,
        "parameter": 3,
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
                    return "V";
                default:
                    if ( clazz.getName()[0] === "[" ) {
                        return clazz.getName().replace(/\./g, "/");
                    } else {
                        return "L" + clazz.getName().replace(/\./g, "/") + ";";
                    }
            }
        } else if ( obj === null ) {
            return "V";
        } else if ( obj instanceof Array ) {
            return obj.map(toDescriptor).join();
        } else if ( typeof obj === "string" ) {
            return "L" + obj.replace(/\./g, "/"); + ";"
        } else {
            return "("
                   + toDescriptor(getFieldWithDefault("parameters", obj, []))
                   + ")"
                   + toDescriptor(getFieldWithDefault("returnType", obj, null));
        }
    }
    
    function parseSignatureForDescriptor(obj) {
        if ( getClassName(obj) !== null ) {
            return toDescriptor(obj);
        }
        switch ( requireField("type", obj, "signature object") ) {
            case "class":
                return toDescriptor(requireField("clazz", obj, "signature object"));
            case "type":
                return toDescriptor(javaObject);
            case "array":
                return "[" + parseSignatureForDescriptor(requireField("signature", obj, "signature object"));
            default:
                throw "unknown signature object type [" + type + "]";
        }
    }
    
    function parseSignature(obj) {
        if ( getClassName(obj) !== null ) {
            return toDescriptor(obj);
        }
        var ret = "";
        switch ( requireField("type", obj, "signature object") ) {
            case "class":
                ret += "L";
                ret += getClassName(requireField("clazz", obj, "signature object"));
                if ( isSet("types", obj) && obj.types.length > 0 ) {
                    for each ( var subType in obj.types ) {
                        switch ( getFieldWithDefault("wild", subType, "exact") ) {
                            case "*":
                            case "wild":
                                ret += "*";
                                break;
                            case "extends":
                                ret += "+" + parseSignature(requireField("signature", subType, "signature object class types"));
                                break;
                            case "super":
                                ret += "-" + parseSignature(requireField("signature", subType, "signature object class types"));
                                break;
                            case "exact":
                                ret += parseSignature(requireField("signature", subType, "signature object class types"));
                                break;
                            default:
                                throw "unknown signature class types wildness [" + subType.wild + "]";
                        }
                    }
                }
                if ( isSet("subClazz", obj) ) {
                    ret += "." + parseSignature(obj.subClazz);
                }
                break;
            case "type":
                ret += "T" + requireField("identifier", obj, "signature object") + ";";
                break;
            case "array":
                ret += "[" + parseSignature(requireField("signature", obj, "signature object"));
                break;
            default:
                throw "unknown signature object type [" + type + "]";
        }
        return ret;
    }
    
    function isSet(name, obj) {
        return name in obj && (obj[name] !== null && obj[name] !== undefined);
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
    
    classMaker.getClassBytes = function(description) {
        if ( arguments.length < 1 ) {
            description = {};
        }
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
        
        function getConstantIndexUTF8(value) {
            var mappedName = value;
            if ( ! (mappedName in constants.utf8s) ) {
                constantStream.writeByte(1);
                constantStream.writeUTF(value);
                constants.utf8s[mappedName] = constantId++;
            }
            return constants.utf8s[mappedName];
        }
        
        function getConstantIndexClass(value) {
            var mappedName = getClassName(value);
            if ( ! (mappedName in constants.classes) ) {
                var value = getConstantIndexUTF8(mappedName);
                constantStream.writeByte(7);
                constantStream.writeShort(value);
                constants.classes[mappedName] = constantId++;
            }
            return constants.classes[mappedName];
        }
        
        function getConstantIndex(constant) {
            var mappedName;
            switch ( constant.type ) {
                case "class":
                    return getConstantIndexClass(requireField("value", constant, "class constant"));
                case "field":
                    mappedName = [getClassName(requireField("clazz", constant, "field constant")),
                                  requireField("name", constant, "field constant"),
                                  toDescriptor(requireField("type", constant, "field constant")),
                                 ].join(";");
                    if ( ! (mappedName in constants.fields) ) {
                        var clazz = getConstantIndexClass(constant.clazz);
                        var nameAndType = getConstantIndex({type:"nameAndType", name:constant.name, descriptor:constant.type});
                        constantStream.writeByte(9);
                        constantStream.writeShort(clazz);
                        constantStream.writeShort(nameAndType);
                        constants.fields[mappedName] = constantId++;
                    }
                    return constants.fields[mappedName];
                case "method":
                case "interfaceMethod":
                    mappedName = [getClassName(requireField("clazz", constant, constant.type + " constant")),
                                  requireField("name", constant, constant.type + " constant"),
                                  toDescriptor(requireField("parameters", constant, constant.type + " constant")),
                                  toDescriptor(requireField("returnType", constant, constant.type + " constant")),
                                 ].join(";");
                    if ( ! (mappedName in constants.methods) ) {
                        var clazz = getConstantIndexClass(constant.clazz);
                        var nameAndType = getConstantIndex({type:"nameAndType", name:constant.name, descriptor:{parameters:constant.parameters, returnType:constant.returnType}});
                        constantStream.writeByte(constant.type === "method" ? 10 : 11);
                        constantStream.writeShort(clazz);
                        constantStream.writeShort(nameAndType);
                        constants.methods[mappedName] = constantId++;
                    }
                    return constants.methods[mappedName];
                case "string":
                    mappedName = "" + requireField("value", constant, "string constant");
                    if ( ! (mappedName in constants.strings) ) {
                        var value = getConstantIndexUTF8(constant.value);
                        constantStream.writeByte(8);
                        constantStream.writeShort(value);
                        constants.strings[mappedName] = constantId++;
                    }
                    return constants.strings[mappedName];
                case "integer":
                case "int":
                    mappedName = requireField("value", constant, constant.type + " constant");
                    if ( ! (mappedName in constants.integers) ) {
                        constantStream.writeByte(3);
                        constantStream.writeInt(constant.value);
                        constants.integers[mappedName] = constantId++;
                    }
                    return constants.integers[mappedName];
                case "float":
                    mappedName = requireField("value", constant, "float constant");
                    if ( ! (mappedName in constants.floats) ) {
                        constantStream.writeByte(4);
                        constantStream.writeFloat(constant.value);
                        constants.floats[mappedName] = constantId++;
                    }
                    return constants.floats[mappedName];
                case "long":
                    mappedName = requireField("value", constant, "long constant");
                    if ( ! (mappedName in constants.longs) ) {
                        constantStream.writeByte(5);
                        constantStream.writeLong(constant.value);
                        constants.longs[mappedName] = constantId++;
                    }
                    return constants.longs[mappedName];
                case "double":
                    mappedName = requireField("value", constant, "double constant");
                    if ( ! (mappedName in constants.doubles) ) {
                        constantStream.writeByte(6);
                        constantStream.writeDouble(constant.value);
                        constants.doubles[mappedName] = constantId++;
                    }
                    return constants.doubles[mappedName];
                case "nameAndType":
                    mappedName = [requireField("name", constant, "nameAndType constant"), 
                                  toDescriptor(requireField("descriptor", constant, "nameAndType constant")),
                                 ].join(";");
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
                    return getConstantIndexUTF8(requireField("value", constant, "utf8 constant"));
                case "methodHandle":
                    var clazzObject = getClassObject(requireField("clazz", constant, "methodHandle constant"));
                    var kind = requireField("kind", constant, "methodHandle constant");
                    var isInterface =
                        (kind === "invokeStatic" || kind === "invokeSpecial")
                        ? (clazzObject ? clazzObject.isInterface() : !! requireField("isInterface", constant, "methodHandle constant"))
                        : kind === "invokeInterface";
                    var descriptor =
                        ({getField:true, getStatic:true, putField:true, putStatic:true})[kind]
                        ? toDescriptor(requireField("fieldType", constant, "methodHandle constant"))
                        : toDescriptor({
                            parameters:requireField("parameters", constant, "methodHandle constant"),
                            returnType:requireField("fieldType", constant, "methodHandle constant"),
                        });
                    mappedName = [kind,
                                  isInterface,
                                  getClassName(constant.clazz),
                                  requireField("name", constant, "methodHandle constant"),
                                  toDescriptor(getFieldWithDefault("fieldType", constant, "")),
                                  descriptor,
                                 ].join(";");
                    if ( ! (mappedName in constants.methodHandles) ) {
                        var ref;
                        switch ( kind ) {
                            case "getField":
                            case "getStatic":
                            case "putField":
                            case "putStatic":
                                ref = getConstantIndex({type:"field", clazz:constant.clazz, name:constant.name, descriptor:constant.fieldType});
                                break;
                            case "invokeVirtual":
                            case "invokeStatic":
                            case "newInvokeSpecial":
                            case "invokeInterface":
                                ref = getConstantIndex({type:(isInterface?"interfaceMethod":"method"), clazz:constant.clazz, name:constant.name, parameters:constant.parameters, returnType:constant.returnType});
                                break;
                            default:
                                throw "unknown methodHandle kind [" + kind + "]";
                        }
                        constantStream.writeByte(15);
                        constantStream.writeByte(methodHandleKindMapping[kind]);
                        constantStream.writeShort(ref);
                        constants.methodHandles[mappedName] = constantId++;
                    }
                    return constants.methodHandles[mappedName];
                case "methodType":
                    mappedName = [toDescriptor(requireField("parameters", constant, "methodType constant")),
                                  toDescriptor(requireField("parameters", constant, "returnType constant")),
                                 ].join(";");
                    if ( ! (mappedName in constants.methodTypes) ) {
                        var descriptor = getConstantIndexUTF8(toDescriptor({parameters:constant.parameters, returnType:constant.returnType}));
                        constantStream.writeByte(16);
                        constantStream.writeShort(descriptor);
                        constants.methodTypes[mappedName] = constantId++;
                    }
                    return constants.methodTypes[mappedName];
                case "invokeDynamic":
                    mappedName = [requireField("bootstrapIndex", constant, "invokeDynamic constant"),
                                  requireField("name", constant, "invokeDynamic constant"),
                                  toDescriptor(requireField("parameters", constant, "invokeDynamic constant")),
                                  toDescriptor(requireField("returnType", constant, "invokeDynamic constant"))
                                 ].join(";");
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
        var postConstantStream = new DataOutputStream(postConstantData);
        
        function writeCustomData(stream, obj) {
            var constants = getFieldWithDefault("constants", obj, []);
            constants.sort(function(x,y){return x.address - y.address});
            if ( isSet("array", obj) ) {
                stream.writeInt(obj.array.length);
                var startIndex = 0;
                for each ( var constant in constants ) {
                    stream.write(obj.array, startIndex, requireField("address", constant, "arbitraryData constant") - startIndex);
                    stream.writeShort(getConstantIndex(requireField("constant", constant, "arbitraryData constant")));
                    startIndex = constant.address + 2;
                }
                stream.write(obj.array, startIndex, obj.array.length - startIndex);
            } else if ( isSet("stream", obj) && isSet("size", obj) ) {
                stream.writeInt(obj.size);
                var buf = new byteArray(1024);
                var startIndex = 0;
                for each ( var constant in constants ) {
                    while ( startIndex < constant.address ) {
                        var countRead = obj.stream.read(buf, 0, Math.min(1024, crequireField("address", constant, "arbitraryData constant") - startIndex));
                        if ( countRead === -1 ) {
                            throw "unexpected end of stream in arbitraryData stream";
                        }
                        stream.write(buf, 0, countRead);
                        startIndex += countRead;
                    }
                    stream.writeShort(getConstatnIndex(requireField("constant", constant, "arbitraryData constant")));
                    obj.stream.skip(2);
                }
                while ( startIndex < obj.size ) {
                    var countRead = obj.stream.read(buf, 0, Math.min(1024, obj.size - startIndex));
                    if ( countRead === -1 ) {
                        throw "unexpected end of stream in arbitraryData stream";
                    }
                    stream.write(buf, 0, countRead);
                    startIndex += countRead;
                }
            } else {
                throw "missing item in arbitraryData object";
            }
        }
        
        function detectAnnotationType(value, clazz) {
            if ( value instanceof Object && isSet("typeOverride", value ) && (isSet("value", value) || value.value === null) ) {
                return value.typeOverride;
            }
            if ( clazz ) {
                try{
                    return clazz.getDelcaredMethod(name).getReturnType();
                } catch (e if e instanceof NoSuchMethodException) {
                    // do nothing, fall through to guessing type
                }
            }
            if ( typeof value === "string" && value.length > 1 ) {
                return javaString.class;
            } else if ( value instanceof javaEnum ) {
                return value.getClass();
            } else if ( value instanceof javaClass ) {
                return javaClass.class;
            } else if ( value === null ) {
                return javaClass.class;
            } else if ( value.getClass && value.getClass().isAnnotation() ) {
                return value.getClass();
            } else if ( value instanceof Array ) {
                var subType = detectAnnotationType(value[0]);
                if ( subType !== undefined ) {
                    return javaArray.newInstance(subType, 0).getClass();
                } else {
                    return undefined;
                }
            } else if ( value instanceof Object && isSet("type", value) ) {
                return Annotation.class;
            } else {
                throw "could not detect annotation type for [" + name + "] on [" + obj.type + "]";
            }
            
        }
        
        function writeAnnotationValue(stream, value, type) {
            if ( value instanceof Object && isSet("typeOverride", value ) && isSet("value", value) ) {
                type = value.typeOverride;
                value = value.value;
            }
            switch ( type ) {
                case javaByteType:
                    stream.writeChar("B");
                    stream.writeShort(getConstantIndex({type:"integer", value:value}));
                    break;
                case javaCharType:
                    stream.writeChar("C");
                    stream.writeShort(getConstantIndex({type:"integer", value:value}));
                    break;
                case javaDoubleType:
                    stream.writeChar("D");
                    stream.writeShort(getConstantIndex({type:"double", value:value}));
                    break;
                case javaFloatType:
                    stream.writeChar("F");
                    stream.writeShort(getConstantIndex({type:"float", value:value}));
                    break;
                case javaIntType:
                    stream.writeChar("I");
                    stream.writeShort(getConstantIndex({type:"integer", value:value}));
                    break;
                case javaLongType:
                    stream.writeChar("J");
                    stream.writeShort(getConstantIndex({type:"long", value:value}));
                    break;
                case javaShortType:
                    stream.writeChar("S");
                    stream.writeShort(getConstantIndex({type:"integer", value:value}));
                    break;
                case javaBooleanType:
                    stream.writeChar("Z");
                    stream.writeShort(getConstantIndex({type:"integer", value:value}));
                    break;
                case javaString.class:
                    stream.writeChar("s");
                    stream.writeShort(getConstantIndex({type:"utf8", value:value}));
                    break;
                case javaClass:
                    stream.writeChar("c");
                    stream.writeShort(getConstantIndexUTF8(toDescriptor(value)));
                default:
                    if ( retType.isEnum() ) {
                        stream.writeChar("e");
                        stream.writeShort(getConstantIndexUTF8(getClassName(retType)));
                        stream.writeShort(getConstantIndexUTF8(value.name()));
                    } else if ( retType.isAnnotation() ) {
                        stream.writeChar("@");
                        writeAnnotation(stream, value);
                    } else if ( retType.isArray() ) {
                        stream.writeChar("[");
                        stream.writeShort(value.length);
                        for each ( var annotationValue in value ) {
                            writeAnnotationValue(stream, value);
                            writeAnnotationValue(stream, annotationValue, type.getComponentType());
                        }
                    } else {
                        throw "invlaid annotation type [" + retType + "]";
                    }
                    break;
            }
        }
        
        function writeAnnotation(stream, obj) {
            stream.writeShort(getConstantIndex({type:"utf8", value:getClassName(requireField("type", obj, "annotation"))}));
            var clazz = getClassObject(obj.type);
            if ( ! isSet("values", obj ) ) {
                stream.writeShort(0);
            } else {
                stream.writeShort(Object.keys(obj.values).length);
                for ( var name in obj.values ) {
                    stream.writeUTF8(name);
                    writeAnnotationValue(stream, obj.values[name], detectAnnotationType(obj.values[name], clazz));
                }
            }
        }
        
        function writeTypeAnnotation(stream, obj) {
            var type = requireField("type", requireField("target", obj, "type annoation"), "type annotation target");
            switch ( type ) {
                case "class":
                    stream.writeByte(0x00);
                    stream.writeByte(getFieldWithDefault("genericIndex", obj, 0));
                    break;
                case "method":
                    stream.writeByte(0x01);
                    stream.writeByte(getFieldWithDefault("genericIndex", obj, 0));
                    break;
                case "super":
                    stream.writeByte(0x10);
                    if ( getFieldWithDefault("interfaceIndex", obj, -1) === -1 ) {
                        stream.writeShort(65535);
                    } else {
                        stream.writeShort(obj.interfaceIndex);
                    }
                    break;
                case "classBound":
                    stream.writeByte(0x11);
                    stream.writeByte(getFieldWithDefault("genericIndex", obj, 0));
                    stream.writeByte(getFieldWithDefault("boundIndex", obj, 0));
                    break;
                case "methodBound":
                    stream.writeByte(0x12);
                    stream.writeByte(getFieldWithDefault("genericIndex", obj, 0));
                    stream.writeByte(getFieldWithDefault("boundIndex", obj, 0));
                    break;
                case "field":
                    stream.writeByte(0x13);
                    break;
                case "methodReturn":
                    stream.writeByte(0x14);
                    break;
                case "methodThis":
                    stream.writeByte(0x15);
                    break;
                case "methodParameter":
                    stream.writeByte(0x16);
                    stream.writeByte(getFieldWithDefault("parameterIndex", obj, 0));
                    break;
                case "methodThrows":
                    stream.writeByte(0x17);
                    stream.writeShort(getFieldWithDefault("exceptionIndex", obj, 0));
                    break;
                case "localVariable":
                    stream.writeByte(0x40);
                    for each ( var location in requireField("locations", obj, "type annotation target " + type) ) {
                        stream.writeShort(requireField("startIndex", obj, "type annotation target " + type + " location"));
                        stream.writeShort(requireField("length", obj, "type annotation target " + type + " location"));
                        stream.writeShort(requireField("index", obj, "type annotation target " + type + " location"));
                    }
                    break;
                case "resourceVariable":
                    stream.writeByte(0x41);
                    for each ( var location in requireField("locations", obj, "type annotation target " + type) ) {
                        stream.writeShort(requireField("startIndex", obj, "type annotation target " + type + " location"));
                        stream.writeShort(requireField("length", obj, "type annotation target " + type + " location"));
                        stream.writeShort(requireField("index", obj, "type annotation target " + type + " location"));
                    }
                    break;
                case "exceptionParameter":
                    stream.writeByte(0x42);
                    stream.writeShort(requireField("exceptionIndex", obj, "type annotation target " + type));
                    break;
                case "instanceof":
                    stream.writeByte(0x43);
                    stream.writeShort(requireField("index", obj, "type annotation target " + type));
                    break;
                case "new":
                    stream.writeByte(0x44);
                    stream.writeShort(requireField("index", obj, "type annotation target " + type));
                    break;
                case "dynamicNew":
                    stream.writeByte(0x45);
                    stream.writeShort(requireField("index", obj, "type annotation target " + type));
                    break;
                case "dynamicMethod":
                    stream.writeByte(0x46);
                    stream.writeShort(requireField("index", obj, "type annotation target " + type));
                    break;
                case "cast":
                    stream.writeByte(0x47);
                    stream.writeShort(requireField("index", obj, "type annotation target " + type));
                    stream.writeByte(getFieldWithDefault("typeIndex", obj, 0));
                    break;
                case "newType":
                    stream.writeByte(0x48);
                    stream.writeShort(requireField("index", obj, "type annotation target " + type));
                    stream.writeByte(getFieldWithDefault("typeIndex", obj, 0));
                    break;
                case "methodType":
                    stream.writeByte(0x49);
                    stream.writeShort(requireField("index", obj, "type annotation target " + type));
                    stream.writeByte(getFieldWithDefault("typeIndex", obj, 0));
                    break;
                case "dynamicNewType":
                    stream.writeByte(0x4A);
                    stream.writeShort(requireField("index", obj, "type annotation target " + type));
                    stream.writeByte(getFieldWithDefault("typeIndex", obj, 0));
                    break;
                case "dynamicMethodType":
                    stream.writeByte(0x4B);
                    stream.writeShort(requireField("index", obj, "type annotation target " + type));
                    stream.writeByte(getFieldWithDefault("typeIndex", obj, 0));
                    break;
            }
            if ( ! isSet("targetPath", obj) ) {
                stream.writeShort(0);
            } else {
                stream.writeShort(obj.targetPath.length);
                for each ( var pathElement in obj.targetPath ) {
                    var type;
                    var index;
                    if ( typeof pathElement === "string" ) {
                        type = pathElement;
                        index = 0;
                    } else {
                        type = requireField("kind", pathElement, "type annotation pathElement");
                        index = getFieldWithDefault("index", pathElement, 0);
                    }
                    stream.writeByte(typePathKindMapping[type]);
                    stream.writeByte(index);
                }
            }
            writeAnnotation(stream, requireField("annotation", obj, "type annotation"));
        }
        
        function writeVerificationType(stream, obj) {
            var type = obj;
            if ( obj instanceof Object ) {
                type = requireField("type", obj, "verificationType");
            }
            switch ( type ) {
                case "top":
                    stream.writeByte(0);
                    break;
                case "int":
                    stream.writeByte(1);
                    break;
                case "float":
                    stream.writeBye(2);
                    break;
                case "null":
                    stream.writeByte(5);
                    break;
                case "uninitializedThis":
                    stream.writeByte(6);
                    break;
                case "object":
                    stream.writeByte(7);
                    stream.writeShort(getConstantIndexClass(requireField("value", obj, "verificationType object")));
                    break;
                case "uninitialized":
                    stream.writeByte(8);
                    stream.writeShort(requireField("newOffset", obj, "verificationType uninitialized"));
                    break;
                case "long":
                    stream.writeByte(4);
                    break;
                case "double":
                    stream.writeByte(3);
                    break;
                default:
                    throw "unknown verification type [" + type + "]";
            }
        }
                    
        function writeAttributes(stream, obj, type) {
            var supportedAttributes = {
                constantValue: true, synthetic: true, deprecated: true, signature: true, runtimeTypeAnnotations: true, compiletimeTypeAnnotations: true, code: true,
                lineNumbers: true, localVariables: true, stackMap:true, exceptions: true, runtimeParameterAnnotations: true, compiletimeParametersAnnotations: true,
                annotationDefault: true, methodParameters: true, runtimeAnnotations: true, compiletimeAnnotations: true, sourceFile: true, innerClasses: true,
                enclosingMethod: true, sourceDebugExtension: true, bootstrapMethods: true,
            }
            var count = getFieldWithDefault("customAttributes", obj, []).length;
            if ( obj.attributes ) {
                for ( var name in obj.attributes ) {
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
                    if ( type !== "field" ) {
                        throw "constantValue attribute not valid for " + type;
                    }
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
                        case javaString.class:
                            ref = getConstantIndex({type:"string", value:obj.attributes.constantValue});
                            break;
                        default:
                            throw "unknown constantValue type [" + obj.type + "]";
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
                        attributeStream.writeShort(obj.attributes.code.length);
                        for each ( var exceptionHandler in obj.attributes.code.exceptionHandlers ) {
                            attributeStream.writeShort(requireField("startIndex", exceptionHandler, "exceptionHandler attribute"));
                            attributeStream.writeShort(requireField("endIndex", exceptionHandler, "exceptionHandler attribute"));
                            attributeStream.writeShort(requireField("handlerIndex", exceptionHandler, "exceptionHandler attribute"));
                            attributeStream.writeShort(isSet("catchType", exceptionHandler) ? getConstantIndexClass(exceptionHandler.catchType) : 0);
                        }
                    }
                    writeAttributes(attributeStream, obj.attributes.code, "code");
                    
                    stream.writeShort(getConstantIndexUTF8("Code"));
                    stream.writeInt(attributeData.size());
                    attributeData.writeTo(stream);
                    attributeStream.close();
                }
                if ( isSet("stackMap", obj.attributes) ) {
                    attributeData = new ByteArrayOutputStream();
                    attributeStream = new DataOutputStream(attributeData);
                    
                    attributeStream.writeShort(obj.attributes.stackMap.length);
                    for each ( var stackFrame in obj.attributes.stackMap ) {
                        switch ( requireField("type", stackFrame, "stackMap attribute") ) {
                            case "same":
                                if ( requireField("offset", stackFrame, "stackFrame " + stackFrame.type) < 64 ) {
                                    attributeStream.writeByte(stackFrame.offset);
                                } else {
                                    attributeStream.writeByte(251);
                                    attributeStream.writeShort(stackFrame.offset);
                                }
                                break;
                            case "setStack1":
                            case "growStack1":
                                attributeStream.writeByte(64 + requireField("offset", stackFrame, "stackFrame " + stackFrame.type));
                                writeVerificationType(attributeStream, requireField("stack", stackFrame, "stackFrame " + stackFrame.type));
                                break;
                            case "extendStack1":
                                attributeStream.writeByte(247);
                                attributeStream.writeShort(requireField("offset", stackFrame, "stackFrame " + stackFrame.type));
                                writeVerificationType(attributeStream, requireField("stack", stackFrame, "stackFrame " + stackFrame.type));
                                break;
                            case "reduceStack":
                            case "chop":
                                attributeStream.writeByte(251 - requireField("offset", stackFrame, "stackFrame " + stackFrame.type));
                                attributeStream.writeShort(requireField("offset", stackFrame, "stackFrame " + stackFrame.type));
                                break;
                            case "addLocals":
                            case "append":
                                attributeStream.writeByte(251 + requireField("locals", stackFrame, "stackFrame " + stackFrame.type).length);
                                attributeStream.writeShort(requireField("offset", stackFrame, "stackFrame " + stackFrame.type));
                                for each ( var verType in requireField("locals", stackFrame, "stackFrame " + stackFrame.type) ) {
                                    writeVerificationType(attributeStream, verType);
                                }
                            case "full":
                                attributeStream.writeByte(255);
                                attributeStream.writeShort(requireField("offset", stackFrame, "stackFrame " + stackFrame.type));
                                attributeStream.writeShort(requireField("locals", stackFrame, "stackFrame " + stackFrame.type).length);
                                for each ( var verType in requireField("locals", stackFrame, "stackFrame " + stackFrame.type) ) {
                                    writeVerificationType(attributeStream, verType);
                                }
                                attributeStream.writeShort(requireField("stack", stackFrame, "stackFrame " + stackFrame.type).length);
                                for each ( var verType in requireField("stack", stackFrame, "stackFrame " + stackFrame.type) ) {
                                    writeVerificationType(attributeStream, verType);
                                }
                            default:
                                throw "unknown stackFrame type [" + stackFrame.type + "]";
                        }
                    }
                    
                    stream.writeShort(getConstantIndexUTF8("StackMapTable"));
                    stream.writeInt(attributeData.size());
                    attributeData.writeTo(stream);
                    attributeStream.close();
                }
                if ( isSet("exceptions", obj.attributes) ) {
                    stream.writeShort(getConstantIndexUTF8("Exceptions"));
                    stream.writeInt(2 + 2 * obj.attributes.exceptions.length);
                    for each ( var clazz in obj.attributes.exceptions ) {
                        stream.writeShort(getConstantIndexClass(clazz));
                    }
                }
                if ( isSet("innerClasses", obj.attributes) ) {
                    stream.writeShort(getConstantIndexUTF8("InnerClasses"));
                    stream.writeInt(2 + 8 * obj.attributes.innerClasses.length)
                    for each ( var innerClass in obj.attributes.innerClasses ) {
                        stream.writeShort(getConstantIndexClass(requiredField("innerClass", innerClass, "innerClass attribute")));
                        stream.writeShort(isSet("outerClass", innerClass) ? getConstantIndexClass(innerClass.outerClass) : 0);
                        stream.writeShort(isSet("name", innerClass) ? getConstantIndexUTF8(clazz) : 0);
                        stream.writeShort(requireField("accessFlags", innerClass, "innerClass attribute"));
                    }
                }
                if ( isSet("enclosingMethod", obj.attributes) ) {
                    stream.writeShort(getConstantIndexUTF8("EnclosingMethod"));
                    stream.writeInt(4);
                    stream.writeShort(getConstantIndexClass(requireField("clazz", obj.attributes.enclosingMethod, "enclosingMethod attribute")));
                    stream.writeShort(getConstantIndex({
                        type: "nameAndType",
                        name: requireField("name", obj.attributes.enclosingMethod, "enclosingMethod attribute"),
                        descriptor: {
                            parameters: requireField("parameters", obj.attributes.enclosingMethod, "enclosingMethod attribute"),
                            returnType: requireField("returnType", obj.attributes.enclosingMethod, "enclosingMethod attribute"),
                        },
                    }));
                }
                if ( getFieldWithDefault("synthetic", obj.attributes, false) ) {
                    stream.writeShort(getConstantIndexUTF8("Synthetic"));
                    stream.writeInt(0);
                }
                if ( isSet("signature", obj.attributes) ) {
                    var sig = "";
                    switch ( type ) {
                        case "field":
                            sig = parseSignature(obj.attributes.signature);
                            break;
                        case "method":
                        case "class":
                            if ( isSet("types", obj.attributes.signature) && Object.keys(obj.attributes.signature.types).length > 0 ) {
                                sig += "<";
                                for ( var name in obj.attributes.signature.types ) {
                                    sig += name;
                                    if ( obj.attribtues.signature.types[name].length <= 0 ) {
                                        sig += ":"
                                    } else {
                                        for each ( var subSig in obj.attributes.signature.types[name] ) {
                                            sig += ":";
                                            if ( subSig !== null ) {
                                                sig += parseSignature(subSig);
                                            }
                                        }
                                    }
                                }
                                sig += ">";
                            }
                            if ( type === "method" ) {
                                sig += "(";
                                var params = getFieldWithDefault("parameters", obj.attributes.signature, []);
                                if ( isSet("parameters", obj) ) {
                                    for ( var i = 0; i < obj.parameters.length; i++ ) {
                                        ret += parseSignature(getFieldWithDefault(i, obj.attributes.signature.parameters, obj.parameters[i]));
                                    }
                                }
                                sig += ")";
                                if ( ! isSet("returnType", obj.attributes.signature) && obj.attributes.signature.returnType !== null ) {
                                    sig += parseSignature(obj.returnType);
                                } else {
                                    sig += parseSignature(obj.attributes.signature.returnType);
                                }
                                if ( isSet("exceptions", obj.attributes) ) {
                                    for ( var i = 0; i < obj.attributes.exceptions.length; i++ ) {
                                        ret += parseSignature(getFieldWithDefault(i, obj.attributes.signature.exceptions, obj.attributes.exceptions[i]));
                                    }
                                }
                            } else { // type === "class"
                                sig += parseSignature(getFieldWithDefault("superClass", obj.attributes.signature, obj.superClass));
                                if ( isSet("interfaces", obj) ) {
                                    for ( var i = 0; i < obj.interfaces.length; i++ ) {
                                        ret += parseSignature(getFieldWithDefault(i, obj.attributes.signature.interfaces, obj.interfaces[i]));
                                    }
                                }
                            }
                            break;
                        default:
                            throw "signature attribute not valid for " + type;
                    }
                    
                    stream.writeShort(getConstantIndexUTF8("Signature"));
                    stream.writeInt(2);
                    strean.writeShort(getConstantIndexUTF8(sig));
                }
                if ( isSet("sourceFile", obj.attributes) ) {
                    stream.writeShort(getConstantIndexUTF8("SourceFile"));
                    stream.writeInt(2);
                    stream.writeShort(getConstantIndexUTF8(obj.attributes.sourceFile));
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
                    var numLocalTypes = 0;
                    for each ( var localVariable in obj.attributes.localVariables ) {
                        stream.writeShort(requireField("startIndex", localVariable, "localVariable attribute"));
                        stream.writeShort(requireField("length", localVariable, "localVariable attribute"));
                        stream.writeShort(getConstantIndexUTF8(requireField("name", localVariable, "localVariable attribute")));
                        stream.writeShort(getConstantIndexUTF8(parseSignatureForDescriptor(requireField("signature", localVariable, "localVariable attribute"))));
                        stream.writeShort(requireField("index", localVariable, "localVariable attribute"));
                        if ( getClassName(localVariable) !== null ) {
                            numLocalTypes++;
                        }
                    }
                    
                    if ( numLocalTypes > 0 ) {
                        stream.writeShort(getConstantIndexUTF8("LocalVariableTypeTable"));
                        stream.writeInt(2 + 10 * numLocalTypes);
                        for each ( var localVariable in obj.attributes.localVariables ) {
                            if ( getClassName(localVariable) !== null ) {
                                stream.writeShort(requireField("startIndex", localVariable, "localVariable attribute"));
                                stream.writeShort(requireField("length", localVariable, "localVariable attribute"));
                                stream.writeShort(getConstantIndexUTF8(requireField("name", localVariable, "localVariable attribute")));
                                stream.writeShort(getConstantIndexUTF8(parseSignature(requireField("signature", localVariable, "localVariable attribute"))));
                                stream.writeShort(requireField("index", localVariable, "localVariable attribute"));
                            }
                        }
                    }
                }
                if ( getFieldWithDefault("deprecated", obj.attributes, false) ) {
                    stream.writeShort(getConstantIndexUTF8("Deprecated"));
                    stream.writeInt(0);
                }
                if ( isSet("runtimeAnnotations", obj.attributes) ) {
                    attributeData = new ByteArrayOutputStream();
                    attributeStream = new DataOutputStream(attributeData);
                    
                    attributeStream.writeShort(obj.attributes.runtimeAnnotations.length);
                    for each ( var annotation in obj.attributes.runtimeAnnotations ) {
                        writeAnnotation(attributeStream, annotation);
                    }
                    
                    stream.writeShort(getConstantIndexUTF8("RuntimeVisibleAnnotations"));
                    stream.writeInt(attributeData.size());
                    attributeData.writeTo(stream);
                    attributeStream.close();
                }
                if ( isSet("compiletimeAnnotations", obj.attributes) ) {
                    attributeData = new ByteArrayOutputStream();
                    attributeStream = new DataOutputStream(attributeData);
                    
                    attributeStream.writeShort(obj.attributes.compiletimeAnnotations.length);
                    for each ( var annotation in obj.attributes.compiletimeAnnotations ) {
                        writeAnnotation(attributeStream, annotation);
                    }
                    
                    stream.writeShort(getConstantIndexUTF8("RuntimeInvisibleAnnotations"));
                    stream.writeInt(attributeData.size());
                    attributeData.writeTo(stream);
                    attributeStream.close();
                }
                if ( isSet("runtimeParameterAnnotations", obj.attributes) ) {
                    attributeData = new ByteArrayOutputStream();
                    attributeStream = new DataOutputStream(attributeData);
                    
                    attributeStream.writeShort(obj.attributes.runtimeParameterAnnotations.length);
                    for each ( var annotationArray in obj.attributes.runtimeParameterAnnotations ) {
                        attributeStream.writeShort(annotationArray.length);
                        for each ( var annotation in annotationArray ) {
                            writeAnnotation(attributeStream, annotation);
                        }
                    }
                    
                    stream.writeShort(getConstantIndexUTF8("RuntimeVisibleParameterAnnotations"));
                    stream.writeInt(attributeData.size());
                    attributeData.writeTo(stream);
                    attributeStream.close();
                }
                if ( isSet("compiletimeParameterAnnotations", obj.attributes) ) {
                    attributeData = new ByteArrayOutputStream();
                    attributeStream = new DataOutputStream(attributeData);
                    
                    attributeStream.writeShort(obj.attributes.compiletimeParameterAnnotations.length);
                    for each ( var annotationArray in obj.attributes.compiletimeParameterAnnotations ) {
                        attributeStream.writeShort(annotationArray.length);
                        for each ( var annotation in annotationArray ) {
                            writeAnnotation(attributeStream, annotation);
                        }
                    }
                    
                    stream.writeShort(getConstantIndexUTF8("RuntimeInvisibleParameterAnnotations"));
                    stream.writeInt(attributeData.size());
                    attributeData.writeTo(stream);
                    attributeStream.close();
                }
                if ( isSet("runtimeTypeAnnotations", obj.attributes) ) {
                    attributeData = new ByteArrayOutputStream();
                    attributeStream = new DataOutputStream(attributeData);
                    
                    attributeStream.writeShort(obj.attributes.runtimeTypeAnnotations.length);
                    for each ( var annotation in obj.attributes.runtimeTypeAnnotations ) {
                        writeTypeAnnotation(attributeStream, annotation);
                    }
                    
                    stream.writeShort(getConstantIndexUTF8("RuntimeVisibleTypeAnnotations"));
                    stream.writeInt(attributeData.size());
                    attributeData.writeTo(stream);
                    attributeStream.close();
                }
                if ( isSet("compiletimeTypeAnnotations", obj.attributes) ) {
                    attributeData = new ByteArrayOutputStream();
                    attributeStream = new DataOutputStream(attributeData);
                    
                    attributeStream.writeShort(obj.attributes.compiletimeTypeAnnotations.length);
                    for each ( var annotation in obj.attributes.compiletimeTypeAnnotations ) {
                        writeTypeAnnotation(attributeStream, annotation);
                    }
                    
                    stream.writeShort(getConstantIndexUTF8("RuntimeInvisibleTypeAnnotations"));
                    stream.writeInt(attributeData.size());
                    attributeData.writeTo(stream);
                    attributeStream.close();
                }
                if ( isSet("annotationDefault", obj.attributes) ) {
                    if ( type !== "method" ) {
                        throw "annotationDefault attribute not valid for " + type;
                    }
                    attributeData = new ByteArrayOutputStream();
                    attributeStream = new DataOutputStream(attributeData);
                    
                    writeAnnotationValue(attributeStream, obj.attributes.annotationDefault,
                                         detectAnnotationType(obj.attributes.annotationDefault, getClassObject(obj.returnType)));
                    
                    stream.writeShort(getConstantIndexUTF8("AnnotationDefault"));
                    stream.writeInt(attributeData.size());
                    attributeData.writeTo(stream);
                    attributeStream.close();
                }
                if ( isSet("bootstrapMethods", obj.attributes) ) {
                    attributeData = new ByteArrayOutputStream();
                    attributeStream = new DataOutputStream(attributeData);
                    
                    attributeStream.writeShort(obj.attributes.bootstrapMethods.length);
                    for each ( var bootstrapMethod in bootstrapMethods ) {
                        try {
                            attributeStream.writeShort(getConstantIndex({
                                type: "methodHandle",
                                kind: bootstrapMethod.kind,
                                isInterface: bootstrapMethod.isInterface,
                                clazz: bootstrapMethod.clazz,
                                name: bootstrapMethod.name,
                                parameters: bootstrapMethod.parameters,
                                returnType: bootstrapMethod.returnType,
                            }));
                        } catch (e if typeof e === "string") {
                            // we're passing off argument requirements to getConstantIndex, so add our location to any returned exceptions
                            throw e + "in bootstrapMethods attribute";
                        }
                        attributeStream.writeShort(bootstrapMethod.bootstrapArguments.length);
                        for each ( var bootstrapArgument in bootstrapMethod.bootstrapArguments ) {
                            attributeStream.writeShort(getConstantIndex(bootstrapArgument));
                        }
                    }
                    
                    stream.writeShort(getConstantIndexUTF8("BootstrapMethods"));
                    stream.writeInt(attributeData.size());
                    attributeData.writeTo(stream);
                    attributeStream.close();
                }
                if ( isSet("methodParameters", obj.attributes) ) {
                    stream.writeShort(getConstantIndexUTF8("MethodParameters"));
                    stream.writeInt(1 + 4 * obj.attributes.methodParameters.length);
                    for each ( var parameter in obj.attributes.methodParameters ) {
                        stream.writeShort(isSet("name", parameter) ? getConstantIndexUTF8(parameter.name) : 0);
                        stream.writeShort(getFieldWithDefault("accessFlags", description, 0x0000));
                    }
                }
            }
            for each ( var customAttribtue in getFieldWithDefault("customAttributes", obj, []) ) {
                stream.writeShort(getConstantIndexUTF8(requireField("name", customAttribute, "custom attribute")));
                writeCustomData(requireField("data", customAttribute, "custom attribute"));
            }
        }
        
        postConstantStream.writeShort(getFieldWithDefault("accessFlags", description, 0x0021));
        postConstantStream.writeShort(getConstantIndexClass(isSet("name", description) ? description.name : "createPackage.CreatedClass" + Math.random().toString().substring(2)));
        postConstantStream.writeShort(getConstantIndexClass(getFieldWithDefault("superClass", description, javaObject)));
        if ( ! isSet("interfaces", description) ) {
            postConstantStream.writeShort(0);
        } else {
            postConstantStream.writeShort(description.interfaces.length);
            for each ( var iface in description.interfaces ) {
                postConstantStream.writeShort(getConstantIndexClass(iface));
            }
        }
        if ( ! isSet("fields", description) ) {
            postConstantStream.writeShort(0);
        } else {
            postConstantStream.writeShort(description.fields.length);
            for each ( var field in description.fields ) {
                postConstantStream.writeShort(getFieldWithDefault("accessFlags", field, 0x0001));
                postConstantStream.writeShort(getConstantIndexUTF8(requireField("name", field, "field")));
                postConstantStream.writeShort(getConstantIndexUTF8(toDescriptor(field.type)));
                writeAttributes(postConstantStream, field, "field");
            }
        }
        if ( ! isSet("methods", description) ) {
            postConstantStream.writeShort(0);
        } else {
            postConstantStream.writeShort(description.methods.length);
            for each ( var method in description.methods ) {
                postConstantStream.writeShort(getFieldWithDefault("accessFlags", method, 0x0001));
                postConstantStream.writeShort(getConstantIndexUTF8(requireField("name", method, "method")));
                postConstantStream.writeShort(getConstantIndexUTF8(toDescriptor({
                    parameters: getFieldWithDefault("parameters", method, []),
                    returnType: getFieldWithDefault("returnType", method, null),
                })));
                writeAttributes(postConstantStream, method, "method");
            }
        }
        writeAttributes(postConstantStream, description, "class");
        
        
        
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