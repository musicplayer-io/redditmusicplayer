module.exports = function(grunt) {
  grunt.initConfig({
    // JADE - MAIN
    jade: {
      compile: {
        options: {
          data: {
            debug: false
          }
        },
        files: {
          "app/main.html": ["src/jade/main.jade"]
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
          alias: 'app/js/modules/player.js:./js/modules/player,app/js/modules/content.js:./js/modules/content,app/js/modules/progressbar.js:./js/modules/progressbar,app/js/modules/options.js:./js/modules/options'
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
  });

  grunt.loadNpmTasks("grunt-contrib-less");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.registerTask('default', ["less", "jade", 'watch']);
  grunt.registerTask('server', ["less", "jade", "browserify", "watch"]);
  grunt.registerTask('build', ["less", "jade", "browserify"]);
}