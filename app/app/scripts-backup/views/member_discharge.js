define([
    "jquery",
    "underscore",
    "backbone",
    "hbs!templates/member_discharge",
    "marionette",
    "backbone.validation"
], function ($, _, Backbone, Template) {
    
    return Backbone.Marionette.ItemView.extend({
        template: Template,
        events: {
            "submit form": "executeDischarge"
        },
        initialize: function(options) {
            options = options || {};
            this.member = options.member || {};
            Backbone.Validation.bind(this);
        },
        serializeData: function() {
            return $.extend({
                member: this.member.toJSON()
            }, this.model.toJSON());
        },
        executeDischarge: function(e) {
            e.preventDefault();
            var data = $(e.currentTarget).serializeObject(),
                memberId = this.member.get("id"),
                promises = [];
            data.member_id = memberId;
            data.forum_id = "Vanilla";
            this.model.set(data);
            
            if(this.model.isValid(true)) {
                // End all assignments
                promises.push($.ajax({
                    method: "POST",
                    url: this.member.url() + "/discharge"
                }));
                
                // Add discharge record
                promises.push(this.model.save(data, {
                    method: "POST",
                    patch: true,
                    data: data,
                    processData: true
                }));
                
                $.when.apply($, promises).done(function () {
                    Backbone.history.navigate("members/" + memberId + "/servicerecord", {
                        trigger: true
                    });
                });
            }
        }
    });
});