<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
require(APPPATH.'libraries/REST_Controller.php');

class MY_Controller extends REST_Controller {
    public function __construct() {
        parent::__construct();
        
        // Load user library and pass it third-party (forum) cookie
        $this->load->library('user', array('cookie' => $this->input->cookie(config_item('third_party_cookie'))));
    }
}