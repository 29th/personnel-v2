<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Servers extends MY_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->model('server_model');
    }
    
    /**
     * INDEX
     */
    public function index_get() {
        $servers = $this->server_model->get()->result();
        $this->response(array('status' => true, 'servers' => $servers));
    }
    
    /**
     * VIEW
     */
    public function view_get($server_id) {
        $server = $this->server_model->get_by_id($server_id);
        $this->response(array('status' => true, 'server' => $server));
    }
}