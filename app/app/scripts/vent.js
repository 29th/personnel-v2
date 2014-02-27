define([
    "jquery"
    ,"underscore"
    ,"backbone.wreqr"
    ,"util"
], function($, _, Wreqr, util) {
    "use strict";
    
    var vent = new Wreqr.EventAggregator()
        ,promises = [];
    
    vent.on("fetch", function(promise) {
        var wasEmpty = promises.length === 0;
        
        promise instanceof Array ? promises.concat(promise) : promises.push(promise);
        console.log("Added promise");
        
        if(wasEmpty) {
            util.loading(true);
            console.log("Loading on");
        
            $.when.apply($, promises).done(function() {
                util.loading(false);
                console.log("Loading off");
            });
        }
    });
    
    return vent;
});