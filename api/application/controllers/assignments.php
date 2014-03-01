<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Assignments extends MY_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->model('assignment_model');
        $this->load->library('form_validation');
    }
    
    /*public function index_get() {
        $assignments = $this->assignment_model->get()->result();
        $this->response(array('status' => true, 'assignments' => $assignments));
    }*/
    
    public function index_options() {
        $this->response(array('status' => true));
    }
    public function view_options() {
        $this->response(array('status' => true));
    }
    
    public function view_get($assignment_id) {
        $assignment = nest($this->assignment_model->select_member()->get_by_id($assignment_id));
        if( ! $this->user->permission('profile_view', $assignment['member']['id']) && ! $this->user->permission('profile_view_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        else {
            $this->response(array('status' => true, 'assignment' => $assignment));
        }
    }
    
    public function index_post() {
        if( ! $this->post('member_id')) {
            $this->response(array('status' => false, 'error' => 'No member specified'), 400);
        } else if( ! $this->user->permission('assignment_add', $this->post('member_id')) && ! $this->user->permission('assignment_add_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        //} else if($this->form_validation->run('assignment_add') === FALSE) {
        //    $this->response(array('status' => false, 'error' => $this->form_validation->get_error_array()), 400);
        } else {
            $insert_id = $this->assignment_model->save(NULL, $this->post());
            $this->response(array('status' => $insert_id ? true : false, 'assignment' => $insert_id ? $this->assignment_model->select_member()->get_by_id($insert_id) : null));
        }
    }
    
    public function view_post($assignment_id) {
        if( ! ($assignment = nest($this->assignment_model->select_member()->get_by_id($assignment_id)))) {
            $this->response(array('status' => false, 'error' => 'Assignment not found'), 404);
        } else if( ! $this->user->permission('assignment_add', $assignment['member']['id']) && ! $this->user->permission('assignment_add_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        } else if($this->form_validation->run('assignment_add') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->form_validation->get_error_array()), 400);
        } else {
            $data = $this->post();
            if( ! $data['start_date']) $data['start_date'] = NULL;
            if( ! $data['end_date']) $data['end_date'] = NULL;
            $this->assignment_model->save($assignment_id, $data);
            $this->response(array('status' => true, 'assignment' => $this->assignment_model->select_member()->get_by_id($assignment_id)));
        }
    }
    
    public function view_delete($assignment_id) {
        if( ! ($assignment = nest($this->assignment_model->select_member()->get_by_id($assignment_id)))) {
            $this->response(array('status' => false, 'error' => 'Assignment not found'), 404);
        } else if( ! $this->user->permission('assignment_delete', $assignment['member']['id']) && ! $this->user->permission('assignment_delete_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        } else {
            $this->assignment_model->delete($assignment_id);
            $this->response(array('status' => true));
        }
    }
}