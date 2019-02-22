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

const nonCryptoAcronyms = [
  'ETF',
  'ICO',
  'CEO',
  'CTO',
]

const cryptoWords = [
  'crypto',
  'bitcoin',
  'blockchain',
  'dapp',
  'ico',
  'altcoin',
  'ethereum',
  'cryptocurrency',
  'cryptocurrencies',
  'smart contract',
]

function getCoins() {
  let coins = [];
  $('p').each((idx, p) => {
    let newCoins = ($(p).html().match(new RegExp('[A-Z]{3}', 'g')) || [])
    
    coins = coins.concat(newCoins)
  })

  console.log(coins)
  return coins;
}

function isCryptoRelated(content) {
  let words;
  if(Array.isArray(content)) {
    words = content
  } else if(typeof(content) === 'string') {
    words = content.split(' ');
  }

  for(var i=0; i<words.length; i++) {
    for(var j=0; j<cryptoWords.length; j++) {
      if(words[i].indexOf(cryptoWords[j]) !== -1) {
        console.log(`Matched ${words[i]} with ${cryptoWords[j]}`)
        return true;
      }
    }
  }

  return false;
}

const CryptoArticles = {
  name: 'crypto-articles',

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

  start: function() {

    // var scrollPercentage = 0;
    // $(window).on('scroll', function(){
    //   var s = $(window).scrollTop(),
    //       d = $(document).height(),
    //       c = $(window).height();
    
    //   scrollPercentage = (s / (d - c)) * 100;
    // })

    loadTime = (new Date).getTime();
    URL = window.location.href;

    getCoins()

    this.generateData.bind(this)()
    // window.addEventListener("beforeunload", this.generateData().bind(this));
  },

  generateData: function() {
    leaveTime = (new Date).getTime();

    let author = this.getAuthor();
    let title = this.getTitle();
    let publication = window.location.hostname;

    let datapoint = {
      author: author,
      title: title,
      keywords: this.getKeywords(),
      description: this.getDescription(),
      _str: `${title} ( ${publication} )`,
      _timestamp: Date.now(),
      loadTime: loadTime,
      leaveTime: leaveTime,
      // scrollPercentage: Math.round(scrollPercentage),
      _url: URL,
      publication: publication
    }

    console.log(datapoint);

    if(this.validate(datapoint)) {
      this.mc.sendDatapoint(datapoint)
    }

    return null;
  },

  validate: function(datapoint) {
    if(isCryptoRelated(datapoint.description) 
        || isCryptoRelated(datapoint.keywords)
        || isCryptoRelated(datapoint.title)) {
      return true
    } else {
      return false
    }
  },

  initDataSource: function(metroClient) {
    this.mc = metroClient;
    let contentType = $('meta[property="og:type"]').attr('content');

    let pCount = $('p').length
    let articleCount = $('article').length

    if(contentType == "article" && (articleCount > 0 || pCount > 5)) {
      this.start();
    }
    
  }
}

registerDataSource(CryptoArticles);
