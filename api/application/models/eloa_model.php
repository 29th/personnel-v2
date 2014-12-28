<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class ELOA_model extends CRUD_Model {
    public $table = 'loa';
    public $primary_key = 'loa.id';
    
    public function default_select() {
        $this->db->select('SQL_CALC_FOUND_ROWS loa.id, loa.start_date, loa.end_date, loa.reason, loa.is_available AS availability, members.id AS `member|id`', FALSE)
            ->select($this->virtual_fields['short_name'] . ' AS `member|short_name`', FALSE);
    }
    
    public function default_join() {
        $this->db->join('members', 'members.id = loa.member_id', 'left')
            ->join('ranks', 'ranks.id = members.rank_id', 'left');
    }
    
    public function default_order_by() {
        $this->db->order_by('loa.posting_date DESC');
    }

    public function active($date = FALSE) {
        if($date == FALSE) $date = format_date('now', 'mysqldate');
        $this->filter_where('loa.start_date <=', $date);
        $this->filter_where('loa.end_date >=', $date);
        return $this;
    }

    public function by_member($member) {
        if(is_array($member)) {
            $this->filter_where_in('loa.member_id', $member);
        } else {
            $this->filter_where('loa.member_id', $member);
        }
        return $this;
    }
}