/*
YouTube dynamically loads data, which means that we can't just scrape normally, we have to
wait for the DOM to be updated.
*/

function isVideo(url) {
  let r = new RegExp("http(?:s?):\\/\\/(?:www\\.)?youtu(?:be\\.com\\/watch\\?v=|\\.be\\/)([\\w\\-\\_]*)(&(amp;)?‌​[\\w\\?‌​=]*)?")
  return r.test(url);
}

const Study = {
  mc: null,
  name: 'study-materials',

  getSearchQuery: () => {
    return $('#gs_hdr_tsi').value
  },

  getCitationCount: (node) => {
    const text = node.find('.gs_ri').find('.gs_fl a:eq(2)').text()

    const last = a => a[a.length - 1];
    return parseInt(last(text.split(' ')))
  },

  runScholar: function() {
    const searchQuery = this.getSearchQuery();
    $('.gs_r.gs_or.gs_scl').each((idx, val) => {
      const sideLinks = $(val).find('.gs_ggs.gs_fl').find('a')
      const mainLink = $(val).find('.gs_rt').find('a')
      const contentLink = $(sideLinks[0])
      const citationCount = this.getCitationCount($(val))

      const handleClick = (e) => {
        if(e.which === 1 || e.which === 2) {
          this.sendDatapointScholar(contentLink.attr('href'), mainLink.text(), searchQuery, citationCount)
        }
      }

      sideLinks.each((idx, link) => {
        $(link).on('mouseup', handleClick)
      })

      mainLink.on('mouseup', handleClick)
    })
    
  },

  createDatapoint: function(self, url, $videoPlayer) {
    const category = this.getCategory();
    const title = $('#container h1.title yt-formatted-string').text();
    const views = $('#container div#info').find('span.view-count').text().replace(/\D/g, '');
    const lengthText = $videoPlayer.find('.ytp-time-duration').text()
    // Convert hh:mm:ss to seconds
    const lengthSeconds = +(lengthText.split(':').reduce((acc,time) => (60 * acc) + +time));

    self.sendDatapointYt(url, title, views, category, lengthSeconds);
  },

  getCategory: function () {
    // Get the container div which has the #title and #content of the Category field
    let categoryContainer = $('ytd-expander.ytd-video-secondary-info-renderer ytd-metadata-row-renderer:has(#title yt-formatted-string:contains("Category"))');
    // Extract the text from the #content div
    let category = categoryContainer.find('#content').text().trim();
    // Click the "Show Less" button
    $('ytd-expander.ytd-video-secondary-info-renderer #less').click();

    return category;
  },

  showMore: function () {
    let clickBtn = $('ytd-expander.ytd-video-secondary-info-renderer #more');
    clickBtn.click(); // Click the "show more button"
  },

  validateDatapoint: function(datapoint) {
    switch(datapoint.type) {
      case "youtube":
        if (datapoint.youtubeData.category == "Education") {
          return true;
        } else {
          console.log(`Video category is not 'Education' so not sending it`)
          return false;
        }
      case "googleScholar":
        return true;
      case "loop":
        return true;
      default:
        console.error("Invalid datapoint type: " + datapoint.type)
        return false;
    }
  },

  getFavicon: function() {
    try {
        return document.querySelector('link[rel="shortcut icon"]').href;
    } catch(err) {
        return document.querySelector('link[rel="icon"]').href;
    }
  },

  sendDatapointLoop: function (url, title) {
    const img = this.getFavicon();
    
    // Create the datapoint:
    let datapoint = {
      _url: url,
      _str: title,
      _action: "Viewed",
      _timestamp: Date.now(),
      _image: img,
      type: 'loop',
      scholarData: {},
      youtubeData: {},
      loopData: {}
    };

    if(this.validateDatapoint(datapoint)) {
      console.log(datapoint)
      // Validate and send the datapoint
      this.mc.sendDatapoint(datapoint);
    }
  },

  sendDatapointScholar: function (url, title, searchQuery, citationCount) {
    const img = this.getFavicon();

    // Create the datapoint:
    let datapoint = {
      _url: url,
      _str: title,
      _action: "Viewed",
      _timestamp: Date.now(),
      _image: img,
      type: 'googleScholar',
      scholarData: {
        searchQuery: searchQuery,
        citationsCount: citationCount
      },
      youtubeData: {},
      loopData: {}
    };

    if(this.validateDatapoint(datapoint)) {
      // Validate and send the datapoint
      this.mc.sendDatapoint(datapoint);
    }
  },

  getYouTubeID: (url) => {
      url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
      return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
  },

  sendDatapointYt: function (url, title, views, category, lengthSeconds) {
    const id = this.getYouTubeID(url)
    const img = `https://i1.ytimg.com/vi/${id}/default.jpg`
    // Create the datapoint:
    let datapoint = {
      _url: url,
      _str: title,
      _action: "Watched",
      _timestamp: Date.now(),
      _image: img,
      type: 'youtube',
      scholarData: {},
      youtubeData: {
        category: category,
        views: views,
        lengthSeconds: lengthSeconds
      },
      loopData: {}
    };

    // Log it
    console.log(datapoint);

    if(this.validateDatapoint(datapoint)) {
      // Validate and send the datapoint
      this.mc.sendDatapoint(datapoint);
    }
  },

  runYoutube: function(previousUrl) {
    let currentUrl = window.location.href;
    if(previousUrl == currentUrl) {
      return currentUrl;
    } else if(isVideo(currentUrl)) { // New page
      const self = this;
      setTimeout(function() {
        // Get the video player
        let $videoPlayer = $('#movie_player');

        // YouTube loads data dynamically, so we must click the "show more" button
        //    extract the category, and then click the "show less" button.
        self.showMore();
        setTimeout(function() {
          self.createDatapoint(self, currentUrl, $videoPlayer);
        }, 10000);
      }, 2000);

      return currentUrl;
    } else {
      return currentUrl;
    }
  },

  runLoop: function() {
    const $main = $('#page-content').find('.course-content')
    const $sections = $main.find('li.section')
    $sections.each((idx, val) => {
      const $val = $(val)
      const $links = $val.find('li.activity').find('a').not('.showdescription')

      $links.each((idx, link) => {
        $(link).on('mouseup', (e) => {
          if(e.which === 1 || e.which === 2) {
            const url = $(link).attr('href')
            const text = $(link).find('.instancename').text()
            this.sendDatapointLoop(url, text)
          }
        })
      })
    })
  },

  initDataSource: function (metroClient) {
    // The entrypoint
    this.mc = metroClient;
    const self = this;

    // setTimeout(this.addRecommendation, 5000)

    const hostname = window.location.hostname.replace('www.', '')
    if (hostname === "youtube.com") {
      let url = "";
      setInterval(function () {
        url = self.runYoutube(url);
      }, 500);
    } else if (hostname === "scholar.google.com") {
      this.runScholar()
    } else if(hostname.includes("loop")) {
      this.runLoop()
    }
  }
}

registerDataSource(Study);