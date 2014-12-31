<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Qualification_model extends CRUD_Model {
    public $table = 'qualifications';
    public $primary_key = 'qualifications.id';
    
    public function validation_rules_add() {
        return array(
            array(
                'field' => 'member_id'
                ,'rules' => 'required|numeric'
            )
            ,array(
                'field' => 'standard_id'
                ,'rules' => 'required|numeric'
            )
        );
    }
    
    public function validation_rules_edit() {
        return array(
            array(
                'field' => 'member_id'
                ,'rules' => 'numeric'
            )
            ,array(
                'field' => 'standard_id'
                ,'rules' => 'numeric'
            )
        );
    }
    
    public function default_select() {
        $this->db->select('qualifications.id, qualifications.date')
            ->select('qualifications.author_member_id AS `author|id`')
            ->select('CONCAT(a_ranks.`abbr`, " ", IF(a_members.`name_prefix` != "", CONCAT(a_members.`name_prefix`, " "), ""), a_members.`last_name`) AS `author|short_name`', FALSE)
            ->select('qualifications.standard_id AS `standard|id`, s.weapon AS `standard|weapon`, s.badge AS `standard|badge`, s.description AS `standard|description`');
    }
    
    public function default_join() {
        $this->db->join('standards AS s', 's.id = qualifications.standard_id')
            ->join('members AS a_members', 'a_members.id = qualifications.author_member_id', 'left')
            ->join('ranks AS a_ranks', 'a_ranks.id = a_members.rank_id', 'left');
    }
    
    public function select_member() {
        $this->filter_select('qualifications.member_id AS `member|id`');
        $this->filter_select($this->virtual_fields['short_name'] . ' AS `member|short_name`', FALSE);
        $this->filter_join('members', 'members.id = qualifications.member_id');
        $this->filter_join('ranks', 'ranks.id = members.rank_id');
        return $this;
    }
    
    public function order_by() {
        $this->db->order_by('qualifications.date DESC');
    }
}