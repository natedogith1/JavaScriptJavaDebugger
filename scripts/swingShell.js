Java.type("javax.swing.SwingUtilities").invokeLater(function(){
  // class definitions
  var JFrame = Java.type("javax.swing.JFrame");
  var JTextArea = Java.type("javax.swing.JTextArea");
  var PlainDocument = Java.type("javax.swing.text.PlainDocument");
  var JScrollPane = Java.type("javax.swing.JScrollPane");
  var ScrollPaneConstants = Java.type("javax.swing.ScrollPaneConstants");
  var KeyListener = Java.type("java.awt.event.KeyListener");
  var KeyEvent = Java.type("java.awt.event.KeyEvent");
  var SwingWorker = Java.type("javax.swing.SwingWorker");
  
  // actual code
  var frame = new JFrame("debugger shell");
  frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
  var document_super;
  var prompt = "> ";
  var documentObject = {
    outputEnd: null,
    isFirst: true,
    insertString: function(offs, str, a) {
      if ( offs >= this.outputEnd.getOffset() + prompt.length )
        document_super.insertString(offs, str, a);
    },
    remove: function(offs, len) {
      if ( offs >= this.outputEnd.getOffset() + prompt.length )
        document_super.remove(offs, len);
    },
    outputText: function(text) {
      document_super.insertString(this.outputEnd.getOffset(), text, null)
      if ( this.isFirst & text.length > 0) {
        this.isFirst = false;
        document_super.insertString(this.outputEnd.getOffset(), "\n", null)
        prompt = "\n" + prompt;
        this.outputEnd = document_super.createPosition(text.length);
      }
    },
    getInput: function() {
      if ( this.isFirst ) {
        this.isFirst = false;
        var text = document_super.getText(prompt.length, document_super.getLength() - prompt.length);
        document_super.insertString(document_super.getLength(), "\n" + prompt, null);
        prompt = "\n" + prompt
        this.outputEnd = document_super.createPosition(document_super.getLength() - prompt.length);
        return text;
      } else {
        var text = document_super.getText(this.outputEnd.getOffset() + prompt.length, document_super.getLength() - this.outputEnd.getOffset() - prompt.length);
        this.outputText("\n" + document_super.getText(this.outputEnd.getOffset() + 1, document_super.getLength() - this.outputEnd.getOffset() - 1));
        document_super.remove(this.outputEnd.getOffset() + prompt.length, document_super.getLength() - this.outputEnd.getOffset() - prompt.length);
        return text;
      }
    }
  };
  var document = new (Java.extend(PlainDocument))(documentObject);
  document_super = Java.super(document);
  document_super.insertString(0, prompt, null);
  documentObject.outputEnd = document_super.createPosition(0);
  var textArea = new JTextArea(document, null, 20, 50);
  textArea.setLineWrap(true);
  var swingWorkerAdapter = Java.extend(SwingWorker);
  var shellGlobal = {};
  textArea.addKeyListener(new KeyListener(){
    keyPressed : function(event) {
      if ( event.getKeyCode() == KeyEvent.VK_ENTER ) {
        var text = documentObject.getInput();
        print(text);
        (new swingWorkerAdapter() {
          doInBackground: function() {
            try {
              eval.call(shellGlobal,text)
            } catch( e ) {
              print( e );
            }
          }
        }).execute();
        event.consume();
      } else if ( event.getKeyCode() == KeyEvent.VK_LEFT ) {
        if ( textArea.getCaretPosition() == documentObject.outputEnd.getOffset() + prompt.length ) {
          event.consume();
        }
      }
        
    },
    keyReleased : function(event) {
      
    },
    keyTyped : function(event) {
      if ( textArea.getCaretPosition() < documentObject.outputEnd.getOffset() + prompt.length )
        textArea.setCaretPosition(document.getLength());
    }
  });
  textArea.setCaretPosition(document.getLength());
  var scrollPane = new JScrollPane(textArea, ScrollPaneConstants.VERTICAL_SCROLLBAR_ALWAYS, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
  frame.add(scrollPane, null);
  frame.pack();
  frame.setVisible(true);
  
  
});