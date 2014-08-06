
banner = "// Copyright © 2014 Ilias Ismanalijev \n
// \n
// This program is free software: you can redistribute it and/or modify \n
// it under the terms of the GNU Affero General Public License as \n
// published by the Free Software Foundation, either version 3 of the \n
// License, or (at your option) any later version. \n
//  \n
// This program is distributed in the hope that it will be useful, \n
// but WITHOUT ANY WARRANTY; without even the implied warranty of \n
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the \n
// GNU Affero General Public License for more details."


module.exports = (grunt) =>
	grunt.initConfig
		less:
			app:
				options:
					compress: true
					cleancss: true
					report: "gzip"
				files:
					"app/css/style.css": "src/less/style.less"
		coffee:
			compile:
				options:
					join: true
					sourceMap: true
					bare: true
				files: 
					"app/js/main.js": ["src/coffee/main.coffee", "src/coffee/config.coffee", "src/coffee/templates.coffee", "src/coffee/reddit.coffee", "src/coffee/authentication.coffee",  "src/coffee/controls.coffee", "src/coffee/ui.coffee", "src/coffee/main/subreddits.coffee", "src/coffee/main/playlist.coffee", "src/coffee/main/song.coffee", "src/coffee/player.coffee", "src/coffee/options.coffee", "src/coffee/main/search.coffee", "src/coffee/main/remote.coffee", "src/coffee/keyboard.coffee"]
		uglify:
			target:
				options:
					mangle: false
					sourceMap: true
					sourceMapIn: "app/js/main.js.map"
					banner: banner
				files:
					"app/js/main.min.js": ["app/js/main.js"]
		watch:
			less:
				files: ["src/less/*"]
				tasks: ["less"]
			coffee:
				files: ["src/coffee/*", "src/coffee/*/*"]
				tasks: ["coffee", "uglify"]
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
	grunt.registerTask "default", ["coffee", "uglify", "less", "watch"]
	grunt.registerTask "build", ["coffee", "uglify", "less"]