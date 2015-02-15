define([
    "jquery",
    "underscore",
    "handlebars",
    "moment-duration-format",
    "bbcode"
], function ($, _, Handlebars, moment, bbcode) {

    /** 
     *  format an ISO date using Moment.js
     *  http://momentjs.com/
     *  moment syntax example: moment(Date("2011-07-18T15:50:52")).format("MMMM YYYY")
     *  usage: {{dateFormat creation_date format="MMMM YYYY"}}
     */
    Handlebars.registerHelper('dateFormat', function (context, block) {
        if (moment) {
            var f = block.hash.format || "YYYY-MM-DD"; // "ll"
            return moment(context).format(f);
        } else {
            return context; //  moment plugin not available. return data as is.
        }
    });

    /** 
     * Join array on delimiter
     * x.join(y)
     */
    Handlebars.registerHelper('join', function (context, block) {
        return context.join(block.hash.delimiter);
    });

    /**
     * If OR, If AND
     */
    Handlebars.registerHelper('or', function (a, b, options) {
        if (a || b) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });

    Handlebars.registerHelper('and', function (a, b, options) {
        if (a && b) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });

    Handlebars.registerHelper('add', function (a, b) {
        return a + b;
    });

    Handlebars.registerHelper('subtract', function (a, b) {
        return a - b;
    });

    Handlebars.registerHelper('multiply', function (a, b) {
        return a * b;
    });

    Handlebars.registerHelper('divide', function (a, b) {
        return a / b;
    });

    Handlebars.registerHelper('length', function (x) {
        return x.length;
    });
    
    Handlebars.registerHelper('decimals', function(a) {
        return Number(a).toFixed(2);
    });

    Handlebars.registerHelper('select', function (value, options) {
        var $el = $('<select />').html(options.fn(this));
        $el.find('[value="' + value + '"]').attr({
            'selected': 'selected'
        });
        return $el.html();
    });

    Handlebars.registerHelper('toLowerCase', function (value) {
        return (value && typeof value === "string") ? value.toLowerCase() : value;
    });

    /**
     * Chain multiple functions together
     * ie. {{chain "taxAdd" "formatPrice" this.product.price}}
     * https://github.com/wycats/handlebars.js/issues/304#issuecomment-15635762
     */
    Handlebars.registerHelper('chain', function () {
        var helpers = [],
            value;
        $.each(arguments, function (i, arg) {
            if (Handlebars.helpers[arg]) {
                helpers.push(Handlebars.helpers[arg]);
            } else {
                value = arg;
                $.each(helpers, function (j, helper) {
                    value = helper(value, arguments[i + 1]);
                });
                return false;
            }
        });
        return value;
    });

    // Beautifully simple, from https://gist.github.com/flesch/315070
    Handlebars.registerHelper('sprintf', function() {
        var args = Array.prototype.slice.call(arguments);
        return args.shift().replace(/%s/g, function(){
            return args.shift();
        });
    });

    Handlebars.registerHelper('substring', function () {
        var string = arguments[0],
            args = Array.prototype.slice.call(arguments, 1, -1);
        return String.prototype.substring.call(string, args);
    });

    Handlebars.registerHelper('enlistment_label', function (status) {
        return (status === "Accepted" ? "primary" : (status === "Withdrawn" ? "warning" : (status === "Denied" ? "danger" : "default")));
    });

    Handlebars.registerHelper('bbcode', function (string) {
        return new Handlebars.SafeString(bbcode.render(string.replace(/\n/g, "<br>")));
    });

    Handlebars.registerHelper('within_24_hours', function (a, b) {
        var moment_a = moment(a),
            moment_b = typeof b === "string" ? moment(b) : moment();
        return Math.abs(moment_a.diff(moment_b, 'hours')) <= 24;
    });

    Handlebars.registerHelper('past', function (date) {
        return moment(date).isBefore(moment());
    });
    
    Handlebars.registerHelper('duration', function(days) {
        return moment.duration(days, 'days').format('Y [years], M [months], [and] D [days]');
    });

    Handlebars.registerHelper('award_img_name', function (award) {
        beg = award.substr(0, 2);
        switch (beg) {
        case "m:":
          return "marks";
        case "s:":
          return "sharps";
        case "e:":
          return "expert";
        }
        return award;
    });

    Handlebars.registerHelper('str_replace', function (str, from, to) {
        return str.replace(from, to);
    });

    Handlebars.registerHelper('times', function(n, block) {
        var accum = '';
        for(var i = 0; i < n; ++i)
            accum += block.fn(i);
        return accum;
    });
    
    // debug helper
    // usage: {{debug}} or {{debug someValue}}
    // from: @commondream (http://thinkvitamin.com/code/handlebars-js-part-3-tips-and-tricks/)
    Handlebars.registerHelper("debug", function(optionalValue) {
        console.log("Current Context");
        console.log("====================");
        console.log(this);
        
        if (optionalValue) {
            console.log("Value");
            console.log("====================");
            console.log(optionalValue);
        }
    });
    
});