var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/member_eloa.html");
var Marionette = require("backbone.marionette");
require("backbone.validation");

  
  module.exports = Marionette.ItemView.extend({
      template: Template,
      events: {
          "submit form": "createELOA"
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
      createELOA: function(e) {
          e.preventDefault();
          var data = $(e.currentTarget).serializeObject(),
              memberId = this.member.get("id"),
              promises = [];
              var today = new Date();
              var dd = today.getDate();
              var mm = today.getMonth()+1; //January is 0!
              var yyyy = today.getFullYear();

                  if(dd<10) {
                      dd='0'+dd;
                  } 
                  if(mm<10) {
                      mm='0'+mm;
                  } 
                  today = yyyy+'/'+mm+'/'+dd;
          data.member_id = memberId;
          data.posting_date = today;
          this.model.set(data);
          
          if(this.model.isValid(true)) {
              // Add ELOA record
              promises.push(this.model.save(data, {
                  method: "POST",
                  patch: true,
                  data: data,
                  processData: true
              }));
              
              $.when.apply($, promises).done(function () {
                  Backbone.history.navigate("eloas", {
                      trigger: true
                  });
              });
          }
      }
  });
