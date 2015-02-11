/**
 * Utilities / Helper Functions
 */
define([
    "jquery",
    "underscore",
    "handlebars",
    "nprogress"
], function ($, _, Handlebars, NProgress) {
    "use strict";

    var util = {};

    util.loading = function (status) {
        //$("body").toggleClass("loading", status);
        if (status !== undefined && status) NProgress.start();
        else NProgress.done();
    };

    util.scrollToTop = function () {
        $(window).scrollTop(0);
    };

    /**
     * Add commas to numbers in thousands place etc.
     * http://stackoverflow.com/a/2901298/633406
     */
    util.formatNumber = function (x, decimals) {
        if (isNaN(x) || x === null) return x;
        if (decimals !== undefined) x = decimals ? Math.round(x * 100) / 100 : Math.round(x);
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    $.fn.serializeObject = function () {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function () {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };

    util.sprintf = function() {
        var args = Array.prototype.slice.call(arguments);
        return args.shift().replace(/%s/g, function(){
            return args.shift();
        });
    }

    return util;
});