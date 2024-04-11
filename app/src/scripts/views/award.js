var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/award.html"),
  config = require("../config"),
  util = require("../util");
var Marionette = require("backbone.marionette");


  module.exports = Marionette.ItemView.extend({
      template: Template,
      title: "Awards",
      serializeData: function () {
          var awards = this.model.toJSON();
          _.each( awards.awardings,  function( record ) {
            if(record.forums.id && record.forums.topic && record.forums.topic > 0 && config.forum[record.forums.id] !== undefined) 
            {
              record.forums.url = config.forum[record.forums.id].baseUrl + util.sprintf(config.forum[record.forums.id].topicPath, record.forums.topic);
            }
          });
          return {
              award: awards
          };
      },
      onRender: function () {
          this.title = "Award: " + this.model.toJSON().title;
      }
  });
