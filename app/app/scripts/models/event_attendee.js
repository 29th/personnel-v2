define([
    "jquery"
    ,"underscore"
    ,"backbone"
], function($, _, Backbone) {
    "use strict";
    
    return Backbone.Model.extend({
        initialize: function() {
            var attended = this.get("attended")
                ,absent = this.get("absent") || null
                ,excused = this.get("excused");
            this.set("attended", attended !== null ? parseInt(attended, 10) : attended);
            this.set("excused", excused !== null ? parseInt(excused, 10) : excused);
            if(absent !== null) this.set("absent", parseInt(absent, 10));
        }
    });
});