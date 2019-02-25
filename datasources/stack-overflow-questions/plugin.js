const LANGUAGES = [
  'python',
  'java',
  'javascript',
  'haskell',
  'c++',
  'c',
  'rust',
  'html',
  'css',
  'sql',
  'bash',
  'shell',
  'c#',
  'php',
  'ruby',
  'swift',
  'assembly',
  'go',
  'objective-c',
  'r',
  'scala',
  'groovy',
  'perl',
  'kotlin',
  'matlab',
  'typescript',
  'vb.net',
  'vba',
  'elixir',
]

const StackOverflowQuestions = {
  name: 'stack-overflow-questions',

  getQuestionTitle: function() {
    return $('#question-header h1').text();
  },

  getTags: function() {
    let tags = $('.post-taglist .grid a').toArray();
    return tags.map(tagElement => tagElement.innerText )
  },

  getQInfo: function() {
    let qInfo = $('#qinfo tbody')
    return qInfo;
  },

  getAskedTimestamp: function() {
    // The 0th <tr> in the table
    let qInfo = this.getQInfo();
    let $tr = qInfo.find('tr:eq(0)')
    let value = $tr.find('td:eq(1) p').attr('title');
    let timestamp = new Date(value).getTime()/1000;

    return timestamp
  },

  getActiveTimestamp: function() {
    // The 2nd <tr> in the table
    let qInfo = this.getQInfo();
    let $tr = qInfo.find('tr:eq(2)')
    let value = $tr.find('td:eq(1) p b a').attr('title');
    let timestamp = new Date(value).getTime()/1000;

    return timestamp
  },

  getViews: function() {
    // The 1st <tr> in the table
    let qInfo = this.getQInfo();
    let $tr = qInfo.find('tr:eq(1)')
    let value = $tr.find('td:eq(1) p b').text()

    return value.split(' ')[0]
  },

  getQuestionUpvotes: function() {
    return $('#question').find('div [itemprop="upvoteCount"]').text();
  },

  getAnswerCount: function() {
    return $('#answers-header .subheader h2').data('answercount');
  },

  hasAcceptedAnswer: function() {
    return $('.accepted-answer').length !== 0;
  },

  getAcceptedAnswerTimestamp: function() {
    let time = $('.accepted-answer').find('time').attr('datetime') + "Z";
    console.log(time)
    let timestamp = new Date(time).getTime()/1000;

    return timestamp
  },

  getFavoriteCount: function() {
    let count = $('.js-favorite-count').text();
    return (count.length === 0 ? 0 : count)
  },

  filterProgrammingLanguages: function(tags) {
    // tags -> [ 'buttons', 'python', 'dianarocks', 'java', 'c++' ]
    let languages = tags.filter(tag => LANGUAGES.includes(tag)) // True or False
    
    return languages // [ 'python', 'java', 'c++' ]
  },

  run: function() {
    let self = this;

    let questionTitle = this.getQuestionTitle();
    let tags = this.getTags();
    let askedTimestamp = parseInt(this.getAskedTimestamp());
    let activeTimestamp = this.getActiveTimestamp();
    let questionUpvotes = this.getQuestionUpvotes();
    let answerCount = this.getAnswerCount();
    let hasAcceptedAnswer = this.hasAcceptedAnswer();
    let acceptedAnswerTimestamp = parseInt(this.getAcceptedAnswerTimestamp());
    let languages = this.filterProgrammingLanguages(tags);
    let views = this.getViews();
    let favCount = this.getFavoriteCount();
    let action = "Viewed";

    let datapoint = {
      _str: questionTitle,
      _url: window.location.href,
      _timestamp: Date.now(),
      _action: action,
      title: questionTitle,
      tags: tags,
      languages: languages,
      hasAcceptedAnswer: hasAcceptedAnswer,
      acceptedAnswerTimestamp: acceptedAnswerTimestamp,
      questionUpvotes: questionUpvotes,
      questionFavs: favCount,
      answerCount: answerCount,
      askedTimestamp: askedTimestamp,
      activeTimestamp: activeTimestamp,
      views: views,
    }

    this.mc.sendDatapoint(datapoint)

    $('#content').on('copy', function() {
      // Set the action before we send it
      datapoint['_action'] = "Copied"
      datapoint['_timestamp'] = Date.now()
      self.mc.sendDatapoint(datapoint);
    })

    $('.question').find('.js-vote-up-btn').click(function() {
      // Set the action before we send it
      datapoint['_action'] = "Upvoted"
      datapoint['_timestamp'] = Date.now()
      self.mc.sendDatapoint(datapoint);
    })

    $('.js-favorite-btn').click(function() {
      // Set the action before we send it
      datapoint['_action'] = "Fav'd"
      datapoint['_timestamp'] = Date.now()
      self.mc.sendDatapoint(datapoint);
    })
  },

  initDataSource: function(metroClient) {
    this.mc = metroClient;

    this.run()
  }
}

registerDataSource(StackOverflowQuestions);
