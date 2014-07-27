define([
    "jquery",
    "underscore",
    "backbone",
    "hbs!templates/assignment_edit",
    "marionette",
    "bootstrap-datepicker"
], function ($, _, Backbone, Template) {

    return Backbone.Marionette.ItemView.extend({
        template: Template,
        title: "Modify Assignment",
        events: {
            "submit form": "onSubmitForm"
        },
        initialize: function (options) {
            options = options || {};
            this.units = options.units || {};
            this.positions = options.positions || {};
            _.bindAll(this, "onSubmitForm");
            Backbone.Validation.bind(this);
        },
        serializeData: function () {
            return $.extend({
                units: this.units.length ? this.units.toJSON() : {},
                positions: this.positions.length ? this.positions.toJSON() : {}
            }, this.model.toJSON());
        },
        onRender: function() {
            this.$(".selectpicker").selectpicker();
        },
        onSubmitForm: function (e) {
            e.preventDefault();
            var data = $(e.currentTarget).serializeObject(),
                memberId = this.model.get("member").id;
            this.model.save(data, {
                method: "POST",
                patch: true,
                data: data,
                processData: true,
                success: function () {
                    Backbone.history.navigate("members/" + memberId + "/servicerecord", {
                        trigger: true
                    });
                }
                //,error: function() {console.log("ERROR!!!")}
            });
        }
    });
});