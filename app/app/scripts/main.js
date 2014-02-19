window.requirejs = window.requirejs || {};
(function(requirejs) {
    "use strict";
    
    // Setup third-party libraries
    requirejs.config({
        baseUrl: "scripts/"
        ,paths: {
            "jquery": [
                "//ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min"
                ,"../vendor/jquery/jquery.min"
            ]
            ,"underscore": [
                "//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min"
                ,"../vendor/underscore/underscore-min"
            ]
            ,"backbone": [
                "//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.0/backbone-min"
                ,"../vendor/backbone/backbone-min"
            ]
            ,"handlebars": //[
                //"//cdnjs.cloudflare.com/ajax/libs/handlebars.js/1.3.0/handlebars.min"
                "../vendor/handlebars/handlebars.min" // Needs to be included in build to avoid errors
            //]
            ,"marionette": [
                "//cdnjs.cloudflare.com/ajax/libs/backbone.marionette/1.5.1-bundled/backbone.marionette.min"
                ,"../vendor/marionette/lib/backbone.marionette.min"
            ]
            ,"jquery-bootstrap": [
                "//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.1.0/js/bootstrap.min"
                ,"../vendor/bootstrap/dist/bootstrap.min"
            ]
            ,"moment": [
                "//cdnjs.cloudflare.com/ajax/libs/moment.js/2.5.1/moment.min"
                ,"../vendor/moment/moment.min"
            ]
            ,"fullcalendar": [
                "//cdnjs.cloudflare.com/ajax/libs/fullcalendar/1.6.4/fullcalendar.min"
                ,"../vendor/fullcalendar/fullcalendar.min"
            ]
            ,"nprogress": "../vendor/nprogress/nprogress"
            ,"text": "../vendor/text/text"
            ,"hbs": "../vendor/requirejs-hbs/hbs"
            ,"json": "../vendor/requirejs-plugins/src/json"
        }
        ,shim: {
            "underscore": {
                exports: "_"
            }
            ,"backbone": {
                exports: "Backbone"
                ,deps: ["jquery", "underscore"]
            }
            ,"handlebars": {
                exports: "Handlebars"
            }
            ,"marionette": {
                exports: "Marionette"
                ,deps: ["jquery", "underscore", "backbone"]
            }
            ,"jquery-jsonp": {
                deps: ["jquery"]
            }
            ,"jquery-bootstrap": {
                deps: ["jquery"]
            }
            ,"fullcalendar": {
                deps: ["jquery"]
            }
            ,"nprogress": {
                exports: "NProgress"
            }
        }
        ,hbs: { templateExtension: ".html" }
    });
    
    
    /**
     * Initialize app
     */
    require([
        "router"
    ], function(Router) {
    
        window.DEBUG = false; // Global
        $.ajaxSetup({cache: true, xhrFields: { withCredentials: true }}); // Cache ajax requests & send cookies
        
        var app = new Backbone.Marionette.Application();
        
        app.addRegions({
            mainRegion: "#main"
            ,navRegion: "#nav"
            ,flashRegion: "#flash"
        });
        
        app.addInitializer(function(options) {
            new Router({app: this});
            Backbone.history.start();
        });
        
        app.start();
    });
    
})(window.requirejs);