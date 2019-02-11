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

const dwellAndScroll = {
  name: 'news-dwell-and-scroll',

  getAuthor: function() {
    // Tries to find the author of the article from the webpage
    var info = document.getElementsByTagName('META');

    for (var i=0;i<info.length;i++) {
      if (isAuthorTag(info[i])) {
        author = info[i].getAttribute('CONTENT');
        return author;
      }
    }
    return "";
  },

  getKeywords: function() {
    // Tries to find the author of the article from the webpage
    var info = document.getElementsByTagName('META');

    for (var i=0;i<info.length;i++) {
      if (info[i].getAttribute('name') != null && info[i].getAttribute('name').toLowerCase().includes('keywords')) {
        keywords = info[i].getAttribute('CONTENT');
        return keywords.split(',');
      }
    }
    return [];
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
    return "";
  },

  getDescription: function() {
    // Tries to find the title of the article from the webpage
    var info = document.getElementsByTagName('META');

    for (var i=0;i<info.length;i++) {
      if (info[i].getAttribute('name') != null && info[i].getAttribute('name').toLowerCase().includes('description')) {
        description = info[i].getAttribute('CONTENT');
        return description;
      }
    }
    return "";
  },

  monitorDwellTime: function() {
    let self = this;

    var scrollPercentage = 0;
    $(window).on('scroll', function(){
      var s = $(window).scrollTop(),
          d = $(document).height(),
          c = $(window).height();
    
      scrollPercentage = (s / (d - c)) * 100;
    })

    loadTime = (new Date).getTime();
    URL = window.location.href;

    window.addEventListener("beforeunload", function() {
      leaveTime = (new Date).getTime();

      let datapoint = {
        author: self.getAuthor(),
        title: self.getTitle(),
        keywords: self.getKeywords(),
        description: self.getDescription(),
        _str: self.getTitle(),
        _timestamp: Date.now(),
        loadTime: loadTime,
        leaveTime: leaveTime,
        scrollPercentage: Math.round(scrollPercentage),
        _url: URL,
        publication: window.location.hostname
      }

      console.log(datapoint);
      console.log(self.mc)

      self.mc.sendDatapoint(datapoint);
      console.log("sent");
    });
  },

  initDataSource: function(metroClient) {
    this.mc = metroClient;
    let contentType = $('meta[property="og:type"]').attr('content');

    if(contentType == "article") {
      this.monitorDwellTime();
    }
    
  }
}

registerDataSource(dwellAndScroll);
