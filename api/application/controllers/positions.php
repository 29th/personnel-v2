<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class positions extends MY_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->model('position_model');
    }
    
    /**
     * PRE-FLIGHT
     */
    public function index_options() { $this->response(array('status' => true)); }
    public function view_options() { $this->response(array('status' => true)); }
    
	/**
	 * INDEX
	 */
    public function index_get() {
        $positions = $this->position_model;
        $positions = $positions->order_by($this->input->get('order') ? $this->input->get('order') : 'order');
        $positions = $positions->get()->result();
        $this->response(array('status' => true, 'positions' => $positions));
    }
    
	/**
	 * VIEW
	 * Not sure why we'd need this...
	 */
    public function view_get($position_id) {
        $position = nest($this->position_model->get_by_id($position_id));
        $this->response(array('status' => true, 'position' => $position));
    }
    
	/**
	 * CREATE
	 */
    public function index_post() {
		// Must have permission to create this type of record
        if( ! $this->user->permission('position_add')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
		// Form validation
		else if($this->position_model->run_validation('validation_rules_add') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->position_model->validation_errors), 400);
        }
		// Create record
		else {
			$data = whitelist($this->post(), array('name', 'active', 'order', 'description'));
            $insert_id = $this->position_model->save(NULL, $data);
            $this->response(array('status' => $insert_id ? true : false, 'position' => $insert_id ? $this->position_model->get_by_id($insert_id) : null));
        }
    }
    
	/**
	 * UPDATE
	 */
    public function view_post($position_id) {
		// Must have permission to create this type of record
        if( ! $this->user->permission('position_add')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
		// Form validation
		else if($this->position_model->run_validation('validation_rules_edit') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->position_model->validation_errors), 400);
        }
		// Update record
		else {
			$data = whitelist($this->post(), array('name', 'active', 'order', 'description'));
            $result = $this->position_model->save($position_id, $data);
            $this->response(array('status' => $results ? true : false, 'position' => $this->position_model->get_by_id($position_id)));
        }
    }
    
	/**
	 * DELETE
	 */
    public function view_delete($position_id) {
		// Must have permission to delete this type of record
        if( ! $this->user->permission('position_delete')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
		// Delete record
		else {
            $this->position_model->delete($position_id);
            $this->response(array('status' => true));
        }
    }
}