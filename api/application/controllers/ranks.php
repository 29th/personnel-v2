<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Ranks extends MY_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->model('rank_model');
    }
    
    /**
     * INDEX
     */
    public function index_get() {
        $ranks = $this->rank_model->get()->result();
        $this->response(array('status' => true, 'ranks' => $ranks));
    }
    
    /**
     * VIEW
     */
    public function view_get($rank_id) {
        $rank = $this->rank_model->get_by_id($rank_id);
        $this->response(array('status' => true, 'rank' => $rank));
    }
    
    /*public function index_post() {
        $this->form_validation->set_group_rules('rank_add');
        $this->form_validation->set_group_rules('rank_edit');
        if($this->form_validation->run() === FALSE) {
            $this->response(array('status' => false, 'error' => $this->form_validation->get_error_array()));
        } else {
            $insert_id = $this->rank_model->save(NULL, $this->post());
            $this->response(array('status' => $insert_id ? true : false, 'rank' => $insert_id ? $this->rank_model->get_by_id($insert_id) : null));
        }
    }*/
    
    /*public function view_post($rank_id) {
        if($this->form_validation->run('rank_edit') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->form_validation->get_error_array()));
        } else {
            $this->rank_model->save($rank_id, $this->post());
            $this->response(array('status' => true, 'rank' => $this->rank_model->get_by_id($rank_id)));
        }
    }*/
    
    /*public function view_delete($rank_id) {
        $this->rank_model->delete($rank_id);
        $this->response(array('status' => true));
    }*/
}