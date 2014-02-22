<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Standard_model extends CRUD_Model {
    public $table = 'standards';
    public $primary_key = 'standards.id';
    
    public function default_select() {
        $this->db->select('standards.*');
    }
    
    public function default_order_by() {
        $this->db->order_by('standards.weapon, standards.badge');
    }
    
    public function for_member($member_id) {
        $this->filter_select('qualifications.id AS `qualification|id`, qualifications.date AS `qualification|date`, qualifications.author_member_id AS `qualification|author_member_id`');
        $this->filter_join('qualifications', 'qualifications.standard_id = standards.id AND qualifications.member_id = ' . $this->db->escape($member_id), 'left');
        return $this;
    }
}