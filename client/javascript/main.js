var sharedb = require('sharedb/lib/client');
var StringBinding = require('sharedb-string-binding');

var md = require('markdown-it')({
    html:         false,        // Enable HTML tags in source
    xhtmlOut:     false,        // Use '/' to close single tags (<br />).
                                // This is only for full CommonMark compatibility.
    breaks:       false,        // Convert '\n' in paragraphs into <br>
    langPrefix:   'language-',  // CSS language prefix for fenced blocks. Can be
                                // useful for external highlighters.
    linkify:      false,        // Autoconvert URL-like text to links

    // Enable some language-neutral replacement + quotes beautification
    typographer:  false,

    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Could be either a String or an Array.
    //
    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes: '“”‘’',

    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externally.
    // If result starts with <pre... internal wrapper is skipped.
    highlight: function (/*str, lang*/) { return ''; }
});



var server = window.location.host;
var ws = new WebSocket('ws://'+server+window.location.pathname);
var connection = new sharedb.Connection(ws);

// Create local Doc instance mapped to 'examples' collection document with id 'counter'
var doc = connection.get('pads',window.location.pathname);

// Get initial value of document and subscribe to changes
doc.subscribe(function (err) {
    if (err) throw err;
    var element = document.querySelector('textarea');
    var binding = new StringBinding(element, doc);
    binding.setup();
    element.addEventListener('input', renderMarkdown, false);
});

doc.on("op", renderMarkdown);

function renderMarkdown() {
    var textField = document.getElementById("text");
    document.getElementById("md").innerHTML = md.render(textField.value);
}

