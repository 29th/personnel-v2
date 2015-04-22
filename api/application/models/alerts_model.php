<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Alerts_model extends MY_Model {
    public $table = 'awardings';
    public $primary_key = 'awardings.member_id';
    public $date_field = 'awardings.date';
    
    public function default_select() {
        $this->db->select('SQL_CALC_FOUND_ROWS COUNT(1) as aocc_count', FALSE); // SQL_CALC_FOUND_ROWS allows a COUNT after the query
    }
    
    public function default_where() 
    {
        $this->db->where('awardings.award_id',10); //AOCC
    }
    
}