/*
YouTube dynamically loads data, which means that we can't just scrape normally, we have to
wait for the DOM to be updated.
*/

const youtubeMusic = {
  mc: null,
  name: 'youtube-music',

  registerEventsHandler: function(node) {
    // First we need to get the video player element:
    let $videoPlayer = $('#movie_player');
    // There is a class that is dynamically changed on this element. Either
    // "paused-mode" or "playing-mode" or "ended-mode". We are going to
    // setInterval on this and monitor it for changes to the class. When it
    // changes, we fire that event.
    let currentEvent = "";
    const self = this;

    const title = $('#container h1.title yt-formatted-string').text();
    const views = $('#container div#info').find('span.view-count').text().replace(/\D/g,'');
    const url = window.location.href;

    // Click the "Show More" button
    this.showMore()
    // Then wait 2 seconds, before getting the category
    setTimeout(function(){
      self.run(currentEvent, self, title, views, url, $videoPlayer);
    },2000);
  },

  run: function(currentEvent, self, title, views, url, $videoPlayer) {
    const category = this.getCategory();

    if($videoPlayer.hasClass('playing-mode')){
      self.sendDatapoint("opened", category, url, title, views);
    }

    setInterval(function() {
      let $videoPlayer = $('#movie_player');
      let playing = $videoPlayer.hasClass("playing-mode");
      let paused = $videoPlayer.hasClass("paused-mode");
      let ended = $videoPlayer.hasClass("ended-mode");


      if(playing && currentEvent != "play") {
        self.sendDatapoint("play", category, url, title, views);
        currentEvent = "play";
      } else if(paused && currentEvent != "pause") {
        self.sendDatapoint("pause", category, url, title, views);
        currentEvent = "pause";
      } else if(ended && currentEvent != "finished") {
        self.sendDatapoint("finished", category, url, title, views);
        currentEvent = "finished";
      }
    }, 250);
  },

  showMore: function() {
    $('ytd-expander.ytd-video-secondary-info-renderer #more').click(); // Click the "show more button"
  },

  getCategory: function() {
    // Get the container div which has the #title and #content of the Category field
    let categoryContainer = $('ytd-expander.ytd-video-secondary-info-renderer ytd-metadata-row-renderer:has(#title yt-formatted-string:contains("Category"))');//:contains("category")')
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

    // Set up the event listeners after the page loads fully
    setTimeout(function(){
      self.registerEventsHandler(document.body);
    },2000);
  }
}

registerDataSource(youtubeMusic);