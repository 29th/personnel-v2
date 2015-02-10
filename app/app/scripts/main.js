window.requirejs = window.requirejs || {};
(function (requirejs) {
    "use strict";

    // Setup third-party libraries
    requirejs.config({
        baseUrl: "scripts/",
        paths: {
            "jquery": [
                "//ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min",
                "../vendor/jquery/jquery.min"
            ],
            "underscore": [
                "//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min",
                "../vendor/underscore/underscore-min"
            ],
            "backbone": [
                "//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min",
                "../vendor/backbone/backbone"
            ],
            "handlebars": //[
                //"//cdnjs.cloudflare.com/ajax/libs/handlebars.js/1.3.0/handlebars.min"
                "../vendor/handlebars/handlebars.min" // Needs to be included in build to avoid errors
            //]
            ,
            "marionette": [
                "//cdnjs.cloudflare.com/ajax/libs/backbone.marionette/1.5.1-bundled/backbone.marionette.min",
                "../vendor/marionette/lib/backbone.marionette.min"
            ],
            "backbone.wreqr": "../vendor/backbone.wreqr/lib/amd/backbone.wreqr.min",
            "jquery-bootstrap": [
                "//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.1.0/js/bootstrap.min",
                "../vendor/bootstrap/dist/js/bootstrap.min"
            ],
            "moment": [
                "//cdnjs.cloudflare.com/ajax/libs/moment.js/2.9.0/moment.min",
                "../vendor/moment/min/moment.min"
            ],
            "fullcalendar": [
                "//cdnjs.cloudflare.com/ajax/libs/fullcalendar/1.6.4/fullcalendar.min",
                "../vendor/fullcalendar/fullcalendar.min"
            ],
            "vanilla-comments": "//new.29th.org/forums/js/embed",
            "nprogress": [
                "//cdnjs.cloudflare.com/ajax/libs/nprogress/0.1.3/nprogress.min",
                "../vendor/nprogress/nprogress"
            ],
            "bbcode": "../vendor/bbcode/src/bbcode",
            "bootstrap-datepicker": [
                "//cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.3.0/js/bootstrap-datepicker.min",
                "../vendor/bootstrap-datepicker/js/bootstrap-datepicker"
            ],
            "backbone.validation": "../vendor/backbone.validation/dist/backbone-validation-amd-min",
            "bootstrap-select": [
                "//cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.6.3/js/bootstrap-select.min",
                "../vendor/bootstrap-select/dist/js/bootstrap-select.min"
            ],
            "theme": "theme",
            "enquire": "../vendor/enquire/dist/enquire.min",
            "jquery-nestable": "jquery.nestable.min",
            "moment-duration-format": "../vendor/moment-duration-format/lib/moment-duration-format",
            "moment-timezone": "../vendor/moment-timezone/builds/moment-timezone-with-data.min",
            "text": "../vendor/text/text",
            "hbs": "hbs",
            "json": "../vendor/requirejs-plugins/src/json",
            "handlebars-helpers": "../vendor/handlebars-helpers/src/helpers",
            "config": "config.dev"
        },
        shim: {
            "underscore": {
                exports: "_"
            },
            "backbone": {
                exports: "Backbone",
                deps: ["jquery", "underscore"]
            },
            "handlebars": {
                exports: "Handlebars"
            },
            "marionette": {
                exports: "Marionette",
                deps: ["jquery", "underscore", "backbone"]
            },
            "jquery-jsonp": {
                deps: ["jquery"]
            },
            "jquery-bootstrap": {
                deps: ["jquery"]
            },
            "fullcalendar": {
                deps: ["jquery"]
            },
            "nprogress": {
                exports: "NProgress"
            },
            "bootstrap-datepicker": {
                deps: ["jquery"]
            },
            "bootstrap-select": {
                deps: ["jquery"]
            },
            "handlebars.helpers": {
                deps: ["handlebars"]
            },
            "backbone.validation": {
                deps: ["jquery", "underscore", "backbone"]
            },
            "validation.config": {
                deps: ["backbone.validation"]
            },
            "moment-duration-format": {
                exports: "moment",
                deps: ["moment"]
            }
        },
        hbs: {
            templateExtension: ".html"
        }
    });


    /**
     * Initialize app
     */
    require([
        "jquery",
        "util",
        "router"
    ], function ($, util, Router) {

        window.DEBUG = false; // Global
        
        // Cache ajax requests & send cookies
        $.ajaxSetup({
            cache: true,
            xhrFields: {
                withCredentials: true
            }
        });
        
        // Loading indicators
        $(document).ajaxStart(function () {
            util.loading(true);
        });
        $(document).ajaxStop(function () {
            util.loading(false);
        });

        var app = new Backbone.Marionette.Application();

        app.addRegions({
            mainRegion: "#main",
            navRegion: "#nav",
            flashRegion: "#flash"
        });

        app.addInitializer(function (options) {
            new Router({
                app: this
            });
            Backbone.history.start();
        });

        app.start();
    });

})(window.requirejs);
