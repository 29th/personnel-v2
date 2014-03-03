define([
    "jquery"
    , "underscore"
    , "backbone"
    , "hbs!templates/qualifications"
    , "marionette"
    ], function ($, _, Backbone, QualificationsTemplate) {
    var QualificationsView = Backbone.Marionette.ItemView.extend({
        template: QualificationsTemplate,
        serializeData: function () {
            var standards = this.collection.toJSON(),
                sorted = {};
            _.each(standards, function (standard) {
                // Sort into hierarchy of weapon > badge [standards]
                if (sorted[standard.weapon] === undefined) sorted[standard.weapon] = {};
                if (sorted[standard.weapon][standard.badge] === undefined) sorted[standard.weapon][standard.badge] = [];
                sorted[standard.weapon][standard.badge].push(standard);
            });
            return {
                items: sorted
            };
        }
    });

    return QualificationsView;
});