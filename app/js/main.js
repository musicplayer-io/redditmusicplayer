var API, Authentication, BandcampPlayer, Button, Buttons, CommentsView, CurrentSongView, FLAG_DEBUG, KeyboardController, MP3Player, MobileUI, MusicPlayer, NotALink, NotASong, PlayerController, Playlist, PlaylistView, ProgressBar, ProgressBarView, Reddit, Song, SongBandcamp, SongMP3, SongSoundcloud, SongVimeo, SongYoutube, SortMethodView, SoundcloudPlayer, Subreddit, SubredditPlayListView, SubredditPlaylist, SubredditSelectionView, Templates, UIModel, VimeoPlayer, YoutubePlayer, onYouTubeIframeAPIReady, timeSince;

window.RMP = {};

RMP.dispatcher = _.clone(Backbone.Events);

$(document).ready(function() {
  RMP.dispatcher.trigger("app:main");
  return RMP.dispatcher.trigger("app:resize");
});

$(window).resize(function() {
  return RMP.dispatcher.trigger("app:resize");
});

RMP.dragging = false;

$(window).mouseup(function() {
  RMP.dragging = false;
  return RMP.dispatcher.trigger("events:stopDragging");
});

API = {
  Bandcamp: {
    base: "//api.bandcamp.com/api",
    key: "vatnajokull"
  },
  Soundcloud: {
    base: "//api.soundcloud.com",
    key: "5441b373256bae7895d803c7c23e59d9"
  },
  Reddit: {
    base: "//www.reddit.com"
  }
};

FLAG_DEBUG = true;

Templates = {
  SubredditPlayListView: _.template("<a class='item' data-category='<%= category %>' data-value='<%= name %>'><%= text %></a>"),
  PlayListView: _.template("<div class='ui item' data-id='<%= id %>'> <% if (thumbnail) { %> <% if (thumbnail == 'self' || thumbnail == 'default') { %> <% if (type == 'mp3') { %> <i class='left floated icon music large'/> <% } else { %> <i class='left floated icon chat outline large'/> <% } %> <% } else {%> <img src='<%= thumbnail %>' class='ui image rounded left floated'/> <% } %> <% } %> <div class='content'> <div class='title'><%= title %></div> <span class='ups'><%= ups %></span> / <span class='downs'><%= downs %></span> • <span class='author'><%= author %></span> in <span class='subreddit'><%= subreddit %></span> • <span class='created'><%= created_ago %></span> • <span class='origin'><%= domain %></span> • <span class='comments'><%= num_comments %> comments</span> </div> </div>"),
  CurrentSongView: _.template("<% if (media) { %> <img class='ui image fluid' src='<%= media.oembed.thumbnail_url %>' /> <% } %> <% if (url.indexOf('imgur') >= 0) { %> <a class='ui image fluid' href='<%= url %>' target='_blank'> <img src='<%= url %>' /> </a> <% } %> <div class='vote' id='<%= name %>'> <div class='upvote'><i class='icon up arrow'></i></div> <div class='downvote'><i class='icon down arrow'></i></div> </div> <h3 class='ui header title'><%= title %></h3> <table class='ui table inverted'> <tbody> <% if (media) { %> <tr> <td>Title</td> <td><%= media.oembed.title %></td> </tr> <tr> <td>Description</td> <td><%= media.oembed.description %></td> </tr> <% } %> <tr> <td class='four wide'>Upvotes</td> <td class='thirteen wide'><%= ups %></td> </tr><tr> <td>Downvotes</td> <td><%= downs %></td> </tr><tr> <td>Author</td> <td><%= author %></td> </tr><tr> <td>Timestamp</td> <td><%= subreddit %></td> </tr><tr> <td>Subreddit</td> <td><%= created_ago %> ago</td> </tr><tr> <td>Origin</td> <td><%= domain %></td> </tr><tr> <td>Comments</td> <td><%= num_comments %> comments</td> </tr><tr> <td colspan='2'> <div class='ui 2 fluid tiny buttons'> <a target='_blank' class='permalink ui button' href='http://www.reddit.com<%= permalink %>'> <i class='url icon'></i> Reddit </a> <% if (type == 'link') { %> <a target='_blank' class='ui external button' href='<%= url %>'> <i class='external url icon'></i> Link </a> <% } %> <% if (media) { %> <% if (media && (media.type == 'youtube.com' || media.type == 'youtu.be')) { %> <script src='https://apis.google.com/js/platform.js'></script> <div class='ui youtube tiny button'> <div class='g-ytsubscribe' data-channel='<%= media.oembed.author_name %>' data-layout='default' data-theme='dark' data-count='default'></div> </div> <% } else if (media.type == 'soundcloud.com') { %> <a href='<%= media.oembed.author_url %>' target='_blank' class='ui soundcloud button'> <i class='icon male'></i> <%= media.oembed.author_name %> </a> <% } else if (media.type == 'vimeo.com') { %> <a href='<%= media.oembed.author_url %>' target='_blank' class='ui soundcloud button'> <i class='icon male'></i> <%= media.oembed.author_name %> </a> <% } %> <% } %> </div> </td> </tr> </tbody> </table> <% if (is_self) { %> <div class='ui divider'></div> <div class='self text'> <%= selftext_html %> </div> <% } %>"),
  CommentsView: _.template("<div class='comment' id='<%= name %>' data-ups='<%= ups %>' data-downs='<%= downs %>'> <div class='vote'> <div class='upvote<% if (likes === true) print(' active') %>'><i class='icon up arrow'></i></div> <div class='downvote<% if (likes === false) print(' active') %>'><i class='icon down arrow'></i></div> </div> <div class='content'> <a class='author'><%= author %></a> <div class='metadata'> <span class='ups'><%= ups %></span>/ <span class='downs'><%= downs %></span> <span class='date'><%= created_ago %> ago</span> </div> <div class='text'><% print(_.unescape(body_html)) %></div> <div class='actions'><a class='reply'>Reply</a></div> </div> </div>"),
  ReplyTo: _.template("<span class='ui reply_to label inverted black fluid' id='<%= id %>'> Replying to <%= author %> <i class='icon close'></i> </span>"),
  AuthenticationView: _.template("<div class='item ui dropdown reddit account' id='<%= id %>'> <i class='icon user'></i> <%= name %> <i class='icon dropdown'></i> <div class='menu'> <div class='item'> <%= link_karma %> Link Karma </div> <div class='item'> <%= comment_karma %> Comment Karma </div> <% if (is_gold == true) { %> <div class='item'> Gold Member </div> <% } %> <a class='item sign-out' href='/logout'> <i class='icon off'></i> Log Out </a> </div> </div>")
};

