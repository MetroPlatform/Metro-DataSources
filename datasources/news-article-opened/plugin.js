function metaTagContains(metaTag, propName) {
  let nameExists = metaTag.getAttribute('name') != null && 
                    metaTag.getAttribute('name').toLowerCase().includes(propName); 
  let propertyExists = metaTag.getAttribute('property') != null &&
                        metaTag.getAttribute('property').toLowerCase().includes(propName);

  if(nameExists || propertyExists) {
    return true;
  } else {
    return false;
  }
}

const articleOpened = {
  mc: null,
  name: "news-article-opened",

  initDataSource: function(metroClient) {
    let contentType = $('meta[property="og:type"]').attr('content');

    if(contentType == "article") {
      this.sendDetails(metroClient);
    }
  },

  getAuthor: function() {
    // Tries to find the author of the article from the webpage
    var info = document.getElementsByTagName('META');

    for (var i=0;i<info.length;i++) {
      console.log(info[i]);
      if (metaTagContains(info[i], 'author')) {
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
      if (metaTagContains(info[i], 'title')) {
        title = info[i].getAttribute('CONTENT');
        return title;
      }
    }
    return "unk";
  },

  sendDetails: function(metroClient) {
    let datapoint = {
      "author": this.getAuthor(),
      "title": this.getTitle(),
      "url": window.location.href,
      "hostname": window.location.hostname
    }
    console.log(datapoint);

    metroClient.sendDatapoint(datapoint);
  }
}

registerDataSource(articleOpened);
