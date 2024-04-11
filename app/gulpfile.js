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
    browserify = require("browserify"),
    source = require("vinyl-source-stream"),
    buffer = require("vinyl-buffer"),
    sourcemaps = require("gulp-sourcemaps"),
    watchify = require("watchify"),
    dotenv = require("dotenv");
    
var dir = {
    dev: "./src/",
    prod: "./dist/"
};
dotenv.load(); // Load environment variables from .env

/**
 * Main execution
 */
gulp.task("default", ["clean"], function() {
    gulp.start("scripts", "styles", "images", "robots");
});

/**
 * Scripts
 * Compiles all Require.js modules into one script, then uglifies and minifies the compiled file
 */
var initBundle = function(watch) {
    var bundle = browserify({
        entries: [
            dir.dev + "scripts/shims/marionette.js",
            dir.dev + "scripts/main.js"
        ],
        debug: true,
        cache: {},
        packageCache: {},
        fullPaths: true
    });
    
    if(watch) {
        bundle = watchify(bundle);
        bundle.on("update", function() {
            execBundle(bundle);
        });
    }
    return execBundle(bundle);
};

var execBundle = function(bundle) {
    return bundle.bundle()
        .pipe(source("main.min.js"))
        //.pipe(buffer())
        //.pipe(sourcemaps.init({loadMaps: true}))
        //.pipe(uglify())
        //.pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(dir.prod + "scripts/"));
};

gulp.task("watch", function() {
    return initBundle(true);
});

gulp.task("scripts", function() {
    return initBundle(false);
    /*return browserify({
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
        .pipe(gulp.dest(dir.prod + "scripts/"));*/
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
        .pipe(minifyHTML())
        .pipe(gulp.dest(dir.prod));
});

/**
 * Robots.txt
 * Copies file into dist directory
 */
gulp.task("robots", function() {
    return gulp.src(dir.dev + "robots.txt")
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
