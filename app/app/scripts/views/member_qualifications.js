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
            var model = this.model.toJSON();
            
            // Convert qualification model to JSON since .toJSON() is not recursive
            if(model.qualification !== undefined) model.qualification = model.qualification.toJSON();
            
            return _.extend({
                allowedTo: this.rootOptions.allowedTo
            }, model);
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