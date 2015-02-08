define([
    "jquery",
    "underscore",
    "backbone",
    "hbs!templates/unit_activity",
    "config",
    "marionette"
], function ($, _, Backbone, Template, config) {
    
    return Backbone.Marionette.ItemView.extend({
        template: Template,
        initialize: function(options) {
            options = options || {};

            this.promotions = options.promotions || null;
            this.awardings = options.awardings || null;
            this.finances = options.finances || null;
            this.demerits = options.demerits || null;
            this.eloas = options.eloas || null;
        },
        serializeData: function () {
            var items = [],
            // Group everything together by date
                dates = _.groupBy(this.promotions.toJSON().concat(
                    this.awardings.toJSON(),
                    this.finances.toJSON(),
                    this.demerits.toJSON(),
                    this.eloas.toJSON()
                ), function (item) {
                    return item.start_date || item.date;
                });
            // Transform grouped-by data into an array of dates with items
            _.each(dates, function (dateItems, date) {
                items.push({
                    date: date,
                    items: dateItems
                });
            }); 
            // Sort descending by date
            items.sort(function (a, b) {
                if (a.date < b.date) return 1;
                if (b.date < a.date) return -1;
                return 0;
            });

            return {items: items};
        }
    });
});