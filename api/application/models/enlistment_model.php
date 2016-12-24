<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Enlistment_model extends MY_Model {
    public $table = 'enlistments';
    public $primary_key = 'enlistments.id';
    
    // Controller adds member_id, status, date
    // array('first_name', 'middle_name', 'last_name', 'age', 'country_id', 'timezone', 'game', 'ingame_name', 'steam_name', 'steam_id', 'experience', 'recruiter', 'comments')
    public function validation_rules_add() {
        return array(
            array(
                'field' => 'first_name'
                ,'rules' => 'required|max_length[30]'
            )
            ,array(
                'field' => 'last_name'
                ,'rules' => 'required|max_length[40]'
            )
            ,array(
                'field' => 'age'
                ,'rules' => 'required|max_length[8]'
            )
            ,array(
                'field' => 'country_id'
                ,'rules' => 'required|numeric'
            )
            ,array(
                'field' => 'timezone'
                ,'rules' => 'required'
            )
            ,array(
                'field' => 'game'
                ,'rules' => 'required'
            )
            ,array(
                'field' => 'ingame_name'
                ,'rules' => 'max_length[60]'
            )
            ,array(
                'field' => 'steam_name'
                ,'rules' => 'max_length[60]'
            )
            ,array(
                'field' => 'steam_id'
                ,'rules' => 'numeric_or_empty'
            )
            ,array(
                'field' => 'experience'
                ,'rules' => 'required'
            )
            ,array(
                'field' => 'recruiter'
                ,'rules' => 'max_length[128]'
            )
            ,array(
                'field' => 'topic_id'
                ,'rules' => 'numeric_or_empty'
            )
        );
    }
    
    // array('first_name', 'middle_name', 'last_name', 'age', 'country_id', 'timezone', 'game', 'ingame_name', 'steam_name', 'steam_id', 'experience', 'recruiter', 'comments')
    public function validation_rules_edit() {
        return array(
            array(
                'field' => 'first_name'
                ,'rules' => 'min_length[1]||max_length[30]'
            )
            ,array(
                'field' => 'last_name'
                ,'rules' => 'min_length[1]||max_length[40]'
            )
            ,array(
                'field' => 'age'
                ,'rules' => 'numeric'
            )
            ,array(
                'field' => 'country_id'
                ,'rules' => 'numeric'
            )
            /*,array(
                'field' => 'timezone'
                ,'rules' => ''
            )*/
            /*,array(
                'field' => 'game'
                ,'rules' => ''
            )*/
            ,array(
                'field' => 'ingame_name'
                ,'rules' => 'max_length[60]'
            )
            ,array(
                'field' => 'steam_name'
                ,'rules' => 'max_length[60]'
            )
            ,array(
                'field' => 'steam_id'
                ,'rules' => 'numeric_or_empty'
            )
            /*,array(
                'field' => 'experience'
                ,'rules' => ''
            )*/
            ,array(
                'field' => 'recruiter'
                ,'rules' => 'max_length[128]'
            )
            ,array(
                'field' => 'topic_id'
                ,'rules' => 'numeric_or_empty'
            )
        );
    }
    
    // array('status', 'unit_id', 'recruiter_member_id')
    public function validation_rules_process() {
        return array(
            array(
                'field' => 'status'
                ,'rules' => 'required'
            )
            ,array(
                'field' => 'unit_id'
                ,'rules' => 'numeric'||null
            )
            ,array(
                'field' => 'recruiter_member_id'
                ,'rules' => 'numeric_or_empty'
            )
        );
    }
    
    public function default_select() {
        $this->db->select('SQL_CALC_FOUND_ROWS enlistments.*', FALSE) // SQL_CALC_FOUND_ROWS allows a COUNT after the query
            ->select('units.id AS `unit|id`, units.abbr AS `unit|abbr`')
            ->select($this->virtual_fields['unit_key'] . ' AS `unit|key`', FALSE)
            ->select('enlistments.member_id AS `member|id`')
            ->select($this->virtual_fields['short_name'] . ' AS `member|short_name`', FALSE)
            ->select('members.steam_id AS `member|roid`')
            ->select('members.rank_id AS `member|rank_id`')
            ->select('members.forum_member_id AS `member|forum_member_id`')
            ->select('enlistments.liaison_member_id AS `liaison|id`')
            ->select('CONCAT(l_ranks.`abbr`, " ", IF(l_members.`name_prefix` != "", CONCAT(l_members.`name_prefix`, ". "), ""), l_members.`last_name`) AS `liaison|short_name`', FALSE)
            ->select('enlistments.country_id AS `country|id`, countries.name AS `country|name`, countries.abbr AS `country|abbr`');
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
    
    public function by_game($game) {
        $this->filter_where('enlistments.game', $game);
        return $this;
    }
    
    public function by_timezone($timezone) {
        $this->filter_where('enlistments.timezone IN (\'Either\', \'' . $timezone . '\')');
        return $this;
    }
    
    public function default_order_by() {
        $this->db->order_by('enlistments.date DESC, enlistments.id DESC');
    }
}