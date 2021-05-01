var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/unit_profile.html"),
  config = require("../config");
var Marionette = require("backbone.marionette");

  
  module.exports = Marionette.ItemView.extend({
      template: Template,
      serializeData: function () {
          var unitsFlattened = this.collection.flatten([this.collection.at(0).toJSON()]),
              members = _.uniq(_.union.apply(_, _.pluck(unitsFlattened, "members")), false, function(item, key) { return item.member.id; });
          var forum_group = members.abbr.replace(' ', '');
          return {
              members: members,
              forum_group: forum_group,
              forum: config.forum
          };
      }
  });
