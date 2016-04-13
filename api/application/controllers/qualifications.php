<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Qualifications extends MY_Controller {
    public $model_name = 'qualification_model';
    public $abilities = array(
        'view_any' => 'qualification_view_any',
        'view' => 'qualification_view'
    );
    public $paginate = false;

    public function __construct() {
        parent::__construct();
        $this->load->model('qualification_model');
    }
    
    /**
     * PRE-FLIGHT
     */
    public function index_options() { $this->response(array('status' => true)); }
    public function view_options() { $this->response(array('status' => true)); }
    
    /**
     * INDEX
     */
    /*public function index_get($member_id, $unit_id='') {
        // Must have permission to view this member's profile or any member's profile
        if( ! $this->user->permission('profile_view', array('member' => $member_id)) && ! $this->user->permission('profile_view_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        else {
            $model = $this->qualification_model;
            if($unit_id) {
              $model->by_unit($unit_id);  
            }
            elseif($member_id) {
                $model->where('qualifications.member_id', $member_id);
            }
            $qualifications = nest($model->get()->result_array());
            $this->response(array('status' => true, 'qualifications' => $qualifications, 'mem' => $member_id, 'unit' => $unit_id ));
        }
    }*/
    
    /**
     * VIEW
     */
    /*public function view_get($qualification_id) {
    }*/
    
    /**
     * CREATE
     */
    public function index_post() {
        // Must have permission to create this type of record for this member or for any member
        if( ! $this->user->permission('qualification_add', array('member' => $this->post('member_id'))) && ! $this->user->permission('qualification_add_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        // Form validation
        else if($this->qualification_model->run_validation('validation_rules_add') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->qualification_model->validation_errors), 400);
        }
        // Create record
        else {
            $this->usertracking->track_this();
            $data = whitelist($this->post(), array('member_id', 'standard_id'));
            
            // Set automatic properties
            $data['date'] = format_date('now', 'mysqldate');
            $data['author_member_id'] = $this->user->member('id');
            
            $insert_id = $this->qualification_model->save(NULL, $data);
            
            $this->response(array('status' => $insert_id ? true : false, 'qualification' => $insert_id ? nest($this->qualification_model->select_member()->get_by_id($insert_id)) : null));
        }
    }
    
    /**
     * UPDATE
     */
    /*public function view_post($qualification_id) {
    }*/
    
    /**
     * DELETE
     */
    public function view_delete($qualification_id) {
        // Fetch record
        if( ! ($qualification = nest($this->qualification_model->select_member()->get_by_id($qualification_id)))) {
            $this->response(array('status' => false, 'error' => 'Qualification not found'), 404);
        }
        // Must have permission to delete this type of record for this member or for any member
        else if( ! $this->user->permission('qualification_delete', array('member' => $qualification['member']['id'])) && ! $this->user->permission('qualification_delete_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        // Delete record
        else {
            $this->usertracking->track_this();
            $this->qualification_model->delete($qualification_id);
            
            $this->response(array('status' => true));
        }
    }
}