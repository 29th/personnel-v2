var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone");

  "use strict";

  module.exports = Backbone.Model.extend({
      initialize: function () {
          var amount_received = this.get("amount_received"),
              amount_paid = this.get("amount_paid"),
              fee = this.get("fee");
          this.set("amount_received", amount_received !== null ? parseInt(amount_received, 10) : amount_received);
          this.set("amount_paid", excused !== null ? parseInt(amount_paid, 10) : amount_paid);
          this.set("fee", fee !== null ? parseInt(fee, 10) : fee);
      }
  });
