<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Member_model extends CRUD_Model {
    public $table = 'members';
    public $primary_key = 'members.id';
    
    public function default_select() {
        $this->db->select('members.id, members.last_name, members.first_name, members.middle_name, members.name_prefix, members.steam_id, members.city, members.primary_assignment_id')
            ->select($this->virtual_fields['short_name'] . ' AS short_name, ' . $this->virtual_fields['full_name'] . ' AS full_name', FALSE)
            ->select('members.rank_id AS `rank|id`, ranks.abbr AS `rank|abbr`, ranks.name AS `rank|name`, ranks.filename AS `rank|filename`')
            ->select('units.id AS `unit|id`, units.abbr AS `unit|abbr`, ' . $this->virtual_fields['unit_key'] . ' AS `unit|key`, units.name AS `unit|name`', FALSE)
            ->select('positions.name AS `position|name`')
            ->select('countries.id AS `country|id`, countries.abbr AS `country|abbr`, countries.name AS `country|name`');
    }
    
    public function default_join() {
        $this->db->join('ranks', 'ranks.id = members.rank_id')
            ->join('assignments', 'assignments.id = members.primary_assignment_id', 'left')
            ->join('positions', 'positions.id = assignments.position_id', 'left')
            ->join('units', 'units.id = assignments.unit_id', 'left')
            ->join('countries', 'countries.id = members.country_id', 'left');
    }
    
    public function default_order_by() {
        $this->db->order_by('ranks.order DESC');
    }
}