<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Users
 * Gets info about current logged in user
 */
class Users extends MY_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->model('assignment_model');
    }
    
	/**
	 * INDEX
	 * Noop
	 */
	//public function index_get() {}
	
	/**
	 * VIEW
	 * Gets basic user information
	 */
    public function view_get() {
        if($this->user->logged_in()) {
            $this->response(array('status' => true, 'user' => $this->user->member()));
        } else {
            $this->response(array('status' => false, 'error' => 'Not logged in'));
        }
    }
    
	/**
	 * USER PERMISSIONS
	 */
    public function permissions_get($member_id = FALSE, $unit_id = FALSE) {
        if($this->user->logged_in()) {
            $this->response(array('status' => true, 'permissions' => $this->user->permissions($member_id, $unit_id)));
        } else {
            $this->response(array('status' => false, 'error' => 'Not logged in'));
        }
    }
    
	/**
	 * USER ASSIGNMENTS
	 */
    public function assignments_get() {
        if($this->user->logged_in()) {
            $model = $this->assignment_model->where('assignments.member_id', $this->user->member('id'));
            if($this->input->get('current')) $model->by_date();
            $assignments = nest($model->get()->result_array());
            $this->response(array('status' => true, 'assignments' => $assignments));
        } else {
            $this->response(array('status' => false, 'error' => 'Not logged in'));
        }
    }
}