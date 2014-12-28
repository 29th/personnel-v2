<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class ELOA_model extends CRUD_Model {
    public $table = 'eloas';
    public $primary_key = 'eloas.id';
    
    public function default_select() {
        $this->db->select('SQL_CALC_FOUND_ROWS eloas.id, eloas.start_date, eloas.end_date, eloas.reason, eloas.availability, members.id AS `member|id`', FALSE)
            ->select($this->virtual_fields['short_name'] . ' AS `member|short_name`', FALSE);
    }
    
    public function default_join() {
        $this->db->join('members', 'members.id = eloas.member_id', 'left')
            ->join('ranks', 'ranks.id = members.rank_id', 'left');
    }
    
    public function default_order_by() {
        $this->db->order_by('eloas.posting_date DESC');
    }

    public function active($date = FALSE) {
        if($date == FALSE) $date = format_date('now', 'mysqldate');
        $this->filter_where('eloas.start_date <=', $date);
        $this->filter_where('eloas.end_date >=', $date);
        return $this;
    }

    public function by_member($member) {
        if(is_array($member)) {
            $this->filter_where_in('eloas.member_id', $member);
        } else {
            $this->filter_where('eloas.member_id', $member);
        }
        return $this;
    }
}