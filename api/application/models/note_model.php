<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Note_model extends MY_Model {
    public $table = 'notes';
    public $primary_key = 'notes.id';
    
    public function default_select() {
        $this->db->select('SQL_CALC_FOUND_ROWS notes.*', FALSE)
            ->select('members.id AS `author|id`', FALSE)
            ->select('CONCAT(ranks.`abbr`, " ", IF(members.`name_prefix` != "", CONCAT(members.`name_prefix`, " "), ""), members.`last_name`) AS `author|short_name`', FALSE)
        ;
    }

    public function default_join() {
        $this->filter_join('members', 'members.id = notes.author_member_id')
            ->filter_join('ranks', 'ranks.id = members.rank_id', 'left');
    }


    public function default_order_by() {
        $this->db->order_by('notes.date_add DESC');
    }
    
    public function by_access($permissions) {
        $this->filter_where('notes.access IN (\'' . implode( "','", $permissions ) . '\')');
        return $this;
    }
}