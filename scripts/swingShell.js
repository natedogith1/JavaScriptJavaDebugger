Java.type("javax.swing.SwingUtilities").invokeLater(function(){
  // class definitions
  var JFrame = Java.type("javax.swing.JFrame");
  var JTextArea = Java.type("javax.swing.JTextArea");
  var PlainDocument = Java.type("javax.swing.text.PlainDocument");
  var JScrollPane = Java.type("javax.swing.JScrollPane");
  var ScrollPaneConstants = Java.type("javax.swing.ScrollPaneConstants");
  var KeyListener = Java.type("java.awt.event.KeyListener");
  var KeyEvent = Java.type("java.awt.event.KeyEvent");
  
  // actual code
  var frame = new JFrame("debugger shell");
  frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
  var document_super;
  var documentObject = {
    prompt: "> ",
    outputEnd: null,
    promptStart: null,
    inputStart: null,
    insertString: function(offs, str, a) {
      if ( offs >= this.inputStart.getOffset() )
        document_super.insertString(offs, str, a);
    },
    remove: function(offs, len) {
      if ( offs >= this.inputStart.getOffset() )
        document_super.remove(offs, len);
    },
    outputText: function(text) {
      document_super.insertString(this.outputEnd.getOffset(), text, null)
    },
    getInput: function() {
      var text = document_super.getText(inputStart.getOffset(), document_super.getLength() - inputStart.getOffset());
      outputText(document_super.getText(promptStart.getOffset(), document_super.getLength() - promptStart.getOffset()));
      document_super.remove(promptStart.getOffset(), document_super.getLength() - promptStart.getOffset());
      document_super.insertText(promptStart.getOffset(), this.prompt, null);
      inputStart = document_super.createPosition(promptStart.getOffset() + prompt.length);
      return text;
    }
  };
  var document = new (Java.extend(PlainDocument))(documentObject);
  document_super = Java.super(document);
  document_super.insertString(0, "\n" + documentObject.prompt, null);
  documentObject.outputEnd = document_super.createPosition(0);
  documentObject.promptStart = document_super.createPosition(1);
  documentObject.inputStart = document_super.createPosition(1 - 1 + documentObject.prompt.length);
  var textArea = new JTextArea(document, null, 20, 50);
  textArea.setLineWrap(true);
  textArea.addKeyListener(new KeyListener(){
    keyPressed : function(event) {
      if ( event.
    },
    keyReleased : function(event) {
      
    },
    keyTyped : function(event) {
      if ( textArea.getCaretPosition() < documentObject.inputStart.getOffset() )
        textArea.setCaret(document.getLength());
    }
  });
  var scrollPane = new JScrollPane(textArea, ScrollPaneConstants.VERTICAL_SCROLLBAR_ALWAYS, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
  frame.add(scrollPane, null);
  frame.pack();
  frame.setVisible(true);
});