<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/*
| -------------------------------------------------------------------------
| URI ROUTING
| -------------------------------------------------------------------------
| This file lets you re-map URI requests to specific controller functions.
|
| Typically there is a one-to-one relationship between a URL string
| and its corresponding controller class/method. The segments in a
| URL normally follow this pattern:
|
|	example.com/class/method/id/
|
| In some instances, however, you may want to remap this relationship
| so that a different class/function is called than the one
| corresponding to the URL.
|
| Please see the user guide for complete details:
|
|	http://codeigniter.com/user_guide/general/routing.html
|
| -------------------------------------------------------------------------
| RESERVED ROUTES
| -------------------------------------------------------------------------
|
| There area two reserved routes:
|
|	$route['default_controller'] = 'welcome';
|
| This route indicates which controller class should be loaded if the
| URI contains no data. In the above example, the "welcome" class
| would be loaded.
|
|	$route['404_override'] = 'errors/page_missing';
|
| This route will tell the Router what URI segments to use if those provided
| in the URL cannot be matched to a valid route.
|
*/

// Custom
$route['members/(:num)/promotions/(:num)'] = 'members/promotions/$1/$2';
$route['members/(:num)/promotions'] = 'members/promotions/$1';
$route['members/(:num)/awardings/(:num)'] = 'members/awardings/$1/$2';
$route['members/(:num)/awardings'] = 'members/awardings/$1';
$route['members/(:num)/qualifications/(:num)'] = 'members/qualifications/$1/$2';
$route['members/(:num)/qualifications'] = 'members/qualifications/$1';
$route['members/(:num)/assignments'] = 'members/assignments/$1';
$route['members/(:num)/assignments/(:num)'] = 'members/assignments/$1/$2';
$route['members/(:num)/attendance/(:num)/(:num)'] = 'members/attendance/$1/$2/$3';
$route['members/(:num)/attendance'] = 'members/attendance/$1';
$route['members/(:num)/enlistments'] = 'members/enlistments/$1';
$route['members/(:num)/discharges'] = 'members/discharges/$1';
$route['members/(:num)/awols'] = 'members/awols/$1';
$route['members/(:num)/discharge'] = 'members/discharge/$1';
$route['members/(:num)/coat'] = 'members/coat/$1';
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

// Enlistments
$route['enlistments/(:num)/process'] = 'enlistments/process/$1';
$route['enlistments/(:num)'] = 'enlistments/view/$1';
$route['enlistments'] = 'enlistments/index';

// Admin
$route['admin'] = 'admin/members';

// Defaults
$route['default_controller'] = "welcome";
$route['404_override'] = '';


/* End of file routes.php */
/* Location: ./application/config/routes.php */