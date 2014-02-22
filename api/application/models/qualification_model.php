<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Qualification_model extends CRUD_Model {
    public $table = 'qualifications';
    public $primary_key = 'qualifications.id';
    
    public function default_select() {
        $this->db->select('qualifications.id, qualifications.standard_id, qualifications.date, qualifications.author_member_id')
            ->select('s.weapon AS `standard|weapon`, s.badge AS `standard|badge`, s.description AS `standard|description`');
    }
    
    public function default_join() {
        $this->db->join('standards AS s', 's.id = qualifications.standard_id');
    }
    
    public function order_by() {
        $this->db->order_by('qualifications.date DESC');
    }
}