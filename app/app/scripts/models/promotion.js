define([
    "jquery"
    , "underscore"
    , "backbone"
    ], function ($, _, Backbone) {
    "use strict";

    return Backbone.Model.extend({
        initialize: function () {
          var oldRank = this.get("old_rank"),
              newRank = this.get("new_rank");
          oldRank.order = parseInt(oldRank.order, 10);
          newRank.order = parseInt(newRank.order, 10);
          this.set("old_rank", oldRank);
          this.set("new_rank", newRank);
        }
    });
});