'use strict';

var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        clean: {
            dist: ['.tmp', 'dist/*'],
            server: '.tmp'
        },
        uglify: {
            my_target: {
                files: {
                    'dist/bbcode.min.js': ['src/*.js']
                }
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                'src/*.js'
//                'test/spec/{,*/}*.js'
            ]
        },
        connect: {
            options: {
                port: 9001,
                hostname: 'localhost'
            },
            test: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, '.')
                        ];
                    }
                }
            }
        },
        mocha: {
            all: {
                options: {
                    run: true,
                    urls: ['http://localhost:<%= connect.options.port %>/test/index.html']
                }
            }
        }
    });

    grunt.registerTask('test', [
        'clean',
        'connect:test',
        'mocha'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'uglify'
    ]);

    grunt.registerTask('default', [
        'jshint',
        'test',
        'build'
    ]);
};
