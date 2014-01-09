		// Last FM

			$(".lastfm-btn").click(function() {
				var lastfm_key = "5627a9006241747e2d462a15685b27ac";
				var secret = "e4ac152e4201f7032a020b8e5f70495a";
				var user = $(".lastfm-user input").val();
				var pass = $(".lastfm-pass input").val();
				var sig = "api_key"+lastfm_key+"methodauth.getMobileSessionpassword"+pass+"username"+user+secret;
				var md5_sig = hex_md5(sig);
				$.post("https://ws.audioscrobbler.com/2.0/", {
					method: "auth.getMobileSession",
					username: user,
					password: pass,
					api_key: lastfm_key,
					api_sig: md5_sig
				}, function(data) {
					var lastData = $(data);
					Options.set("lastfm_name", lastData.find("name").text());
					Options.set("lastfm_key", lastData.find("key").text());
					isLoggedInLastFM();
				})
			})

			$(".lastfm-logout-btn").click(function() {
				Options.clear("lastfm_key");
				Options.clear("lastfm_name");
				$(".lastfm.log-in").show();
				$(".lastfm.logged-in").hide();

				$(".lastfm-user input").val("");
				$(".lastfm-pass input").val("");
			})


			// Subreddits
				var makeDefaultSubreddits = function() {
					var root =  $(".subreddits-default");
					root.html("");
					var template = $(".templates [type='html/subredditlabel']").html();
					var defaultSubs = Options.get("subreddits");
					for (var i = defaultSubs.length - 1; i >= 0; i--) {
						var sub = {"sub": defaultSubs[i], "name": defaultSubs[i], "icon": "remove"};
						var el = $($.render(template, sub));
						el.appendTo(root);
						el.click(removeDefaultSub);
					};
				}
				var addDefaultSub = function(e) {
					var sub = $(this).data("sub");
					if (Options.get("subreddits").indexOf(sub) === -1) {
						var tOptions = Options.get("subreddits");
						tOptions.push(sub.toLowerCase());
						Options.set("subreddits", tOptions);
					}
					makeDefaultSubreddits();
				}

				var removeDefaultSub = function(e) {
					var sub = $(this).data("sub");
					if (Options.get("subreddits").indexOf(sub) > -1) {
						var tOptions = Options.get("subreddits");
						tOptions.splice(Options.get("subreddits").indexOf(sub), 1);
						Options.set("subreddits", tOptions);
					}
					makeDefaultSubreddits();
				}

				makeDefaultSubreddits();

				$(".subreddits-add input").keyup(function() {
					var value = $(this).val();
					var root =  $(".subreddits-search-add");
					var template = $(".templates [type='html/subredditlabel']").html();
					root.html("");
					root.show("fade up in");
					if (value.length >= 2) {
						for (var i = Options.subreddits.length - 1; i >= 0; i--) {
							var sub = Options.subreddits[i];
							if (sub.fuzzy(value)) {
								var string = sub.split("");
								var marks = sub.fuzzyMark(value);
								for (var n = 0; n < string.length; n++) {
									for (var m = 0; m < marks.length; m++) {
										var mark = marks[m];
										if (n==mark) {
											string[n] = "<b>"+ string[n] +"</b>";
										}
									};
								};
								var subData = {"sub": sub, "name": string.join(""), "icon": "add"};
								var el = $($.render(template, subData));
								el.appendTo(root);
								el.click(addDefaultSub);
							}
						};
					}
						
				})
				$(".subreddits-add input").blur(function() {
					var root =  $(".subreddits-search-add");
					root.transition({
						animation : 'fade up out',
						duration  : '200ms',
						complete  : function() {
							root.html("");
						}
					});
					$(".subreddits-add input").val("");
				});

