<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Position_model extends CRUD_Model {
    public $table = 'positions';
    public $primary_key = 'positions.id';
    
    public function validation_rules_add() {
        return array(
            array(
                'field' => 'name'
                ,'rules' => 'required|max_length[250]'
            )
            ,array(
                'field' => 'active'
                ,'rules' => 'numeric|greater_than[-1]|less_than[2]'
            )
            ,array(
                'field' => 'order'
                ,'rules' => 'numeric'
            )
            ,array(
                'field' => 'description'
                ,'rules' => 'max_length[100]'
            )
            ,array(
                'field' => 'access_level'
                ,'rules' => 'numeric|greater_than[-1]|less_than[2]'
            )
        );
    }
    
    public function validation_rules_edit() {
        return array(
            array(
                'field' => 'name'
                ,'rules' => 'min_length[1]|max_length[250]'
            )
            ,array(
                'field' => 'active'
                ,'rules' => 'numeric|greater_than[-1]|less_than[2]'
            )
            ,array(
                'field' => 'order'
                ,'rules' => 'numeric'
            )
            ,array(
                'field' => 'description'
                ,'rules' => 'max_length[100]'
            )
            ,array(
                'field' => 'access_level'
                ,'rules' => 'numeric|greater_than[-1]|less_than[2]'
            )
        );
    }
    
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