<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class ELOA_model extends CRUD_Model {
    public $table = 'eloas';
    public $primary_key = 'eloas.id';
    
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
    
    public function select_member() {
        $this->filter_select($this->table . '.member_id AS `member|id`');
        $this->filter_select($this->virtual_fields['short_name'] . ' AS `member|short_name`', FALSE);
        $this->filter_join('members', 'members.id = ' . $this->table . '.member_id');
        $this->filter_join('ranks', 'ranks.id = members.rank_id');
        return $this;
    }

    public function by_unit($unit_id) {
        $this->filter_join('assignments', 'assignments.member_id = ' . $this->table . '.member_id');
        $this->filter_join('units', 'units.id = assignments.unit_id');

        $this->filter_where('(units.id = ' . $unit_id . ' OR units.path LIKE "%/' . $unit_id . '/%")');
        $this->filter_where('assignments.end_date IS NULL'); // Only include current members
        return $this;
    }
}