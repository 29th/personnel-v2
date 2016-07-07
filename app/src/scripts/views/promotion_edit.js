var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  config = require("../config"),
  Template = require("../templates/promotion_edit.html"),
  Countries = require("../countries.json"),
  moment = require("moment"),
  util = require("../util");
var Marionette = require("backbone.marionette");
require("backbone.validation");


  module.exports = Marionette.ItemView.extend({
      template: Template,
      title: "New Promotion",
      events: {
          "submit form": "onSubmitForm"
      },
      initialize: function (options) {
          options = options || {};
          this.member = options.member || {};
          this.ranks = options.ranks || {};
          this.units = options.units || {};
          _.bindAll(this, "onSubmitForm");
          Backbone.Validation.bind(this);
      },
      serializeData: function () {
          return $.extend({
              member: this.member.toJSON(),
              ranks: this.ranks.toJSON(),
              units: this.units.toJSON(),
          }, this.model.toJSON());
      },
      onRender: function() {
          this.$(".selectpicker").selectpicker();
      },
      onSubmitForm: function (e) {
          e.preventDefault();
          var data = $(e.currentTarget).serializeObject();
          this.model.save(data, {
            method: "POST",
            patch: true,
            data: data,
            processData: true,
            success: function (model, response, options) {
                  Backbone.history.navigate("members/" + model.get("member_id"), {
                      trigger: true
                  });
            },
            error: function() {console.log("ERROR!!!")}
          });
      }
/* 
//This is new version - using forums/api
      onSubmitForm: function (e) 
      {
          e.preventDefault();
         //prepering data for posting
          var data = $(e.currentTarget).serializeObject(),
              mod = this.model;
//and now based on if we want to post to forums or not we either just save the model OR verify model -> post to forums -> save model
          if ( data.do_forum_post == "on" )
          {
            data.topic_id = 0;
            if (!mod.validate(data, {
              method: "POST",
              patch: true,
              data: data,
              processData: true,
              success: function (model, response, options) { Backbone.history.navigate("members/" + model.get("member_id"), {trigger: true} ); },
              error: function(a,b,c) {console.log("ERROR!!!");}
            }) ) 
            { //Validation returned null - is successfull
              var 
                url = config.forum.Vanilla.baseUrl + config.forum.Vanilla.apiPath + '/discussions',
                mem = this.member.toJSON(),
                ranks = this.ranks.toJSON(),
                quote = data.quoted_member_id.split(','),
                discussion_data = 
                {
                  Name    : 'Promotion (' + mem.full_name + ')',
                  Body    : ( data.quoted_member_id ? '[' +quote[1] + '](/#members/' +quote[0] + ') said:\r\n>' + data.content.replace(/\n/g,'\n>') + '\r\n\r\n' : '' ) + '___\r\n\r\n<center style="box-sizing: border-box;">\r\n\r\n![Army Seal](http://29th.org/ForumPostImages/29thsealheaderblack_lightened.png "Army Seal")\r\n\r\n<span style=\'font-size: xx-large\'>CERTIFICATION OF PROMOTION</span>\r\n\r\n<b>TO ALL WHO SHALL SEE THESE PRESENTS, GREETING:</b>\r\n<font size="3" >Know Ye, that reposing special trust and<br> confidence in the fidelity and abilities of</font>\r\n<br>\r\n[' + mem.full_name + '](http://personnel.29th.org/#members/' + mem.id + ')&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + mem.steam_id.substr(-9) + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + mem.unit.abbr + '\r\n\r\n<font size="3">I do promote him to <u style="font-family: \'Courier New\';">' + ranks[this.ranks.pluck('id').indexOf(data['new_rank_id'])].name + '</u> in the </font>\r\n\r\n<font size="6">UNITED STATES ARMY</font>\r\n\r\nto rank as such from the <u>'+moment(data.date).format("Do")+'</u> day of <u>'+moment(data.date).format("MMMM YYYY")+'</u>.\r\n\r\n<p style=\'font-size:0.9em;\'>You are charged to discharge carefully and diligently the duties of the grade to which promoted and to uphold the traditions and standards of the Army.\r\n\r\nEffective with this promotion you are charged to execute diligently your special skills with a high degree of technical proficiency and to maintain standards of performance, moral courage and dedication to the Army which will serve as outstanding examples to your fellow soldiers. You are charged to observe and follow the orders and directions given by superiors acting according to the law, articles and rules governing the discipline of the Army. Your unfailing trust in superiors and loyalty to your peers will significantly contribute to the readiness and honor of the United States Army.</p>\r\n\r\n\r\n\r\n![ ](http://29th.org/ForumPostImages/29th_seal_footer_edited.png " ")\r\n\r\n</center>\r\n\r\n<img style=\'float:right;\' src=\'http://i.imgur.com/3lrc3IB.png\' />\r\n\r\n<br>\r\n\r\n<br>\r\n\r\n<br>\r\n\r\n___',
                 CategoryID : config.vanillaCategoryPromotions
                };
              Backbone.$.ajax( {
                method  : "POST",
                url     : url,
                data    : JSON.stringify(discussion_data),
                dataType: 'json',
                contentType: "application/json",
                success : function ( dis ) 
                {
                  data.topic_id = dis.Discussion.DiscussionID;
                  mod.save(data, {
                    method: "POST",
                    patch: true,
                    data: data,
                    processData: true,
                    success: function (model, response, options) {
                        Backbone.history.navigate("members/" + model.get("member_id"), { trigger: true });
                    },
                    error: function() {console.log("ERROR!!!");}
                  }); 
                }
              });
            }//successfull validation
        } //Post to forums?
        else //No posting to forums
        {
          data.topic_id = 0;
          mod.save(data, 
          {
            method: "POST",
            patch: true,
            data: data,
            processData: true,
            success: function (model, response, options) 
            {
                Backbone.history.navigate("members/" + model.get("member_id"), { trigger: true });
    
            },
            error: function() {console.log("ERROR!!!");}
          }); 
        }
      }
*/
  });
