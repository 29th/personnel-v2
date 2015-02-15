var $ = require("jquery"),
  _ = require("underscore");
require("backbone.validation");

      
  // Auto-enable input validation
  //_.extend(Backbone.Model.prototype, Backbone.Validation.mixin);
  
  // Modify input validation to work with bootstrap
  _.extend(Backbone.Validation.callbacks, {
      valid: function (view, attr, selector) {
          var $el = view.$("[name=" + attr + "]"), 
              $group = $el.closest(".form-group"),
              $msgContainer = $group.find(".error-msg");
          if( ! $msgContainer.length) $msgContainer = $("<div/>").addClass("help-block").addClass("error-msg").appendTo($group);
          
          $group.removeClass("has-error");
          $msgContainer.html("").addClass("hidden");
      },
      invalid: function (view, attr, error, selector) {
          var $el = view.$("[name=" + attr + "]"), 
              $group = $el.closest(".form-group"),
              $msgContainer = $group.find(".error-msg");
          if( ! $msgContainer.length) $msgContainer = $("<div/>").addClass("help-block").addClass("error-msg").appendTo($group);
          
          $group.addClass("has-error");
          $msgContainer.html(error).removeClass("hidden");
      }
  });
