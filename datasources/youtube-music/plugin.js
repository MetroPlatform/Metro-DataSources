/*
YouTube dynamically loads data, which means that we can't just scrape normally, we have to
wait for the DOM to be updated.
*/

function isVideo(url) {
  let r = new RegExp("http(?:s?):\\/\\/(?:www\\.)?youtu(?:be\\.com\\/watch\\?v=|\\.be\\/)([\\w\\-\\_]*)(&(amp;)?‌​[\\w\\?‌​=]*)?")
  return r.test(url);
}

const youtubeMusic = {
  mc: null,
  name: 'youtube-music',

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

    if($videoPlayer.hasClass('playing-mode')){
      self.sendDatapoint("opened", category, url, title, views);
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
    if(datapoint['category'] == "Music") {
      return true;
    }

    console.log(`Video category is ${datapoint['category']} so not sending it`)
    return false;
  },

  sendDatapoint: function(eventType, category, url, title, views) {
    // Create the datapoint:
    let datapoint = {};
    datapoint['event'] = eventType;
    datapoint['time'] = Date.now();
    datapoint['url'] = url;
    datapoint['title'] = title;
    datapoint['category'] = category;
    datapoint['views'] = views;

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

registerDataSource(youtubeMusic);