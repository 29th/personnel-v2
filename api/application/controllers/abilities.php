<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Abilities extends MY_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->model('ability_model');
    }
    
    public function index_get() {
        $abilities = $this->ability_model->get()->result();
        $this->response(array('status' => true, 'abilities' => $abilities));
    }
    
    public function view_get($ability_id) {
        $ability = $this->ability_model->get_by_id($ability_id);
        $this->response(array('status' => true, 'ability' => $ability));
    }
}