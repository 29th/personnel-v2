/*jshint -W024 */
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {

  var appConfig = {
    dev: 'app',
    prod: 'app/build',
    temp: 'temp'
  };

  grunt.initConfig({
    app: appConfig,
    pkg: grunt.file.readJSON('package.json'),
    port: 9000,
    connect: {
      options: {
        port: 9000,
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, 'app')
            ];
          }
        }
      }
    },
    watch: {
      compass: {
        files: ['<%= app.dev %>/styles/*.{scss,sass}'],
        tasks: ['compass']
      },
      livereload: {
        options: {
          livereload: 35729
        },
        files: ['<%= app.dev %>/*', '<%= app.dev %>/scripts/**/*', '<%= app.dev %>/styles/*.css']
      }
    },
    open: {
      dev: {
        path: 'http://localhost:<%= connect.options.port %>'
      }
    },
    jshint: {
      all: ['Gruntfile.js', '<%= app.dev %>/scripts/*.js', '<%= app.dev %>/scripts/**/*.js', 'test/*.js', '!<%= app.dev %>/scripts/vendor/**/*.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    mocha: {
      dev: {
        src: ['testrunner.html'],
        run: false,
        options: {
          log: true,
          reporter: 'Spec'
        }
      }
    },
    compass: {
      dev: {
        options: {
        cssDir: '<%= app.dev %>/styles',
        sassDir: '<%= app.dev %>/styles',
        imagesDir: '<%= app.dev %>/images',
        javascriptsDir: '<%= app.dev %>/scripts',
        force: true
        }
      }
    },
    umd: {
      nprogress: {
        src: '<%= app.dev %>/vendor/nprogress/nprogress.js',
        dest: '<%= app.dev %>/vendor/nprogress/umd/nprogress.js',
        deps: {
          'default': ['jquery']
        },
        objectToExport: 'NProgress'
      },
      underscore_template_helpers: {
        src: '<%= app.dev %>/vendor/underscore-template-helpers/underscore.template-helpers.js',
        dest: '<%= app.dev %>/vendor/underscore-template-helpers/umd/underscore.template-helpers.js',
        deps: {
          'default': ['underscore']
        }
      },
      bootstrap_switch: {
        src: '<%= app.dev %>/vendor/bootstrap-switch/build/js/bootstrap-switch.min.js',
        dest: '<%= app.dev %>/vendor/bootstrap-switch/build/js/umd/bootstrap-switch.min.js',
        deps: {
          'default': ['jquery']
        }
      },
      bootstrap_select: {
        src: '<%= app.dev %>/vendor/bootstrap-select/bootstrap-select.min.js',
        dest: '<%= app.dev %>/vendor/bootstrap-select/umd/bootstrap-select.min.js',
        deps: {
          'default': ['jquery']
        }
      },
      typeahead: {
        src: '<%= app.dev %>/vendor/typeahead.js/dist/typeahead.min.js',
        dest: '<%= app.dev %>/vendor/typeahead.js/dist/umd/typeahead.min.js',
        deps: {
          'default': ['jquery']
        }
      },
      bootstrap_datepicker: {
        src: '<%= app.dev %>/vendor/bootstrap-datepicker/js/bootstrap-datepicker.js',
        dest: '<%= app.dev %>/vendor/bootstrap-datepicker/js/umd/bootstrap-datepicker.js',
        deps: {
          'default': ['jquery']
        }
      }
    },
    requirejs: {
      compile: {
        options: {
          name: 'main',
          baseUrl: '<%= app.dev %>/scripts',
          mainConfigFile: '<%= app.dev %>/scripts/main.js',
          out: '<%= app.prod %>/scripts/main.js',
          optimize: 'none',
          preserveLicenseComments: false,
          paths: {
            'jquery': '//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min',
            'underscore': '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min',
            'backbone': '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.0/backbone-min',
            'marionette': '//cdnjs.cloudflare.com/ajax/libs/backbone.marionette/1.5.1-bundled/backbone.marionette.min',
            'bootstrap': '//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.0.3/js/bootstrap.min',
            //'bootstrap-select': '//cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.3.5/bootstrap-select.min',
            //'bootstrap-switch': '//cdnjs.cloudflare.com/ajax/libs/bootstrap-switch/1.8/js/bootstrap-switch.min.js',
            //'typeahead': '//cdnjs.cloudflare.com/ajax/libs/typeahead.js/0.9.3/typeahead.min',
            //'bootstrap-datepicker': '//cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.2.0/js/bootstrap-datepicker.min',
            'nprogress': '../vendor/nprogress/umd/nprogress',
            'underscore-template-helpers': '../vendor/underscore-template-helpers/umd/underscore.template-helpers',
            'bootstrap-switch': '../vendor/bootstrap-switch/build/js/umd/bootstrap-switch.min',
            'bootstrap-select': '../vendor/bootstrap-select/umd/bootstrap-select.min',
            'typeahead': '../vendor/typeahead.js/dist/umd/typeahead.min',
            'bootstrap-datepicker': '../vendor/bootstrap-datepicker/js/umd/bootstrap-datepicker'
          }
        }
      }
    },
    copy: {
      main: {
        files: [
          /*{expand: true, cwd: '<%= app.dev %>/vendor/underscore/', src: 'underscore-min.js', dest: '<%= app.prod %>/vendor/underscore/', filter: 'isFile'},
          {expand: true, cwd: '<%= app.dev %>/vendor/jquery/', src: 'jquery.min.js', dest: '<%= app.prod %>/vendor/jquery/', filter: 'isFile'},
          {expand: true, cwd: '<%= app.dev %>/vendor/backbone/', src: 'backbone-min.js', dest: '<%= app.prod %>/vendor/backbone/', filter: 'isFile'},
          {expand: true, cwd: '<%= app.dev %>/vendor/requirejs/', src: 'require.js', dest: '<%= app.prod %>/vendor/requirejs/', filter: 'isFile'},
          {expand: true, cwd: '<%= app.dev %>/vendor/bootstrap/dist/js', src: 'bootstrap.js', dest: '<%= app.prod %>/vendor/bootstrap/dist/js', filter: 'isFile'},
          {expand: true, cwd: '<%= app.dev %>/vendor/bootstrap-switch/static/js', src: 'bootstrap-switch.js', dest: '<%= app.prod %>/vendor/bootstrap-switch/static/js', filter: 'isFile'},
          {expand: true, cwd: '<%= app.dev %>/vendor/bootstrap-select', src: 'bootstrap-select.js', dest: '<%= app.prod %>/vendor/bootstrap-select', filter: 'isFile'},
          {expand: true, cwd: '<%= app.dev %>/vendor/bootstrap/dist/fonts', src: 'glyphicons-halflings-regular.*', dest: '<%= app.prod %>/vendor/bootstrap/dist/fonts', filter: 'isFile'}*/
          {expand: true, cwd: '<%= app.dev %>/vendor/', src: ['**'], dest: '<%= app.prod %>/vendor/'},
          {expand: true, cwd: '<%= app.dev %>/scripts/nls/', src: ['**'], dest: '<%= app.prod %>/scripts/nls/'}
        ]
      }
    },
    clean: {
      build: ['<%= app.prod %>/**/*', '!<%= app.prod %>/.git', '!<%= app.prod %>/CNAME'],
      temp: ['<%= app.temp %>']
    },
    cssmin: {
      minify: {
        expand: false,
        keepSpecialComments: 0,
        src: [
            '<%= app.dev %>/styles/*.css',
            '<%= app.dev %>/vendor/nprogress/nprogress.css',
            '<%= app.dev %>/vendor/bootstrap-select/bootstrap-select.min.css',
            '<%= app.dev %>/vendor/bootstrap-datepicker/css/datepicker.css',
            '<%= app.dev %>/vendor/bootstrap-switch/build/css/bootstrap3/bootstrap-switch.css'
        ],
        dest: '<%= app.prod %>/styles/main.min.css'
      }
    },
    processhtml: {
      dist: {
        files: {
          '<%= app.temp %>/index.html': ['app/index.html']
        }
      }
    },
    htmlmin: {
      build: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: {
          '<%= app.prod %>/index.html': '<%= app.temp %>/index.html'
        }
      }
    }
  });

  grunt.registerTask('default', ['clean', 'umd', 'requirejs', 'copy:main', 'cssmin', 'processhtml', 'htmlmin', 'clean:temp']);
  grunt.registerTask('umd', ['umd']);
  grunt.registerTask('server', ['connect:livereload','open:dev','watch']);
  grunt.registerTask('compass', ['compass']);
  grunt.registerTask('test', ['jshint','mocha:dev']);

  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-umd');
};