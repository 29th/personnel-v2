var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  config = require("../config"),
  Template = require("../templates/member_eloas.html"),
  config = require("../config");
  util = require("../util");
var Marionette = require("backbone.marionette");

  
  module.exports = Marionette.ItemView.extend({
      template: Template,
      initialize: function(options) {
          options = options || {};
          this.eloas = options.collection || false;
      },
      serializeData: function () {
          var items = [];
          var rec_count = 0;
          var today = new Date();
          items = this.eloas.toJSON();
              _.each( items, function( record ) {
                  if(record.forum_id && record.topic_id && record.topic_id > 0 && config.forum[record.forum_id] !== undefined) {
                      record.topic_url = config.forum[record.forum_id].baseUrl + util.sprintf(config.forum[record.forum_id].topicPath, record.topic_id);
                  }
              });
          return _.extend({
              eloas: items,
              forum: config.forum,
              rec_count: this.eloas.length
          });
      }
  });
