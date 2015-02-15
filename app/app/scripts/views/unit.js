var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/unit.html");
var Marionette = require("backbone.marionette");

      
  module.exports = Marionette.Layout.extend({
      template: Template,
      className: "unit",
      title: "Unit",
      numColumns: 1,
      initialize: function (options) {
          options = options || {};
      },
      modelEvents: {
          "change": "render"
      },
      regions: {
          adminRegion: "#admin",
          pageRegion: "#page"
      },
      setHighlight: function (highlight) {
          this.highlight = highlight;
          this.$(".nav li").removeClass("active");
          if (highlight) this.$(".nav li[data-highlight=\"" + highlight + "\"]").addClass("active");
      },
      serializeData: function () {
          return _.extend({
              highlight: this.highlight,
              numColumns: this.numColumns
          }, this.collection.length ? this.collection.at(0).toJSON() : {});
      },
      onRender: function () {
          var model = this.collection.length ? this.collection.at(0) : undefined;
          if (model && model.get("name")) this.title = model.get("name");
      },
  });
