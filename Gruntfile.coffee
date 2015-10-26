
banner = '// Copyright © 2014-2015 Ilias Ismanalijev \n
// \n
// This program is free software: you can redistribute it and/or modify \n
// it under the terms of the GNU Affero General Public License as \n
// published by the Free Software Foundation, either version 3 of the \n
// License, or (at your option) any later version. \n
//	\n
// This program is distributed in the hope that it will be useful, \n
// but WITHOUT ANY WARRANTY; without even the implied warranty of \n
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the \n
// GNU Affero General Public License for more details.\n'


module.exports = (grunt) ->
	coffeeFiles = [
		'main',
		'util',
		'config',
		'templates',
		'reddit',
		'authentication',
		'controls',
		'ui',
		'main/subreddits',
		'main/playlist',
		'main/song',
		'player',
		'options',
		'main/search',
		'main/remote',
		'keyboard',
		'messag'
	].map (i) -> "src/coffee/#{i}.coffee"

	grunt.initConfig
		less:
			app:
				options:
					compress: true
					cleancss: true
					report: 'gzip'
				files:
					'app/css/style.css': 'src/less/style.less'

		coffee:
			compile:
				options:
					join: true
					sourceMap: true
					bare: true
				files:
					'app/js/main.js': coffeeFiles

		coffeelint:
			app: coffeeFiles
			server: ['server/*.coffee', 'server/controller/*.coffee', 'server/config/*.coffee']
			options:
				configFile: './coffeelint.json'

		uglify:
			production:
				options:
					mangle: false
					sourceMap: false
					banner: banner
				files:
					'app/js/main.min.js': ['app/js/main.js']

		clean:
			all: ['app/css/style.css', 'app/js/main.*']
			production: ['app/js/*.map', 'app/js/main.js', 'app/js/*.coffee']

		watch:
			less:
				files: ['src/less/*']
				tasks: ['less']
			coffee:
				files: ['src/coffee/*', 'src/coffee/*/*']
				tasks: ['coffeelint', 'coffee', 'uglify']

			livereload:
				options:
					livereload: true
				files: ['app/css/*', 'app/js/*', 'app/jade/**']

	grunt.loadNpmTasks 'grunt-contrib-coffee'
	grunt.loadNpmTasks 'grunt-contrib-watch'
	grunt.loadNpmTasks 'grunt-contrib-less'
	grunt.loadNpmTasks 'grunt-contrib-uglify'
	grunt.loadNpmTasks 'grunt-coffeelint'
	grunt.loadNpmTasks 'grunt-contrib-clean'

	grunt.registerTask 'c', ['coffee']
	grunt.registerTask 'l', ['less']
	grunt.registerTask 'default', ['coffee', 'less', 'watch']
	grunt.registerTask 'build', ['coffee', 'uglify', 'less', 'clean:production']
	grunt.registerTask 'test', ['coffeelint', 'clean:all']
