var $ = require("jquery"),
  _ = require("underscore"),
  Handlebars = require("hbsfy/runtime"),
  moment = require("moment"),
  bbcode = require("bbcode"),
  util = require("../util"),
  config = require("../config");
require("moment-duration-format");


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
    return (status === "Accepted" ? "primary" : (status === "Withdrawn" ? "warning" : (status === "Denied" ? "danger" : (status === "AWOL" ? "info" : "default"))));
});

Handlebars.registerHelper('bbcode', function (string) {
    if (string)
        return new Handlebars.SafeString(bbcode.parse(string.replace(/\n/g, "<br>")));
    else
        return "";
});

Handlebars.registerHelper('within_24_hours', function (a, b) {
    var moment_a = moment(a),
        moment_b = typeof b === "string" ? moment(b) : moment();
    return Math.abs(moment_a.diff(moment_b, 'hours')) <= 24;
});

Handlebars.registerHelper('past', function (date) {
    date = moment( date ).format('YYYY-MM-DD HH:mm');
    var date_conv = moment.utc(date+'-04:00').local();
    return moment(date_conv).isBefore(moment());
});

Handlebars.registerHelper('time_conv', function (date) {
    date = moment( date ).format('YYYY-MM-DD HH:mm');
    return moment.utc(date+'-04:00').local(); //.format('YYYY-MM-DD HH:mm')
});

Handlebars.registerHelper('between', function (s_date, e_date) {
    return moment(e_date).add(1, 'days').isAfter(moment()) && moment(s_date).isBefore(moment());
});

Handlebars.registerHelper('eloa_future', function (s_date) {
    return moment(s_date).isAfter(moment());
});

Handlebars.registerHelper('duration', function(days) {
    return moment.duration(days, 'days').format('Y [years], M [months], [and] D [days]');
});

Handlebars.registerHelper('award_img_name', function (award) {
    var beg = award.substr(0, 2);
    var ret = award;
    switch (beg) {
    case "m:":
      ret = "marks";
      break;
    case "s:":
      ret = "sharps";
      break;
    case "e:":
      ret = "expert";
      break;
    }
    if ( award.substr(2,5) == 'pilot' )
      ret += 'Pilot';
    return ret;
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

Handlebars.registerHelper('stat_color', function (perc) {
    if (perc == null) {
        return "stat_great";
    }
    else if (perc == 100) {
        return "stat_great";
    }
    else if (perc > 75) {
        return "stat_good";
    }
    else if (perc > 50) {
        return"stat_soso";
    }
    else if (perc > 25) {
        return "stat_bad";
    }
    else {
        return "stat_aweful";
    }
});

Handlebars.registerHelper('stat_format', function (txt) {
    txt = txt.replace('Marksman','<img src="images/awards/marks_np.gif" title="Marksman Badge">');
    txt = txt.replace('Sharpshooter','<img src="images/awards/sharps_np.gif" title="Sharpshooter Badge">');
    txt = txt.replace('Expert','<img src="images/awards/expert_np.gif" title="Expert Badge">');
    txt = txt.replace('EIB','<img src="images/awards/eib.gif" title="Expert Infantry Badge">');
    txt = txt.replace('NCO','<img src="images/awards/anpdr.gif" style="height:8px;width:33px;" title="Army NCO Professional Development Ribbon">');
    if (txt.indexOf('100%')>=0)
        return txt.replace("100%","<span class='stat_color stat_aweful' title='Awaiting Badge Approval'>100%</span>");
    if (!txt)
        return '0%';
    return txt;
});

var isArray = function(value) {
    return Object.prototype.toString.call(value) === '[object Array]';
};

var ExpressionRegistry = function() {
    this.expressions = [];
};

ExpressionRegistry.prototype.add = function (operator, method) {
    this.expressions[operator] = method;
};

ExpressionRegistry.prototype.call = function (operator, left, right) {
    if ( ! this.expressions.hasOwnProperty(operator)) {
        throw new Error('Unknown operator "'+operator+'"');
    }

    return this.expressions[operator](left, right);
};

var eR = new ExpressionRegistry;
eR.add('not', function(left, right) {
    return left != right;
});
eR.add('>', function(left, right) {
    return left > right;
});
eR.add('<', function(left, right) {
    return left < right;
});
eR.add('>=', function(left, right) {
    return left >= right;
});
eR.add('<=', function(left, right) {
    return left <= right;
});
eR.add('===', function(left, right) {
    return left === right;
});
eR.add('!==', function(left, right) {
    return left !== right;
});
eR.add('in', function(left, right) {
    if ( ! isArray(right)) {
        right = right.split(',');
    }
    return right.indexOf(left) !== -1;
});

var isHelper = function() {
    var args = arguments
    ,   left = args[0]
    ,   operator = args[1]
    ,   right = args[2]
    ,   options = args[3]
    ;

    if (args.length == 2) {
        options = args[1];
        if (left) return options.fn(this);
        return options.inverse(this);
    }

    if (args.length == 3) {
        right = args[1];
        options = args[2];
        if (left == right) return options.fn(this);
        return options.inverse(this);
    }

    if (eR.call(operator, left, right)) {
        return options.fn(this);
    }
    return options.inverse(this);
};

Handlebars.registerHelper('is', isHelper);

Handlebars.registerHelper('nl2br', function(text) {
    var nl2br = (text + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>' + '$2');
    return new Handlebars.SafeString(nl2br);
});

Handlebars.registerHelper('log', function() {
    console.log(['Values:'].concat(
        Array.prototype.slice.call(arguments, 0, -1)
    ));
});

Handlebars.registerHelper('debug', function() {
    console.log('Context:', this);
    console.log(['Values:'].concat(
        Array.prototype.slice.call(arguments, 0, -1)
    ));
});

Handlebars.registerHelper('forum_topic_url', function(topicId, block) {
    var forumId = block.hash.forum_id || config.defaultForumId;
    var { baseUrl, topicPath } = config.forum[forumId];
    var suffix = util.sprintf(topicPath, topicId);
    return `${baseUrl}${suffix}`;
});

Handlebars.registerHelper('forum_profile_url', function(forumMemberid, block) {
    var forumId = block.hash.forum_id || config.defaultForumId;
    var { baseUrl, profilePath } = config.forum[forumId];
    var username = encodeURIComponent(block.hash.username);
    var suffix = util.sprintf(profilePath, forumMemberid, username)
    return `${baseUrl}${suffix}`;
});

Handlebars.registerHelper('forum_group_url', function(group, block) {
    var forumId = block.hash.forum_id || config.defaultForumId;
    var { baseUrl, groupPath } = config.forum[forumId];
    var suffix = util.sprintf(groupPath, group)
    return `${baseUrl}${suffix}`;
})
