<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Awards extends MY_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->model('award_model');
    }
    
    /**
     * INDEX
     */
    public function index_get() {
        $awards = $this->award_model->get()->result();
        $this->response(array('status' => true, 'awards' => $awards));
    }
    
    /**
     * VIEW
     */
    public function view_get($award_id) {
        $award = $this->award_model->get_by_id($award_id);
        $this->response(array('status' => true, 'award' => $award));
    }
    
    /*public function index_post() {
        if($this->form_validation->run('award_add') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->form_validation->get_error_array()));
        } else {
            $insert_id = $this->award_model->save(NULL, $this->post());
            $this->response(array('status' => $insert_id ? true : false, 'award' => $insert_id ? $this->award_model->get_by_id($insert_id) : null));
        }
    }
    
    public function view_post($award_id) {
        if($this->form_validation->run('award_add') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->form_validation->get_error_array()));
        } else {
            $this->award_model->save($award_id, $this->post());
            $this->response(array('status' => true, 'award' => $this->award_model->get_by_id($award_id)));
        }
    }
    
    public function view_delete($award_id) {
        $this->award_model->delete($award_id);
        $this->response(array('status' => true));
    }*/
}