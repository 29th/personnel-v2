<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Assignments extends MY_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->model('assignment_model');
    }
    
    /**
     * PRE-FLIGHT
     */
    public function index_options() { $this->response(array('status' => true)); }
    public function view_options() { $this->response(array('status' => true)); }
    
    /**
     * INDEX
     * We don't want to be able to fetch a list of assignments for all members, no need
     */
    /*public function index_get() {
        $assignments = $this->assignment_model->get()->result();
        $this->response(array('status' => true, 'assignments' => $assignments));
    }*/
    
    /**
     * VIEW
     */
    public function view_get($assignment_id) {
        // Must have permission to view this member's profile or any member's profile
        $assignment = nest($this->assignment_model->select_member()->get_by_id($assignment_id));
        if( ! $this->user->permission('profile_view', $assignment['member']['id']) && ! $this->user->permission('profile_view_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        // View record
        else {
            $this->response(array('status' => true, 'assignment' => $assignment));
        }
    }
    
    /**
     * CREATE
     */
    public function index_post() {
        // Must have permission to create this type of record for this member or for any member
        if( ! $this->user->permission('assignment_add', $this->post('member_id')) && ! $this->user->permission('assignment_add_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        // Form validation
        else if($this->assignment_model->run_validation('validation_rules_add') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->assignment_model->validation_errors), 400);
        }
        // Create record
        else {
            $data = whitelist($this->post(), array('member_id', 'unit_id', 'position_id', 'access_level', 'start_date', 'end_date'));
            $insert_id = $this->assignment_model->save(NULL, $data);
            $this->response(array('status' => $insert_id ? true : false, 'assignment' => $insert_id ? $this->assignment_model->select_member()->get_by_id($insert_id) : null));
        }
    }
    
    /**
     * UPDATE
     */
    public function view_post($assignment_id) {
        // Fetch record
        if( ! ($assignment = nest($this->assignment_model->select_member()->get_by_id($assignment_id)))) {
            $this->response(array('status' => false, 'error' => 'Assignment not found'), 404);
        }
        // Must have permission to create this type of record for this member or for any member
        else if( ! $this->user->permission('assignment_add', $assignment['member']['id']) && ! $this->user->permission('assignment_add_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        // Form validation
        else if($this->assignment_model->run_validation('validation_rules_edit') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->assignment_model->validation_errors), 400);
        }
        // Update record
        else {
            $data = whitelist($this->post(), array('unit_id', 'position_id', 'access_level', 'start_date', 'end_date'));
            //if( ! $data['start_date']) $data['start_date'] = NULL; // done in the model
            //if( ! $data['end_date']) $data['end_date'] = NULL;
            $result = $this->assignment_model->save($assignment_id, $data);
            $this->response(array('status' => $result ? true : false, 'assignment' => $this->assignment_model->select_member()->get_by_id($assignment_id)));
        }
    }
    
    /**
     * DELETE
     * Should only be done to correct an error. Otherwise just set the end_date to end an assignment.
     */
    public function view_delete($assignment_id) {
        // Fetch record
        if( ! ($assignment = nest($this->assignment_model->select_member()->get_by_id($assignment_id)))) {
            $this->response(array('status' => false, 'error' => 'Assignment not found'), 404);
        }
        // Must have permission to delete this type of record for this member or for any member
        else if( ! $this->user->permission('assignment_delete', $assignment['member']['id']) && ! $this->user->permission('assignment_delete_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        // Delete record
        else {
            $this->assignment_model->delete($assignment_id);
            $this->response(array('status' => true));
        }
    }
}