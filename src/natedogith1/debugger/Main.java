package natedogith1.debugger;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.lang.instrument.Instrumentation;
import java.util.regex.Pattern;
import java.util.regex.Matcher;
import javax.script.Bindings;
import javax.script.ScriptContext;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

public class Main {
  public static final String FORMAT_OUTPUT = "scriptFile:instrumentationName:argsName:engineName;scriptArguments";
  
  public static void startup(String agentArgs, Instrumentation inst) throws FileNotFoundException, ScriptException {
    // scriptFile:instrumentationName:argsName:engineName;args
    Matcher mat = Pattern.compile("^(?<scriptFile>[^:]*):(?<instName>[^:]*):(?<argsName>[^:]*):(?<engineName>[^;]*);(?<scriptArgs>.*)$").matcher(agentArgs);
    if ( ! mat.find() ) {
      throw new IllegalArgumentException("expected arguments to be of form \"" + FORMAT_OUTPUT + "\"");
    }
    if ( mat.group("scriptFile").equals("") )
      throw new IllegalArgumentException("no script file provided");
    File scriptFile = new File(mat.group("scriptFile"));
    ScriptEngine engine;
    if ( ! mat.group("engineName").equals("") ) {
      engine = new ScriptEngineManager().getEngineByName(mat.group("engineName"));
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
    if ( ! mat.group("instName").equals("") )
      bindings.put(mat.group("instName"), inst);
    if ( ! mat.group("argsName").equals("") )
      bindings.put(mat.group("argsName"), mat.group("scriptArgs"));
    engine.eval(new FileReader(scriptFile));
  }
  
  public static void premain(String agentArgs, Instrumentation inst) throws FileNotFoundException, ScriptException {
    startup(agentArgs, inst);
  }
  
  public static void agentmain(String agentArgs, Instrumentation inst) throws FileNotFoundException, ScriptException {
    startup(agentArgs, inst);
  }
  
  public static void main(String... args) throws FileNotFoundException, ScriptException {
    if ( args[0].equals("--help") ) {
      System.out.println("format: " + FORMAT_OUTPUT);
      System.out.println("blank values will be interpreted as either none or automatic, as appropriate");
      return;
    }
    StringBuffer str = new StringBuffer();
    for ( String arg : args ) {
      str.append(" ");
      str.append(arg);
    }
    try { 
      startup(str.substring(1), null);
    } catch (IllegalArgumentException e) {
      System.out.println(e.getMessage());
    }
  }
}