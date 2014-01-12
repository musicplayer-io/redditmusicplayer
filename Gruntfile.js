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
					"app/main.html": ["src/jade/server.jade"]
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
		},
		// NATIVE -> BROWSER
		browserify: {
			dist: {
				src: ['app/js/main.js'],
				dest: 'app/js/browser.js',
				options: {
					alias: getModules()
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
			build: ["chrome/css", "chrome/js", "chrome/img", "chrome/fonts"]
		},
		// Then placing them back
		copyto: {
			stuff: {
				files: [
					{cwd: 'app/', src: ['**/*'], dest: 'chrome/'}
				],
				options: {
					// array of ignored paths, can be specific files or a glob
					ignore: [
						'app/package.json',
						'app/js/native.js'
					]
				}
			}
		},
	});
	
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks("grunt-contrib-less");
	grunt.loadNpmTasks("grunt-contrib-watch");
	// Browser
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-browserify');
	// Chrome
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-copy-to');
	grunt.registerTask('default', ["jshint", "less", "jade", 'watch']);
	grunt.registerTask('server', ["jshint", "less", "browserify", "watch"]);
	grunt.registerTask('build', ["jshint", "less", "jade", "browserify"]);
	grunt.registerTask('chrome', ["jshint", "less", "jade", "browserify", "clean", "copyto"]);
};