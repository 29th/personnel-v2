define([
    "jquery",
    "underscore",
    "backbone",
    "hbs!templates/unit_profile",
    "config",
    "marionette"
], function ($, _, Backbone, Template, config) {
    
    return Backbone.Marionette.ItemView.extend({
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
});