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
  name: 'study',

  operate: async function(previousUrl) {
    let currentUrl = window.location.href;
    if(previousUrl == currentUrl) {
      return currentUrl;
    } else {
      let ytRegex = new RegExp("^.*youtube\\.com.*$")
      let scholarRegex = new RegExp("^scholar\\.google\\.com.*$")
      if(ytRegex.test(currentUrl)) {
        console.log("YouTube")

      } else if(scholarRegex.test(currentUrl)) {
        console.log("Scholar")
        runScholar(currentUrl)
      }
    }

    // // } else if(isVideo(currentUrl)) { // New page
    // //   const self = this;
    // //   setTimeout(function() {
    // //     // Get the video player
    // //     let $videoPlayer = $('#movie_player');

    // //     // YouTube loads data dynamically, so we must click the "show more" button
    // //     //    extract the category, and then click the "show less" button.
    // //     self.showMore();
    // //     setTimeout(function() {
    // //       self.createDatapoint(self, currentUrl, $videoPlayer);
    // //     }, 10000);
    // //   }, 2000);

    // //   return currentUrl;
    // // } else {
    // //   return currentUrl;
    // }
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
    if(datapoint['category'] == "Education") {
      return true;
    }

    console.log(`Video category is not 'Education' so not sending it`)
    return false;
  },

  sendDatapoint: function(eventType, category, url, title, views) {
    // Create the datapoint:
    let datapoint = {
      _url: url,
      url: url,
      _str: title,
      _action: "Viewed",
      _timestamp: Date.now(),
      time: Date.now(),
      event: eventType,
      category: category,
      title: title,
      views: views
    };

    // Log it
    console.log(datapoint);

    if(this.validateDatapoint(datapoint)) {
      // Validate and send the datapoint
      this.mc.sendDatapoint(datapoint);
    }
  },

  addRecommendation: function() {
    console.log('Adding recommendation! ------')
    let $nextVideo = $('#related #items ytd-compact-video-renderer').eq(0)
    let metroVideo = $nextVideo.clone()
    console.log($nextVideo)
    console.log(metroVideo)
    metroVideo.insertAfter($nextVideo)
    metroVideo.empty()
    metroVideo.find('a').attr('href', 'https://getmetro.co')

    let foo = $('<a href="https://getmetro.co" style="text-decoration: none; text-align: center; color: black; font-size: 2rem; background: #efc04e; height: 100%; width: 100%; padding: 2rem;">')
    $('<h2>METRO NEXT</h2>').appendTo(foo)
    foo.appendTo(metroVideo)
    metroVideo.on('click', function() {
      window.location = "https://getmetro.co"
    })
  },

  initDataSource: function(metroClient) {
    // The entrypoint
    this.mc = metroClient;
    const self = this;

    // setTimeout(this.addRecommendation, 5000)

    let url = "";
    setInterval(function() {
      url = self.operate(url);
    }, 500);
  }
}

registerDataSource(Study);