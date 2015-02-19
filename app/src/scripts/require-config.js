// Setup third-party libraries
requirejs.config({
    //baseUrl: "scripts/",
    paths: {
        "jquery": null,
        "underscore": null,
        "backbone": null,
        "handlebars": "hbsfy/runtime",
        "marionette": "backbone.marionette",
        "jquery-bootstrap": "bootstrap",
        "moment": null,
        "fullcalendar": "fullcalendar-browser",
        "nprogress": null,
        "bbcode": null,
        "bootstrap-datepicker": null,
        "backbone.validation": null,
        "bootstrap-select": null,
        "jquery-nestable": "jquery-nestable/jquery.nestable",
        "moment-duration-format": null,
        "moment-timezone": null,
        "handlebars-helpers": "HandlebarsHelpers",
        "config": "./config.dev"
    },
    shim: {
        /*"underscore": {
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
        }*/
    }
});