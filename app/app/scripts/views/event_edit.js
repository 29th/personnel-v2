define([
    "jquery",
    "underscore",
    "backbone",
    "hbs!templates/event_edit",
    "marionette",
    "bootstrap-datepicker"
], function ($, _, Backbone, Template) {

    return Backbone.Marionette.ItemView.extend({
        template: Template,
        title: "Modify Event",
        events: {
            "submit form": "onSubmitForm"
        },
        initialize: function (options) {
            options = options || {};
            this.units = options.units || {};
            this.servers = options.servers || {};
            _.bindAll(this, "onSubmitForm");
            Backbone.Validation.bind(this);
        },
        serializeData: function () {
            return $.extend({
                units: this.units.length ? this.units.toJSON() : {},
                servers: this.servers.length ? this.servers.toJSON() : {}
            }, this.model.toJSON());
        },
        onRender: function() {
            this.$(".selectpicker").selectpicker();
        },
        onSubmitForm: function (e) {
            /*e.preventDefault();
            var data = $(e.currentTarget).serializeObject();
            this.model.save(data, {
                method: "POST",
                patch: true,
                data: data,
                processData: true,
                success: function () {
                    Backbone.history.navigate("events/" + 0, {
                        trigger: true
                    });
                }
                //,error: function() {console.log("ERROR!!!")}
            });*/
        }
    });
});