<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Note_model extends MY_Model {
    public $table = 'notes';
    public $primary_key = 'notes.id';
    
    public function validation_rules_add() {
        return array(
            array(
                'field' => 'subject'
                ,'rules' => 'min_length[1]||max_length[60]'
            )
        );
    }
    
    public function default_select() {
        $this->db->select('SQL_CALC_FOUND_ROWS notes.*', FALSE)
            ->select('authors.id AS `author|id`', FALSE)
            ->select('CONCAT(a_ranks.`abbr`, " ", IF(authors.`name_prefix` != "", CONCAT(authors.`name_prefix`, " "), ""), authors.`last_name`) AS `author|short_name`', FALSE)
            ->select('subjects.id AS `object|id`',FALSE)
            ->select('CONCAT(s_ranks.`abbr`, " ", IF(subjects.`name_prefix` != "", CONCAT(subjects.`name_prefix`, " "), ""), subjects.`last_name`) AS `object|short_name`', FALSE)
        ;
    }

    public function default_join() {
        $this->filter_join('members AS authors', 'authors.id = notes.author_member_id')
             ->filter_join('ranks AS a_ranks', 'a_ranks.id = authors.rank_id', 'left')
             ->filter_join('members AS subjects', 'subjects.id = notes.member_id')
             ->filter_join('ranks AS s_ranks', 's_ranks.id = subjects.rank_id', 'left')
        ;
    }


    public function default_order_by() {
        $this->db->order_by('notes.date_add DESC');
    }
    
    public function by_access($permissions) {
        $this->filter_where('notes.access IN (\'' . implode( "','", $permissions ) . '\')');
        return $this;
    }
    
    public function add_subject() {
           $this->filter_join('members AS subjects', 'subjects.id = notes.member_id')
                ->filter_join('ranks AS s_ranks', 's_ranks.id = subjects.rank_id', 'left');
        
    }
}