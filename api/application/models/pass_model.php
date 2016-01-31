<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Pass_model extends MY_Model {
    public $table = 'passes';
    public $primary_key = 'passes.id';
    public $date_field = 'passes.start_date';
    
    public function validation_rules_add() {
        return array(
            array(
                'field' => 'member_id'
                ,'rules' => 'required|numeric'
            )
            ,array(
                'field' => 'start_date'
                ,'rules' => 'required'
            )
            ,array(
                'field' => 'end_date'
                ,'rules' => 'required'
            )
        );
    }
    
    public function validation_rules_edit() {
        return array(
        );
    }
    
    public function default_select() {
        $this->db->select('SQL_CALC_FOUND_ROWS passes.id, passes.start_date, passes.end_date, passes.add_date, passes.reason, passes.type', FALSE);
    }
    
    public function default_join() {
    }
    
    public function default_order_by() {
        $this->db->order_by('passes.end_date DESC, passes.start_date DESC');
    }

    public function active($date = FALSE) {
        if($date == FALSE) $date = format_date('now', 'mysqldate');
        $this->filter_where('passes.start_date <=', $date);
        $this->filter_where('passes.end_date >=', $date);
        return $this;
    }

    public function select_member() {
        $this->filter_select('passes.member_id AS `member|id`');
        $this->filter_select('CONCAT(ranks.abbr," ",members.last_name) AS `member|short_name`', FALSE);
        $this->filter_select('passes.author_id AS `author|id`');
        $this->filter_select('CONCAT(a_ranks.abbr," ",a_members.last_name) AS `poster|short_name`', FALSE);
        $this->filter_select('passes.recruit_id AS `recruit|id`');
        $this->filter_select('CONCAT(r_ranks.abbr," ",r_members.last_name) AS `recruit|short_name`', FALSE);
        $this->filter_join('members', 'members.id = passes.member_id','left');
        $this->filter_join('ranks', 'ranks.id = members.rank_id','left');
        $this->filter_join('members AS a_members', 'a_members.id = passes.author_id','left');
        $this->filter_join('ranks AS a_ranks', 'a_ranks.id = a_members.rank_id','left');
        $this->filter_join('members AS r_members', 'r_members.id = passes.recruit_id','left');
        $this->filter_join('ranks AS r_ranks', 'r_ranks.id = r_members.rank_id','left');
        return $this;
    }
    

    public function by_member($member) {
        if(is_array($member)) {
            $this->filter_where_in('passes.member_id', $member);
        } else {
            $this->filter_where('passes.member_id', $member);
        }
        return $this;
    }
}