<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Standards extends MY_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->model('standard_model');
        $this->load->library('form_validation');
    }
    
    public function index_get($weapon = FALSE, $badge = FALSE) {
        $model = $this->standard_model;
        if($weapon) $model->where('weapon', $weapon);
        if($badge) $model->where('badge', $badge);
        $standards = $model->get()->result();
        $this->response(array('status' => true, 'standards' => $standards));
    }
    
    public function view_get($standard_id) {
        $standard = $this->standard_model->get_by_id($standard_id);
        $this->response(array('status' => true, 'standard' => $standard));
    }
    
    public function index_post() {
        if($this->form_validation->run('standard_add') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->form_validation->get_error_array()));
        } else {
            $insert_id = $this->standard_model->save(NULL, $this->post());
            $this->response(array('status' => $insert_id ? true : false, 'standard' => $insert_id ? $this->standard_model->get_by_id($insert_id) : null));
        }
    }
    
    public function view_post($standard_id) {
        if($this->form_validation->run('standard_add') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->form_validation->get_error_array()));
        } else {
            $this->standard_model->save($standard_id, $this->post());
            $this->response(array('status' => true, 'standard' => $this->standard_model->get_by_id($standard_id)));
        }
    }
    
    public function view_delete($standard_id) {
        $this->standard_model->delete($standard_id);
        $this->response(array('status' => true));
    }
}