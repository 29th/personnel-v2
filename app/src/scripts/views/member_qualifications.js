var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Qualification = require("../models/qualification"),
  Template = require("../templates/member_qualifications.html"),
  GameTemplate = require("../templates/member_qualifications_game.html"),
  WeaponTemplate = require("../templates/member_qualifications_weapon.html"),
  BadgeTemplate = require("../templates/member_qualifications_badge.html"),
  StandardTemplate = require("../templates/member_qualifications_standard.html");
var Marionette = require("backbone.marionette");

  
  var StandardView = Marionette.ItemView.extend({
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
//------------------------------------------------------------------------------  
  var BadgeView = Marionette.CompositeView.extend({
      itemView: StandardView,
      itemViewContainer: "ul",
      template: BadgeTemplate,
      className: "tab-pane",
      initialize: function(options) {
          this.collection = this.model.get("children");
          this.rootOptions = options.rootOptions || {};
          this.rootOptions.badge = this.model.get("badge");
          var className = (this.rootOptions.game + this.rootOptions.weapon + this.model.get("badge")).replace(/ /g, "");
          this.$el.addClass(className);
      },
      itemViewOptions: function() {
          return {
              rootOptions: this.rootOptions
          };
      }
  });
//------------------------------------------------------------------------------  
  var WeaponView = Marionette.CompositeView.extend({
      itemView: BadgeView,
      itemViewContainer: ".tab-content",
      template: WeaponTemplate,
      initialize: function(options) {
          this.collection = this.model.get("children");
          this.rootOptions = options.rootOptions || {};
          this.rootOptions.weapon = this.model.get("weapon");
      },
      itemViewOptions: function() {
          return {
              rootOptions: this.rootOptions
          };
      },
      serializeData: function() {
          return $.extend({
              badges: this.collection.toJSON(),
              game: this.rootOptions.game
          }, this.model.toJSON());
      },
      onRender: function() {
          // Set first badge tab to be displayed by default
          this.$(".tab-pane").eq(0).addClass("active");
          this.$(".nav-tabs li").eq(0).addClass("active");
      }
  });
//------------------------------------------------------------------------------  
  var GameView = Marionette.CompositeView.extend({
      itemView: WeaponView,
      template: GameTemplate,
      className: "gametab-pane",
      initialize: function(options) {
          this.collection = this.model.get("children");
          this.rootOptions = options.rootOptions || {};
          this.rootOptions.game = this.model.get("game");
          var className = ('game_' + this.rootOptions.game).replace(/ /g, "");
          this.$el.addClass(className);
      },
      itemViewOptions: function() {
          return {
              rootOptions: this.rootOptions
          };
      }
  });
  
//------------------------------------------------------------------------------  
  // Container view
  module.exports = Marionette.CompositeView.extend({
      itemView: GameView,
      itemViewContainer: ".gametab-content",
      template: Template,
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
      onRender: function() {
          // Set first badge tab to be displayed by default
          this.$(".gametab-pane").eq(0).addClass("active");
          this.$(".nav-tabs li").eq(0).addClass("active");
      },
      itemViewOptions: function() {
          return {
              rootOptions: this.rootOptions
          };
      }
  });
