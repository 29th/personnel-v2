define([
    "jquery",
    "underscore",
    "backbone",
    "hbs!templates/member_qualifications",
    "marionette"
], function ($, _, Backbone, Template) {
    
    return Backbone.Marionette.ItemView.extend({
        template: Template,
        initialize: function (options) {
            options = options || {};
            this.qualifications = options.qualifications  || {};
            this.permissions = options.permissions  || {};
            this.memberPermissions = options.memberPermissions  || {};
            //this.awards = options.awards || false;
        },
        serializeData: function() {
            var permissions = this.permissions.length ? this.permissions.pluck("abbr") : [],
                memberPermissions = this.memberPermissions.length ? this.memberPermissions.pluck("abbr") : [],
                qualifications = this.qualifications,
                sortedStandards = {},
                allowedTo = {
                    addQualification: memberPermissions.indexOf("qualification_add") !== -1 || permissions.indexOf("qualification_add_any") !== -1
                };
            _.each(this.collection.toJSON(), function(standard) {
                // Set default values so objects don't break
                if( ! standard.game) standard.game = "N/A";
                if( ! standard.weapon) standard.weapon = "N/A";
                if( ! standard.badge) standard.badge = "N/A";
                
                // Make sure dimensions exists
                if(sortedStandards[standard.game] === undefined) {
                    sortedStandards[standard.game] = {};
                }
                if(sortedStandards[standard.game][standard.weapon] === undefined) {
                    sortedStandards[standard.game][standard.weapon] = {};
                }
                if(sortedStandards[standard.game][standard.weapon][standard.badge] === undefined) {
                    sortedStandards[standard.game][standard.weapon][standard.badge] = [];
                }
                
                // Check if member has qualified for this standard
                var qualified = qualifications.filter(function(qualification) { return qualification.get("standard").id === standard.id; });
                if(qualified.length) {
                    standard.qualification = qualified[0].toJSON();
                }
                
                // Add this standard to its group
                sortedStandards[standard.game][standard.weapon][standard.badge].push(standard);
            });
            
            return {
                standards: sortedStandards,
                allowedTo: allowedTo
            };
        }
    });
});