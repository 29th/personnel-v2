define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"hbs!templates/service_record"
    ,"marionette"
], function($, _, Backbone, ServiceRecordTemplate) {
    var ServiceRecordView = Backbone.Marionette.ItemView.extend({
        template: ServiceRecordTemplate
        ,initialize: function(options) {
            options = options || {};
            this.assignments = options.assignments || false;
            this.promotions = options.promotions || false;
            this.awardings = options.awardings || false;
        }
        ,serializeData: function() {
            var items = []
                // Group everything together by date
                ,dates = _.groupBy(this.assignments.toJSON().concat(this.promotions.toJSON(), this.awardings.toJSON()), function(item) { return item.start_date || item.date; });
            // Transform grouped-by data into an array of dates with items
            _.each(dates, function(dateItems, date) {
                items.push({
                    date: date
                    ,items: dateItems
                });
            });
            // Sort descending by date
            items.sort(function(a, b) {
                if(a.date < b.date) return 1;
                if(b.date < a.date) return -1;
                return 0;
            });
            return {items: items};
        }
    });
    
    return ServiceRecordView;
});