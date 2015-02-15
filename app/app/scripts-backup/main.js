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
