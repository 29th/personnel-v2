<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Awarding extends MY_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->model('awarding_model');
        $this->load->library('form_validation');
    }
    
    /*public function index_get() {
        $awardings = $this->awarding_model->get()->result();
        $this->response(array('status' => true, 'awardings' => $awardings));
    }*/
    
    public function index_options() {
        $this->response(array('status' => true));
    }
    public function view_options() {
        $this->response(array('status' => true));
    }
    
    public function view_get($awarding_id) {
        $awarding = nest($this->awarding_model->get_by_id($awarding_id));
        if( ! $this->user->permission('profile_view', $awarding['member_id']) && ! $this->user->permission('profile_view_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        else {
            $this->response(array('status' => true, 'awarding' => $awarding));
        }
    }
    
    public function index_post() {
        if( ! $this->post('member_id')) {
            $this->response(array('status' => false, 'error' => 'No member specified'), 400);
        } else if( ! $this->user->permission('awarding_add', $this->post('member_id')) && ! $this->user->permission('awarding_add_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        } else if($this->form_validation->run('awarding_add') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->form_validation->get_error_array()), 400);
        } else {
            $insert_id = $this->awarding_model->save(NULL, $this->post());
            $this->response(array('status' => $insert_id ? true : false, 'awarding' => $insert_id ? $this->awarding_model->get_by_id($insert_id) : null));
        }
    }
    
    public function view_post($awarding_id) {
        if( ! ($awarding = $this->awarding_model->get_by_id($awarding_id))) {
            $this->response(array('status' => false, 'error' => 'Awarding not found'), 404);
        } else if( ! $this->user->permission('awarding_add', $awarding['member_id']) && ! $this->user->permission('awarding_add_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        } else if($this->form_validation->run('awarding_add') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->form_validation->get_error_array()), 400);
        } else {
            $this->awarding_model->save($awarding_id, $this->post());
            $this->response(array('status' => true, 'awarding' => $this->awarding_model->get_by_id($awarding_id)));
        }
    }
    
    public function view_delete($awarding_id) {
        if( ! ($awarding = $this->awarding_model->get_by_id($awarding_id))) {
            $this->response(array('status' => false, 'error' => 'Awarding not found'), 404);
        } else if( ! $this->user->permission('awarding_delete', $awarding['member_id']) && ! $this->user->permission('awarding_delete_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        } else {
            $this->awarding_model->delete($awarding_id);
            $this->response(array('status' => true));
        }
    }
}