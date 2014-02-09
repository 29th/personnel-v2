define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"hbs!templates/member_admin"
    ,"marionette"
], function($, _, Backbone, MemberAdminTemplate) {
    var MemberAdminView = Backbone.Marionette.ItemView.extend({
        template: MemberAdminTemplate
        ,serializeData: function() {
            return {member_id: this.collection.member_id, items: this.collection.pluck("abbr")};
        }
    });
    
    return MemberAdminView;
});