<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Promotion_model extends CRUD_Model {
    public $table = 'promotions';
    public $primary_key = 'promotions.id';
    
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
                'field' => 'old_rank_id'
                ,'rules' => 'required|numeric'
            )
            ,array(
                'field' => 'new_rank_id'
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
            /*array(
                'field' => 'date'
                ,'rules' => ''
            )*/
            array(
                'field' => 'old_rank_id'
                ,'rules' => 'numeric'
            )
            ,array(
                'field' => 'new_rank_id'
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
        $this->db->select('SQL_CALC_FOUND_ROWS promotions.id, promotions.date, promotions.forum_id, promotions.topic_id', FALSE)
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
    
    public function members() {
        $this->filter_select('promotions.member_id AS `member|id`');
        $this->filter_select($this->virtual_fields['short_name'] . ' AS `member|short_name`', FALSE);
        $this->filter_join('members', 'members.id = promotions.member_id');
        $this->filter_join('ranks', 'ranks.id = members.rank_id');
        return $this;
    }
}