Reddit = Backbone.Model.extend({
  defaults: {
    sortMethod: "hot",
    topMethod: "month"
  },
  vote: function(id, dir) {
    var data;
    data = {
      id: id,
      dir: dir
    };
    return $.ajax({
      type: 'POST',
      dataType: "json",
      url: "/api/vote",
      data: data,
      success: (function(_this) {
        return function(resp) {
          if (FLAG_DEBUG) {
            return console.log(resp);
          }
        };
      })(this)
    });
  },
  subreddits: function() {
    return RMP.subredditplaylist.toString();
  },
  getMusic: function(callback) {
    var data;
    data = {};
    data.sort = this.get("sortMethod");
    if (this.get("sortMethod") === "top") {
      data.t = this.get("topMethod");
    }
    if (FLAG_DEBUG) {
      console.log("Reddit :: GetMusic :: ", this.subreddits());
    }
    return $.ajax({
      dataType: "json",
      url: "" + API.Reddit.base + "/r/" + (this.subreddits()) + "/" + (this.get('sortMethod')) + ".json?jsonp=?",
      data: data,
      success: (function(_this) {
        return function(r) {
          if (r.error != null) {
            return console.error("Reddit :: " + r.error.type + " :: " + r.error.message);
          }
          return callback(r.data.children);
        };
      })(this)
    });
  },
  getMore: function(last, callback) {
    var data;
    data = {};
    data.sort = this.get("sortMethod");
    if (this.get("sortMethod") === "top") {
      data.t = this.get("topMethod");
    }
    data.after = last;
    return $.ajax({
      dataType: "json",
      url: "" + API.Reddit.base + "/r/" + (this.subreddits()) + "/" + (this.get('sortMethod')) + ".json?jsonp=?",
      data: data,
      success: (function(_this) {
        return function(r) {
          if (r.error != null) {
            return console.error("Reddit :: " + r.error.type + " :: " + r.error.message);
          }
          return callback(r.data.children);
        };
      })(this)
    });
  },
  getComments: function(permalink, callback) {
    var data, url;
    data = {};
    data.sort = this.get("sortMethod");
    if (this.get("sortMethod") === "top") {
      data.t = this.get("topMethod");
    }
    url = "" + API.Reddit.base + permalink + ".json?jsonp=?";
    if (RMP.authentication != null) {
      url = "/api/comments";
    }
    if (RMP.authentication != null) {
      data.permalink = permalink;
    }
    return $.ajax({
      dataType: "json",
      url: url,
      data: data,
      success: (function(_this) {
        return function(r) {
          if (r.error != null) {
            return console.error("Reddit :: " + r.error.type + " :: " + r.error.message);
          }
          return callback(r[1].data.children);
        };
      })(this)
    });
  },
  addComment: function(params) {
    var data;
    data = {
      text: params.text,
      thing_id: params.thing_id
    };
    return $.ajax({
      type: 'POST',
      dataType: "json",
      url: "/api/add_comment",
      data: data,
      success: (function(_this) {
        return function(r) {
          if (r.error != null) {
            return console.error("Reddit :: " + r.error.type + " :: " + r.error.message);
          }
          return params.callback(r);
        };
      })(this)
    });
  },
  changeSortMethod: function(sortMethod, topMethod) {
    this.set("sortMethod", sortMethod);
    return this.set("topMethod", topMethod);
  },
  save: function() {
    localStorage["sortMethod"] = this.get("sortMethod");
    return localStorage["topMethod"] = this.get("topMethod");
  },
  initialize: function() {
    if (localStorage["sortMethod"] != null) {
      this.set("sortMethod", localStorage["sortMethod"]);
    }
    if (localStorage["topMethod"] != null) {
      this.set("topMethod", localStorage["topMethod"]);
    }
    if (this.get("sortMethod") !== "top" || this.get("sortMethod") !== "hot" || this.get("sortMethod") !== "new") {
      this.changeSortMethod("hot", "week");
      this.save();
    }
    return this.listenTo(this, "change", this.save);
  }
});

RMP.reddit = new Reddit;

Authentication = Backbone.Model.extend({
  template: Templates.AuthenticationView,
  initialize: function() {
    this.$el = $(".titlebar .authentication");
    this.$ = function(selector) {
      return $(".titlebar .authentication " + selector);
    };
    if (this.get("name")) {
      this.$el.html(this.template(this.attributes));
      return this.$(".ui.dropdown").dropdown();
    }
  }
});

RMP.dispatcher.on("app:page", function(category, page) {
  if (RMP.authentication != null) {
    return $(".titlebar .authentication .sign-out").attr("href", "/logout?redirect=/" + page);
  } else {
    return $(".titlebar .authentication .log-in").attr("href", "/login?redirect=/" + page);
  }
});

ProgressBar = Backbone.Model.extend({
  defaults: {
    loaded: 0,
    current: 0,
    duration: 60,
    currentSongID: -1
  },
  setDuration: function(data) {
    this.set("duration", data);
    return this.set("current", 0);
  },
  setLoaded: function(data) {
    return this.set("loaded", data);
  },
  setCurrent: function(data) {
    return this.set("current", data);
  },
  change: function(index, song) {
    if (song.get("id") !== this.get("currentSongID") && song.get("playable") === true) {
      this.setCurrent(0);
      this.setLoaded(0);
      this.setDuration(60);
      this.set("currentSongID", song.get("id"));
      return $(".controls .progress").removeClass("soundcloud");
    }
  },
  enableSoundcloud: function(waveform) {
    $(".controls .progress").addClass("soundcloud");
    return $(".controls .progress .waveform").css("-webkit-mask-box-image", "url(" + waveform + ")");
  },
  initialize: function() {
    if (FLAG_DEBUG) {
      console.log("ProgressBar :: Ready");
    }
    this.listenTo(RMP.dispatcher, "song:change", this.change);
    this.listenTo(RMP.dispatcher, "progress:current", this.setCurrent);
    this.listenTo(RMP.dispatcher, "progress:loaded", this.setLoaded);
    return this.listenTo(RMP.dispatcher, "progress:duration", this.setDuration);
  }
});

ProgressBarView = Backbone.View.extend({
  events: {
    "mousemove .progress": "seeking",
    "mousedown .progress": "startSeeking"
  },
  justSeeked: false,
  startSeeking: function(e) {
    RMP.dragging = true;
    this.percentage = e.offsetX / this.$(".progress").outerWidth();
    return this.justSeeked = true;
  },
  seeking: function(e) {
    if (!this.justSeeked) {
      return;
    }
    this.percentage = e.offsetX / this.$(".progress").outerWidth();
    if (RMP.dragging) {
      RMP.dispatcher.trigger("progress:set", this.percentage, !RMP.dragging);
    }
    return this.$(".progress .current").css("width", this.percentage * 100 + "%");
  },
  stopSeeking: function() {
    if (!this.justSeeked) {
      return;
    }
    RMP.dispatcher.trigger("progress:set", this.percentage, !RMP.dragging);
    if (FLAG_DEBUG && RMP.dragging === false) {
      console.log("ProgressBarView :: Seek :: " + (this.percentage * 100) + "%");
    }
    return this.justSeeked = false;
  },
  toMinSecs: function(secs) {
    var hours, mins;
    hours = Math.floor(secs / 3600);
    if (hours) {
      mins = Math.floor((secs / 60) - hours * 60);
      secs = Math.floor(secs % 60);
      return "" + (String('0' + hours).slice(-2)) + ":" + (String('0' + mins).slice(-2)) + ":" + (String('0' + secs).slice(-2));
    } else {
      mins = Math.floor(secs / 60);
      secs = Math.floor(secs % 60);
      return "" + (String('0' + mins).slice(-2)) + ":" + (String('0' + secs).slice(-2));
    }
  },
  resize: function() {
    var itemWidth;
    itemWidth = $(".controls .left .item").outerWidth();
    return this.$(".progress").css("width", $("body").innerWidth() - itemWidth * 6.2);
  },
  render: function() {
    this.$(".end.time").text(this.toMinSecs(this.model.get("duration")));
    this.$(".progress .loaded").css("width", this.model.get("loaded") * 100 + "%");
    this.$(".start.time").text(this.toMinSecs(this.model.get("current")));
    return this.$(".progress .current").css("width", this.model.get("current") / this.model.get("duration") * 100 + "%");
  },
  initialize: function() {
    this.resize();
    if (FLAG_DEBUG) {
      console.log("ProgressBarView :: Ready");
    }
    this.listenTo(this.model, "change", this.render);
    this.listenTo(RMP.dispatcher, "app:resize", this.resize);
    return this.listenTo(RMP.dispatcher, "events:stopDragging", this.stopSeeking);
  }
});

