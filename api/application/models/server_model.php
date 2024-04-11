<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Server_model extends MY_Model {
    public $table = 'servers';
    public $primary_key = 'servers.id';
    
    public function default_order_by() {
        $this->db->order_by('servers.name, servers.game');
    }
}