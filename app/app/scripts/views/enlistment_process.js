define([
    "jquery",
    "underscore",
    "backbone",
    "hbs!templates/enlistment_process",
    "marionette",
    "bootstrap-select"
], function ($, _, Backbone, Template) {

    return Backbone.Marionette.ItemView.extend({
        template: Template,
        title: "Process Enlistment",
        events: {
            "submit form": "onSubmitForm"
        },
        initialize: function (options) {
            options = options || {};
            this.tps = options.tps || {};
            this.units = options.units || {};
            _.bindAll(this, "onSubmitForm");
            Backbone.Validation.bind(this);
        },
        serializeData: function () {
            return $.extend({
                tps: this.tps.length ? this.tps.at(0).get("children").toJSON() : {},
                units: this.units.length ? this.units.toJSON() : {}
            }, this.model.toJSON());
        },
        onRender: function() {
            this.$(".selectpicker").selectpicker();
        },
        onSubmitForm: function (e) {
            e.preventDefault();
            var data = $(e.currentTarget).serializeObject(),
                enlistmentId = this.model.get("id");
            this.model.save(data, {
                method: "POST",
                patch: true,
                data: data,
                processData: true,
                url: this.model.url() + "/process",
                success: function () {
                    Backbone.history.navigate("enlistments/" + enlistmentId, {
                        trigger: true
                    });
                }
                //,error: function() {console.log("ERROR!!!")}
            });
        }
    });
});