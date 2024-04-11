<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Restricted_names_model extends MY_Model {
    public $table = 'restricted_names';
    public $primary_key = 'restricted_names.id';
    
    public function validation_rules_add() {
        return array(
            array(
                'field' => 'last_name'
                ,'rules' => 'is_unique[restricted_names.name]'
            )
        );
    }

    public function default_select() {
        $this->db->select('SQL_CALC_FOUND_ROWS restricted_names.*', FALSE) // SQL_CALC_FOUND_ROWS allows a COUNT after the query
            ->select($this->virtual_fields['short_name'] . ' AS short_name, ' . $this->virtual_fields['full_name'] . ' AS full_name', FALSE)
            ->select('members.steam_id AS `member|roid`')
            ->select('members.rank_id AS `rank|id`, ranks.abbr AS `rank|abbr`, ranks.name AS `rank|name`, ranks.filename AS `rank|filename`')
            ->select('members.forum_member_id AS `member|forum_member_id`')
            ->select('(SELECT COUNT(1) FROM assignments WHERE assignments.member_id = members.id AND end_date IS NULL) AS is_active')
            ->select('(SELECT start_date FROM assignments WHERE assignments.member_id = members.id ORDER BY start_date ASC LIMIT 1) AS `service|start`')
            ->select('(SELECT start_date FROM assignments WHERE assignments.member_id = members.id AND end_date IS NOT NULL ORDER BY end_date DESC LIMIT 1) AS `service|end`')
            ;
    }
    
    public function default_join() {
        $this->db->join('members', 'members.id = restricted_names.member_id')
            ->join('ranks', 'ranks.id = members.rank_id', 'left')
            ;
    }
    
    public function default_order_by() {
        $this->db->order_by('ranks.id DESC, restricted_names.member_id ASC');
    }
}