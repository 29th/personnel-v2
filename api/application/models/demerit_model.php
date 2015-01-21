<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Demerit_model extends CRUD_Model {
    public $table = 'demerits';
    public $primary_key = 'demerits.id';
    
    public function default_select() {
        $this->db->select('SQL_CALC_FOUND_ROWS demerits.date, demerits.reason, demerits.forum_id, demerits.topic_id, members.id AS `member|id`', FALSE)
            ->select($this->virtual_fields['short_name'] . ' AS `member|short_name`', FALSE)
            
            // Author
            ->select('demerits.author_member_id AS `author|id`, ' . $this->virtual_fields['short_name'] . ' AS `author|short_name`', FALSE);
    }
    
    public function default_join() {
        // Recipient
        $this->db->join('members', 'members.id = demerits.member_id', 'left')
            ->join('ranks', 'ranks.id = members.rank_id', 'left');
            
        // Author
        $this->db->join('members AS am', 'am.id = demerits.author_member_id', 'left')
            ->join('ranks AS ar', 'ar.id = am.rank_id', 'left');
    }
    
    public function default_order_by() {
        $this->db->order_by('demerits.date DESC');
    }
}