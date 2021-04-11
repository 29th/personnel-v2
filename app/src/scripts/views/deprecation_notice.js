var FlashView = require("./flash"),
  Template = require("../templates/deprecation_notice.html");

module.exports = FlashView.extend({
  template: Template,
  initialize: function (options) {
    options = options || {};
    this.url = options.url || "https://www.29th.org/admin";
  },
  serializeData: function () {
    return {
      url: this.url
    }
  }
})
