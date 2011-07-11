if (wysihtml5.browser.supported()) {
  module("wysihtml5.Editor - compatible", {
    setup: function() {
      wysihtml5.dom.insertCSS([
        "#wysihtml5-test-textarea { width: 200px; height: 100px; margin-top: 5px; font-style: italic; border: 2px solid red; }",
        "#wysihtml5-test-textarea:focus { margin-top: 10px; }"
      ]).into(document);

      this.textareaElement        = document.createElement("textarea");
      this.textareaElement.id     = "wysihtml5-test-textarea";
      this.textareaElement.title  = "Please enter your foo";
      this.textareaElement.value  = "hey tiff, what's up?";
      
      this.form = document.createElement("form");
      this.form.onsubmit = function() { return false; };
      this.form.appendChild(this.textareaElement);
      
      this.originalBodyClassName = document.body.className;
      
      document.body.appendChild(this.form);
    },

    teardown: function() {
      var leftover;
      while (leftover = document.querySelector("iframe.wysihtml5-sandbox, input[name='_wysihtml5_mode']")) {
        leftover.parentNode.removeChild(leftover);
      }
      this.form.parentNode.removeChild(this.form);
      document.body.className = this.originalBodyClassName;
    },

    getComposerElement: function() {
      return this.getIframeElement().contentWindow.document.body;
    },

    getIframeElement: function() {
      var iframes = document.querySelectorAll("iframe.wysihtml5-sandbox");
      return iframes[iframes.length - 1];
    }
  });
  
  test("Basic test", function() {
    expect(16);
    stop(2000);
    
    var that = this;
    
    var editor = new wysihtml5.Editor(this.textareaElement);
    editor.observe("load", function() {
      var iframeElement   = that.getIframeElement(),
          composerElement = that.getComposerElement(),
          textareaElement = that.textareaElement;
      ok(true, "Load callback triggered");
      ok(wysihtml5.dom.hasClass(document.body, "wysihtml5-supported"), "<body> received correct class name");
      equals(textareaElement.style.display, "none", "Textarea not visible");
      ok(iframeElement.style.display, "", "Editor iFrame is visible");
      equals(editor.currentView.name, "composer", "Current view is 'composer'");
      
      // Make textarea visible for a short amount of time, in order to calculate dimensions properly
      textareaElement.style.display = "";
      same(
        [iframeElement.offsetHeight,    iframeElement.offsetWidth],
        [textareaElement.offsetHeight,  textareaElement.offsetWidth],
        "Editor has the same dimensions as the original textarea"
      );
      textareaElement.style.display = "none";
      
      var hiddenField = textareaElement.nextSibling;
      equals(hiddenField.name, "_wysihtml5_mode", "Hidden field has correct name");
      equals(hiddenField.value, "1", "Hidden field has correct value");
      equals(hiddenField.type, "hidden", "Hidden field is actually hidden");
      equals(textareaElement.nextSibling.nextSibling, iframeElement, "Editor iframe is inserted after the textarea");
      equals(composerElement.getAttribute("contentEditable"), "true", "Body element in iframe is editable");
      equals(editor.textarea.element, textareaElement, "Textarea correctly available on editor instance");
      equals(editor.composer.element, composerElement, "contentEditable element available on editor instance");
      equals(wysihtml5.dom.getStyle("font-style").from(composerElement), "italic", "Correct font-style applied to editor element");
      equals(composerElement.innerHTML.toLowerCase(), "hey tiff, what's up?", "Copied the initial textarea value to the editor");
      ok(wysihtml5.dom.hasClass(composerElement, "wysihtml5-editor"), "Editor element has correct class name");
      
      start();
    });
  });


  test("Check setting of name as class name on iframe and iframe's body", function() {
    expect(4);
    stop(2000);
    
    this.textareaElement.className = "death-star";
    
    var that   = this,
        name   = "star-wars-input",
        editor = new wysihtml5.Editor(this.textareaElement, { name: "star-wars-input" });
    
    editor.observe("load", function() {
      var iframeElement   = that.getIframeElement(),
          composerElement = that.getComposerElement(),
          textareaElement = that.textareaElement;
      ok(wysihtml5.dom.hasClass(iframeElement, name), "iFrame has adopted name as className");
      ok(wysihtml5.dom.hasClass(composerElement, name), "iFrame's body has adopted name as className");
      ok(wysihtml5.dom.hasClass(composerElement, "death-star"), "iFrame's body has adopted the textarea className");
      ok(!wysihtml5.dom.hasClass(textareaElement, name), "Textarea has not adopted name as className");
      start();
    });
  });


  test("Check textarea with box-sizing: border-box;", function() {
    expect(1);
    stop(2000);
    
    var that = this;
    
    wysihtml5.dom.setStyles({
      MozBoxSizing:     "border-box",
      WebkitBoxSizing:  "border-box",
      MsBoxSizing:      "border-box",
      boxSizing:        "border-box"
    }).on(this.textareaElement);
  
    var editor = new wysihtml5.Editor(this.textareaElement);
    editor.observe("load", function() {
      // Make textarea visible for a short amount of time, in order to calculate dimensions properly
      that.textareaElement.style.display = "";
      same(
        [that.getIframeElement().offsetWidth, that.getIframeElement().offsetHeight],
        [that.textareaElement.offsetWidth,    that.textareaElement.offsetHeight],
        "Editor has the same dimensions as the original textarea"
      );
      that.textareaElement.style.display = "none";
    
      start();
    });
  });


  test("Check whether attributes are copied", function() {
    expect(1);
    stop(2000);
    
    var that = this;
    
    var editor = new wysihtml5.Editor(this.textareaElement);
    editor.observe("load", function() {
      equals(that.getComposerElement().title, that.textareaElement.title, "Editor got attributes copied over from textarea");
      start();
    });
  });


  test("Check events", function() {
    expect(8);
    stop(2000);
    
    var that = this;
    
    var editor = new wysihtml5.Editor(this.textareaElement);
    
    editor.observe("beforeload", function() {
      ok(true, "'beforeload' event correctly fired");
    });
    
    editor.observe("load", function() {
      var composerElement = that.getComposerElement(),
          iframeElement   = that.getIframeElement();
      
      editor.observe("focus", function() {
        ok(true, "'focus' event correctly fired");
      });
      
      editor.observe("blur", function() {
        ok(true, "'blur' event correctly fired");
      });
      
      editor.observe("change", function() {
        ok(true, "'change' event correctly fired");
      });
      
      editor.observe("paste", function() {
        ok(true, "'paste' event correctly fired");
      });
      
      editor.observe("drop", function() {
        ok(true, "'drop' event correctly fired");
      });
      
      editor.observe("custom_event", function() {
        ok(true, "'custom_event' correctly fired");
      });
      
      QUnit.triggerEvent(composerElement, "focus");
      // Modify innerHTML in order to force 'change' event to trigger onblur
      composerElement.innerHTML = "foobar";
      QUnit.triggerEvent(composerElement, "blur");
      QUnit.triggerEvent(composerElement, "focusout");
      equals(wysihtml5.dom.getStyle("margin-top").from(iframeElement), "5px", ":focus styles are correctly unset");
      QUnit.triggerEvent(composerElement, "paste");
      QUnit.triggerEvent(composerElement, "drop");
      
      editor.fire("custom_event");
      
      // Delay teardown in order to avoid unwanted js errors caused by a too early removed sandbox iframe
      // which then causes js errors in Safari 5
      setTimeout(function() { start(); }, 100);
    });
  });


  test("Check sync (basic)", function() {
    expect(1);
    stop(2500);
    
    var that = this;
    
    var editor = new wysihtml5.Editor(this.textareaElement);
    editor.observe("load", function() {
      var html = "<p>hello foobar, what up?</p>";
      that.getComposerElement().innerHTML = html;
    
      setTimeout(function() {
        equals(that.textareaElement.value.toLowerCase(), html.toLowerCase(), "Editor content got correctly copied over to original textarea");
        start();
      }, 500);
    });
  });
  
  
  test("Check sync (advanced)", function() {
    expect(5);
    stop(4000);
    
    var that = this;
    
    var editor = new wysihtml5.Editor(this.textareaElement, {
      parserRules: { tags: { "strong": true } }
    });
    
    editor.observe("load", function() {
      var html = "<strong>timmay!</strong>",
          composerElement = that.getComposerElement();
      composerElement.innerHTML = html;
      
      setTimeout(function() {
        equals(that.textareaElement.value.toLowerCase(), html.toLowerCase(), "Editor content got correctly copied over to original textarea");
        
        composerElement.innerHTML = "<font color=\"red\">hey </font><strong>helen!</strong>";
        editor.fire("change_view", "textarea");
        equals(that.textareaElement.value.toLowerCase(), "hey <strong>helen!</strong>", "Editor got immediately copied over to textarea after switching the view");
        
        that.textareaElement.value = "<i>hey </i><strong>richard!</strong>";
        editor.fire("change_view", "composer");
        equals(composerElement.innerHTML.toLowerCase(), "hey <strong>richard!</strong>", "Textarea sanitized and copied over it's value to the editor after switch");
        
        composerElement.innerHTML = "<i>hey </i><strong>timmay!</strong>";
        QUnit.triggerEvent(that.form, "submit");
        equals(that.textareaElement.value.toLowerCase(), "hey <strong>timmay!</strong>", "Textarea gets the sanitized content of the editor onsubmit");
        
        setTimeout(function() {
          that.form.reset();
          
          // Timeout needed since reset() isn't executed synchronously
          setTimeout(function() {
            equals(wysihtml5.dom.getTextContent(composerElement), "", "Editor is empty after reset");
            start();
          }, 100);
          
        }, 500);
        
      }, 500);
      
    });
  });
  
  
  test("Check placeholder", function() {
    expect(13);
    stop(3000);
    
    var that = this;
    
    var placeholderText = "enter text ...";
    this.textareaElement.value = "";
    this.textareaElement.setAttribute("placeholder", "enter text ...");
    
    var editor = new wysihtml5.Editor(this.textareaElement);
    editor.observe("load", function() {
      var composerElement = that.getComposerElement();
      equals(wysihtml5.dom.getTextContent(composerElement), placeholderText, "Placeholder text correctly copied into textarea");
      ok(wysihtml5.dom.hasClass(composerElement, "placeholder"), "Editor got 'placeholder' css class");
      ok(editor.hasPlaceholderSet(), "'hasPlaceholderSet' returns correct value when placeholder is actually set");
      editor.fire("focus:composer");
      equals(wysihtml5.dom.getTextContent(composerElement), "", "Editor is empty after focus");
      ok(!wysihtml5.dom.hasClass(composerElement, "placeholder"), "Editor hasn't got 'placeholder' css class");
      ok(!editor.hasPlaceholderSet(), "'hasPlaceholderSet' returns correct value when placeholder isn't actually set");
      editor.fire("blur:composer");
      equals(wysihtml5.dom.getTextContent(composerElement), placeholderText, "Editor restored placeholder text after unfocus");
      editor.fire("focus:composer");
      equals(wysihtml5.dom.getTextContent(composerElement), "");
      composerElement.innerHTML = "some content";
      editor.fire("blur:composer");
      equals(wysihtml5.dom.getTextContent(composerElement), "some content");
      ok(!wysihtml5.dom.hasClass(composerElement, "placeholder"), "Editor hasn't got 'placeholder' css class");
      editor.fire("focus:composer");
      // Following html causes innerText and textContent to report an empty string
      var html = '<img>';
      composerElement.innerHTML = html;
      editor.fire("blur:composer");
      equals(composerElement.innerHTML.toLowerCase(), html, "HTML hasn't been cleared even though the innerText and textContent properties indicate empty content.");
      ok(!wysihtml5.dom.hasClass(composerElement, "placeholder"), "Editor hasn't got 'placeholder' css class");
      
      setTimeout(function() {
        that.form.reset();
        
        // Timeout needed since reset() isn't executed synchronously
        setTimeout(function() {
          equals(wysihtml5.dom.getTextContent(composerElement), placeholderText, "After form reset the editor has the placeholder as content");
          start();
        }, 100);
        
      }, 500);
    });
  });
  
  
  test("Check public api", function() {
    expect(14);
    stop(2000);
    
    var that = this;
    
    var editor = new wysihtml5.Editor(this.textareaElement, {
      parserRules:        { tags: { p: { rename_tag: "div" } } },
      bodyClassName:      "editor-is-supported",
      composerClassName:  "editor"
    });
    
    editor.observe("load", function() {
      ok(editor.isCompatible(), "isCompatible() returns correct value");
      ok(wysihtml5.dom.hasClass(document.body, "editor-is-supported"), "<body> received correct class name");
      
      var composerElement = that.getComposerElement();
      editor.clear();
      equals(wysihtml5.dom.getTextContent(composerElement), "", "Editor empty after calling 'clear'");
      ok(wysihtml5.dom.hasClass(composerElement, "editor"), "Composer element has correct class name");
      
      var html = "hello <strong>foo</strong>!";
      editor.setValue(html);
      equals(composerElement.innerHTML.toLowerCase(), html, "Editor content correctly set after calling 'setValue'");
      ok(!editor.isEmpty(), "'isEmpty' returns correct value when the composer element isn't actually empty");
      
      var value = editor.getValue();
      equals(value.toLowerCase(), html, "Editor content correctly returned after calling 'getValue'");
      
      editor.clear();
      value = editor.getValue();
      equals(value, "");
      ok(editor.isEmpty(), "'isEmpty' returns correct value when the composer element is actually empty");
      
      equals(editor.parse("<p>foo</p>").toLowerCase(), "<div>foo</div>", "'parse' returns correct value");
      
      // Check disable/enable
      editor.disable();
      ok(!composerElement.getAttribute("contentEditable"), "When disabled the composer hasn't the contentEditable attribute");
      equals(composerElement.getAttribute("disabled"), "disabled", "When disabled the composer has the disabled=\"disabled\" attribute");
      
      editor.enable();
      equals(composerElement.getAttribute("contentEditable"), "true", "After enabling the editor the contentEditable property is true");
      ok(!composerElement.getAttribute("disabled"), "After enabling the disabled attribute is unset");
      
      start();
    });
  });
  
  
  test("Parser (default parser method with parserRules as object", function() {
    expect(2);
    stop(3000);
    
    var parserRules = {
      tags: {
        div: true,
        p: { rename_tag: "div" },
        span: true,
        script: undefined
      }
    };
    
    var input   = "<p>foobar</p>",
        output  = "<div>foobar</div>";
    
    var editor = new wysihtml5.Editor(this.textareaElement, {
      parserRules: parserRules
    });
    
    editor.observe("load", function() {
      equals(editor.config.parserRules, parserRules, "Parser rules correctly set on config object");
      // Invoke parsing via second parameter of setValue()
      editor.setValue(input, true);
      equals(editor.getValue().toLowerCase(), output, "HTML got correctly parsed within setValue()");
      start();
    });
  });
  
  
  test("Parser (custom parser method with parserRules as object", function() {
    expect(7);
    stop(3000);
    
    var that        = this,
        parserRules = { script: undefined },
        input       = this.textareaElement.value,
        output      = input;
    
    var editor = new wysihtml5.Editor(this.textareaElement, {
      parserRules: parserRules,
      parser:      function(html, rules, context) {
        equals(html.toLowerCase(), input, "HTML passed into parser is equal to the one which just got inserted");
        equals(rules, parserRules, "Rules passed into parser are equal to those given to the editor");
        equals(context, that.getIframeElement().contentWindow.document, "Context passed into parser is equal the document object of the editor's iframe");
        return html.replace(/\<script\>.*?\<\/script\>/gi, "");
      }
    });
    
    editor.observe("load", function() {
      input   = "<p>foobar</p><script>alert(1);</script>";
      output  = "<p>foobar</p>";
      
      // Invoke parsing via second parameter of setValue()
      editor.setValue(input, true);
      equals(editor.getValue().toLowerCase(), output, "HTML got correctly parsed within setValue()");
      
      start();
    });
  });
  
  
  test("Inserting an element which causes the textContent/innerText of the contentEditable element to be empty works correctly", function() {
    expect(2);
    stop(2000);
    
    var that = this;
    
    var editor = new wysihtml5.Editor(this.textareaElement);
    editor.observe("load", function() {
      var html            = '<img>',
          composerElement = that.getComposerElement(),
          textareaElement = that.textareaElement;
      composerElement.innerHTML = html;
      
      // Fire events that could cause a change in the composer
      QUnit.triggerEvent(composerElement, "keypress");
      QUnit.triggerEvent(composerElement, "keyup");
      QUnit.triggerEvent(composerElement, "cut");
      QUnit.triggerEvent(composerElement, "blur");
      
      setTimeout(function() {
        equals(composerElement.innerHTML.toLowerCase(), html, "Composer still has correct content");
        equals(textareaElement.value.toLowerCase(), html, "Textarea got correct value");
        start();
      }, 500);
    });
  });
  
  
  test("Check for stylesheets", function() {
    stop(2000);
    expect(5);
    
    var that = this;
    
    var stylesheetUrls = [
      "http://yui.yahooapis.com/2.8.2r1/build/reset/reset-min.css",
      "http://yui.yahooapis.com/2.8.0/build/reset/reset-min.css"
    ];
    
    var editor = new wysihtml5.Editor(this.textareaElement, {
      stylesheets: stylesheetUrls
    });
    
    editor.observe("load", function() {
      var iframeElement = that.getIframeElement(),
          iframeDoc     = iframeElement.contentWindow.document,
          linkElements  = iframeDoc.getElementsByTagName("link");
      equals(linkElements.length, 2, "Correct amount of stylesheets inserted into the dom tree");
      equals(linkElements[0].getAttribute("href"), stylesheetUrls[0]);
      equals(linkElements[0].getAttribute("rel"), "stylesheet");
      equals(linkElements[1].getAttribute("href"), stylesheetUrls[1]);
      equals(linkElements[1].getAttribute("rel"), "stylesheet");
      start();
    });
  });
}


