var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone");

  "use strict";

  module.exports = Backbone.Model.extend({
      initialize: function () {
          var attended = this.get("attended"),
              absent = this.get("absent") || null,
              excused = this.get("excused"),
              event = this.get("event");
          this.set("attended", attended !== null ? parseInt(attended, 10) : attended);
          this.set("excused", excused !== null ? parseInt(excused, 10) : excused);
          if (absent !== null) this.set("absent", parseInt(absent, 10));
          if (event) {
              event.mandatory = parseInt(event.mandatory, 10);
              this.set("event", event);
          }
      }
  });