RMP.progressbar = new ProgressBar;

RMP.progressbarview = new ProgressBarView({
  el: $(".controls .middle.menu"),
  model: RMP.progressbar
});

Button = Backbone.View.extend({
  events: {
    "click": "click"
  },
  click: function(e) {
    return RMP.dispatcher.trigger(this.attributes.clickEvent, e);
  },
  stateChange: function(data) {
    if (FLAG_DEBUG) {
      console.log("Button :: StateChange", data);
    }
    if (this.checkState(data) === true) {
      return this.$el.addClass("active");
    } else {
      return this.$el.removeClass("active");
    }
  },
  initialize: function() {
    this.checkState = this.attributes.checkState;
    if (this.attributes.listenEvent != null) {
      return this.listenTo(RMP.dispatcher, this.attributes.listenEvent, this.stateChange);
    }
  }
});

Buttons = Backbone.Model.extend({
  initialize: function() {
    this.backward = new Button({
      el: $(".controls .backward.button"),
      attributes: {
        clickEvent: "controls:backward"
      }
    });
    this.forward = new Button({
      el: $(".controls .forward.button"),
      attributes: {
        clickEvent: "controls:forward"
      }
    });
    this.play = new Button({
      el: $(".controls .play.button"),
      attributes: {
        clickEvent: "controls:play",
        listenEvent: "player:playing player:paused player:ended",
        checkState: function(player) {
          if (player === window) {
            player = RMP.player.controller;
          }
          if (player.type === "youtube") {
            return player.player.getPlayerState() === 1;
          } else {
            return player.playerState === "playing";
          }
        }
      }
    });
    this.shuffle = new Button({
      el: $(".controls .shuffle.button"),
      attributes: {
        clickEvent: "controls:shuffle",
        listenEvent: "player:shuffle"
      }
    });
    return this.repeat = new Button({
      el: $(".controls .repeat.button"),
      attributes: {
        clickEvent: "controls:repeat",
        listenEvent: "player:repeat"
      }
    });
  }
});

RMP.buttons = new Buttons;

UIModel = Backbone.View.extend({
  tagName: "div",
  className: "container",
  cache: {},
  events: {
    "click .switcher .item": "open"
  },
  open: function(e) {
    var item, page;
    item = $(e.currentTarget);
    page = item.data("page");
    return this.navigate(page);
  },
  load: function(page, callback, ignoreCache) {
    if (page in this.cache && (ignoreCache === false || (ignoreCache == null))) {
      return callback(this.cache[page]);
    }
    if (FLAG_DEBUG) {
      console.log("UI :: Load :: ", page);
    }
    return $.get("/" + page, (function(_this) {
      return function(data) {
        _this.cache[page] = data;
        return callback(data);
      };
    })(this));
  },
  navigate: function(page) {
    return this.load(page, (function(_this) {
      return function(data) {
        return _this.render(data, page);
      };
    })(this));
  },
  getElement: function(page) {
    return this.$("[data-page=" + page + "]");
  },
  render: function(data, page) {
    this.$el.html(data.content);
    this.$el.find(".ui.dropdown").dropdown();
    return RMP.dispatcher.trigger("loaded:" + page);
  },
  initialize: function() {
    if (FLAG_DEBUG) {
      console.log("UI :: Ready");
    }
    $(".ui.dropdown").dropdown();
    return this.listenTo(RMP.dispatcher, "app:page", this.navigate);
  }
});

RMP.ui = [
  new UIModel({
    el: $(".ui.container.one")
  }), new UIModel({
    el: $(".ui.container.two")
  }), new UIModel({
    el: $(".ui.container.three")
  })
];

MobileUI = Backbone.View.extend({
  tagName: "div",
  className: "mobilebar",
  events: {
    "click .item": "click"
  },
  click: function(e) {
    var container, item, page;
    item = $(e.currentTarget);
    console.log(item);
    page = item.data("page");
    container = $(".ui.container[data-page=" + page + "]");
    $(".ui.container").removeClass("active");
    container.addClass("active");
    this.$(".item").removeClass("active");
    return item.addClass("active");
  },
  initialize: function() {
    if (FLAG_DEBUG) {
      return console.log("MobileUI :: Ready");
    }
  }
});

RMP.mobileui = new MobileUI({
  el: $(".ui.mobilebar")
});

RMP.dispatcher.on("loaded:about", function(page) {
  return $(".start.listening").click(function(e) {
    if (FLAG_DEBUG) {
      console.log("About :: Start Listening");
    }
    RMP.dispatcher.trigger("controls:play");
    return RMP.sidebar.open("playlist");
  });
});

RMP.dispatcher.on("app:main", function() {
  return $(".ui.container").each(function(i, el) {
    var item;
    item = $(el);
    return RMP.dispatcher.trigger("loaded:" + (item.data('page')));
  });
});

Subreddit = Backbone.Model.extend({
  defaults: {
    category: null,
    name: null,
    text: null
  },
  idAttribute: "name",
  toString: function() {
    return this.escape("name");
  },
  initialize: function() {
    if (FLAG_DEBUG) {
      return console.log("Subreddit :: Created");
    }
  }
});

SubredditPlaylist = Backbone.Collection.extend({
  model: Subreddit,
  localStorage: new Backbone.LocalStorage("Subreddits"),
  toString: function() {
    return RMP.subredditplaylist.pluck("name").join("+");
  },
  initialize: function() {
    if (FLAG_DEBUG) {
      console.log("SubredditPlaylist :: Ready");
    }
    this.listenTo(this, "add", this.save);
    return this.listenTo(this, "remove", this.save);
  }
});

SubredditPlayListView = Backbone.View.extend({
  tagName: "div",
  className: "selection",
  events: {
    "click .menu.selection .item": "remove"
  },
  remove: function(e) {
    var currentReddit;
    currentReddit = e.currentTarget.dataset.value;
    RMP.subredditplaylist.get(currentReddit).destroy();
    return RMP.subredditplaylist.remove(RMP.subredditplaylist.get(currentReddit));
  },
  template: Templates.SubredditPlayListView,
  render: function() {
    this.$(".menu.selection").html("");
    return RMP.subredditplaylist.each((function(_this) {
      return function(model) {
        return _this.$(".menu.selection").append(_this.template(model.toJSON()));
      };
    })(this));
  },
  initialize: function() {
    this.listenTo(RMP.subredditplaylist, "add", this.render);
    this.listenTo(RMP.subredditplaylist, "remove", this.render);
    if (FLAG_DEBUG) {
      return console.log("SubredditPlayListView :: Ready");
    }
  }
});

