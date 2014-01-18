//     Reddit Music Player
//     Copyright (C) 2014  Ilias Ismanalijev

//     This program is free software: you can redistribute it and/or modify
//     it under the terms of the GNU Affero General Public License as
//     published by the Free Software Foundation, either version 3 of the
//     License, or (at your option) any later version.

//     This program is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU Affero General Public License for more details.

//     You should have received a copy of the GNU Affero General Public License
//     along with this program.  If not, see http://www.gnu.org/licenses/

"use strict";

module.exports = function (grunt) {
	var modules = [
		"music", "players",
		"content", "progressbar", "subreddits",
		"options", "events"
	];

	var getModules = function () {
		// returns app/js/modules/music.js:./js/modules/music
		var moduleList = [];
		for (var i = modules.length - 1; i >= 0; i--) {
			var module = "app/js/modules/" + modules[i] + ".js:./js/modules/" + modules[i];
			moduleList.push(module);
		}
		return moduleList.join(",");
	};

	var getModulesChrome = function () {
		// returns app/js/modules/music.js:./js/modules/music
		var moduleList = [];
		for (var i = modules.length - 1; i >= 0; i--) {
			var module = "chrome/js/modules/" + modules[i] + ".js:./js/modules/" + modules[i];
			moduleList.push(module);
		}
		return moduleList.join(",");
	};

	grunt.initConfig({
		// JSHINT
		jshint: {
			files: ['Gruntfile.js', 'server/*.js', 'app/js/main.js', 'app/js/modules/*.js'],
			options: {
				jshintrc: '.jshintrc'
			}
		},
		// JADE - MAIN
		jade: {
			compile: {
				options: {
					data: {
						debug: false
					}
				},
				files: {
					"app/main.html": ["src/jade/native.jade"]
				}
			},
			chrome: {
				options: {
					data: {
						debug: false
					}
				},
				files: {
					"chrome/main.html": ["src/jade/chrome.jade"],
					"chrome/sandbox.html": ["src/jade/sandbox.jade"]
				}
			}
		},
		// LESS
		less: {
			dev: {
				src: ['src/less/style.less'],
				dest: 'app/css/style.css',
				options: {
					style: "compressed",
					compress: true,
					yuicompress: true
				},
			},
			hompage: {
				src: ['src/less/homepage.less'],
				dest: 'app/css/homepage.css',
				options: {
					style: "compressed",
					compress: true,
					yuicompress: true
				},
			},
		},
		// NATIVE -> BROWSER
		browserify: {
			dist: {
				src: ['app/js/main.js'],
				dest: 'app/js/browser.js',
				options: {
					alias: getModules()
				}
			},
			chrome: {
				src: ['chrome/js/main.js'],
				dest: 'chrome/js/browser.js',
				options: {
					alias: getModulesChrome()
				}
			}
		},
		// LiVERELOAD & WATCH
		watch: {
			less: {
				files: ['src/less/*'],
				tasks: ['less']
			},
			jade: {
				files: ["src/jade/*", "src/jade/*/*"],
				tasks: ["jade"]
			},
			browserify: {
				files: ["app/js/*", "app/js/*/*"],
				tasks: ["browserify"]
			},
			livereload: {
				options: { livereload: true },
				files: ['app/css/*', "app/fonts/*", "app/img/*", "app/js/lib/*", "app/js/modules/*", "app/js/main.js", "app/js/native.js", "app/main.html"],
			},
		},
		// Removing chrome builds
		clean: {
			before: ["chrome/sandbox.html", "chrome/main.html", "chrome/css", "chrome/js", "chrome/img", "chrome/fonts"],
			one: ["chrome/js/modules/players.js", "chrome/js/modules/players.js"]
		},
		// Then placing them back
		copy: {
			one: {
				files: [
					{expand: true, cwd: 'app/', src: ['**/*'], dest: 'chrome/'},
				],
				options: {
					// array of ignored paths, can be specific files or a glob
					ignore: [
						"app/node_modules",
						'app/package.json',
						'app/js/native.js'
					]
				}
			},
			two: {
				files: [
					{expand: true, cwd: 'src/chrome/', src: ['**/*', "js/modules/*.js"], dest: 'chrome/'},
				],
				options: {
					// array of ignored paths, can be specific files or a glob
					ignore: [
						"app/node_modules",
						'app/package.json',
						'app/js/native.js'
					]
				}
			}
		},
		uglify: {
			options: {
				mangle: false
			},
			my_target: {
				files: {
					'app/js/browser.js': ['app/js/browser.js']
				}
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks("grunt-contrib-less");
	grunt.loadNpmTasks("grunt-contrib-watch");
	// Browser
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-browserify');
	// Chrome
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('live', ["jshint", "less", "jade", "browserify:dist", "watch"]);
	grunt.registerTask('server', ["jshint", "less", "browserify:dist"]);
	grunt.registerTask('cleanup', ["jshint", "clean:before"]);
	grunt.registerTask('build', ["jshint", "less", "jade", "browserify"]);
	grunt.registerTask('chrome', ["jshint", "less", "clean:before", "copy:one", "clean:one", "copy:two", "jade:chrome", "browserify:chrome"]);
};