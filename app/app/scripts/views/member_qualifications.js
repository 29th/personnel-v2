define([
    "jquery",
    "underscore",
    "backbone",
    "models/qualification",
    "hbs!templates/member_qualifications_game",
    "hbs!templates/member_qualifications_weapon",
    "hbs!templates/member_qualifications_badge",
    "hbs!templates/member_qualifications_standard",
    "marionette"
], function ($, _, Backbone, Qualification, GameTemplate, WeaponTemplate, BadgeTemplate, StandardTemplate) {
    
    /*return Backbone.Marionette.ItemView.extend({
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
    });*/
    
    var StandardView = Backbone.Marionette.ItemView.extend({
        template: StandardTemplate,
        initialize: function(options) {
            this.rootOptions = options.rootOptions || {};
            _.bindAll(this, "onToggleQualification");
        },
        onBeforeRender: function() {
            var model = this.model;
            // Check if member has qualified for this standard
            if(this.rootOptions.qualifications.length) {
                var qualified = this.rootOptions.qualifications.filter(function(qualification) { return qualification.get("standard").id === model.get("id"); });
                if(qualified.length) {
                    model.set("qualification", qualified[0]);
                }
            }
        },
        events: {
            "click .cursor": "onToggleQualification"
        },
        modelEvents: {
            "change": "render" // Coulda sworn marionette did this out of the box...
        },
        serializeData: function() {
            return _.extend({
                allowedTo: this.rootOptions.allowedTo
            }, this.model.toJSON());
        },
        onToggleQualification: function(e) {
            var self = this;
            if(this.model.get("qualification")) {
                console.log("Deleting", this.model.get("qualification").toJSON());
                this.model.get("qualification").destroy({
                    wait: true,
                    success: function() {
                        self.model.unset("qualification");
                    }
                });
            } else {
                var standard_id = $(e.currentTarget).attr("data-standard-id");
                (new Qualification()).save(null, {
                    data: {
                        member_id: this.rootOptions.member_id,
                        standard_id: standard_id
                    },
                    processData: true,
                    success: function(model, response, options) {
                        self.model.set("qualification", model);
                    }
                });
                //this.render(); // Re-render the standard
            }
            e.preventDefault();
        }
    });
    
    var BadgeView = Backbone.Marionette.CompositeView.extend({
        itemView: StandardView,
        itemViewContainer: "ul",
        template: BadgeTemplate,
        initialize: function(options) {
            this.collection = this.model.get("children");
            this.rootOptions = options.rootOptions || {};
        },
        itemViewOptions: function() {
            return {
                rootOptions: this.rootOptions
            };
        }
    });
    
    var WeaponView = Backbone.Marionette.CompositeView.extend({
        itemView: BadgeView,
        template: WeaponTemplate,
        initialize: function(options) {
            this.collection = this.model.get("children");
            this.rootOptions = options.rootOptions || {};
        },
        itemViewOptions: function() {
            return {
                rootOptions: this.rootOptions
            };
        }
    });
    
    var GameView = Backbone.Marionette.CompositeView.extend({
        itemView: WeaponView,
        template: GameTemplate,
        initialize: function(options) {
            this.collection = this.model.get("children");
            this.rootOptions = options.rootOptions || {};
        },
        itemViewOptions: function() {
            return {
                rootOptions: this.rootOptions
            };
        }
    });
    
    // Container view
    return Backbone.Marionette.CollectionView.extend({
        itemView: GameView,
        initialize: function(options) {
            options = options || {};
            this.permissions = options.permissions  || {};
            this.memberPermissions = options.memberPermissions  || {};
            this.rootOptions = {
                qualifications: options.qualifications  || {},
                member_id: options.member_id
            };
        },
        onBeforeRender: function(event) {
            var permissions = this.permissions.length ? this.permissions.pluck("abbr") : [],
                memberPermissions = this.memberPermissions.length ? this.memberPermissions.pluck("abbr") : [];
            this.rootOptions.allowedTo = {
                addQualification: memberPermissions.indexOf("qualification_add") !== -1 || permissions.indexOf("qualification_add_any") !== -1
            };
        },
        itemViewOptions: function() {
            return {
                rootOptions: this.rootOptions
            };
        }
    });
});