SubredditSelectionView = Backbone.View.extend({
  tagName: "div",
  className: "selection",
  events: {
    "click .menu.selection .item": "open"
  },
  open: function(e) {
    var currentReddit, target;
    target = $(e.currentTarget);
    currentReddit = new Subreddit({
      category: this.category,
      name: target.data("value"),
      text: target.text()
    });
    if (target.hasClass("active")) {
      RMP.subredditplaylist.get(currentReddit).destroy();
      RMP.subredditplaylist.remove(currentReddit);
    } else {
      RMP.subredditplaylist.add(currentReddit);
      RMP.subredditplaylist.get(currentReddit).save();
    }
    if (FLAG_DEBUG) {
      console.log("Subreddit :: Changed :: " + currentReddit);
    }
    return this.render();
  },
  category: "Default",
  reddits: [],
  render: function() {
    var redditsInThisCategory, redditsInThisCategoryByName;
    redditsInThisCategory = RMP.subredditplaylist.where({
      "category": this.category
    });
    if (redditsInThisCategory === 0) {
      return;
    }
    redditsInThisCategoryByName = _.pluck(_.pluck(redditsInThisCategory, "attributes"), "name");
    this.activeReddits = _.intersection(redditsInThisCategoryByName, this.reddits);
    this.$(".menu .item").removeClass("active");
    return _.each(this.activeReddits, (function(_this) {
      return function(element) {
        return _this.$(".menu .item[data-value='" + element + "']").addClass("active");
      };
    })(this));
  },
  initialize: function() {
    this.category = this.$el.data("category");
    this.reddits = $.map(this.$(".selection.menu .item"), function(o) {
      return $(o).data("value");
    });
    this.render();
    this.listenTo(RMP.subredditplaylist, "add", this.render);
    this.listenTo(RMP.subredditplaylist, "remove", this.render);
    if (FLAG_DEBUG) {
      return console.log("Subreddit :: View Made");
    }
  }
});

RMP.subredditsSelection = [];

RMP.subredditplaylist = new SubredditPlaylist;

RMP.subredditplaylistview = new SubredditPlayListView({
  el: $(".content.browse .my.reddit.menu")
});

RMP.dispatcher.on("loaded:browse", function(page) {
  RMP.subredditsSelection = [];
  if (FLAG_DEBUG) {
    console.time("Making Views");
  }
  $(".content.browse .reddit.subreddits.menu").each(function(index, element) {
    return RMP.subredditsSelection.push(new SubredditSelectionView({
      el: element
    }));
  });
  if (FLAG_DEBUG) {
    console.timeEnd("Making Views");
  }
  RMP.subredditplaylistview.setElement($(".content.browse .my.reddit.menu"));
  if (RMP.subredditplaylist.length > 0) {
    return RMP.subredditplaylistview.render();
  }
});

RMP.dispatcher.on("app:main", function() {
  var sub, _i, _len, _ref;
  if ((RMP.URLsubreddits != null)) {
    RMP.subredditplaylist.reset();
    _ref = RMP.URLsubreddits;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      sub = _ref[_i];
      RMP.subredditplaylist.add(new Subreddit({
        category: "url",
        name: sub,
        text: sub
      }));
    }
  } else {
    RMP.subredditplaylist.fetch();
  }
  if (RMP.subredditplaylist.length === 0) {
    return RMP.subredditplaylist.add(new Subreddit({
      category: "Other",
      name: "listentothis",
      text: "Listen To This"
    }));
  }
});

timeSince = function(time) {
  var interval, seconds;
  seconds = Math.floor((new Date() - time) / 1000);
  interval = Math.floor(seconds / 31536000);
  if (interval > 1) {
    return "" + interval + " years";
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return "" + interval + " months";
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return "" + interval + " days";
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return "" + interval + " hours";
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return "" + interval + " minutes";
  }
  return "" + (Math.floor(seconds)) + " seconds";
};

Song = Backbone.Model.extend({
  type: "none",
  playable: false,
  initialize: function() {
    var time;
    time = new Date();
    time.setTime(parseInt(this.get("created_utc")) * 1000);
    this.set("created_ago", timeSince(time));
    this.set("type", this.type);
    return this.set("playable", this.playable);
  }
});

SongYoutube = Song.extend({
  type: "youtube",
  playable: true
});

SongSoundcloud = Song.extend({
  type: "soundcloud",
  playable: true
});

SongBandcamp = Song.extend({
  type: "bandcamp",
  playable: true
});

SongMP3 = Song.extend({
  type: "mp3",
  playable: true
});

SongVimeo = Song.extend({
  type: "vimeo",
  playable: true
});

NotASong = Backbone.Model.extend({
  type: "link",
  playable: false,
  initialize: function() {
    var time;
    time = new Date();
    time.setTime(parseInt(this.get("created_utc")) * 1000);
    this.set("created_ago", timeSince(time));
    this.set("type", this.type);
    return this.set("playable", this.playable);
  }
});

NotALink = NotASong.extend({
  type: "self"
});

Playlist = Backbone.Collection.extend({
  current: {
    song: null,
    index: -1
  },
  parseSong: function(item) {
    var song;
    return song = (function() {
      switch (false) {
        case !(item.domain === "youtube.com" || item.domain === "youtu.be" || item.domain === "m.youtube.com"):
          return new SongYoutube(item);
        case item.domain !== "soundcloud.com":
          return new SongSoundcloud(item);
        case item.domain.substr(-12) !== "bandcamp.com":
          return new SongBandcamp(item);
        case item.url.substr(-4) !== ".mp3":
          return new SongMP3(item);
        case item.domain !== "vimeo.com":
          return new SongVimeo(item);
        case !item.is_self:
          return new NotALink(item);
        default:
          return new NotASong(item);
      }
    })();
  },
  activate: function(song) {
    var index;
    index = _.indexOf(this.models, song);
    this.current.song = song;
    this.current.index = index;
    RMP.dispatcher.trigger("song:change", index, song);
    if (this.current.index >= this.length - 1) {
      return this.more();
    }
  },
  refresh: function() {
    return RMP.reddit.getMusic((function(_this) {
      return function(items) {
        var list;
        list = [];
        _.each(items, function(item) {
          return list.push(_this.parseSong(item.data));
        });
        _this.reset(list);
        return RMP.dispatcher.trigger("app:loadedMusic");
      };
    })(this));
  },
  more: function(callback) {
    return RMP.reddit.getMore(this.last().get("name"), (function(_this) {
      return function(items) {
        if (FLAG_DEBUG) {
          console.log(items);
        }
        _.each(items, function(item) {
          return _this.add(_this.parseSong(item.data));
        });
        if (callback != null) {
          return callback();
        }
      };
    })(this));
  },
  forward: function() {
    if (this.current.index >= this.length - 1) {
      return this.more((function(_this) {
        return function() {
          return _this.forward();
        };
      })(this));
    } else {
      this.current.index++;
      this.current.song = this.at(this.current.index);
      if (this.current.song.get("playable") === false) {
        return this.forward();
      } else {
        return this.activate(this.current.song);
      }
    }
  },
  backward: function() {
    if (this.current.index - 1 <= 0) {
      this.current.song = this.at(this.current.index - 1);
      if (this.current.song.get("playable") === true) {
        this.current.index = 0;
        return this.activate(this.current.song);
      }
    } else {
      this.current.index--;
      this.current.song = this.at(this.current.index);
      if (this.current.song.get("playable") === false) {
        return this.backward();
      } else {
        return this.activate(this.current.song);
      }
    }
  },
  playFirstSongIfEmpty: function() {
    if (this.current.index === -1) {
      return this.forward();
    }
  },
  initialize: function() {
    this.listenTo(RMP.subredditplaylist, "add", this.refresh);
    this.listenTo(RMP.subredditplaylist, "remove", this.refresh);
    this.listenTo(RMP.dispatcher, "controls:forward", this.forward);
    this.listenTo(RMP.dispatcher, "controls:backward", this.backward);
    this.listenTo(RMP.dispatcher, "controls:sortMethod", this.refresh);
    this.listenTo(RMP.dispatcher, "controls:play", this.playFirstSongIfEmpty);
    this.listenTo(RMP.dispatcher, "player:ended", this.forward);
    if (FLAG_DEBUG) {
      return console.log("Playlist :: Ready");
    }
  }
});

