define([
    "jquery"
    , "underscore"
    , "backbone"
    , "config"
    , "hbs!templates/event"
    , "views/event_attendee"
    , "marionette"
    ], function ($, _, Backbone, config, EventTemplate, AttendeeView) {

    return Backbone.Marionette.CompositeView.extend({
        template: EventTemplate,
        itemView: AttendeeView,
        itemViewContainer: "ul",
        events: {
            "click #loa-cancel, #loa-post": "onClickLOA"
        },
        initialize: function (options) {
            options = options || {};
            _.bindAll(this, "onClickLOA");
            this.user = options.user || {};
            this.permissions = options.permissions || {};
            this.permissions.on("reset", this.render, this);

            this.unitPermissions = options.unitPermissions || {};
            this.unitPermissions.on("reset", this.render, this);
        },
        onBeforeRender: function () {
            var user_id = this.options.user.get("id"),
                rsvp = this.getRSVP(this.options.user.get("id"));
            this.model.set("user_expected", this.isExpected(this.model));
            if (rsvp) this.model.set("user_rsvp", rsvp.toJSON());
        },
        onRender: function () {
            if (this.model.get("unit").abbr) this.title = this.model.get("unit").abbr + " " + this.model.get("type");
        },
        serializeData: function () {
            return _.extend({
                permissions: this.permissions.length ? this.permissions.pluck("abbr") : [],
                unitPermissions: this.unitPermissions.length ? this.unitPermissions.pluck("abbr") : []
            }, this.model.toJSON());
        },
        isExpected: function (event) {
            var expected = false;
            if (this.options.userAssignments.length && event.get("unit").id) {
                this.options.userAssignments.any(function (assignment) {
                    if (!assignment.get("path_array")) {
                        assignment.set("path_array", assignment.get("unit").path.split("/").map(function (i) {
                            if (i) return parseInt(i, 10);
                        }));
                    }
                    if (assignment.get("unit").id === event.get("unit").id || assignment.get("path_array").indexOf(parseInt(event.get("unit").id, 10)) > -1) {
                        expected = true;
                        return true;
                    }
                });
            }
            return expected;
        },
        getRSVP: function (user_id) {
            return this.collection.find(function (model) {
                return model.get("member").id === user_id;
            });
        },
        onClickLOA: function (e) {
            e.preventDefault();
            var button = e.currentTarget,
                excuse = (button.id === "loa-post" ? 1 : 0),
                model = this.getRSVP(this.user.get("id"));

            // If attendance has already been posted
            if (model && model.get("attended") !== null) {
                model.save({
                    excused: excuse
                }, {
                    method: excuse ? "POST" : "DELETE",
                    wait: true,
                    success: function () {
                        $(button).parent().removeClass(excuse ? "loa-post" : "loa-cancel").addClass(excuse ? "loa-cancel" : "loa-post");
                    }
                });
            }
            // If attendance hasn't been posted yet
            else {
                // If posting LOA
                if (excuse) {
                    // TODO: Why doesn't this trigger "request" on the collection?
                    this.collection.create({
                        attended: null,
                        excused: 1,
                        member: {
                            id: this.user.get("id"),
                            short_name: this.user.get("short_name")
                        }
                    }, {
                        wait: true,
                        success: function () {
                            $(button).parent().removeClass("loa-post").addClass("loa-cancel");
                        }
                    });
                }
                // If cancelling LOA
                else {
                    model.id = this.user.get("id"); // Allows .destroy() to sync even though we don't need it
                    model.destroy({
                        url: config.apiHost + "/events/" + this.collection.id + "/excuse",
                        wait: true,
                        success: function () {
                            $(button).parent().removeClass("loa-cancel").addClass("loa-post");
                            // TODO: Why doesn't this trigger "sync" on the model/collection?
                        }
                    });
                }
            }
        }
    });
});