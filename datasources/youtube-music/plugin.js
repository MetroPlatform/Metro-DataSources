/*
YouTube dynamically loads data, which means that we can't just scrape normally, we have to
wait for the DOM to be updated.
*/

const basicYoutubeActions = {
  mc: null,
  name: 'basic-youtube-actions',

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
    const url = window.location.href;

    // Click the "Show More" button
    this.showMore()
    // Then wait 2 seconds, before getting the category
    setTimeout(function(){
      self.setUpInterval(currentEvent, self, title, url, $videoPlayer);
    },2000);
  },

  setUpInterval: function(currentEvent, self, title, url, $videoPlayer) {
    const category = this.getCategory();
    setInterval(function() {
      let playing = $videoPlayer.hasClass("playing-mode");
      let paused = $videoPlayer.hasClass("paused-mode");
      let ended = $videoPlayer.hasClass("ended-mode");


      if(playing && currentEvent != "play") {
        self.sendDatapoint("play", category, url, title);
        currentEvent = "play";
      } if(paused && currentEvent != "pause") {
        self.sendDatapoint("pause", category, url, title);
        currentEvent = "pause";
      } if(ended && currentEvent != "finished") {
        self.sendDatapoint("finished", category, url, title);
        currentEvent = "finished";
      }
    }, 250);
  },

  showMore: function() {
    $('ytd-expander.ytd-video-secondary-info-renderer #more').click(); // Click the "show more button"
  },

  getCategory: function() {
    let category = $('ytd-expander.ytd-video-secondary-info-renderer ytd-metadata-row-renderer #content').find('a').text();
    $('ytd-expander.ytd-video-secondary-info-renderer #less').click(); // Click the "show more button"

    return category;
  },

  validateDatapoint: function(datapoint) {
    if(datapoint['category'] == "Music") {
      return true;
    }

    return false;
  },

  sendDatapoint: function(eventType, category, url, title) {
    // Create the datapoint:
    let datapoint = {};
    datapoint['event'] = eventType;
    datapoint['time'] = Date.now();
    datapoint['url'] = url;
    datapoint['title'] = title;
    datapoint['category'] = category;

    // Log it
    console.log(datapoint);

    if(this.validateDatapoint(datapoint)) {
      this.mc.sendDatapoint(datapoint);
    }
  },

  initDataSource: function(metroClient) {
    // The entrypoint
    this.mc = metroClient;
    console.log("Beginning YouTube actions DataSource.");
    const self = this;

    // Set up the event listeners after the page loads fully
    setTimeout(function(){
      self.registerEventsHandler(document.body);
    },2000);
  }
}

registerDataSource(basicYoutubeActions);