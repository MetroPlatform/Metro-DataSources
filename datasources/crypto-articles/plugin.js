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

const nonCryptoAcronyms = [
  'ETF',
  'ICO',
  'CEO',
  'CTO',
  'CFO',
  'CMO',
  'COO',
  'FTP',
  'GTD',
  'PDF',
  'DNS',
  'XML',
  'GUI',
  'VPN',
  'USD',
  'GBP',
  'USA',
  'API',
  'FAQ',
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

  start: async function() {
    let self = this;
    var scrollPercentage = 0;
    $(window).on('scroll', function(){
      var s = $(window).scrollTop(),
          d = $(document).height(),
          c = $(window).height();
    
      scrollPercentage = (s / (d - c)) * 100;
    })

    const loadTime = (new Date).getTime();
    const coins = await this.getCoins()


    window.addEventListener("beforeunload", function(e) {
      const URL = window.location.href;
      const leaveTime = (new Date).getTime();
      const nameRegex = new RegExp("^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$")

      const metas = Array.from(document.querySelectorAll('META'));
      var author = getMetaOrBlank(metas, 'author')
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
        _url: URL,
        _image: image,
        _str: title,
        _timestamp: Date.now(),
        _action: "Read",
        author: author,
        title: title,
        keywords: keywords,
        coins: coins,
        description: description,
        loadTime: loadTime,
        leaveTime: leaveTime,
        scrollPercentage: Math.round(scrollPercentage),
        publication: publication
      }

      if(this.isValid(datapoint)) {
        this.mc.sendDatapoint(datapoint)

        // To make sure the request fires
        var t = Date.now() + 200;
        while(Date.now() < t) {};
      }
    }.bind(this));
  },

  isValid: (datapoint) => {
    try {
      const urlObj = new URL(datapoint._url)
      if(urlObj.pathname.startsWith('/tags')) {
        return false
      }
    } catch(e) {
      return false
    }
    
    return datapoint._str
            && datapoint._url
            && datapoint._timestamp
            && datapoint._action
            && datapoint._image

  },

  getCoins: async function() {
    let coins = [];
    $('p').each((idx, p) => {
      let newCoins = ($(p).html().match(new RegExp(/\b[A-Z]{3}\b/, 'g')) || [])
      
      coins = coins.concat(newCoins)
    })
    const uniqueCoins = [...new Set(coins)]
    const coinInfo = await Promise.all(
      uniqueCoins.map(async (c) => {
        const result = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${c}&tsyms=USD&api_key=2fb48558fb7e0241a083eea864cf13f46e7e2a5970410b9856d02c8d758507f8`)
          .then(res => res.json())
          .then(data => {
            return data.hasOwnProperty('USD') && !(nonCryptoAcronyms.includes(c))
          })
        return [c, result]
      })
    )
    const realCoins = coinInfo.filter(cp => cp[1] === true).map(cp => cp[0])
    console.debug(realCoins)
    return realCoins
  },

  isValidCoin: (coin) => {
    return fetch(`https://min-api.cryptocompare.com/data/price?fsym=${coin}&tsyms=USD&api_key=2fb48558fb7e0241a083eea864cf13f46e7e2a5970410b9856d02c8d758507f8`)
              .then(res => res.json())
              .then(data => {
                return data.hasOwnProperty('USD')
              })
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
