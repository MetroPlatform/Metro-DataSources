const soundtrackWords = [
  'vgm',
  'ost',
  'soundtrack',
  'videogame',
  'video game',
  'motion picture'
]

function isSoundtrack(title) {
  for(i = 0; i < soundtrackWords.length; i++) {
    let w = soundtrackWords[i];
    if(title.toLowerCase().indexOf(w) !== -1) {
      return true;
    }
  }

  return false;
}

/*
YouTube Soundtrack DataSource

Captures the details of movie/game soundtracks on YouTube

YouTube dynamically loads data, which means that we can't just scrape normally, we have to
wait for the DOM to be updated.
*/

function isVideo(url) {
  let r = new RegExp("http(?:s?):\\/\\/(?:www\\.)?youtu(?:be\\.com\\/watch\\?v=|\\.be\\/)([\\w\\-\\_]*)(&(amp;)?‌​[\\w\\?‌​=]*)?")
  return r.test(url);
}

const youtubeSoundtracks = {
  mc: null,
  name: 'youtube-soundtracks',

  operate: function(previousUrl) {
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

  createDatapoint: function(self, url, $videoPlayer) {
    const category = this.getCategory();
    let title = $('#container h1.title yt-formatted-string').text();
    let views = $('#container div#info').find('span.view-count').text().replace(/\D/g,'');
    let lengthStr = $videoPlayer.find('.ytp-bound-time-right').text();
    let seconds = lengthStr.split(':').reduce((acc,time) => (60 * acc) + +time)

    let date = $('span.date').text()
    let uploadTimestamp = new Date(date).getTime()/1000

    if($videoPlayer.hasClass('playing-mode')){
      self.sendDatapoint("Listened", category, url, title, views, seconds, uploadTimestamp);
    }
  },

  showMore: function() {
    let clickBtn = $('ytd-expander.ytd-video-secondary-info-renderer #more');
    clickBtn.click(); // Click the "show more button"
  },

  getCategory: function() {
    // Get the container div which has the #title and #content of the Category field
    let categoryContainer = $('ytd-expander.ytd-video-secondary-info-renderer ytd-metadata-row-renderer:has(#title yt-formatted-string:contains("Category"))');
    // Extract the text from the #content div
    let category = categoryContainer.find('#content').text().trim();
    // Click the "Show Less" button
    $('ytd-expander.ytd-video-secondary-info-renderer #less').click();

    return category;
  },

  validateDatapoint: function(datapoint) {
    // Only accept the datapoint if it's in the 'music' category
    if(!(datapoint['category'] == "Music")) {
      console.log(`[Metro - YouTube Soundtrack] Video category is ${datapoint['category']} so not sending it`)
      return false;
    } else if(!isSoundtrack(datapoint['title'])) {
      console.log(`[Metro - YouTube Soundtrack] Video title doesn't look like a soundtrack, so not sending it`)
      return false;
    }

    return true;
  },

  sendDatapoint: function(action, category, url, title, views, seconds, uploadTimestamp) {
    // Create the datapoint:
    let datapoint = {
      _url: url,
      _str: title,
      _timestamp: Date.now(),
      _action: action,
      time: Date.now(),
      category: category,
      title: title,
      views: views,
      lengthSeconds: seconds,
      uploadTimestamp: uploadTimestamp
    };

    // Log it
    console.log(datapoint);

    if(this.validateDatapoint(datapoint)) {
      // Validate and send the datapoint
      this.mc.sendDatapoint(datapoint);
    }
  },

  initDataSource: function(metroClient) {
    // The entrypoint
    this.mc = metroClient;
    const self = this;

    let url = "";
    setInterval(function() {
      url = self.operate(url);
    }, 500);
  }
}

registerDataSource(youtubeSoundtracks);