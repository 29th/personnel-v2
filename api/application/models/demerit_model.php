<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Demerit_model extends CRUD_Model {
    public $table = 'demerits';
    public $primary_key = 'demerits.id';
    
    public function default_select() {
        $this->db->select('SQL_CALC_FOUND_ROWS demerits.id, demerits.date, demerits.reason, demerits.forum_id, demerits.topic_id', FALSE)
            
            // Author
            ->select('demerits.author_member_id AS `author|id`')
            ->select('CONCAT(a_ranks.`abbr`, " ", IF(a_members.`name_prefix` != "", CONCAT(a_members.`name_prefix`, " "), ""), a_members.`last_name`) AS `author|short_name`', FALSE);
    }
    
    public function default_join() {
            
        // Author
        $this->db->join('members AS a_members', 'a_members.id = demerits.author_member_id', 'left')
            ->join('ranks AS a_ranks', 'a_ranks.id = a_members.rank_id', 'left');
    }
    
    public function default_order_by() {
        $this->db->order_by('demerits.date DESC');
    }
    
    public function select_member() {
        $this->filter_select($this->table . '.member_id AS `member|id`');
        $this->filter_select($this->virtual_fields['short_name'] . ' AS `member|short_name`', FALSE);
        $this->filter_join('members', 'members.id = ' . $this->table . '.member_id');
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