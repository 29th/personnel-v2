var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/enlistment_edit.html"),
  Countries = require("../countries.json");
var Marionette = require("backbone.marionette");

require("backbone.validation");


  module.exports = Marionette.ItemView.extend({
      template: Template,
      title: "Modify Enlistment",
      events: {
          "submit form": "onSubmitForm",
          "click .btn-add": "onClickBtnAdd",
          "click .btn-remove": "onClickBtnRemove"
      },
      initialize: function (options) {
          options = options || {};
          this.tps = options.tps || {};
          this.userdata = options.user || {};
          _.bindAll(this, "onSubmitForm","onClickBtnAdd","onClickBtnRemove");
          this.ages = [];
          this.unitsTableRowCount = 0;
          var i;
          for (i = 13; i <= 99; i++) {
              this.ages.push(i);
          }
          Backbone.Validation.bind(this);
      },
      serializeData: function () {
          return $.extend({
              ages: this.ages,
              countries: Countries,
              userdata: _.isEmpty(this.userdata) ? [] : this.userdata.toJSON(),
              tps: this.tps.length ? this.tps.at(0).get("children").toJSON() : {}
          }, this.model.toJSON());
      },
      onClickBtnRemove: function (e) {
          $(e.currentTarget).parent().parent().remove();
      },
      onClickBtnAdd: function (e) {
          if (this.unitsTableRowCount == 0)
            this.unitsTableRowCount = $(".units-table tbody tr").length;
          var point = $('.units-table').find('tbody'),
              indexVal = this.unitsTableRowCount++,//$(".units-table tbody tr").length,
              newRowContent = "<tr>" +
'                    <td><input type="text" class="form-control" name="previous_units['+indexVal+'][unit]" id="previous_units[unit]" value=""></td>'+
'                    <td>'+
'                        <select class="form-control" name="previous_units['+indexVal+'][game]" id="previous_units[game]">'+
'                            <option value="">Select...</option>'+
'                            <option value="Arma 2">Arma 2</option>'+
'                            <option value="Arma 3">Arma 3</option>'+
'                            <option value="DH">Darkest Hour</option>'+
'                            <option value="DOD">Day of Defeat</option>'+
'                            <option value="DODS">Day of Defeat: Source</option>'+
'                            <option value="RO">Red Orchestra</option>'+
'                            <option value="RO2">Red Orchestra 2</option>'+
'                            <option value="RS">Rising Storm</option>'+
'                            <option value="RS2">Rising Storm 2: Vietnam</option>'+
'                            <option value="SQ">Squad</option>'+
'                        </select>'+
'                    </td>'+
'                    <td><input type="text" class="form-control" name="previous_units['+indexVal+'][name]" id="previous_units[name]" value=""></td>'+
'                    <td><input type="text" class="form-control" name="previous_units['+indexVal+'][rank]" id="previous_units[rank]" value=""></td>'+
'                    <td><input type="text" class="form-control" name="previous_units['+indexVal+'][reason]" id="previous_units[reason]" value=""></td>'+
'                    <td><button type="button" class="btn btn-default btn-remove"> - </button></td>'+
'                </tr>';
          point.append(newRowContent);
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
                  Backbone.history.navigate("enlistments/" + model.get("id"), {
                      trigger: true
                  });
              },
              error: function(model, response, options) {
                  alert(Object.values(response.responseJSON.error));
                  console.log( "Error 12.1" );
              }
          });
      }
  });
