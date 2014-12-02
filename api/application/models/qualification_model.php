<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Qualification_model extends CRUD_Model {
    public $table = 'qualifications';
    public $primary_key = 'qualifications.id';
    
    public function default_select() {
        $this->db->select('qualifications.id, qualifications.date')
            ->select('qualifications.author_member_id AS `author|id`, ' . $this->virtual_fields['short_name'] . ' AS `author|short_name`', FALSE)
            ->select('qualifications.standard_id AS `standard|id`, s.weapon AS `standard|weapon`, s.badge AS `standard|badge`, s.description AS `standard|description`');
    }
    
    public function default_join() {
        $this->db->join('standards AS s', 's.id = qualifications.standard_id')
            ->join('members', 'members.id = qualifications.author_member_id')
            ->join('ranks', 'ranks.id = members.rank_id', 'left');
    }
    
    public function order_by() {
        $this->db->order_by('qualifications.date DESC');
    }
}