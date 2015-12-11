module.exports =
	SubredditCurrentPlayListView: _.template("
			<a class='active subreddit item' data-category='<%= category %>' data-value='<%= name %>'>
				<%= text %>
				<i class='icon add'></i>
				<i class='icon remove'></i>
			</a>
		")
	PlayListView: _.template("
			<div class='ui item <%= type %>' data-id='<%= id %>'>
				<% if (thumbnail) { %>
					<% if (thumbnail == 'self' || thumbnail == 'default') { %>
						<% if (type == 'mp3') { %>
							<i class='left floated icon music large thumbnail'/>
						<% } else { %>
							<i class='left floated icon chat outline large thumbnail'/>
						<% } %>
					<% } else if (thumbnail == 'nsfw' ){%>
						<i class='left floated icon spy large thumbnail'/>
					<% } else {%>
						<img src='<%= thumbnail %>' class='ui image tiny rounded left floated thumbnail'/>
					<% } %>
				<% } %>
				<div class='content'>
					<div class='title'><%= title %></div>
					<% if (playable) { %>
					<span class='ups'><%= ups %></span> •
					<span class='author'><%= author %></span> in
					<span class='subreddit'><%= subreddit %></span> •
					<span class='created'><%= created_ago %></span> •
					<span class='origin'><%= domain %></span>
					<% if (num_comments > 0) { %>
						• <span class='comments'><%= num_comments %> <i class='icon small chat'></i></span>
					<% } %>
					<% } %>
				</div>
			</div>
		")
	CurrentSongView: _.template("
			<% if (media) { %>
				<% if (url.indexOf('youtu') == -1 && url.indexOf('vimeo') == -1 && url.indexOf('soundcloud') == -1) { %>
					<img class='ui image fluid' src='<%= media.oembed.thumbnail_url %>' />
				<% } %>
			<% } %>
			<% if (url.indexOf('i.imgur') >= 0) { %>
				<a class='ui image fluid' href='<%= url %>' target='_blank'>
					<img src='<%= url %>' />
				</a>
			<% } %>
			<h3 class='ui header title'><%= title %></h3>

			<div class='ui inverted actions statistics vote' id='<%= name %>'>
				<div class='ui inverted statistic upvote'>
					<div class='value'><i class='icon large up arrow'></i></div>
					<div class='label'>Upvote</div>
				</div>
				<div class='ui inverted statistic downvote'>
					<div class='value'><i class='icon large down arrow'></i></div>
					<div class='label'>Downvote</div>
				</div>
				<a class='ui inverted statistic' href='http://www.reddit.com<%= permalink %>' target='_blank'>
					<span class='value'><i class='icon large reddit'></i></span>
					<span class='label'>Reddit</span>
				</a>
				<% if (type == 'link') { %>
					<a target='_blank' class='ui inverted statistic' href='<%= url %>'>
						<span class='value'><i class='external url large icon'></i></span>
						<span class='label'>External Link</span>
					</a>
				<% } %>
				<% if (media) { %>
					<% if (media.type == 'soundcloud.com') { %>
						<a href='<%= media.oembed.author_url %>' target='_blank' class='ui inverted statistic'>
							<span class='value'><i class='icon large soundcloud'></i></span>
							<span class='label'><%= media.oembed.author_name %></span>
						</a>
					<% } else if (media.type == 'vimeo.com') { %>
						<a href='<%= media.oembed.author_url %>' target='_blank' class='ui inverted statistic'>
							<span class='value'><i class='icon large vimeo'></i></span>
							<span class='label'><%= media.oembed.author_name %></span>
						</a>
					<% } else if (media.type.indexOf('youtu') !== -1) { %>
						<a href='<%= media.oembed.author_url %>' target='_blank' class='ui inverted statistic'>
							<span class='value'><i class='icon large youtube'></i></span>
							<span class='label'><%= media.oembed.author_name %></span>
						</a>
					<% } %>
				<% } %>
			</div>

			<% if (media) { %>
					<p><%= media.oembed.description %></p>
			<% } %>

			<% if (is_self) { %>
				<div class='self text'>
					<%= selftext_html %>
				</div>
				<div class='ui divider'></div>
			<% } %>

			<div class='ui inverted mini statistics'>
				<div class='ui inverted orange statistic'>
					<div class='value'><%= score %></div>
					<div class='label'>Karma</div>
				</div>
				<div class='ui inverted statistic'>
					<a href='http://reddit.com/u/<%=author%>' target='_blank' class='value author'>/u/<%= author %></a>
					<div class='label'>Author</div>
				</div>
				<div class='ui inverted statistic' title='<%= new Date(created_utc * 1000).toLocaleString() %>'>
					<div class='value date'><%= created_ago %></div>
					<div class='label'>Age</div>
				</div>
				<div class='ui inverted statistic'>
					<div class='value'>/r/<%= subreddit %></div>
					<div class='label'>Subreddit</div>
				</div>
			</div>
		")
	CommentsView: _.template("
			<div class='comment' id='<%= name %>' data-ups='<%= ups %>' data-downs='<%= downs %>'>
				<div class='vote'>
					<div class='upvote<% if (likes === true) print(' active') %>'><i class='icon up arrow'></i></div>
					<div class='downvote<% if (likes === false) print(' active') %>'><i class='icon down arrow'></i></div>
				</div>
				<div class='content expand'>
					<% if (distinguished && distinguished === 'moderator') { %>
					<a class='author moderator'><%= author %> [M]</a>
					<% } else if (isSubmitter) { %>
					<a class='author submitter'><%= author %> [S]</a>
					<% } else { %>
					<a class='author'><%= author %></a>
					<% } %>
					<div class='metadata'>
						<a class='expand'>Expand <i class='icon plus'></i></a>
					</div>
				</div>
				<div class='content'>
					<% if (distinguished && distinguished === 'moderator') { %>
					<a class='author moderator' href='http://reddit.com/u/<%= author %>' target='_blank'><%= author %> [M]</a>
					<% } else if (isSubmitter) { %>
					<a class='author submitter' href='http://reddit.com/u/<%= author %>' target='_blank'><%= author %> [S]</a>
					<% } else { %>
					<a class='author' href='http://reddit.com/u/<%= author %>' target='_blank'><%= author %></a>
					<% } %>
					<div class='metadata'>
						<span class='ups'><%= score %></span>
						<span class='date' title='<%= new Date(created_utc * 1000).toLocaleString() %>'><%= created_ago %> ago</span>
					</div>
					<div class='text'></div>
					<div class='actions'>
						<a class='collapse'>Collapse <i class='icon minus'></i></a>
						<a class='permalink' target='_blank' href='<%=permalink%>'>Permalink</a>
						<a class='reply'>Reply</a>
					</div>
				</div>
			</div>
		")
	ReplyTo: _.template("
			<span class='ui reply_to label inverted black fluid' id='<%= id %>'>
				Replying to <%= author %>
				<i class='icon close'></i>
			</span>
		")
	AuthenticationView: _.template("
			<div class='item ui dropdown reddit account' id='<%= id %>'>
				<i class='icon user'></i>
				<%= name %>
				<i class='icon dropdown'></i>
				<div class='menu'>
					<div class='item'>
						<%= link_karma %> Link Karma
					</div>
					<div class='item'>
						<%= comment_karma %> Comment Karma
					</div>
					<% if (is_gold == true) { %>
						<div class='item'>
							Gold Member
						</div>
					<% } %>
					<a class='item sign-out' href='/logout'>
						Log Out
					</a>
				</div>
			</div>
		")
	MessageView: _.template("
			<div data-id='<%= cid %>' class='ui message inverted <%= type %>' data-type='<%= type %>' data-status='<%= status %>'>
				<span class='text'><%= text %></span>
				<div class='ui buttons'>
					<% for (btn of buttons) { %>
						<a data-id='<%= buttons.indexOf(btn) %>' class='inverted ui button <%= btn.className %>' <% if (btn.url) { %> href='<%= btn.url %>' target='_blank' <% } %>>
							<% if (btn.icon) { %>
								<i class='<%= btn.icon %> icon'></i>
							<% } else { %>
								<%= btn.text %>
							<% } %>
						</a>
					<% } %>
				</div>
			</div>
		")
