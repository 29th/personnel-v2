<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Awarding_model extends CRUD_Model {
    public $table = 'awardings';
    public $primary_key = 'awardings.id';
    
    public function validation_rules_add() {
        return array(
            array(
                'field' => 'member_id'
                ,'rules' => 'required|numeric'
            )
            ,array(
                'field' => 'date'
                ,'rules' => 'required'
            )
            ,array(
                'field' => 'award_id'
                ,'rules' => 'required|numeric'
            )
            ,array(
                'field' => 'forum_id'
                ,'rules' => 'numeric'
            )
            ,array(
                'field' => 'topic_id'
                ,'rules' => 'numeric'
            )
        );
    }
    
    public function validation_rules_edit() {
        return array(
            array(
                'field' => 'member_id'
                ,'rules' => 'numeric'
            )
            /*,array(
                'field' => 'date'
                ,'rules' => ''
            )*/
            ,array(
                'field' => 'award_id'
                ,'rules' => 'numeric'
            )
            ,array(
                'field' => 'forum_id'
                ,'rules' => 'numeric'
            )
            ,array(
                'field' => 'topic_id'
                ,'rules' => 'numeric'
            )
        );
    }
    
    public function default_select() {
        $this->db->select('SQL_CALC_FOUND_ROWS awardings.id, awardings.date, awardings.forum_id, awardings.topic_id', FALSE)
            ->select('a.code AS `award|abbr`, a.title AS `award|name`, a.image AS `award|filename`'); // Change code to abbr, title to name, image to filename
    }
    
    public function default_join() {
        $this->db->join('awards as a', 'a.id = awardings.award_id');
    }
    
    public function default_order_by() {
        $this->db->order_by('awardings.date DESC');
    }
    
    public function select_member() {
        $this->filter_select('awardings.member_id AS `member|id`');
        $this->filter_select($this->virtual_fields['short_name'] . ' AS `member|short_name`', FALSE);
        $this->filter_join('members', 'members.id = awardings.member_id');
        $this->filter_join('ranks', 'ranks.id = members.rank_id');
        return $this;
    }

    public function by_unit($unit_id) {
        $this->filter_join('assignments', 'assignments.member_id = ' . $this->table . '.member_id');
        $this->filter_join('units', 'units.id = assignments.unit_id');

        $this->filter_where('(units.id = ' . $unit_id . ' OR units.path LIKE "%/' . $unit_id . '/%")');
        $this->filter_where('assignments.end_date IS NULL'); // Only include current members
        return $this;
    }
}