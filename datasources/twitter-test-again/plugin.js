const registerTweetActions = function (node) {
  var tweets = node.getElementsByClassName("tweet");

  for(var i=0; i<tweets.length; i++) {

    try {
      let tweet = tweets[i];

      // Contains the data identifying this tweet.
      let item = {};

      // Store tweet author.
      let tweetHeaderNode = tweet.getElementsByClassName("stream-item-header")[0];
      let tweetAuthorNode = tweetHeaderNode.getElementsByClassName("username")[0];
      item['tweetAuthor'] = tweetAuthorNode.innerText;


      // Store tweet content.
      let tweetContentNode = tweet.getElementsByClassName("tweet-text")[0];
      item['tweetContent'] = tweetContentNode.innerText;


      // Add reply button click listener.
      let tweetActionsNode = tweet.getElementsByClassName("ProfileTweet-actionList")[0];
      let replyButtonNode = tweetActionsNode.getElementsByClassName("js-actionReply")[0];
      replyButtonNode.addEventListener('click', function() {
        item['event'] = "TwitterReply";
        mc.sendDatapoint(item);
      });

      // Add retweet button click listener.
      let retweetButtonNode = tweetActionsNode.getElementsByClassName("js-actionRetweet")[0];
      retweetButtonNode.addEventListener('click', function() {
        item['event'] = "TwitterRetweet";
        mc.sendDatapoint(item);
      });

      // Add favorite button click listener.
      let favoriteButtonNode = tweetActionsNode.getElementsByClassName("js-actionFavorite")[0];
      favoriteButtonNode.addEventListener('click', function() {
        item['event'] = "TwitterFavorite";
        mc.sendDatapoint(item);
      });
    } catch(err) {
      console.log("Error while setting handlers:");
      console.log(err);
      continue;
    }

  }
}

const observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    mutation.addedNodes.forEach(function (node) {
      if (node.nodeType === 1) { // ELEMENT_NODE
        registerTweetActions(node);
      }
    });
  });
});

const config = {
  attributes: false,
  childList: true,
  characterData: false,
  subtree: true
};


var mc;
function initDataSource(metroClient) {
  mc = metroClient;
  console.log("Beginning Twitter data source.");
  observer.observe(document.body, config);
  registerTweetActions(document.body);
}
