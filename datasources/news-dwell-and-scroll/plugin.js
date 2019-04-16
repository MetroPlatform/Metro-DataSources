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

function getMetaOrBlank(metas, name) {
  try {
    const el = metas.find((val, idx) => {
      const propertyAttr = val.getAttribute('property')
      const nameAttr = val.getAttribute('name')
      if(propertyAttr && propertyAttr.includes(name)) {
        return true
      } else if(nameAttr && nameAttr.includes(name)) {
        return true
      }
      return false
    })

    if(el !== undefined) {
      return el.content
    }
  } catch(e) {
    console.error(e)
    return ""
  }
  return ""
}

const dwellAndScroll = {
  name: 'news-dwell-and-scroll',

  monitorDwellTime: function() {
    let self = this;

    var scrollPercentage = 0;
    $(window).on('scroll', function(){
      var s = $(window).scrollTop(),
          d = $(document).height(),
          c = $(window).height();
    
      scrollPercentage = (s / (d - c)) * 100;
    })

    const loadTime = (new Date).getTime();


    window.addEventListener("beforeunload", function() {
      const URL = window.location.href;
      const leaveTime = (new Date).getTime();
      const nameRegex = new RegExp("^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$")

      const metas = Array.from(document.querySelectorAll('META'));
      metas.forEach(console.log)
      var author = getMetaOrBlank(metas, 'author')
      console.debug(author.trim())
      console.debug(nameRegex.test(author.trim()))
      author = nameRegex.test(author.trim()) ? author : ''
      var title = getMetaOrBlank(metas, 'og:title')
      if(title === "") {
        title = getMetaOrBlank(metas, "title")
      }
      const description = getMetaOrBlank(metas, 'description')
      const image = getMetaOrBlank(metas, 'image')
      const keywordsStr = getMetaOrBlank(metas, 'keywords')
      const keywords = keywordsStr.length > 0 ? keywordsStr.split(',') : []
      const publication = window.location.hostname;

      let datapoint = {
        author: author,
        title: title,
        keywords: keywords,
        description: description,
        _image: image,
        _str: title,
        _timestamp: Date.now(),
        _action: "Read",
        loadTime: loadTime,
        leaveTime: leaveTime,
        scrollPercentage: Math.round(scrollPercentage),
        _url: URL,
        publication: publication
      }
      console.log(datapoint)

      if(self.isValid(datapoint)) {
        self.mc.sendDatapoint(datapoint);
      }
    });
  },

  isValid: (datapoint) => {
    if(datapoint._str.includes("Category: ")) {
      return false // OpenGraph tags don't update when you browse around TechCrunch :()
    }
    return datapoint._str
            && datapoint._url
            && datapoint._timestamp
            && datapoint._action
            && datapoint._image

  },

  initDataSource: function(metroClient) {
    this.mc = metroClient;
    let contentType = $('meta[property="og:type"]').attr('content');

    let pCount = $('p').length
    let articleCount = $('article').length

    if(contentType === "article" && (articleCount > 0 || pCount > 5)) {
      this.monitorDwellTime();
    }
    
  }
}

registerDataSource(dwellAndScroll);