PlaylistView = Backbone.View.extend({
  tagName: "div",
  className: "playlist",
  events: {
    "click .ui.item": "activate",
    "click .item.more": "more"
  },
  more: function(e) {
    return RMP.playlist.more();
  },
  activate: function(e) {
    var id, song, target;
    target = $(e.currentTarget);
    id = target.data("id");
    song = RMP.playlist.get(id);
    return RMP.playlist.activate(song);
  },
  template: Templates.PlayListView,
  render: function() {
    this.$el.html("");
    RMP.playlist.each((function(_this) {
      return function(model) {
        return _this.$el.append(_this.template(model.toJSON()));
      };
    })(this));
    this.$el.append($("<div class='item more'>Load More</div>"));
    return this.setCurrent(RMP.playlist.current.index, RMP.playlist.current.song);
  },
  setCurrent: function(index, song) {
    this.$(".item").removeClass("active");
    return $(this.$(".item")[index]).addClass("active");
  },
  initialize: function() {
    this.listenTo(RMP.playlist, "add", this.render);
    this.listenTo(RMP.playlist, "remove", this.render);
    this.listenTo(RMP.playlist, "reset", this.render);
    this.listenTo(RMP.dispatcher, "song:change", this.setCurrent);
    if (FLAG_DEBUG) {
      return console.log("PlayListView :: Ready");
    }
  }
});

SortMethodView = Backbone.View.extend({
  events: {
    "click .item": "select"
  },
  getCurrent: function() {
    return this.$("[data-value='" + (RMP.reddit.get('sortMethod')) + "']");
  },
  render: function() {
    this.$(".item").removeClass("active");
    this.getCurrent().addClass("active");
    return this.$(".ui.dropdown").dropdown("set selected", "top:" + (RMP.reddit.get('topMethod')));
  },
  select: function(e) {
    var method, sortMethod, target, topMethod;
    target = $(e.currentTarget);
    method = target.data("value");
    if (method == null) {
      return;
    }
    sortMethod = method;
    topMethod = RMP.reddit.get("topMethod");
    if (method.substr(0, 3) === "top") {
      sortMethod = "top";
      topMethod = method.substr(4);
    }
    RMP.reddit.changeSortMethod(sortMethod, topMethod);
    RMP.dispatcher.trigger("controls:sortMethod", sortMethod, topMethod);
    return this.render();
  },
  initialize: function() {
    return this.render();
  }
});

RMP.playlist = new Playlist;

RMP.playlistview = new PlaylistView({
  el: $(".content.playlist .music.playlist")
});

RMP.sortmethodview = new SortMethodView({
  el: $(".content.playlist .sortMethod")
});

RMP.dispatcher.on("loaded:playlist", function(page) {
  RMP.playlistview.setElement($(".content.playlist .music.playlist"));
  if (RMP.playlist.length > 0) {
    RMP.playlistview.render();
  }
  RMP.sortmethodview.setElement($(".content.playlist .sortMethod"));
  return RMP.sortmethodview.render();
});

CurrentSongView = Backbone.View.extend({
  template: Templates.CurrentSongView,
  events: {
    "click .upvote": "vote",
    "click .downvote": "vote"
  },
  vote: function(e) {
    var dir, id, parent, target;
    target = $(e.currentTarget);
    parent = target.parents(".vote");
    id = parent.attr('id');
    dir = (function() {
      switch (false) {
        case !target.hasClass("active"):
          return 0;
        case !target.hasClass("upvote"):
          return 1;
        case !target.hasClass("docuwnvote"):
          return -1;
      }
    })();
    RMP.reddit.vote(id, dir);
    $(parent.find(".upvote, .downvote")).removeClass("active");
    if (dir === 1 || dir === -1) {
      return target.addClass("active");
    }
  },
  render: function(index, song) {
    var songJSON;
    if (song == null) {
      song = RMP.playlist.current.song;
    }
    if (song == null) {
      return;
    }
    songJSON = song.toJSON();
    this.$el.html(this.template(songJSON));
    $('.self.text').html($($('.self.text').text()));
    if (song.playable === true) {
      $(".current-song-sidebar .title").text(songJSON.title);
      document.title = "" + songJSON.title + " | Reddit Music Player";
      if (song.get("type") === "bandcamp") {
        return $(".current-song-sidebar .image").attr("src", song.get("media").oembed.thumbnail_url);
      } else {
        return $(".current-song-sidebar .image").attr("src", "");
      }
    }
  },
  initialize: function() {
    this.listenTo(RMP.dispatcher, "song:change", this.render);
    if (FLAG_DEBUG) {
      return console.log("CurrentSongView :: Ready");
    }
  }
});

