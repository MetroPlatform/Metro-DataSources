const redditBasicVotes = {
  mc: null,
  name: 'reddit-basic-votes',

  registerVoteActions: function (node) {
    let gThis = this;
    // First we get all the "rows" denoting posts on the reddit front page:
    var postDivs = node.getElementsByClassName("thing");

    // Then for each of these posts, we find the divs with the "arrow" class
    // denoting vote buttons:
    for(var i=0; i<postDivs.length; i++) {
      let postDiv = postDivs[i];

      // This is going to be the item we send to metro:
      let item = {};

      // First we find the post title and store it in the item. If we can't find
      // the title, skip this post.
      try {
        // The title is stored in an anchor tag with class "title":
        let postTitle = postDiv.querySelectorAll("a.title")[0];
        item['title'] = postTitle.innerText;
      } catch(err) {
        console.log("Failed to get title:");
        console.log(err);
        continue;
      }

      // Attach the up/down vote events or skip this post if we can't find them:
      try {
        // Each "arrow" div has another class, either up or down. We want to attach
        // on these clicks.
        let upvoteDiv = postDiv.getElementsByClassName("up arrow")[0];
        let downvoteDiv = postDiv.getElementsByClassName("down arrow")[0];

        upvoteDiv.addEventListener('click', function(event) {
          item['vote'] = "up";
          console.log("Sending upvote: " + item['title']);
          gThis.mc.sendDatapoint(item);
        });
        downvoteDiv.addEventListener('click', function(event) {
          item['vote'] = "down";
          console.log("Sending downvote: " + item['title']);
          gThis.mc.sendDatapoint(item);
        });
      } catch(err) {
        console.log("Couldn't find a vote div:");
        console.log(err);
        continue;
      }
    }
  },

  initDataSource: function(metroClient) {
    this.mc = metroClient;
    console.log("Beginning reddit-basic data source.");
    this.observer.observe(document.body, this.config);
    this.registerVoteActions(document.body);
  },


  // Boilerplate stuff:
  observer: new MutationObserver(function (mutations) {
    let gThis = this;
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType === 1) { // ELEMENT_NODE
          gThis.registerVoteActions(node);
        }
      });
    });
  }),

  config: {
    attributes: false,
    childList: true,
    characterData: false,
    subtree: true
  }
}

registerDataSource(redditBasicVotes);
