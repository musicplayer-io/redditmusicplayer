module.exports = (grunt) =>
	grunt.initConfig
		less:
			app:
				options:
					style: "compressed"
					compress: true
					yuicompress: true
				src: ["src/less/style.less"]
				dest: "app/css/style.css"
		coffee:
			compile:
				options:
					join: true
					sourceMap: true
					bare: true
				files: 
					"app/js/main.js": ["src/coffee/main.coffee", "src/coffee/config.coffee", "src/coffee/templates.coffee", "src/coffee/reddit.coffee", "src/coffee/authentication.coffee",  "src/coffee/controls.coffee", "src/coffee/sidebar.coffee", "src/coffee/ui.coffee", "src/coffee/main/subreddits.coffee", "src/coffee/main/playlist.coffee", "src/coffee/main/song.coffee", "src/coffee/player.coffee", "src/coffee/options.coffee", "src/coffee/keyboard.coffee"]
		uglify:
			target:
				options:
					mangle: false
				files:
					"app/js/main.min.js": ["app/js/main.js"]
		watch:
			less:
				files: ["src/less/*"]
				tasks: ["less"]
			coffee:
				files: ["src/coffee/*", "src/coffee/*/*"]
				tasks: ["coffee"]
			livereload:
				options:
					livereload: true
				files: ["app/css/*", "app/js/*", "app/jade/**"]

	grunt.loadNpmTasks "grunt-contrib-coffee"
	grunt.loadNpmTasks "grunt-contrib-watch"
	grunt.loadNpmTasks "grunt-contrib-less"
	grunt.loadNpmTasks "grunt-contrib-uglify"

	grunt.registerTask "c", ["coffee"]
	grunt.registerTask "l", ["less"]
	grunt.registerTask "default", ["coffee", "less", "watch"]
	grunt.registerTask "build", ["coffee", "uglify", "less"]