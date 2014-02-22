<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Enlistment_model extends CRUD_Model {
    public $table = 'enlistments';
    public $primary_key = 'enlistments.id';
    
    public function default_select() {
        $this->db->select('SQL_CALC_FOUND_ROWS enlistments.*', FALSE) // SQL_CALC_FOUND_ROWS allows a COUNT after the query
            ->select('units.id AS `unit|id`, units.abbr AS `unit|abbr`')
            ->select($this->virtual_fields['unit_key'] . ' AS `unit|key`', FALSE)
            ->select('enlistments.member_id AS `member|id`')
            ->select($this->virtual_fields['short_name'] . ' AS `member|short_name`', FALSE)
            ->select('enlistments.liaison_member_id AS `liaison|id`')
            ->select('CONCAT(l_ranks.`abbr`, " ", IF(l_members.`name_prefix` != "", CONCAT(l_members.`name_prefix`, " "), ""), l_members.`last_name`) AS `liaison|short_name`', FALSE)
            ->select('enlistments.country_id AS `country|id`, countries.name AS `country|name`');
    }
    
    public function default_join() {
        $this->db->join('members', 'members.id = enlistments.member_id')
            ->join('ranks', 'ranks.id = members.rank_id', 'left')
            ->join('units', 'units.id = enlistments.unit_id', 'left')
            ->join('countries', 'countries.id = enlistments.country_id', 'left')
            ->join('members AS l_members', 'l_members.id = enlistments.liaison_member_id', 'left')
            ->join('ranks AS l_ranks', 'l_ranks.id = l_members.rank_id', 'left');
    }
    
    public function by_status($status) {
        $this->filter_where('enlistments.status', $status);
        return $this;
    }
    
    public function default_order_by() {
        $this->db->order_by('enlistments.date DESC');
    }
}