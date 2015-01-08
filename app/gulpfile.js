var gulp = require("gulp"),
    gutil = require("gulp-util"),
    concat = require("gulp-concat"),
    minifyCSS = require("gulp-minify-css"),
    rjs = require("gulp-requirejs"),
    del = require("del"),
    processhtml = require("gulp-processhtml"),
    minifyHTML = require("gulp-minify-html"),
    wrap = require("gulp-wrap-umd"),
    uglify = require("gulp-uglify"),
    es = require("event-stream"),
    beautify = require("gulp-beautify"),
    
    dir = {
        dev: "./app/",
        prod: "./app/build/"
    };

/**
 * Main execution
 */
gulp.task("default", ["clean", "umd"], function() {
    gulp.start("scripts", "styles", "images", "vendor", "html");
});

/**
 * UMD
 * Wraps non-AMD javascript files in a UMD container so that they can be loaded with Require.js
 */
gulp.task("umd", function() {
    return es.concat(
	gulp.src(dir.dev + "vendor/bootstrap-datepicker/js/bootstrap-datepicker.js")
	    .pipe(wrap({deps: ["jquery"]}))
	    .pipe(gulp.dest(dir.dev + "vendor/umd/")),
	gulp.src(dir.dev + "vendor/bootstrap-select/dist/js/bootstrap-select.min.js")
	    .pipe(wrap({deps: ["jquery"]}))
	    .pipe(gulp.dest(dir.dev + "vendor/umd/")),
	gulp.src(dir.dev + "scripts/theme.js")
	    .pipe(wrap({deps: ["jquery"]}))
	    .pipe(gulp.dest(dir.dev + "vendor/umd/")),
	gulp.src(dir.dev + "scripts/jquery.nestable.min.js")
	    .pipe(wrap({deps: ["jquery"]}))
	    .pipe(gulp.dest(dir.dev + "vendor/umd/")),
	gulp.src(dir.dev + "vendor/nprogress/nprogress.js")
	    .pipe(wrap({exports: "NProgress", deps: ["jquery"]}))
	    .pipe(gulp.dest(dir.dev + "vendor/umd/")),
	gulp.src(dir.dev + "vendor/moment-duration-format/lib/moment-duration-format.js")
	    .pipe(wrap({deps: ["moment"]}))
	    .pipe(gulp.dest(dir.dev + "vendor/umd/"))
    );
});

/**
 * Scripts
 * Compiles all Require.js modules into one script, then uglifies and minifies the compiled file
 */
gulp.task("scripts", function() {
    return rjs({
        name: "main",
        baseUrl: dir.dev + "scripts",
        mainConfigFile: dir.dev + "scripts/main.js", // Why doesn't this leverage appDir + baseUrl ?
        out: "main.min.js",
        preserveLicenseComments: false,
        include: ["requireLib"],
        
        paths: {
            "requireLib": "../vendor/requirejs/require",
            
            // CDNs
            "jquery": "empty:",
            "underscore": "empty:",
            "backbone": "empty:",
            //"handlebars": "empty:", // Needs to be included in build to avoid errors
            "marionette": "empty:",
            "jquery-bootstrap": "empty:",
            "moment": "empty:",
            "fullcalendar": "empty:",
            "vanilla-comments": "empty:",
            "nprogress": "empty:",
            "bootstrap-select": "empty:",
            "bootstrap-datepicker": "empty:",
            "theme": "../vendor/umd/theme",
            "jquery-nestable": "../vendor/umd/jquery.nestable.min",
            "moment-duration-format": "../vendor/umd/moment-duration-format",
            
            // UMD Wrapped
            //"nprogress": "../vendor/umd/nprogress",
            //"bootstrap-datepicker": "../vendor/umd/bootstrap-datepicker",
            //"bootstrap-select": "../vendor/umd/bootstrap-select.min",
            
            // Replaced
            "config": "config.prod"
        }
    })
        .pipe(uglify())
        .pipe(gulp.dest(dir.prod + "scripts/"));
});

/**
 * Styles
 * Combines all stylesheets then minifies it
 */
gulp.task("styles", function() {
    return gulp.src([
        dir.dev + "vendor/nprogress/nprogress.css",
        dir.dev + "vendor/fullcalendar/fullcalendar.css",
        dir.dev + "vendor/bootstrap-datepicker/css/datepicker3.css",
        dir.dev + "vendor/bootstrap-select/dist/css/bootstrap-select.min.css",
        dir.dev + "styles/theme.css",
        dir.dev + "styles/jquery.nestable.css",
        dir.dev + "styles/main.css"
    ])
        .pipe(concat("main.min.css"))
        .pipe(minifyCSS({keepSpecialComments: 0}))
        .pipe(gulp.dest(dir.prod + "styles/"));
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
 * Vendor Scripts
 * Copies third-party javascript libraries to production folder
 */
gulp.task("vendor", function() {
    return gulp.src(dir.dev + "vendor/**/*")
        .pipe(gulp.dest(dir.prod + "vendor"));
});

/**
 * HTML
 * Replaces dev files with production files in the HTML and minifies it
 */
gulp.task("html", function() {
    return gulp.src(dir.dev + "index.html")
        .pipe(processhtml("index.html"))
        .pipe(minifyHTML())
        .pipe(gulp.dest(dir.prod));
});

/**
 * Clean
 * Clean out the build directory for a new compile, but leave .git files and CNAME file
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
