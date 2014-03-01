<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class positions extends MY_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->model('position_model');
        $this->load->library('form_validation');
    }
    
    public function index_get() {
        $positions = $this->position_model;
        $positions = $positions->order_by($this->input->get('order') ? $this->input->get('order') : 'order');
        $positions = $positions->get()->result();
        $this->response(array('status' => true, 'positions' => $positions));
    }
    
    public function index_options() {
        $this->response(array('status' => true));
    }
    public function view_options() {
        $this->response(array('status' => true));
    }
    
    public function view_get($position_id) {
        $position = nest($this->position_model->get_by_id($position_id));
        $this->response(array('status' => true, 'position' => $position));
    }
    
    public function index_post() {
        if( ! $this->user->permission('position_add')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        } else if($this->form_validation->run('position_add') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->form_validation->get_error_array()), 400);
        } else {
            $insert_id = $this->position_model->save(NULL, $this->post());
            $this->response(array('status' => $insert_id ? true : false, 'position' => $insert_id ? $this->position_model->get_by_id($insert_id) : null));
        }
    }
    
    public function view_post($position_id) {
        if( ! ($position = $this->position_model->get_by_id($position_id))) {
            $this->response(array('status' => false, 'error' => 'Position not found'), 404);
        } else if( ! $this->user->permission('position_add')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        } else if($this->form_validation->run('position_add') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->form_validation->get_error_array()), 400);
        } else {
            $this->position_model->save($position_id, $this->post());
            $this->response(array('status' => true, 'position' => $this->position_model->get_by_id($position_id)));
        }
    }
    
    public function view_delete($position_id) {
        if( ! ($position = $this->position_model->get_by_id($position_id))) {
            $this->response(array('status' => false, 'error' => 'Position not found'), 404);
        } else if( ! $this->user->permission('position_delete')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        } else {
            $this->position_model->delete($position_id);
            $this->response(array('status' => true));
        }
    }
}