<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Finance_model extends CRUD_Model {
    public $table = 'finances';
    public $primary_key = 'finances.id';
    
    public function default_select() {
        $this->db->select('SQL_CALC_FOUND_ROWS finances.id, finances.date, finances.vendor, finances.amount_received, finances.amount_paid, finances.fee, finances.forum_id, finances.topic_id, finances.notes', FALSE);
    }
    
    public function default_join() {
    }
    
    public function default_order_by() {
        $this->db->order_by('finances.date DESC');
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