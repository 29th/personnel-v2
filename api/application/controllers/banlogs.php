<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Banlogs extends MY_Controller {
    public function __construct() {
        parent::__construct();
        //$this->load->model('member_model');
        $this->load->model('banlog_model');
        //$this->load->model('assignment_model');
    }
    
    /**
     * PRE-FLIGHT
     */
    public function index_options() { $this->response(array('status' => true)); }
    public function view_options() { $this->response(array('status' => true)); }
    public function process_options() { $this->response(array('status' => true)); }
    
    /**
     * INDEX
     * Paginates
     */
    public function index_get($member_id = FALSE) {
        // Must have permission to view any member's profile
        if( ! $this->user->permission('banlog_view_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        // Index records
        else {
            $skip = $this->input->get('skip') ? $this->input->get('skip', TRUE) : 0;
            $seek_line = $this->input->get('status');
            $model = $this->banlog_model;
            if ( strlen( $seek_line ) > 2 )
                $model->search_roid($seek_line);
            $banlogs = nest($model->select_member()->paginate('', $skip)->result_array());
            $count = $model->total_rows;
            $this->response(array('status' => true, 'count' => $count, 'skip' => $skip, 'banlogs' => $banlogs ));
        }
    }
    /**
     * VIEW
     */
    public function view_get($banlog_id) {
		// Must have permission to view this type of record for this member or for any member
		if( ! $this->user->permission('banlog_view_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
		// View records
		else 
		{
            $banlogs = nest( $this->banlog_model->select_member()->get_by_id($banlog_id) );
            
            $this->load->library('vanilla');
            $discussions_list = $this->vanilla->get_ban_disputes($banlogs['roid']);
            if ( $discussions_list )
                $banlogs['forum_discussions'] = $discussions_list;
            
            $this->response(array('status' => true, 'banlogs' => $banlogs ));
		}
    }   //view_get


    public function index_post() {
        // Must be logged in
        if( ! $this->user->permission('banlog_edit_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        // Form validation for both models
        else if($this->banlog_model->run_validation('validation_rules_add') === FALSE) 
        {
            $this->response(array('status' => false, 'error' => $this->banlog_model->validation_errors), 400);
        }
        // Create record
        else 
        {
            // Create enlistment record using member_id
/*
*/
            $banlog_data = whitelist($this->post(), array('roid', 'uid', 'guid', 'handle', 'ip', 'date', 'id_admin', 'reason', 'comments'));
            $banlog_data['id_poster'] = $this->db->query("SELECT id FROM `members` WHERE forum_member_id = " . $this->user->logged_in() )->result_array()[0]['id'];
        
            $insert_id = $this->banlog_model->save(NULL, $banlog_data);
            $new_record = $insert_id ? nest($this->banlog_model->get_by_id($insert_id)) : null;
            $this->response(array('status' => $insert_id ? true : false, 'banlogs' => $new_record));
        }
    }   //index_post

}
