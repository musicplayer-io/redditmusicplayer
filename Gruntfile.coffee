
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

path = require 'path'

module.exports = (grunt) ->
	coffeeFiles = [
		'Constants.coffee',
		'config.coffee',
		'Util.coffee',
		'Store.coffee',
		'Templates.coffee',
		'controllers/*.coffee',
    'models/*.coffee',
		'players/*.coffee',
    'collections/*.coffee',
    'views/*.coffee',
		'RMP.coffee',
	].map (i) -> "src/coffee/#{i}"

	remapFilter = (alias, dirname, basename) ->
		path.join(dirname, basename.replace(/^(.*)\.coffee$/, '$1'))

	grunt.initConfig
		less:
			app:
				options:
					compress: true
					cleancss: true
					report: 'gzip'
				files:
					'app/css/style.css': 'src/less/style.less'

		browserify:
			app:
				files:
					'app/js/main.js': coffeeFiles
				options:
					#browserifyOptions:
					#	debug: true
					banner: banner
					plugin: [['remapify', [
							{
								src: '*.coffee',
								expose: 'collections'
								cwd: "#{__dirname}/src/coffee/collections/",
								filter: remapFilter
							},
							{
								src: '*.coffee',
								expose: 'views',
								cwd: "#{__dirname}/src/coffee/views/",
								filter: remapFilter
							},
							{
								src: '*.coffee',
								expose: 'models',
								cwd: "#{__dirname}/src/coffee/models/",
								filter: remapFilter
							},
							{
								src: '*.coffee',
								expose: 'controllers',
								cwd: "#{__dirname}/src/coffee/controllers/",
								filter: remapFilter
							},
							{
								src: '*.coffee',
								expose: 'players',
								cwd: "#{__dirname}/src/coffee/players/",
								filter: remapFilter
							},
							{
								src: '*.coffee',
								expose: '',
								cwd: "#{__dirname}/src/coffee/",
								filter: remapFilter
							}
						]]]
					transform: ['coffeeify']

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
				tasks: ['coffeelint', 'browserify', 'uglify']

			livereload:
				options:
					livereload: true
				files: ['app/css/*', 'app/js/*', 'app/jade/**']

	grunt.loadNpmTasks 'grunt-browserify'
	grunt.loadNpmTasks 'grunt-contrib-watch'
	grunt.loadNpmTasks 'grunt-contrib-less'
	grunt.loadNpmTasks 'grunt-contrib-uglify'
	grunt.loadNpmTasks 'grunt-coffeelint'
	grunt.loadNpmTasks 'grunt-contrib-clean'

	grunt.registerTask 'default', ['browserify', 'less', 'watch']
	grunt.registerTask 'build', ['browserify', 'uglify', 'less', 'clean:production']
	grunt.registerTask 'test', ['coffeelint', 'clean:all']
