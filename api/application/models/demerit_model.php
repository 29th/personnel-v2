<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Demerit_model extends MY_Model {
    public $table = 'demerits';
    public $primary_key = 'demerits.id';
    
    public function default_select() {
        $this->db->select('SQL_CALC_FOUND_ROWS demerits.id, demerits.date, demerits.reason, demerits.forum_id, demerits.topic_id, \'Disciplinary\' as demerit_type', FALSE)
            
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
}