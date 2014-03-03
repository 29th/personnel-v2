var gulp = require("gulp"),
    gutil = require("gulp-util"),
    concat = require("gulp-concat"),
    minifyCSS = require("gulp-minify-css"),
    rjs = require("gulp-requirejs"),
    clean = require("gulp-clean"),
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
    
gulp.task("default", ["clean", "umd"], function() {
    gulp.start("scripts", "styles", "images", "vendor", "html");
});

gulp.task("umd", function() {
    return es.concat(
        gulp.src(dir.dev + "vendor/bootstrap-datepicker/js/bootstrap-datepicker.js")
            .pipe(wrap({deps: ["jquery"]}))
            .pipe(gulp.dest(dir.dev + "vendor/umd")),
        gulp.src(dir.dev + "vendor/nprogress/nprogress.js")
            .pipe(wrap({exports: "NProgress", deps: ["jquery"]}))
            .pipe(gulp.dest(dir.dev + "vendor/umd"))
    );
});

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
            
            // UMD Wrapped
            "nprogress": "../vendor/umd/nprogress",
            "bootstrap-datepicker": "../vendor/umd/bootstrap-datepicker",
            
            // Replaced
            "config": "config.prod"
        }
    })
        //.pipe(uglify())
        .pipe(gulp.dest(dir.prod + "scripts/"));
});
    
gulp.task("styles", function() {
    return gulp.src([
        dir.dev + "vendor/nprogress/nprogress.css",
        dir.dev + "vendor/fullcalendar/fullcalendar.css",
        dir.dev + "vendor/bootstrap-datepicker/css/datepicker3.css",
        dir.dev + "styles/main.css"
    ])
        .pipe(concat("main.min.css"))
        .pipe(minifyCSS({keepSpecialComments: 0}))
        .pipe(gulp.dest(dir.prod + "styles/"));
});

gulp.task("images", function() {
    return gulp.src(dir.dev + "images/**/*")
        .pipe(gulp.dest(dir.prod + "images"));
});

gulp.task("vendor", function() {
    return gulp.src(dir.dev + "vendor/**/*")
        .pipe(gulp.dest(dir.prod + "vendor"));
});

gulp.task("html", function() {
    return gulp.src(dir.dev + "index.html")
        .pipe(processhtml("index.html"))
        .pipe(minifyHTML())
        .pipe(gulp.dest(dir.prod));
});

gulp.task("clean", function() {
    return gulp.src([
        dir.prod + "**/*",
        "!" + dir.prod + ".git", // Don't erase the .git folder or CNAME
        "!" + dir.prod + "CNAME"
    ], {read: false})
        .pipe(clean());
});

gulp.task("beautify", function() {
    return gulp.src(dir.dev + "scripts/**/*")
        .pipe(beautify({
            keepArrayIndentation: true
        }))
        .pipe(gulp.dest(dir.dev + "scripts.beautified"));
});