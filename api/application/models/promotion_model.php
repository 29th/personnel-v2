<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Promotion_model extends CRUD_Model {
    public $table = 'promotions';
    public $primary_key = 'promotions.id';
    
    public function default_select() {
        $this->db->select('promotions.id, promotions.date, promotions.forum_id, promotions.topic_id, promotions.member_id')
            ->select('r_old.id AS `old_rank|id`, r_old.order AS `old_rank|order`')
            ->select('r_new.id AS `new_rank|id`, r_new.order AS `new_rank|order`, r_new.abbr AS `new_rank|abbr`, r_new.name AS `new_rank|name`, r_new.filename AS `new_rank|filename`');
    }
    
    public function default_join() {
        $this->db->join('ranks AS r_old', 'r_old.id = promotions.old_rank_id', 'left')
            ->join('ranks AS r_new', 'r_new.id = promotions.new_rank_id');
    }
    
    public function default_order_by() {
        $this->db->order_by('promotions.date DESC');
    }
    
    public function by_newer($member_id, $date) {
        $this->filter_where('promotions.member_id', $member_id)
            ->filter_where('promotions.date >', $date);
        return $this;
    }
}