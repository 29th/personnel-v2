<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Awarding extends MY_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->model('awarding_model');
        $this->load->library('servicecoat');
    }
    
    /**
     * PRE-FLIGHT
     */
    public function index_options() { $this->response(array('status' => true)); }
    public function view_options() { $this->response(array('status' => true)); }
    
    /**
     * INDEX
     * We don't want to be able to fetch a list of awardings for all members, no need
     */
    /*public function index_get() {
        $awardings = $this->awarding_model->get()->result();
        $this->response(array('status' => true, 'awardings' => $awardings));
    }*/
    
    /**
     * VIEW
     */
    public function view_get($awarding_id) {
        // Must have permission to view this member's profile or any member's profile
        $awarding = nest($this->awarding_model->get_by_id($awarding_id));
        if( ! $this->user->permission('profile_view', $awarding['member_id']) && ! $this->user->permission('profile_view_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        // View record
        else {
            $this->response(array('status' => true, 'awarding' => $awarding));
        }
    }
    
    /**
     * CREATE
     */
    public function index_post() {
        // Must have permission to create this type of record for this member or for any member
        if( ! $this->user->permission('awarding_add', $this->post('member_id')) && ! $this->user->permission('awarding_add_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        // Form validation
        else if($this->awarding_model->run_validation('validation_rules_add') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->awarding_model->validation_errors), 400);
        }
        // Create record
        else {
            $this->usertracking->track_this();
            $data = whitelist($this->post(), 'member_id', 'date', 'award_id', 'forum_id', 'topic_id');
			
			// Clean date
			$data['date'] = format_date($data['date'], 'mysqldate');
			
            $insert_id = $this->awarding_model->save(NULL, $data);
            
            // Update service coat
            $this->servicecoat->update($member_id);
            
            $this->response(array('status' => $insert_id ? true : false, 'awarding' => $insert_id ? $this->awarding_model->get_by_id($insert_id) : null));
        }
    }
    
    /**
     * UPDATE
     */
    public function view_post($awarding_id) {
        // Fetch record
        if( ! ($awarding = $this->awarding_model->get_by_id($awarding_id))) {
            $this->response(array('status' => false, 'error' => 'Record not found'), 404);
        }
        // Must have permission to create this type of record for this member or for any member
        else if( ! $this->user->permission('awarding_add', $awarding['member_id']) && ! $this->user->permission('awarding_add_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        // Form validation
        else if($this->awarding_model->run_validation('validation_rules_edit') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->awarding_model->validation_errors), 400);
        }
        // Update record
        else {
            $this->usertracking->track_this();
            $data = whitelist($this->post(), array('date', 'award_id', 'forum_id', 'topic_id'));
			
			// Clean date
			$data['date'] = format_date($data['date'], 'mysqldate');
			
            $result = $this->awarding_model->save($awarding_id, $data);
            
            // Update service coat
            $this->servicecoat->update($member_id);
            
            $this->response(array('status' => $result ? true : false, 'awarding' => $this->awarding_model->get_by_id($awarding_id)));
        }
    }
    
    /**
     * DELETE
     */
    public function view_delete($awarding_id) {
        // Fetch record
        if( ! ($awarding = $this->awarding_model->get_by_id($awarding_id))) {
            $this->response(array('status' => false, 'error' => 'Record not found'), 404);
        }
        // Must have permission to delete this type of record for this member or for any member
        else if( ! $this->user->permission('awarding_delete', $awarding['member_id']) && ! $this->user->permission('awarding_delete_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        // Delete record
        else {
            $this->usertracking->track_this();
            $this->awarding_model->delete($awarding_id);
            
            // Update service coat
            $this->servicecoat->update($member_id);
            
            $this->response(array('status' => true));
        }
    }
}