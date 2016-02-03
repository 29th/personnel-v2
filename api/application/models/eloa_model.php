<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class ELOA_model extends MY_Model {
    public $table = 'eloas';
    public $primary_key = 'eloas.id';
    public $date_field = 'eloas.posting_date';
    
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
        $this->db->select('SQL_CALC_FOUND_ROWS eloas.id, eloas.start_date, eloas.end_date, eloas.posting_date, eloas.reason, eloas.availability', FALSE);
    }
    
    public function default_join() {
    }
    
    public function default_order_by() {
        $this->db->order_by('eloas.end_date DESC, eloas.start_date DESC');
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