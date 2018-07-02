"use strict";

(function(){
	var minecraftData = shell.loadLib("minecraftData");
	var vanilla = {
		data: null, // contains mappings between names and info about them
		wrapedName: "wrapedMinecraftObject", // name of the field that the object is stored when using vanilla.wrap(object)
		unwrap: null, // unwraps object
		wrap: null, // wraps object
		getDescription: null, // getDescription(object, field or method name), returns the descriptive text for a method or field fo an object
		translate: null, // translates the string into human-intended text
		getPlayer: null, // gets a player by username
		getWorld: null, // gets the world by id
		registerEventHandler: null, // registerEventHandler(eventClass, handler function, priority (defualt=NORMAL)), returns a handler instance
		unregisterEventHandler: null, // given the result of registerEventHandler, unregisters the event handler
		runOnServerThread: null, // runs a function on the server thread
		eventHandlers = [], // all registered event handlers
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
	vanilla.data = minecraftData.getInfos(minecraftVersion);

	var Class = Java.type("java.lang.Class");
	var StatCollector = debugUtils.findClass("net.minecraft.util.StatCollector").static;
	var javaString = Java.type("java.lang.String");
	var Modifier = Java.type("java.lang.reflect.Modifier");
	var MinecraftServer = debugUtils.findClass("net.minecraft.server.MinecraftServer").static;
	var DimensionManager = debugUtils.findClass("net.minecraftforge.common.DimensionManager").static;
	var ObjectToString = Java.type("java.lang.Object").class.getMethod("toString");
	var Base64 = Java.type("java.util.Base64");
	var ClassLoader = Java.type("java.lang.ClassLoader");
	var DataOutputStream = Java.type("java.io.DataOutputStream");
	var ByteArrayOutputStream = Java.type("java.io.ByteArrayOutputStream");
	var byteArray = Java.type("byte[]");
	var javaInt = Java.type("int");

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
		if ( hasKey(vanilla.data.backward, key) ) {
			tmp = vanilla.data.backward[key].map(function(entry){
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
				return vanilla.wrap(obj[getRealKey(obj, key)] = minecraft.unwrap(value));
			},
			__call__ : function(name) {
				if ( name == "toString" ) {
					// Java Class wrappers don't have a toString, so we give them one
					if ( typeof obj.class != "undefined" && obj.class instanceof Class && obj.class.static == obj ) {
						return "[adapted]" + obj;
					}
				}
				var keys = getRealKeys(obj, name);
				if ( keys.length <= 0 ) {
					if ( name == "toString" ) {
						return ObjectToString.invoke(obj);
					} else if ( name == "valueOf" ) {
						return this;
					} else {
						throw new Error(name + " does not exist");
					}
				}
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
					if ( hasKey(vanilla.data.forward, key) ) {
						arr.push(vanilla.data.forward[key].name);
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
				for each ( var e in obj ) {
					arr.push(vanilla.wrap(e));
				}
				return arr;
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
		var entry = vanilla.data.forward[getRealKey(realObj, key)];
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
				if ( vanilla.data.params[paramBase+(i+offset)+"_"] ) {
					args.push(argTypes[i].getName() + " " + vanilla.data.params[paramBase+(i+offset)+"_"].name);
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

	if ( MinecraftForge ) {
		vanilla.getWorld = function(id) {
			return vanilla.wrap(DimensionManager).getWorld(id);
		}

		var classLoader = MinecraftForge.getClassLoader();
		var resourceCache = classLoader.getClass().getDeclaredField("resourceCache");
		resourceCache.setAccessible(true);

		//compiled from this code, split on cpw.mods.fml.common.eventhandler.Event and eventHandlers.cpw.mods.fml.common.eventhandler.Event constants and the priority value
		/*
		package eventHandlers.NORMAL.cpw.mods.fml.common.eventhandler;
		public class Event {
			private java.util.function.Consumer func;
			public Event(java.util.function.Consumer func) {
				this.func = func;
			}
			@cpw.mods.fml.common.eventhandler.SubscribeEvent(priority=cpw.mods.fml.common.eventhandler.EventPriority.NORMAL)
			public void handleEvent(cpw.mods.fml.common.eventhandler.Event event) {
				func.accept(event);
			}
		}
		*/
		// '"' + btoa(str.split(" ").map(x=>String.fromCharCode(parseInt(x,16))).join("")).match(/.{1,64}/g).join('" +\n"') + '"'
		var eventHandlerBytes = [
			"yv66vgAAADQAHwoABQAVCQAEABYLABcAGAcAGQcAGgEABGZ1bmMBAB1MamF2YS91" +
			"dGlsL2Z1bmN0aW9uL0NvbnN1bWVyOwEABjxpbml0PgEAIChMamF2YS91dGlsL2Z1" +
			"bmN0aW9uL0NvbnN1bWVyOylWAQAEQ29kZQEAD0xpbmVOdW1iZXJUYWJsZQEAC2hh" +
			"bmRsZUV2ZW50AQ==",

			"AQAZUnVudGltZVZpc2libGVBbm5vdGF0aW9ucwEAMUxjcHcvbW9kcy9mbWwvY29t" +
			"bW9uL2V2ZW50aGFuZGxlci9TdWJzY3JpYmVFdmVudDsBAAhwcmlvcml0eQEAMExj" +
			"cHcvbW9kcy9mbWwvY29tbW9uL2V2ZW50aGFuZGxlci9FdmVudFByaW9yaXR5OwE=",

			"AQAKU291cmNlRmlsZQEACkV2ZW50LmphdmEMAAgAGwwABgAHBwAcDAAdAB4B",

			"AQAQamF2YS9sYW5nL09iamVjdAEAAygpVgEAG2phdmEvdXRpbC9mdW5jdGlvbi9D" +
			"b25zdW1lcgEABmFjY2VwdAEAFShMamF2YS9sYW5nL09iamVjdDspVgAhAAQABQAA" +
			"AAEAAgAGAAcAAAACAAEACAAJAAEACgAAACoAAgACAAAACiq3AAEqK7UAArEAAAAB" +
			"AAsAAAAOAAMAAAAEAAQABQAJAAYAAQAMAA0AAgAKAAAAJwACAAIAAAALKrQAAiu5" +
			"AAMCALEAAAABAAsAAAAKAAIAAAAJAAoACgAOAAAADQABAA8AAQAQZQARABIAAQAT" +
			"AAAAAgAU"
		]
		// 1 = this, 2 = target, 3 = priority
		var eventHandlerMidStrings = [
				"(L%2$s;)V",
				"%3$s",
				"%1$s"
		]
		for ( var i = 0; i < eventHandlerBytes.length; i++ ) {
			eventHandlerBytes[i] = Base64.getDecoder().decode(eventHandlerBytes[i]);
		}
		var handledClasses = {}
		var EventPriority = classLoader.loadClass("cpw.mods.fml.common.eventhandler.EventPriority").static;
		vanilla.registerEventHandler = function(eventClass, func, priority) {
			if ( classLoader.loadClass(eventClass.getName()) != eventClass ) {
				throw "[" + eventClass.getName() + "] does not match the one returned from the class loader";
			}
			if ( arguments.length < 3 ) {
				priority = "NORMAL"; // TODO set to whatever values we expect
			} else {
				priority = ("" + priority).toUpperCase();
				try {
					EventPriority.valueOf(priority);
				} catch (e) {
					throw "'" + priority + "' is not a valid priority"
				}
			}
			var newName = "eventHandlers." + priority +"." + eventClass.getName();
			if ( ! (newName in handledClasses) ) {
				var internalThis = newName.replace(/\./g, "/");
				var internalTarget = eventClass.getName().replace(/\./g, "/");
				var internalPriority = priority;

				var byteOutput = new ByteArrayOutputStream();
				var dataOutput = new DataOutputStream(byteOutput);
				var i;
				for ( var i = 0; i < eventHandlerBytes.length - 1; i++ ) {
						dataOutput.write(eventHandlerBytes[i], 0, eventHandlerBytes[i].length);
						dataOutput.writeUTF(javaString.format(eventHandlerMidStrings[i], internalThis, internalTarget, internalPriority));
				}
				dataOutput.write(eventHandlerBytes[i], 0, eventHandlerBytes[i].length);
				dataOutput.close();
				resourceCache.get(classLoader).put(newName, byteOutput.toByteArray());
				handledClasses[newName] = true;
			}
			var handler = new (classLoader.loadClass(newName).static)(function(event){
				try {
					func(event)
				} catch(e) {
					try {
						shell.printException(e);
					} catch (e2) {
						print("Got exception while handling exception " + e2);
					}
					vanilla.unregisterEventHandler(handler);
				}
			});
			MinecraftForge.static.EVENT_BUS.register(handler);
			vanilla.eventHandlers.push(handler);
			return handler;
		}
		vanilla.unregisterEventHandler = function(handler) {
				var index = vanilla.eventHandlers.lastIndexOf(handler);
				if ( index >= 0 ) {
					vanilla.eventHandlers.splice(index, 1);
				}
				MinecraftForge.static.EVENT_BUS.unregister(handler);
		}
		var ServerTickEvent = classLoader.loadClass("cpw.mods.fml.common.gameevent.TickEvent$ServerTickEvent");
		vanilla.runOnServerThread = function(func) {
			var first = true;
			var handler;
			handler = vanilla.registerEventHandler(ServerTickEvent, function(event){
				if ( first ) {
					first = false;
					vanilla.unregisterEventHandler(handler);
					func();
				}
			});
		}
	}
	return vanilla;
})();