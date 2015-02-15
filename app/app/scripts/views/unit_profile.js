var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/unit_profile.html"),
  config = require("../config.dev");
var Marionette = require("backbone.marionette");

  
  module.exports = Marionette.ItemView.extend({
      template: Template,
      serializeData: function () {
          var unitsFlattened = this.collection.flatten([this.collection.at(0).toJSON()]),
              members = _.uniq(_.union.apply(_, _.pluck(unitsFlattened, "members")), false, function(item, key) { return item.member.id; });
          return {
              members: members,
              forum: config.forum
          };
      }
  });