CommentsView = Backbone.View.extend({
  template: Templates.CommentsView,
  events: {
    "click .upvote": "vote",
    "click .downvote": "vote",
    "click .actions .reply": "reply",
    "click .form .add_comment": "add_comment",
    "click .reply_to .close": "reply_close"
  },
  reply: function(e) {
    var id, parent, target, temp;
    target = $(e.currentTarget);
    parent = target.parents(".comment");
    id = parent.attr('id');
    this.reply_id = id;
    this.reply_author = $(parent.find(".author")).text();
    this.$(".reply_to").remove();
    temp = Templates.ReplyTo({
      author: this.reply_author,
      id: this.reply_id
    });
    return this.$el.append(temp);
  },
  reply_close: function(e) {
    var target;
    target = $(e.currentTarget.parentElement);
    this.reply_id = this.reply_author = null;
    return target.remove();
  },
  add_comment: function(e) {
    var id, parent, target, text;
    target = $(e.currentTarget);
    parent = target.parents(".comment");
    id = parent.attr('id');
    if (this.reply_id == null) {
      this.reply_id = RMP.playlist.current.song.get("name");
    }
    text = this.$(".comment_text").val();
    this.$(".comment_text").val("");
    return RMP.reddit.addComment({
      text: text,
      thing_id: this.reply_id,
      callback: (function(_this) {
        return function(reply) {
          RMP.playlist.current.song.set("num_comments", RMP.playlist.current.song.get("num_comments") + 1);
          if (FLAG_DEBUG) {
            console.log(reply);
          }
          return _this.render();
        };
      })(this)
    });
  },
  vote: function(e) {
    var dir, dirClass, dirEl, id, initial, parent, target;
    target = $(e.currentTarget);
    parent = target.parents(".comment");
    id = parent.attr('id');
    dir = (function() {
      switch (false) {
        case !target.hasClass("active"):
          return 0;
        case !target.hasClass("upvote"):
          return 1;
        case !target.hasClass("downvote"):
          return -1;
      }
    })();
    RMP.reddit.vote(id, dir);
    $(parent.find(".upvote, .downvote")).removeClass("active");
    $(parent.find(".ups")).text(parent.data("ups"));
    $(parent.find(".downs")).text(parent.data("downs"));
    if (dir === 1 || dir === -1) {
      dirClass = dir === 1 ? "ups" : "downs";
      dirEl = $(parent.find("." + dirClass));
      initial = parent.data(dirClass);
      dirEl.text(parseInt(initial) + 1);
      return target.addClass("active");
    }
  },
  renderComment: function(comment) {
    var html, time;
    time = new Date();
    time.setTime(parseInt(comment.created_utc) * 1000);
    comment.created_ago = timeSince(time);
    html = $(this.template(comment));
    if (FLAG_DEBUG) {
      console.log(comment);
    }
    if (typeof comment.replies === 'object') {
      html.append(this.parse(comment.replies.data.children));
    }
    return html;
  },
  parse: function(comments) {
    var root;
    root = $("<div class='comments'></div>");
    _.each(comments, (function(_this) {
      return function(comment) {
        return root.append(_this.renderComment(comment.data));
      };
    })(this));
    return root;
  },
  render: function(index, song) {
    var permalink, songJSON;
    if (song == null) {
      song = RMP.playlist.current.song;
    }
    if (song == null) {
      return;
    }
    songJSON = song.toJSON();
    this.$(".num_comments").text(songJSON.num_comments);
    this.$(".comments.overview").html("");
    permalink = songJSON.permalink;
    if (songJSON.num_comments > 0) {
      return RMP.reddit.getComments(permalink, (function(_this) {
        return function(comments_tree) {
          return _.each(comments_tree, function(comment) {
            return _this.$(".comments.overview").append(_this.renderComment(comment.data));
          });
        };
      })(this));
    }
  },
  initialize: function() {
    this.listenTo(RMP.dispatcher, "song:change", this.render);
    if (FLAG_DEBUG) {
      return console.log("CommentsView :: Ready");
    }
  }
});

RMP.currentsongview = new CurrentSongView({
  el: $(".content.playlist .current.song")
});

RMP.commentsview = new CommentsView({
  el: $(".content.playlist .comments.root")
});

RMP.dispatcher.on("loaded:playlist", function(page) {
  RMP.currentsongview.setElement($(".content.song .current.song"));
  RMP.currentsongview.render();
  RMP.commentsview.setElement($(".content.song .comments.root"));
  return RMP.commentsview.render();
});

MusicPlayer = Backbone.Model.extend({
  type: "none"
});

YoutubePlayer = MusicPlayer.extend({
  type: "youtube",
  onPlayerReady: function(e) {
    return e.target.playVideo();
  },
  onPlayerStateChange: function(e) {
    if (FLAG_DEBUG) {
      console.log("YoutubePlayer :: StateChange", e);
    }
    switch (e.data) {
      case YT.PlayerState.UNSTARTED:
        return RMP.dispatcher.trigger("player:unstarted", this);
      case YT.PlayerState.PLAYING:
        return RMP.dispatcher.trigger("player:playing", this);
      case YT.PlayerState.PAUSED:
        return RMP.dispatcher.trigger("player:paused", this);
      case YT.PlayerState.ENDED:
        return RMP.dispatcher.trigger("player:ended", this);
      case YT.PlayerState.CUED:
        return RMP.dispatcher.trigger("player:cued", this);
      case YT.PlayerState.BUFFERING:
        return RMP.dispatcher.trigger("player:buffering", this);
    }
  },
  onError: function(e) {
    if (FLAG_DEBUG) {
      console.error("YoutubePlayer :: Error", e);
    }
    return RMP.dispatcher.trigger("controls:forward");
  },
  events: function() {
    return {
      "onReady": this.onPlayerReady,
      "onStateChange": this.onPlayerStateChange,
      "onError": this.onError
    };
  },
  init: function() {
    var isReady;
    isReady = typeof YT !== "undefined" && YT !== null;
    if (!isReady) {
      throw "Youtube not Ready!";
    }
    return this.player = new YT.Player("player", {
      videoId: this.track.id,
      events: this.events()
    });
  },
  initProgress: function() {
    var getData;
    RMP.dispatcher.trigger("progress:duration", this.player.getDuration());
    getData = (function(_this) {
      return function() {
        RMP.dispatcher.trigger("progress:current", _this.player.getCurrentTime());
        return RMP.dispatcher.trigger("progress:loaded", _this.player.getVideoLoadedFraction());
      };
    })(this);
    if (this.interval == null) {
      this.interval = setInterval(getData, 200);
    }
    if (FLAG_DEBUG) {
      return console.log("YoutubePlayer :: Interval Set :: " + this.interval);
    }
  },
  clean: function() {
    this.player.destroy();
    clearInterval(this.interval);
    this.interval = null;
    this.stopListening();
    this.off();
    return this.trigger("destroy");
  },
  "switch": function(song) {
    this.set(song.attributes);
    this.track = this.attributes.media.oembed;
    this.track.id = this.track.url.substr(31);
    return this.player.loadVideoById(this.track.id);
  },
  playPause: function() {
    if (this.player && (this.player.getPlayerState != null) && (this.player.pauseVideo != null) && (this.player.playVideo != null)) {
      if (this.player.getPlayerState() === 1) {
        return this.player.pauseVideo();
      } else {
        return this.player.playVideo();
      }
    }
  },
  seekTo: function(percentage, seekAhead) {
    return this.player.seekTo(percentage * this.player.getDuration(), seekAhead);
  },
  initialize: function() {
    if (this.$el == null) {
      this.$el = $("#player");
    }
    this.track = this.attributes.media.oembed;
    this.track.id = this.track.url.substr(31);
    this.init();
    this.listenTo(RMP.dispatcher, "player:playing", this.initProgress);
    if (FLAG_DEBUG) {
      console.log("YoutubePlayer :: ", this.track);
    }
    if (FLAG_DEBUG) {
      return console.log("Player :: Youtube");
    }
  }
});

