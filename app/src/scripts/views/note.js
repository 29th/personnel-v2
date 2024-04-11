var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/note.html");
var Marionette = require("backbone.marionette");

  
  module.exports = Marionette.ItemView.extend({
      template: Template,
      title: "Note",
      initialize: function(options) {
          options = options || {};
          this.permissions = options.permissions || {};
          this.permissions.on("reset", this.render, this);
      },
      serializeData: function () {
          var permissions = this.permissions.length ? this.permissions.pluck("abbr") : [],
              allowedTo = {
                  editNote: (permissions.indexOf("note_view_all") !== -1 || permissions.indexOf("note_view_mp") !== -1 || permissions.indexOf("note_view_co") !== -1 || permissions.indexOf("note_view_pl") !== -1 || permissions.indexOf("note_view_sq") !== -1 || permissions.indexOf("note_view_lh") !== -1 )
              };
          return $.extend({
              allowedTo: allowedTo
          }, this.model.toJSON());
      },
      events: {
          "click .add_note" : "onClickAddNote",
          "click .edit_note": "onClickEditNote"
      },
      onClickAddNote: function () {
          Backbone.history.navigate('members/' + this.model.get("member").id + '/notes/add', {
                          trigger: true
                      });
      },
      onClickEditNote: function () {
          Backbone.history.navigate('notes/' + this.model.id + '/edit', {
                          trigger: true
                      });
      },
      onRender: function () {
          if (this.model.get("member") && this.model.get("member").short_name)
              this.title = "Note - " + this.model.get("member").short_name;
      },
  });
