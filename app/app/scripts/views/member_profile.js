define([
    "jquery"
    , "underscore"
    , "backbone"
    , "hbs!templates/member_profile"
    , "marionette"
    ], function ($, _, Backbone, MemberProfileTemplate) {
    var MemberProfileView = Backbone.Marionette.ItemView.extend({
        template: MemberProfileTemplate
    });

    return MemberProfileView;
});