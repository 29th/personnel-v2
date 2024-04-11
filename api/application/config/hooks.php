<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/*
| -------------------------------------------------------------------------
| Hooks
| -------------------------------------------------------------------------
| This file lets you define "hooks" to extend CI without hacking the core
| files.  Please see the user guide for info:
|
|	http://codeigniter.com/user_guide/general/hooks.html
|
*/

/*
|
| Added as part of the usertracking library by Casey McLaughlin.  Please ensure
| that you have the Usertracking.php file installed in your application/library folder!
*/
$hook['post_system'][] = array('class' => 'Usertracking', 
                                               'function' => 'auto_track',
                                               'filename' => 'Usertracking.php',
                                               'filepath' => 'libraries');


/* End of file hooks.php */
/* Location: ./application/config/hooks.php */