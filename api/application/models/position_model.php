<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Position_model extends CRUD_Model {
    public $table = 'positions';
    public $primary_key = 'positions.id';
    
    public function default_where() {
        $this->db->where('positions.active', TRUE);
    }
    
    public function order_by($by = FALSE) {
        switch($by) {
            case 'name':
                $this->filter_order_by('positions.name'); break;
            default:
                $this->filter_order_by('positions.order DESC'); break;
        }
        return $this;
    } 
}