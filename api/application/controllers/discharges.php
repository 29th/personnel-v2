<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Discharges extends MY_Controller {
     public $model_name = 'discharge_model';
     public $abilities = array(
          'view_any' => 'profile_view_any',
          'view' => 'profile_view'
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
    
    /**
     * VIEW
     */
    public function view_get($discharge_id) {
        // Must have permission to view this member's profile or any member's profile
        $discharge = nest($this->discharge_model->get_by_id($discharge_id));
        if( ! $this->user->permission('profile_view', array('member' => $discharge['member']['id'])) && ! $this->user->permission('profile_view_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        // View record
        else {
            $this->response(array('status' => true, 'discharge' => $discharge));
        }
    }
    
    /**
     * CREATE
     */
    public function index_post() {
        // Must have permission to create this type of record for this member or for any member
        if( ! $this->user->permission('discharge_add', array('member' => $this->post('member_id'))) && ! $this->user->permission('discharge_add_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        // Form validation
        else if($this->discharge_model->run_validation('validation_rules_add') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->discharge_model->validation_errors), 400);
        }
        // Create record
        else {
            $this->usertracking->track_this();
            $data = whitelist($this->post(), array('member_id', 'type', 'reason', 'forum_id', 'topic_id'));
			
			$data['date'] = format_date('now', 'mysqldate');
			
            $insert_id = $this->discharge_model->save(NULL, $data);
            $this->response(array('status' => $insert_id ? true : false, 'discharge' => $insert_id ? nest($this->discharge_model->get_by_id($insert_id)) : null));
        }
    }
    
    /**
     * UPDATE
     */
    public function view_post($discharge_id) {
        // Fetch record
        if( ! ($discharge = nest($this->discharge_model->get_by_id($discharge_id)))) {
            $this->response(array('status' => false, 'error' => 'Record not found'), 404);
        }
        // Must have permission to create this type of record for this member or for any member
        else if( ! $this->user->permission('discharge_add', array('member' => $discharge['member']['id'])) && ! $this->user->permission('discharge_add_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        // Form validation
        else if($this->discharge_model->run_validation('validation_rules_edit') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->discharge_model->validation_errors), 400);
        }
        // Update record
        else {
            $this->usertracking->track_this();
            $data = whitelist($this->post(), array('date', 'type', 'reason', 'forum_id', 'topic_id'));
			
            $result = $this->discharge_model->save($discharge_id, $data);
            $this->response(array('status' => $result ? true : false, 'discharge' => nest($this->discharge_model->get_by_id($discharge_id))));
        }
    }
    
    /**
     * DELETE
     */
    public function view_delete($discharge_id) {
        // Fetch record
        if( ! ($discharge = nest($this->discharge_model->get_by_id($discharge_id)))) {
            $this->response(array('status' => false, 'error' => 'Record not found'), 404);
        }
        // Must have permission to delete this type of record for this member or for any member
        else if( ! $this->user->permission('discharge_delete', array('member' => $discharge['member']['id'])) && ! $this->user->permission('discharge_delete_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        // Delete record
        else {
            $this->usertracking->track_this();
            $this->discharge_model->delete($discharge_id);
            $this->response(array('status' => true));
        }
    }
}