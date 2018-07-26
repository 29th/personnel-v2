<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Restricted_names extends MY_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->model('restricted_names_model');
    }
    
    /**
     * INDEX / LIST
     */
    public function index_get() {
        $halloffame = $this->restricted_names_model;
        $halloffame = nest( $halloffame->get()->result_array());
        $this->response(array('status' => true, 'halloffame' => $halloffame));
    }
    
}