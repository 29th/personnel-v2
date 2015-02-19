var gulp = require("gulp"),
    gutil = require("gulp-util"),
    concat = require("gulp-concat"),
    usemin = require("gulp-usemin"),
    minifyCSS = require("gulp-minify-css"),
    del = require("del"),
    processhtml = require("gulp-processhtml"),
    minifyHTML = require("gulp-minify-html"),
    uglify = require("gulp-uglify"),
    es = require("event-stream"),
    beautify = require("gulp-beautify"),
    browserify = require("browserify"),
    source = require("vinyl-source-stream"),
    buffer = require("vinyl-buffer"),
    sourcemaps = require("gulp-sourcemaps"),
    dotenv = require("dotenv");
    
var dir = {
    dev: "./src/",
    prod: "./public/"
};
dotenv.load(); // Load environment variables from .env

/**
 * Main execution
 */
gulp.task("default", ["clean"], function() {
    gulp.start("scripts", "styles", "images", "html");
});

/**
 * Scripts
 * Compiles all Require.js modules into one script, then uglifies and minifies the compiled file
 */
gulp.task("scripts", function() {
    return browserify({
            entries: [
                dir.dev + "scripts/shims/marionette.js",
                dir.dev + "scripts/main.js"
            ],
            debug: true
        })
        .bundle()
        .pipe(source("main.min.js"))
        //.pipe(buffer())
        //.pipe(sourcemaps.init({loadMaps: true}))
        //.pipe(uglify())
        //.pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(dir.prod + "scripts/"));
});

/**
 * Styles
 * Combines all stylesheets then minifies it
 */
gulp.task("styles", function() {
    return gulp.src(dir.dev + "*.html")
        .pipe(usemin({
            css: [minifyCSS({keepSpecialComments: 0}), "concat"]
        }))
        .pipe(gulp.dest(dir.prod));
});

/**
 * Images
 * Copies images directory to production folder
 * We could probably do some compression here
 */
gulp.task("images", function() {
    return gulp.src(dir.dev + "images/**/*")
        .pipe(gulp.dest(dir.prod + "images"));
});

/**
 * HTML
 * Minifies HTML
 */
gulp.task("html", function() {
    return gulp.src(dir.dev + "*.html")
        .pipe(minifyHTML())
        .pipe(gulp.dest(dir.prod));
});

/**
 * Clean
 * Clean out the build directory for a new compile
 */
gulp.task("clean", function(cb) {
    return del(dir.prod, cb);
});

/**
 * Beautify
 * Non-build task for beautifying javascript code and enforcing linting standards
 */
gulp.task("beautify", function() {
    return gulp.src(dir.dev + "scripts/**/*")
        .pipe(beautify({
            keepArrayIndentation: true
        }))
        .pipe(gulp.dest(dir.dev + "scripts.beautified"));
});
