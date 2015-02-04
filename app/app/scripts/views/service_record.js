define([
    "jquery",
    "underscore",
    "backbone",
    "config",
    "hbs!templates/service_record",
    "moment",
    "marionette"
], function ($, _, Backbone, config, Template, moment) {
    
    return Backbone.Marionette.ItemView.extend({
        template: Template,
        initialize: function (options) {
            options = options || {};
            this.permissions = options.permissions || {};
            this.permissions.on("reset", this.render, this);
            this.memberPermissions = options.memberPermissions || {};
            this.memberPermissions.on("reset", this.render, this);
            this.assignments = options.assignments || false;
            this.promotions = options.promotions || false;
            this.awardings = options.awardings || false;
            this.discharges = options.discharges || false;
            this.enlistments = options.enlistments || false;
            this.finances = options.finances || false;
            this.demerits = options.demerits || false;
        },
        serializeData: function () {
            var items = [],
                dischargeDate = this.assignments.discharge_date,
            // Group everything together by date
                dates = _.groupBy(this.assignments.toJSON().concat(this.promotions.toJSON(), this.awardings.toJSON(), this.discharges.toJSON(), this.enlistments.toJSON(), this.finances.toJSON(), this.demerits.toJSON()), function (item) {
                    return item.start_date || item.date;
                });
            // Transform grouped-by data into an array of dates with items
            _.each(dates, function (dateItems, date) {
                items.push({
                    date: date,
                    beforeDischarge: dischargeDate && moment(date).isBefore(dischargeDate),
                    items: dateItems
                });
            }); 
            // Sort descending by date
            items.sort(function (a, b) {
                if (a.date < b.date) return 1;
                if (b.date < a.date) return -1;
                return 0;
            });
            
            var permissions = this.permissions.length ? this.permissions.pluck("abbr") : [],
                memberPermissions = this.memberPermissions.length ? this.memberPermissions.pluck("abbr") : [],
                allowedTo = {
                    editAssignment: memberPermissions.indexOf("assignment_add") !== -1 || permissions.indexOf("assignment_add_any") !== -1
                };
            
            return $.extend({
                items: items,
                duration: this.assignments.duration,
                coatDir: config.coatDir,
                allowedTo: allowedTo
            }, this.model.toJSON());
        }
    });
});