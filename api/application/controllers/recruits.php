<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Recruits extends MY_Controller {
    public $model_name = 'recruits_model';
    public $abilities = array(
        'view_any' => 'event_view_any',
        'view' => 'event_view'
    );
    
    /**
     * PRE-FLIGHT
     */
    public function index_options() { $this->response(array('status' => true)); }
    public function view_options() { $this->response(array('status' => true)); }
    
    /**
     * INDEX
     * Handled by index_filter_get in MY_Controller
     */

}