// -------------- TEST WHAT HAPPENS WHEN EDITOR IS NOT COMPATIBLE WITH BROWSER -------------- \\
module("wysihtml5.Editor - incompatible", {
  setup: function() {
    this.originalSupportCheck = wysihtml5.browser.supported;
    wysihtml5.browser.supported = function() { return false; };
    
    this.textareaElement = document.createElement("textarea");
    document.body.appendChild(this.textareaElement);
  },
  
  teardown: function() {
    wysihtml5.browser.supported = this.originalSupportCheck;
    this.textareaElement.parentNode.removeChild(this.textareaElement);
  }
});


test("Basic test", function() {
  expect(12);
  stop(2000);
  
  var that = this;
  
  var editor = new wysihtml5.Editor(this.textareaElement);
  editor.observe("load", function() {
    ok(true, "'load' event correctly triggered");
    ok(!wysihtml5.dom.hasClass(document.body, "wysihtml5-supported"), "<body> didn't receive the 'wysihtml5-supported' class");
    ok(!editor.isCompatible(), "isCompatible returns false when rich text editing is not correctly supported in the current browser");
    equals(that.textareaElement.style.display, "", "Textarea is visible");
    ok(!document.querySelectorAll("iframe.wysihtml5-sandbox").length, "No iframe has been inserted into the dom");
    ok(!document.querySelectorAll("input[name='_wysihtml5_mode']").length, "No hidden field has been inserted into the dom");
    ok(!editor.composer, "Composer not initialized");
    
    var html = "foobar<br>";
    editor.setValue(html);
    equals(that.textareaElement.value, html);
    equals(editor.getValue(), html);
    editor.clear();
    equals(that.textareaElement.value, "");
    
    editor.observe("focus", function() {
      ok(true, "Generic 'focus' event fired");
    });
    
    editor.observe("focus:textarea", function() {
      ok(true, "Specific 'focus:textarea' event fired");
    });
    
    editor.observe("focus:composer", function() {
      ok(false, "Specific 'focus:composer' event fired, and that's wrong, there shouldn't be a composer element/view");
    });
    
    QUnit.triggerEvent(that.textareaElement, wysihtml5.browser.supportsEvent("focusin") ? "focusin" : "focus");
    
    start();
  });
});