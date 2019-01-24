function isAuthorTag(metaTag) {
  let nameExists = metaTag.getAttribute('name') != null; 
  let propertyExists = metaTag.getAttribute('property') != null;

  if(nameExists) {
    let nameIsAuthor = metaTag.getAttribute('name').toLowerCase().includes('author') 
    if (nameIsAuthor) {
      return true;
    } else {
      return false;
    }
  } else if(propertyExists) {
    let propertyIsAuthor = metaTag.getAttribute('property').toLowerCase().includes('author');
    if(propertyIsAuthor) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

const quoteHighlight = {
  mc: null,
  name: "quote-highlight",

  initDataSource: function(metroClient) {
    // Initialize the context-menu buttons
    this.mc = metroClient;
    this.createHighlightButton();
  },

  getAuthor: function() {
    // Tries to find the author of the article from the webpage
    var info = document.getElementsByTagName('META');

    for (var i=0;i<info.length;i++) {
      if (isAuthorTag(info[i])) {
        author = info[i].getAttribute('CONTENT');
        return author;
      }
    }
    return "unk";
  },

  getTitle: function() {
    // Tries to find the title of the article from the webpage
    var info = document.getElementsByTagName('META');

    for (var i=0;i<info.length;i++) {
      // console.log(info[i]);}
      if (info[i].getAttribute('property') != null && info[i].getAttribute('property').toLowerCase().includes('title')) {
        title = info[i].getAttribute('CONTENT');
        return title;
      }
    }
    return "unk";
  },

  sendHighlight: function(contextInfo) {
    // Runs when a user indicates that the highlighted text is "fake news"
    var text = contextInfo['selectionText'];
    var valid = this.validateInput(text);

    if(valid['status'] == 1) {
      let datapoint = {
        text: text,
        title: this.getTitle(),
        author: this.getAuthor(),
        hostname: window.location.hostname,
        url: window.location.href
      };

      console.log(datapoint);

      this.mc.sendDatapoint(datapoint);
    } else {
      alert(valid['msg']);
    }
  },

  validateInput: function(text) {
    // Validate the highlighted text
    if(text.split(' ').length > 100) {
      var resp = {
        'status': 0,
        'msg': 'Quote is too long'
      }
    } else {
      var resp = {
        'status': 1,
        'msg': 'Success!'
      };
    }

    return resp;
  },

  createHighlightButton: function() {
    let contentType = $('meta[property="og:type"]').attr('content');

    if(contentType == "article") {
      // Context-menu button for highlighted text
      this.mc.createContextMenuButton({
        functionName: 'highlightFunction',
        buttonTitle: 'Highlight',
        contexts: ['selection']
      }, this.sendHighlight.bind(this));
    }
  },
}

registerDataSource(quoteHighlight);