SoundcloudPlayer = MusicPlayer.extend({
  type: "soundcloud",
  events: function() {
    return {
      "playProgress": this.progress_play,
      "play": this.event_trigger("playing"),
      "pause": this.event_trigger("paused"),
      "finish": this.event_trigger("ended")
    };
  },
  progress_play: function(data) {
    RMP.dispatcher.trigger("progress:current", data.currentPosition / 1000);
    return RMP.dispatcher.trigger("progress:loaded", data.loadedProgress);
  },
  playerState: "ended",
  event_trigger: function(ev) {
    return (function(_this) {
      return function(data) {
        _this.player.getDuration(function(duration) {
          return RMP.dispatcher.trigger("progress:duration", duration / 1000);
        });
        _this.playerState = ev;
        return RMP.dispatcher.trigger("player:" + ev, _this);
      };
    })(this);
  },
  playPause: function() {
    return this.player.toggle();
  },
  seekTo: function(percentage, seekAhead) {
    return this.player.getDuration((function(_this) {
      return function(duration) {
        return _this.player.seekTo(percentage * duration);
      };
    })(this));
  },
  "switch": function(song) {
    this.set(song.attributes);
    return this.init((function(_this) {
      return function() {
        return _this.player.load(_this.track.sc.uri, {
          auto_play: true
        });
      };
    })(this));
  },
  setUp: function(callback) {
    var iframe;
    if (this.player == null) {
      if (FLAG_DEBUG) {
        console.log("setting up iframe");
      }
      if ($("#soundcloud").length === 0) {
        iframe = $("<iframe id='soundcloud' src='//w.soundcloud.com/player/?visual=true&url=" + this.track.sc.uri + "'>").appendTo($("#player"));
      }
      this.player = SC.Widget("soundcloud");
      _.each(this.events(), (function(_this) {
        return function(listener, ev) {
          return _this.player.bind(ev, listener);
        };
      })(this));
    }
    if (callback != null) {
      return callback();
    }
  },
  clean: function() {
    this.$el.html("");
    this.stopListening();
    this.off();
    return this.trigger("destroy");
  },
  init: function(callback) {
    var track_id, url, user_id;
    this.track = this.attributes.media.oembed;
    url = decodeURIComponent(decodeURIComponent(this.track.html));
    user_id = url.match(/\/users\/(\d+)/);
    if (user_id != null) {
      this.track.type = "users";
    }
    if (user_id != null) {
      this.track.id = user_id[1];
    }
    track_id = url.match(/\/tracks\/(\d+)/);
    if (track_id != null) {
      this.track.type = "tracks";
    }
    if (track_id != null) {
      this.track.id = track_id[1];
    }
    track_id = url.match(/\/playlists\/(\d+)/);
    if (track_id != null) {
      this.track.type = "playlists";
    }
    if (track_id != null) {
      this.track.id = track_id[1];
    }
    console.log(this.track);
    return $.ajax({
      url: "" + API.Soundcloud.base + "/" + this.track.type + "/" + this.track.id + ".json?callback=?",
      jsonp: "callback",
      dataType: "jsonp",
      data: {
        client_id: API.Soundcloud.key
      },
      success: (function(_this) {
        return function(sctrack) {
          if (FLAG_DEBUG) {
            console.log(sctrack);
          }
          if (!sctrack.streamable) {
            throw "not streamable";
          }
          _this.track.sc = sctrack;
          RMP.progressbar.enableSoundcloud(_this.track.sc.waveform_url);
          return _this.setUp(callback);
        };
      })(this)
    });
  },
  initialize: function() {
    if (this.$el == null) {
      this.$el = $("#player");
    }
    return this.init((function(_this) {
      return function() {
        return _this.player.load(_this.track.sc.uri, {
          auto_play: true
        });
      };
    })(this));
  }
});

MP3Player = MusicPlayer.extend({
  type: "mp3",
  events: function() {
    return {
      "progress": this.progress_play(),
      "play": this.event_trigger("playing"),
      "playing": this.event_trigger("playing"),
      "pause": this.event_trigger("paused"),
      "ended": this.event_trigger("ended"),
      "durationchange": this.setDuration()
    };
  },
  setDuration: function() {
    return (function(_this) {
      return function() {
        return RMP.dispatcher.trigger("progress:duration", _this.player.duration);
      };
    })(this);
  },
  progress_play: function(data) {
    return (function(_this) {
      return function() {
        RMP.dispatcher.trigger("progress:loaded", _this.player.buffered.end(0) / _this.player.duration);
        return RMP.dispatcher.trigger("progress:current", _this.player.currentTime);
      };
    })(this);
  },
  playerState: "ended",
  event_trigger: function(ev) {
    return (function(_this) {
      return function(data) {
        _this.playerState = ev;
        return RMP.dispatcher.trigger("player:" + ev, _this);
      };
    })(this);
  },
  init: function() {
    if (FLAG_DEBUG) {
      console.log("MP3Player :: Making Player");
    }
    this.player = $("<audio controls autoplay='true' src='" + this.attributes.streaming_url + "'/>").appendTo(this.$el)[0];
    if (FLAG_DEBUG) {
      console.log(this.$el);
    }
    this.player.play();
    return _.each(this.events(), (function(_this) {
      return function(listener, ev) {
        return $(_this.player).bind(ev, listener);
      };
    })(this));
  },
  clean: function(justTheElement) {
    $(this.player).remove();
    this.$el.html("");
    if (justTheElement == null) {
      this.stopListening();
    }
    if (justTheElement == null) {
      this.trigger("destroy");
    }
    if (!justTheElement) {
      return this.off;
    }
  },
  "switch": function(song) {
    this.set(song.attributes);
    this.set("streaming_url", this.get("url"));
    this.clean(true);
    return this.init();
  },
  playPause: function() {
    if (this.playerState === "playing") {
      return this.player.pause();
    } else {
      return this.player.play();
    }
  },
  seekTo: function(percentage, seekAhead) {
    return this.player.currentTime = percentage * this.player.duration;
  },
  initialize: function() {
    if (this.$el == null) {
      this.$el = $("#player");
    }
    this.$el.html("");
    this.set("streaming_url", this.get("url"));
    return this.init();
  }
});

