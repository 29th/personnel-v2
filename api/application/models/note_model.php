<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Note_model extends MY_Model {
    public $table = 'notes';
    public $primary_key = 'notes.id';
    
    public function default_select() {
        $this->db->select('SQL_CALC_FOUND_ROWS notes.*', FALSE)
            ->select('authors.id AS `author|id`', FALSE)
            ->select('CONCAT(a_ranks.`abbr`, " ", IF(authors.`name_prefix` != "", CONCAT(authors.`name_prefix`, " "), ""), authors.`last_name`) AS `author|short_name`', FALSE)
        ;
    }

    public function default_join() {
        $this->filter_join('members AS authors', 'authors.id = notes.author_member_id')
            ->filter_join('ranks AS a_ranks', 'a_ranks.id = authors.rank_id', 'left');
    }


    public function default_order_by() {
        $this->db->order_by('notes.date_add DESC');
    }
    
    public function by_access($permissions) {
        $this->filter_where('notes.access IN (\'' . implode( "','", $permissions ) . '\')');
        return $this;
    }
}