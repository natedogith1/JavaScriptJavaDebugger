package natedogith1.debugger;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.lang.instrument.Instrumentation;
import javax.script.Bindings;
import javax.script.ScriptContext;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

public class Main {
  public static void startup(String agentArgs, Instrumentation inst) throws FileNotFoundException, ScriptException {
    // scriptFile:instrumentationName:argsName:engineName;args
    int scriptArgsIndex = agentArgs.indexOf(';');
    String scriptArgs = scriptArgsIndex > 0 ? agentArgs.substring(scriptArgsIndex + 1) : "";
    String[] args = agentArgs.substring(0,scriptArgsIndex).split(":", 3);
    if ( args.length < 1 )
      throw new IllegalArgumentException("no script file provided");
    File scriptFile = new File(args[0]);
    ScriptEngine engine;
    if ( args.length >= 4 ) {
      engine = new ScriptEngineManager().getEngineByName(args[3]);
    } else {
      int extensionPos = scriptFile.getName().lastIndexOf(".");
      String extension;
      if ( extensionPos == -1 || extensionPos == 0 )
        extension = "";
      else
        extension = scriptFile.getName().substring(extensionPos + 1);
      engine = new ScriptEngineManager().getEngineByExtension(extension);
    }
    if ( engine == null )
      throw new IllegalArgumentException("could not locate script engine");
    Bindings bindings = engine.getBindings(ScriptContext.ENGINE_SCOPE);
    String instName = args.length >= 2 ? args[1] : "";
    if ( ! instName.equals("") )
      bindings.put(instName, inst);
    String argsName = args.length >= 3 ? args[2] : "";
    if ( ! argsName.equals("") )
      bindings.put(argsName, scriptArgs);
    engine.eval(new FileReader(scriptFile));
  }
  
  public static void premain(String agentArgs, Instrumentation inst) throws FileNotFoundException, ScriptException {
    startup(agentArgs, inst);
  }
  
  public static void agentmain(String agentArgs, Instrumentation inst) throws FileNotFoundException, ScriptException {
    startup(agentArgs, inst);
  }
  
  public static void main(String... args) throws FileNotFoundException, ScriptException {
    StringBuffer str = new StringBuffer();
    for ( String arg : args ) {
      str.append(" ");
      str.append(arg);
    }
    startup(str.substring(1), null);
  }
}