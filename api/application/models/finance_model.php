<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Finance_model extends MY_Model {
    public $table = 'finances';
    public $primary_key = 'finances.id';
    
    public function default_select() {
        $this->db->select('SQL_CALC_FOUND_ROWS finances.id, finances.date, finances.vendor, finances.amount_received, finances.amount_paid, finances.fee, finances.forum_id, finances.topic_id, finances.notes, finances.member_id', FALSE);
    }
    
    public function default_join() {
    }
    
    public function default_order_by() {
        $this->db->order_by('finances.date DESC');
    }
}