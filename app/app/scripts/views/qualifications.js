define([
    "jquery",
    "underscore",
    "backbone",
    "hbs!templates/qualifications",
    "marionette"
], function ($, _, Backbone, Template) {
    
    return Backbone.Marionette.ItemView.extend({
        template: Template,
        initialize: function (options) {
            options = options || {};
            this.awards = options.awards || false;
        },
        serializeData: function () {
            var standards = this.collection.toJSON(),
                awards = this.awards.toJSON(),
                sorted = {},
                level = '',
                type = '';
            _.each(standards, function (standard) {
                // Sort into hierarchy of weapon > badge [standards]
                if (sorted[standard.weapon] === undefined)
                  sorted[standard.weapon] = {};
                if (sorted[standard.weapon][standard.badge] === undefined) {
                  sorted[standard.weapon][standard.badge] = [];
                  sorted[standard.weapon][standard.badge].aqb_path = standard.badge + '\\' + standard.weapon.replace(' ','');
                  sorted[standard.weapon][standard.badge].aqb_path = sorted[standard.weapon][standard.badge].aqb_path.toLowerCase();
                }
                sorted[standard.weapon][standard.badge].push(standard);
            });
            //Correcting paths for EIB and SLT
            sorted.EIB['N/A'].aqb_path = 'eib';
            sorted.SLT['N/A'].aqb_path = 'slt';
            //Marking AQB achieved
            _.each(awards, function (award) {
                if ( award.award.abbr == 'eib') 
                  sorted.EIB['N/A'].aqb = 1; 
                if ( award.award.abbr == 'acamp') 
                  sorted.SLT['N/A'].aqb = 1; 
                if ( award.award.abbr.substr(1,1)===':' )
                {
                   level = award.award.name.substr(0, award.award.name.indexOf(' ') );
                   type  = award.award.name.substr( award.award.name.indexOf(':')+2 );
                   type  = type.substr( 0,  type.indexOf('(')-1 );
                   type  = type.replace('Submachine Gun','SMG');
                   sorted[type][level].aqb = 1;
                }
            });
            return {
                items: sorted
            };
        }
    });
});