BandcampPlayer = MP3Player.extend({
  type: "bandcamp",
  getID: function(callback) {
    return $.ajax({
      url: "" + API.Bandcamp.base + "/url/1/info",
      jsonp: "callback",
      dataType: "jsonp",
      data: {
        key: API.Bandcamp.key,
        url: this.get("url")
      },
      success: (function(_this) {
        return function(data) {
          _this.set(data);
          return callback(data);
        };
      })(this)
    });
  },
  getAlbumInfo: function(callback) {
    return $.ajax({
      url: "" + API.Bandcamp.base + "/album/2/info",
      jsonp: "callback",
      dataType: "jsonp",
      data: {
        key: API.Bandcamp.key,
        album_id: this.get("album_id")
      },
      success: (function(_this) {
        return function(data) {
          _this.set(data);
          _this.set(data.tracks[0]);
          return callback(data);
        };
      })(this)
    });
  },
  getTrackInfo: function(callback) {
    return $.ajax({
      url: "" + API.Bandcamp.base + "/track/3/info",
      jsonp: "callback",
      dataType: "jsonp",
      data: {
        key: API.Bandcamp.key,
        track_id: this.get("track_id")
      },
      success: (function(_this) {
        return function(data) {
          _this.set(data);
          return callback(data);
        };
      })(this)
    });
  },
  errorAvoidBandCamp: function(ids) {
    console.error("BandCampPlayer :: Error", ids.error_message);
    SongBandcamp.prototype.playable = false;
    _.each(RMP.playlist.where({
      type: "bandcamp"
    }), function(item) {
      return item.set("playable", false);
    });
    return RMP.dispatcher.trigger("controls:forward");
  },
  getInfo: function(callback) {
    return this.getID((function(_this) {
      return function(ids) {
        if (ids.error != null) {
          return _this.errorAvoidBandCamp(ids);
        }
        if (FLAG_DEBUG) {
          console.log("BandCampPlayer :: IDs Get");
        }
        if (ids.track_id == null) {
          if (FLAG_DEBUG) {
            console.log("BandCampPlayer :: No Track ID", ids);
          }
          if (ids.album_id != null) {
            if (FLAG_DEBUG) {
              console.log("BandCampPlayer :: Get Album Info");
            }
            return _this.getAlbumInfo(callback);
          }
        } else {
          if (FLAG_DEBUG) {
            console.log("BandCampPlayer :: Get Track Info");
          }
          return _this.getTrackInfo(callback);
        }
      };
    })(this));
  },
  "switch": function(song) {
    this.set(song.attributes);
    this.clean(true);
    return this.getInfo((function(_this) {
      return function() {
        RMP.dispatcher.trigger("progress:duration", _this.get("duration"));
        return _this.init();
      };
    })(this));
  },
  initialize: function() {
    if (this.$el == null) {
      this.$el = $("#player");
    }
    this.$el.html("");
    return this.getInfo((function(_this) {
      return function() {
        RMP.dispatcher.trigger("progress:duration", _this.get("duration"));
        return _this.init();
      };
    })(this));
  }
});

VimeoPlayer = MusicPlayer.extend({
  type: "vimeo",
  events: function() {},
  setDuration: function() {},
  progress_play: function(data) {},
  playerState: "ended",
  event_trigger: function(ev) {},
  init: function() {
    var player;
    if (FLAG_DEBUG) {
      console.log("VimeoPlayer :: Making Player");
    }
    player = $("<iframe src='http://player.vimeo.com/video/" + this.track.id + "?api=1&autoplay=1' webkitallowfullscreen mozallowfullscreen allowfullscreen frameborder='0'>");
    this.$el.append(player);
    this.player = player[0].contentWindow;
    return this.player.postMessage({
      "method": "play"
    }, "*");
  },
  clean: function(justTheElement) {
    $("#player iframe").remove();
    this.$el.html("");
    if (justTheElement == null) {
      this.stopListening();
    }
    if (justTheElement == null) {
      this.trigger("destroy");
    }
    if (!justTheElement) {
      return this.off;
    }
  },
  "switch": function(song) {
    var url, video_id;
    this.set(song.attributes);
    this.track = this.attributes.media.oembed;
    url = decodeURIComponent(decodeURIComponent(this.track.html));
    video_id = url.match(/\/video\/(\d+)/);
    if (video_id != null) {
      this.track.id = video_id[1];
    }
    this.clean(true);
    return this.init();
  },
  playPause: function() {
    if (this.playerState === "playing") {
      return this.player.postMessage({
        method: "pause"
      }, "*");
    } else {
      return this.player.postMessage({
        method: "play"
      }, "*");
    }
  },
  seekTo: function(percentage, seekAhead) {},
  initialize: function() {
    var url, video_id;
    if (this.$el == null) {
      this.$el = $("#player");
    }
    this.$el.html("");
    this.track = this.attributes.media.oembed;
    url = decodeURIComponent(decodeURIComponent(this.track.html));
    video_id = url.match(/\/video\/(\d+)/);
    if (video_id != null) {
      this.track.id = video_id[1];
    }
    return this.init();
  }
});

PlayerController = Backbone.Model.extend({
  change: function(index, song) {
    if (this.controller == null) {
      return this.controller = (function() {
        switch (false) {
          case song.type !== "youtube":
            return new YoutubePlayer(song.attributes);
          case song.type !== "soundcloud":
            return new SoundcloudPlayer(song.attributes);
          case song.type !== "bandcamp":
            return new BandcampPlayer(song.attributes);
          case song.type !== "vimeo":
            return new VimeoPlayer(song.attributes);
          case song.type !== "mp3":
            return new MP3Player(song.attributes);
          default:
            throw "Not A Song Sent to Player Controller";
        }
      })();
    } else {
      if (song.playable === true) {
        if (this.controller.type === song.type) {
          if (this.controller.get("id") !== song.get("id")) {
            return this.controller["switch"](song);
          }
        } else {
          this.controller.clean();
          this.controller = null;
          return this.change(index, song);
        }
      }
    }
  },
  playPause: function(e) {
    if (this.controller == null) {
      return;
    }
    if (FLAG_DEBUG) {
      console.log("PlayerController : PlayPause");
    }
    return this.controller.playPause();
  },
  seekTo: function(percentage, seekAhead) {
    if (this.controller == null) {
      return;
    }
    return this.controller.seekTo(percentage, seekAhead);
  },
  initialize: function() {
    this.listenTo(RMP.dispatcher, "song:change", this.change);
    this.listenTo(RMP.dispatcher, "controls:play", this.playPause);
    return this.listenTo(RMP.dispatcher, "progress:set", this.seekTo);
  }
});

RMP.player = new PlayerController;

RMP.dispatcher.once("app:main", function() {
  $("<script src='https://www.youtube.com/iframe_api' />").appendTo($(".scripts"));
  return $("<script src='https://w.soundcloud.com/player/api.js' />").appendTo($(".scripts"));
});

onYouTubeIframeAPIReady = function() {
  if (FLAG_DEBUG) {
    console.log("Youtube :: iFramed");
  }
  return RMP.dispatcher.trigger("youtube:iframe");
};

KeyboardController = Backbone.Model.extend({
  defaults: {
    shifted: false
  },
  send: function(command, e) {
    return RMP.dispatcher.trigger(command, e);
  },
  initialize: function() {
    $("body").keyup((function(_this) {
      return function(e) {
        if (_this.get("shifted") === true) {
          if (e.keyCode === 40) {
            _this.send("controls:forward", e);
          } else if (e.keyCode === 39) {
            _this.send("controls:forward", e);
          } else if (e.keyCode === 37) {
            _this.send("controls:backward", e);
          } else if (e.keyCode === 38) {
            _this.send("controls:backward", e);
          }
          if (e.keyCode === 32) {
            _this.send("controls:play", e);
            e.preventDefault();
          }
        }
        if (e.keyCode === 17) {
          return _this.set("shifted", false);
        }
      };
    })(this));
    return $("body").keydown((function(_this) {
      return function(e) {
        if (e.keyCode === 17) {
          return _this.set("shifted", true);
        }
      };
    })(this));
  }
});

RMP.keyboard = new KeyboardController;

//# sourceMappingURL=main.js.map
