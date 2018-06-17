const irishNewsSiteUsage = {
  name: 'irish-news-site-usage',

  initDataSource: function(metroClient) {
    loadTime = (new Date).getTime();
    URL = window.location.href;

    window.addEventListener("beforeunload", function() {
      leaveTime = (new Date).getTime();

      let datapoint = {
        "loadTime": loadTime,
        "leaveTime": leaveTime,
        "URL": URL
      }

      metroClient.sendDatapoint(datapoint);
    });
  }
}

registerDataSource(irishNewsSiteUsage);
