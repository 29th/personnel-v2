<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Rank_model extends CRUD_Model {
    public $table = 'ranks';
    public $primary_key = 'ranks.id';
    
    public function default_order_by() {
        $this->db->order_by('ranks.order');
    }
}