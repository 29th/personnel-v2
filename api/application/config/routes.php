<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

// Members
$route['members/(:num)/promotions'] = 'promotions/index/member/$1'; // Filtered
$route['members/(:num)/awardings'] = 'awardings/index/member/$1'; // Filtered
$route['members/(:num)/qualifications'] = 'qualifications/index/member/$1';
$route['members/(:num)/assignments'] = 'assignments/index/$1';
$route['members/(:num)/attendance'] = 'attendance/index/member/$1'; // Filtered
$route['members/(:num)/percentage'] = 'attendance/percentage/member/$1'; // Filtered
$route['members/(:num)/enlistments'] = 'enlistments/index/$1';
$route['members/(:num)/discharges'] = 'discharges/index/member/$1'; // Filtered
$route['members/(:num)/awols'] = 'members/awols/$1';
$route['members/(:num)/discharge'] = 'members/discharge/$1';
$route['members/(:num)/coat'] = 'members/coat/$1';
$route['members/(:num)/roles'] = 'members/roles/$1';
$route['members/(:num)/notes'] = 'notes/index/member/$1';
$route['members/(:num)/passes'] = 'passes/index/member/$1';
$route['members/(:num)/finances'] = 'finances/index/member/$1'; // Filtered
$route['members/(:num)/eloas'] = 'eloas/index/member/$1'; // Filtered
$route['members/(:num)/demerits'] = 'demerits/index/member/$1'; // Filtered
$route['members/(:num)/events'] = 'events/index/member/$1'; // Filtered
$route['members/(:num)/recruits'] = 'recruits/index/member/$1'; // Filtered
$route['members/(:num)'] = 'members/view/$1';
$route['members/search/(:any)'] = 'members/search/$1';
$route['members'] = 'members/index';

// Units
//$route['units/(:any)/attendance'] = 'attendance/index/unit/$1'; // Filtered
$route['units/(:any)/assignments'] = 'assignments/index/unit/$1'; // Filtered -test
$route['units/(:any)/attendance'] = 'events/attendance/$1'; // Filtered -test
$route['units/(:any)/awols'] = 'units/awols/$1'; 
$route['units/(:any)/awardings'] = 'awardings/index/unit/$1'; // Filtered
$route['units/(:any)/percentage'] = 'attendance/percentage/unit/$1'; // Filtered
$route['units/(:any)/promotions'] = 'promotions/index/unit/$1'; // Filtered
$route['units/(:any)/demerits'] = 'demerits/index/unit/$1'; // Filtered
$route['units/(:any)/qualifications'] = 'qualifications/index/unit/$1'; // Filtered
$route['units/(:any)/eloas'] = 'eloas/index/unit/$1'; // Filtered
$route['units/(:any)/finances'] = 'finances/index/unit/$1'; // Filtered
$route['units/(:any)/discharges'] = 'discharges/index/unit/$1'; // Filtered
$route['units/(:any)/events'] = 'events/index/unit/$1'; // Filtered
$route['units/(:any)/recruits'] = 'recruits/index/unit/$1'; // Filtered
$route['units/(:any)/alerts'] = 'alerts/index/unit/$1'; // Filtered
$route['units/(:any)/stats'] = 'units/stats/$1'; // Filtered
$route['units/(:any)'] = 'units/view/$1';
$route['units'] = 'units/index';

// Events
//$route['events/(:num)/(:num)'] = 'events/index/$1/$2';
$route['events/(:num)/excuse/(:num)'] = 'events/excuse/$1/$2';
$route['events/(:num)/excuse'] = 'events/excuse/$1';
$route['events/(:num)/aar'] = 'events/aar/$1';
$route['events/(:num)'] = 'events/view/$1';
$route['events'] = 'events/index'; // Filtered

// User info
$route['user'] = 'users/view';
$route['user/permissions/members/(:num)'] = 'users/permissions/$1';
$route['user/permissions/units/(:any)'] = 'users/permissions//$1';
$route['user/permissions'] = 'users/permissions';
$route['user/assignments'] = 'users/assignments';
$route['user/associate'] = 'users/associate';

// Basic CRUD
$route['abilities/(:num)'] = 'abilities/view/$1';
$route['abilities'] = 'abilities/index';
$route['ranks/(:num)'] = 'ranks/view/$1';
$route['ranks'] = 'ranks/index';
$route['awards/(:num)'] = 'awards/view/$1';
$route['awards'] = 'awards/index';
$route['standards/(:any)/(:any)'] = 'standards/index/$1/$2';
$route['standards/(:num)'] = 'standards/view/$1';
$route['standards/(:any)'] = 'standards/index/$1';
$route['standards'] = 'standards/index';
$route['positions/(:num)'] = 'positions/view/$1';
$route['positions'] = 'positions/index';

// Member-related CRUD
$route['promotions/(:num)'] = 'promotions/view/$1';
$route['promotions'] = 'promotions/index'; // Filtered
$route['awardings/(:num)'] = 'awardings/view/$1';
$route['awardings'] = 'awardings/index'; // Filtered
$route['assignments/(:num)'] = 'assignments/view/$1';
$route['assignments'] = 'assignments/index';
$route['discharges/(:num)'] = 'discharges/view/$1';
$route['discharges'] = 'discharges/index'; // Filtered
$route['qualifications/(:num)'] = 'qualifications/view/$1';
$route['qualifications'] = 'qualifications/index';
$route['demerits/(:num)'] = 'demerits/view/$1';
$route['demerits'] = 'demerits/index'; // Filtered
$route['notes/(:num)'] = 'notes/view/$1';

// Enlistments
$route['enlistments/(:num)/process'] = 'enlistments/process/$1';
$route['enlistments/(:num)'] = 'enlistments/view/$1';
$route['enlistments'] = 'enlistments/index';

// Banlogs
$route['banlogs'] = 'banlogs/index'; 
$route['banlogs/(:num)'] = 'banlogs/view/$1';

// Finances
$route['finances'] = 'finances/index'; // Filtered

// Donations balance
$route['finances/balance'] = 'finances/balance'; 

// Extended LOAs
$route['eloas'] = 'eloas/index'; // Filtered
$route['eloas/(:num)'] = 'eloas/view/$1';

// Weapon Passes
$route['passes'] = 'passes/index'; // Filtered

// Admin
$route['admin'] = 'admin/home';

// Defaults
$route['default_controller'] = "welcome";
$route['404_override'] = '';


/* End of file routes.php */
/* Location: ./application/config/routes.php */