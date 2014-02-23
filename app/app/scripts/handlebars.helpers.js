/* Handlebars Helpers - Dan Harper (http://github.com/danharper) */

/* This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://sam.zoy.org/wtfpl/COPYING for more details. */

/**
 *  Following lines make Handlebars helper function to work with all
 *  three such as Direct web, RequireJS AMD and Node JS.
 *  This concepts derived from UMD.
 *  @courtesy - https://github.com/umdjs/umd/blob/master/returnExports.js
 */

(function (root, factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(require('handlebars'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['handlebars'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory(root.Handlebars);
    }
}(this, function (Handlebars) {

    /**
     * If Equals
     * if_eq this compare=that
     */
    Handlebars.registerHelper('if_eq', function(context, options) {
        if (context == options.hash.compare)
            return options.fn(this);
        return options.inverse(this);
    });

    /**
     * Unless Equals
     * unless_eq this compare=that
     */
    Handlebars.registerHelper('unless_eq', function(context, options) {
        if (context == options.hash.compare)
            return options.inverse(this);
        return options.fn(this);
    });


    /**
     * If Greater Than
     * if_gt this compare=that
     */
    Handlebars.registerHelper('if_gt', function(context, options) {
        if (context > options.hash.compare)
            return options.fn(this);
        return options.inverse(this);
    });

    /**
     * Unless Greater Than
     * unless_gt this compare=that
     */
    Handlebars.registerHelper('unless_gt', function(context, options) {
        if (context > options.hash.compare)
            return options.inverse(this);
        return options.fn(this);
    });


    /**
     * If Less Than
     * if_lt this compare=that
     */
    Handlebars.registerHelper('if_lt', function(context, options) {
        if (context < options.hash.compare)
            return options.fn(this);
        return options.inverse(this);
    });

    /**
     * Unless Less Than
     * unless_lt this compare=that
     */
    Handlebars.registerHelper('unless_lt', function(context, options) {
        if (context < options.hash.compare)
            return options.inverse(this);
        return options.fn(this);
    });


    /**
     * If Greater Than or Equal To
     * if_gteq this compare=that
     */
    Handlebars.registerHelper('if_gteq', function(context, options) {
        if (context >= options.hash.compare)
            return options.fn(this);
        return options.inverse(this);
    });

    /**
     * Unless Greater Than or Equal To
     * unless_gteq this compare=that
     */
    Handlebars.registerHelper('unless_gteq', function(context, options) {
        if (context >= options.hash.compare)
            return options.inverse(this);
        return options.fn(this);
    });


    /**
     * If Less Than or Equal To
     * if_lteq this compare=that
     */
    Handlebars.registerHelper('if_lteq', function(context, options) {
        if (context <= options.hash.compare)
            return options.fn(this);
        return options.inverse(this);
    });

    /**
     * Unless Less Than or Equal To
     * unless_lteq this compare=that
     */
    Handlebars.registerHelper('unless_lteq', function(context, options) {
        if (context <= options.hash.compare)
            return options.inverse(this);
        return options.fn(this);
    });

    /**
     * Convert new line (\n\r) to <br>
     * from http://phpjs.org/functions/nl2br:480
     */
    Handlebars.registerHelper('nl2br', function(text) {
        text = Handlebars.Utils.escapeExpression(text);
        var nl2br = (text + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>' + '$2');
        return new Handlebars.SafeString(nl2br);
    });
    
    /**
     * If in array
     * if_inarray key array
     */
    Handlebars.registerHelper('if_inarray', function(context, options) {
        if (options.hash.compare.indexOf(context) > -1)
            return options.fn ? options.fn(this) : true;
        return options.inverse ? options.inverse(this) : false;
    });
    
    Handlebars.registerHelper('inarray', function(context, options) {
        return (options.hash.haystack.indexOf(options.hash.needle) > -1) ? "1" : "0";
    });
    
    /** 
     *  format an ISO date using Moment.js
     *  http://momentjs.com/
     *  moment syntax example: moment(Date("2011-07-18T15:50:52")).format("MMMM YYYY")
     *  usage: {{dateFormat creation_date format="MMMM YYYY"}}
     */
    Handlebars.registerHelper('dateFormat', function(context, block) {
      if (window.moment) {
        var f = block.hash.format || "MMM Do, YYYY";
        return window.moment(context).format(f);
      } else {
        return context;   //  moment plugin not available. return data as is.
      }
    });
    
    /** 
     * Join array on delimiter
     * x.join(y)
     */
    Handlebars.registerHelper('join', function(context, block) {
        return context.join(block.hash.delimiter);
    });
    
    /**
     * If OR
     */
    Handlebars.registerHelper('or', function (a, b, options) {
        if (a || b) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });
    
    Handlebars.registerHelper('add', function(a, b) {
        return a + b;
    });
    
    Handlebars.registerHelper('subtract', function(a, b) {
        return a - b;
    });
    
    Handlebars.registerHelper('length', function(x) {
        return x.length;
    });
    
    Handlebars.registerHelper('select', function( value, options ){
        var $el = $('<select />').html( options.fn(this) );
        $el.find('[value=' + value + ']').attr({'selected':'selected'});
        return $el.html();
    });
    
    /**
     * Chain multiple functions together
     * ie. {{chain "taxAdd" "formatPrice" this.product.price}}
     * https://github.com/wycats/handlebars.js/issues/304#issuecomment-15635762
     */
    Handlebars.registerHelper('chain', function () {
        var helpers = [], value;
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

}));