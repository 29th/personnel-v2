var routeMap = {
  '#assignments/:id/edit': '/manage/assignments/:id/edit',
  '#awards': '/about/awards/',
  '#awards/:id': '/about/awards/',
  '#banlogs/add': '/manage/ban_logs/new',
  '#banlogs/:id': '/manage/ban_logs/:id',
  '#banlogs': '/manage/ban_logs',
  '#calendar': '/events',
  '#demerits/:id': '/manage/demerits/:id',
  '#demerits/:id/edit': '/manage/demerits',
  '#discharges/:id': '/manage/discharges/:id',
  '#eloas': '/manage/extended_loas',
  '#enlistments/:id/edit': '/manage/enlistments/:id/edit',
  '#enlistments/:id/process': '/manage/enlistments/:id/process_enlistment',
  '#enlistments/:id': '/enlistments/:id',
  '#enlist': '/enlistments/new',
  '#events/add': '/manage/events',
  '#events/:id': '/events/:id',
  '#events/:id/aar': '/events/:id',
  '#halloffame': '/manage/restricted_names',
  '#members/:id/assign': '/manage/assignments',
  '#members/:id/demerit': '/manage/demerits',
  '#members/:id/notes/add': '/manage/notes/',
  '#members/:id/passes/add': '/manage/passes',
  '#members/:id/promote': '/manage/users/:id/promotions',
  '#members/:id': '/members/:id',
  '#members/:id/servicerecord': '/members/:id/service-record',
  '#members/:id/attendance': '/members/:id/attendance',
  '#members/:id/recruits': '/members/:id/recruits',
  '#members/:id/notes': '/manage/users/:id/notes',
  '#members/:id/passes': '/passes?q[user_id_eq]=:id',
  '#members/:id/eloas': '/members/:id/extended-loas',
  '#members/:id/reprimands': '/members/:id/reprimands',
  '#members/:id/qualifications': '/members/:id/qualifications',
  '#members/:id/edit': '/manage/users/:id',
  '#members/:id/eloa': '/manage/users/:id/extended_loas',
  '#members/:id/discharge': '/manage/users/:id/discharges',
  '#notes': '/manage/notes',
  '#notes/:id/edit': '/manage/notes/',
  '#notes/:id': '/manage/notes/:id',
  '#passes': '/passes',
  '#units/:slug': '/units/:slug',
  '#units/:slug/attendance': '/units/:slug/attendance',
  '#units/:slug/awols': '/units/:slug/awols',
  '#units/:slug/alerts': '/units/:slug/missing-awards',
  '#units/:slug/stats': '/units/:slug/stats',
  '#units/:slug/discharges': '/units/:slug/discharges', // TODO: manually check js router for other missing routes
  '#units/:slug/recruits': '/units/:slug/recruits'
};

let countdownSeconds = 10;
let countdownInterval;

;(function() {
  const dialogUrl = document.getElementById("migration-banner-url");
  const dialogCountdown = document.getElementById("migration-countdown");
  const continueBtn = document.getElementById("migration-continue-btn");

  const destinationRoute = getDestinationRoute() || "";
  const destinationUrl = `https://www.29th.org${destinationRoute}`;
  
  if (destinationRoute) {
    dialogUrl.textContent = destinationUrl;
    continueBtn.setAttribute("href", destinationUrl);
  }
  
  countdownInterval = setInterval(updateCountdown.bind(null, dialogCountdown, destinationUrl), 1000);
})();

function isLegacyCookieSet() {
  return document.cookie.includes("stay_on_legacy=true");
}

function getDestinationRoute() {
  var hash = window.location.hash;
  if (!hash) {
    return;
  }

  // Try exact match first
  if (routeMap[hash]) {
    return routeMap[hash];
  }

  // Try pattern matching
  for (var pattern in routeMap) {
    var params = matchRoute(hash, pattern);
    if (params) {
      var targetUrl = routeMap[pattern];
      var paramNames = pattern.match(/:[^/]+/g) || [];
      
      paramNames.forEach(function(paramName, index) {
        var cleanParamName = paramName.slice(1);
        targetUrl = targetUrl.replace(':' + cleanParamName, params[index]);
      });
      
      return targetUrl;
    }
  }
}

function matchRoute(actualRoute, pattern) {
  var regexPattern = pattern
    .replace(/:[^/]+/g, '([^/]+)')
    .replace(/\//g, '\\/');
  
  var regex = new RegExp('^' + regexPattern + '$');
  var match = actualRoute.match(regex);
  
  if (match) {
    return match.slice(1);
  }
  return null;
}

function updateCountdown(countdownEl, destinationUrl) {
  countdownSeconds--;
  countdownEl.textContent = countdownSeconds;
  
  if (countdownSeconds <= 0) {
    clearInterval(countdownInterval);
    window.location.href = destinationUrl;
  }
}
