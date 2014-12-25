<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

// Members
$route['members/(:num)/promotions'] = 'promotions/index/$1';
$route['members/(:num)/awardings'] = 'awardings/index/$1';
$route['members/(:num)/qualifications'] = 'qualifications/index/$1';
$route['members/(:num)/assignments'] = 'assignments/index/$1';
$route['members/(:num)/attendance'] = 'attendance/index/$1';
$route['members/(:num)/enlistments'] = 'enlistments/index/$1';
$route['members/(:num)/discharges'] = 'discharges/index/$1';
$route['members/(:num)/awols'] = 'members/awols/$1';
$route['members/(:num)/discharge'] = 'members/discharge/$1';
$route['members/(:num)/coat'] = 'members/coat/$1';
$route['members/(:num)/roles'] = 'members/roles/$1';
$route['members/(:num)/finances'] = 'finances/index/$1';
$route['members/(:num)'] = 'members/view/$1';
//$route['members'] = 'members/index';

// Units
$route['units/(:any)/attendance'] = 'units/attendance/$1';
$route['units/(:any)/awols'] = 'units/awols/$1';
$route['units/(:any)'] = 'units/view/$1';
$route['units'] = 'units/index';

// Events
$route['events/(:num)/(:num)'] = 'events/index/$1/$2';
$route['events/(:num)/excuse/(:num)'] = 'events/excuse/$1/$2';
$route['events/(:num)/excuse'] = 'events/excuse/$1';
$route['events/(:num)/aar'] = 'events/aar/$1';
$route['events/(:num)'] = 'events/view/$1';

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
$route['promotions'] = 'promotions/index';
$route['awardings/(:num)'] = 'awardings/view/$1';
$route['awardings'] = 'awardings/index';
$route['assignments/(:num)'] = 'assignments/view/$1';
$route['assignments'] = 'assignments/index';
$route['discharges/(:num)'] = 'discharges/view/$1';
$route['discharges'] = 'discharges/index';
$route['qualifications/(:num)'] = 'qualifications/view/$1';
$route['qualifications'] = 'qualifications/index';

// Enlistments
$route['enlistments/(:num)/process'] = 'enlistments/process/$1';
$route['enlistments/(:num)'] = 'enlistments/view/$1';
$route['enlistments'] = 'enlistments/index';

// Finances
$route['finances'] = 'finances/index';

// Admin
$route['admin'] = 'admin/home';

// Defaults
$route['default_controller'] = "welcome";
$route['404_override'] = '';


/* End of file routes.php */
/* Location: ./application/config/routes.php */