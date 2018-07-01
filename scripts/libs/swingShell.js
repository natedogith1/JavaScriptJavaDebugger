//////////////////////////////////////////////////////
//
//  Program: an interactive interface for runing
//      javascript code
//
//  Expected Arguments Name: args
//
//  Arguments: [;scriptFile[:scriptArgs] ...]
//      scriptFile is the name of a file to
//        run when the shell is made
//        if this file starts with a '!' then it is a file path
//        if it doesn't, this is a library
//        if the script returns a function, it will be called with scriptArgs
//        if the script returns an object with an init_shell function, it will
//        be called with scriptArgs
//      scriptArgs will be passed to the scriptFile
//      scriptFile, and scriptArgs can escape characters using backslashes
//
//////////////////////////////////////////////////////

"use strict";

(function(){
	var swingShell = {};

	swingShell.initShell = function(args) {
		var resultShell = Object.create(shell.loadLib("baseShell").baseShell);

		Java.type("javax.swing.SwingUtilities").invokeLater(function(){
			var oldWriter = context.getWriter();
			// method for easier debugging
			var oldPrint = function(text) {
			var a = new java.io.PrintWriter(oldWriter)
			a.println(text);
			a.flush();
			};

			// class definitions
			var JFrame = Java.type("javax.swing.JFrame");
			var JTextArea = Java.type("javax.swing.JTextArea");
			var PlainDocument = Java.type("javax.swing.text.PlainDocument");
			var JScrollPane = Java.type("javax.swing.JScrollPane");
			var ScrollPaneConstants = Java.type("javax.swing.ScrollPaneConstants");
			var KeyListener = Java.type("java.awt.event.KeyListener");
			var KeyEvent = Java.type("java.awt.event.KeyEvent");
			var SwingWorker = Java.type("javax.swing.SwingWorker");
			var Writer = Java.type("java.io.Writer");
			var Reader = Java.type("java.io.Reader");
			var UnsupportedOperationException = Java.type("java.lang.UnsupportedOperationException");
			var javaString = Java.type("java.lang.String");
			var DocumentListener = Java.type("javax.swing.event.DocumentListener");
			var Font = Java.type("java.awt.Font");
			var SwingUtilities = Java.type("javax.swing.SwingUtilities");
			var InputEvent = Java.type("java.awt.event.InputEvent");
			var PipedReader = Java.type("java.io.PipedReader");
			var PipedWriter = Java.type("java.io.PipedWriter");
			var WindowConstants = Java.type("javax.swing.WindowConstants");
			var System = Java.type("java.lang.System");
			var WindowListener = Java.type("java.awt.event.WindowListener");
			var WindowAdapter = Java.type("java.awt.event.WindowAdapter");
			var JOptionPane = Java.type("javax.swing.JOptionPane");

			var lineSeperator = Java.type("java.lang.System").getProperty("line.seperator");

			// actual code
			var frame = new JFrame("debugger shell");
			frame.setDefaultCloseOperation(WindowConstants.DO_NOTHING_ON_CLOSE);
			frame.addWindowListener(new WindowAdapter() {
			windowClosing: function(event) {
			  if ( JOptionPane.showConfirmDialog(frame, "Are you sure you want to close this window?",
				  "Close The Window?", JOptionPane.YES_NO_OPTION) == JOptionPane.YES_OPTION ) {
				frame.dispose();
			  }
			}
			});

			// document that handles things
			var document_super;
			var prompt = "> ";
			var documentObject = {
			realPrompt: "> ",
			set prompt(text) {
			  document_super.remove( this.promptStart, this.realPrompt.length );
			  document_super.insertString( this.promptStart, text, null );
			  this.realPrompt = text;
			},
			get prompt() {
			  return this.realPrompt;
			},
			outputEnd: null, // the location output gets prepended to
			isFirst: true, // handles not starting with a blank line
			isNewLine: false, // so things like print() don't make an extra emtpy line
			get inputStart() {
			  return this.outputEnd.getOffset() + this.prompt.length + (this.isFirst ? 0 : 1 )
			},
			get promptStart() {
			  return this.outputEnd.getOffset() + (this.isFirst ? 0 : 1)
			},
			insertString: function(offs, str, a) { // prevents editing the output
			  if ( offs >= this.inputStart )
				document_super.insertString(offs, str, a);
			},
			remove: function(offs, len) { // prevents editing the output
			  if ( offs >= this.inputStart )
				document_super.remove(offs, len);
			},
			outputText: function(text) { // writes text to the output
			  if ( this.isNewLine ) { // we removed a \n earlier, so re-ad it
				this.isNewLine = false;
				document_super.insertString(this.outputEnd.getOffset(), "\n", null);
			  }
			  if ( text.endsWith("\n") ) { // remove the \n so we don't have extra empty lines
				this.isNewLine = true;
				text = text.substring(0, text.length - 1);
			  }
			  document_super.insertString(this.outputEnd.getOffset(), text, null);
			  if ( this.isFirst && text.length > 0) { // handle modifying prompty string and initializing the outputEnd pointer
				this.isFirst = false;
				document_super.insertString(text.length, "\n", null);
				prompt = "\n" + prompt;
				this.outputEnd = document_super.createPosition(text.length);
			  }
			},
			getInput: function() { // get the input text, push it to the output, and clear the input
			  var text = this.getInputCurrent();
			  if ( ! this.isFirst ) {
				this.isNewLine = true; // insert text on new line, but \n at end of text means we get a line to ourselves
			  }
			  this.outputText(document_super.getText(this.promptStart, document_super.getLength() - this.promptStart) + "\n");
			  // clear the input
			  document_super.remove(this.inputStart, document_super.getLength() - this.inputStart);
			  return text;
			},
			getInputCurrent: function() { // get input without clearing it, used for history
			  return document_super.getText(this.inputStart, document_super.getLength() - this.inputStart);
			},
			setInput: function(text) { // set the input, used for history
			  this.remove(this.inputStart, document_super.getLength() - this.inputStart);
			  this.insertString(this.inputStart, text, null);
			}
			};
			var document = new (Java.extend(PlainDocument))(documentObject);
			document_super = Java.super(document);
			document_super.insertString(0, documentObject.prompt, null);
			documentObject.outputEnd = document_super.createPosition(0);
			var textArea = new JTextArea(document, null, 20, 50);
			textArea.setFont(Font.getFont(Font.MONOSPACED));
			textArea.setLineWrap(true);

			var history = { // handling of history
			node : function(prev, val, next) { // because linked lists are easier (?)
			  this.prev = prev;
			  this.val = val;
			  this.next = next;
			},
			head : null, // first node of the list
			count : 0, // number of items in this list
			limit : -1, // how many items before we start start droping the tail
			cur : null, // curent node in iterator
			tail : null, // last node item in the list
			lowDefault : null, // saves our original input we when start navigating history
			add: function(item) { // add an item to the most recent history and reset the iterator
			  this.enforceLimit();
			  this.lowDefault = null;
			  if ( item == "" ) {
				// do nothing
			  } else if ( this.limit == 0 ) {
				// do nothing
			  } else if ( this.count == 0 ) {
				this.tail = new this.node(this.head,item,null);
				this.head.next = this.tail;
				this.count++;
			  } else if ( this.head.next.val != item ) {
				if (this.count == this.limit ) {
				  this.tail.prev.next = null;
				  this.tail = this.tail.prev;
				}
				this.head.next = new this.node(this.head,item,this.head.next);
				this.head.next.next.prev = this.head.next;
				this.count++;
			  } else {
				// do nothing
			  }
			  this.cur = this.head;
			},
			enforceLimit: function() { // remove elements until the limit is satisfied
			  if ( this.limit >= 0 ) {
				for ( ; count > limit; count-- )
				  tail = tail.prev;
				tail.next = null;
			  }
			},
			getNext: function(item) { // get the next item in the list
			  if ( this.cur == this.head )
				this.lowDefault = item; // store the current input if we're not in history yet
			  if ( this.cur == null || this.cur.next == null )
				return null;
			  this.cur = this.cur.next;
			  return this.cur.val;
			},
			getPrevious: function(item) { // get the previous item in the list
			  if ( this.cur == null || this.cur.prev == null ) {
				return null;
			  }
			  this.cur = this.cur.prev;
			  if ( this.cur == this.head )
				return this.lowDefault; // if we're bellow the bottom of the list, restore the original input
			  else
				return this.cur.val;
			}
			}
			history.cur = history.tail = history.head = new history.node(null,null,null);


			var currentCode = null;
			var inWriter;
			var swingWorkerAdapter = Java.extend(SwingWorker);
			// makes the text area process input rather than execute code
			// used to evaluate user-inputed code
			function runFunction(func) {
			var oldPrompt = documentObject.prompt;
			currentCode = new swingWorkerAdapter() {
			  doInBackground: func,
			  done: function() {
				currentCode = null;
				inWriter.close()
				documentObject.prompt = oldPrompt;
			  }
			};
			documentObject.prompt = "";
			resetReader();
			currentCode.execute();
			};

			textArea.addKeyListener(new KeyListener(){
			keyPressed : function(event) {
			  if ( event.getKeyCode() == KeyEvent.VK_ENTER ) { // comand-execution and history adding
				if ( event.isShiftDown() ) {
				  if ( textArea.getCaretPosition() < documentObject.inputStart ) {
					textArea.setCaretPosition(document.getLength());
				  }
				  documentObject.insertString(textArea.getCaretPosition(), "\n", null);
				  event.consume();
				} else {
					if ( ! currentCode ) {
					  var text = documentObject.getInput();
					  history.add(text);
					  runFunction(function() {
						try {
						  var tmp = eval; // give eval a different name, so that it executes in the global context
						  var res = tmp(text);
						  if ( typeof res != "undefined" )
							print(res);
						} catch( e ) {
						  print( e );
						}
					  });
					  event.consume();
					} else {
					  var text = documentObject.getInput();
					  inWriter.write(""+text);
					  inWriter.write(""+System.getProperty("line.seperator"));
					  event.consume();
					}
				}
			  } else if ( event.getKeyCode() == KeyEvent.VK_LEFT ) { // can't move left past the begining of input
				if ( textArea.getCaretPosition() == documentObject.inputStart ) {
				  if ( ! event.isShiftDown() )
					textArea.setCaretPosition(textArea.getCaretPosition());
				  event.consume();
				}
			  } else if ( event.getKeyCode() == KeyEvent.VK_HOME ) { // home won't take you past the begining of input
				if ( textArea.getLineOfOffset(textArea.getCaretPosition()) == textArea.getLineOfOffset(documentObject.inputStart) ) {
				  if ( event.isShiftDown() )
					textArea.moveCaretPosition(documentObject.inputStart);
				  else
					textArea.setCaretPosition(documentObject.inputStart);
				  event.consume();
				}
			  } else if ( event.getKeyCode() == KeyEvent.VK_UP ) { // go up in history, but only if at top of input
				if ( textArea.getLineOfOffset(textArea.getCaretPosition()) == textArea.getLineOfOffset(documentObject.inputStart) ) {
					var cur = documentObject.getInputCurrent();
					var next = history.getNext(cur);
					if ( next != null && next != cur )
					  documentObject.setInput(next);
					textArea.setCaretPosition(document.getLength());
					event.consume();
				}
			  } else if ( event.getKeyCode() == KeyEvent.VK_DOWN ) { // go down in history, but only if at bottom of input
				if ( textArea.getLineOfOffset(textArea.getCaretPosition()) == textArea.getLineOfOffset(document.getLength()) ) {
					var cur = documentObject.getInputCurrent();
					var prev = history.getPrevious(cur);
					if ( prev != null && prev != cur )
					  documentObject.setInput(prev);
					textArea.setCaretPosition(document.getLength());
					event.consume();
				}
			  } else if ( event.getKeyCode() == KeyEvent.VK_V ) {
				if ( event.isControlDown() ) {
				  if ( textArea.getCaretPosition() < documentObject.inputStart ) {
					textArea.setCaretPosition(document.getLength());
					// dont' consume, we want to paste
				  }
				}
			  } else if ( event.getKeyCode() == KeyEvent.VK_ESCAPE ) { // stop running code
				//if ( event.isControlDown() ) { // used to be ctrl_c, then I realized that's copy
				  if ( currentCode != null ) {
					currentCode.cancel(true);
				  }
				  event.consume();
				//}
			  } else if ( event.getKeyCode() == KeyEvent.VK_A ) {
				if ( event.isControlDown() ) {
				  textArea.setCaretPosition(documentObject.inputStart);
				  textArea.moveCaretPosition(document.getLength());
				  event.consume();
				}
			  }

			},
			keyReleased : function(event) {
			  // nothing here right now
			},
			keyTyped : function(event) { // return user to input area when they start typing
			  if ( textArea.getCaretPosition() < documentObject.inputStart ) {
				if ( event.isControlDown() ) {
				  return; // this isn't a typed character
				}
				textArea.setCaretPosition(document.getLength());
			  }
			}
			});
			/*document.addDocumentListener(new (Java.extend(DocumentListener)){
			changeUpdate: function(event) {
			  // don't know what to do in this case
			},
			insertUpdate: function(event) {
			  if ( textArea.getCaretPosition() >= event.getOffset() )
				textArea.setCaretPosition( textArea.getCaretPosition() + event.getLength() );
			},
			removeUpdate: function(event) {
			  var caret = textArea.getCaretPosition();
			  if ( caret > event.getOffset() ){
				if ( caret > event.getOffset() + event.getLength() )
				  textArea.setCaretPosition( caret - event.getLength() );
				else
				  textArea.setCaretPosition( event.getOffset() );
			  }
			}
			});*/ // not sure why I needed this is the first place.
			textArea.setCaretPosition(document.getLength());
			var scrollPane = new JScrollPane(textArea, ScrollPaneConstants.VERTICAL_SCROLLBAR_ALWAYS, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
			frame.add(scrollPane, null);

			inWriter = new PipedWriter(); // declared above addKeyListener
			function resetReader() {
			var inReader = new PipedReader();
			inWriter = new PipedWriter(inReader);
			context.setReader(inReader);
			};

			var outWriter_super;
			var outWriter = new (Java.extend(Writer)){
			write: function(a,b,c) {
			  if ( arguments.length == 1 )
				outWriter_super.write(a);
			  else if (arguments.length == 3 )
				if ( a instanceof javaString )
				  outWriter_super.write(a,b,c);
				else {
				  var tmp = new javaString(a,b,c); // this has to be here because the default Writer
				  // will re-use the char[] array, meaning we'll get incorrect results if we
				  // use the array after we return (as we do with invokeLater)
				  SwingUtilities.invokeLater(function() {
					documentObject.outputText(tmp);
				  });
				}
			  else {
				throw "invalid argument count [" + arguments.length + "]";
			  }
			},
			flush: function(){},
			close: function(){}
			};
			outWriter_super = Java.super(outWriter);
			context.setWriter(outWriter);
			context.setErrorWriter(outWriter);
			resetReader();

			frame.pack();
			frame.setVisible(true);

			runFunction(function(){
				resultShell.runArguments(args);
			});
		});

		return resultShell;
	}
	return swingShell;
})();
