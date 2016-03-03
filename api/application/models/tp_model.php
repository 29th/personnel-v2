<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Tp_model extends MY_Model {
    public $table = 'units';
    public $primary_key = 'units.id';
    
    public function default_select() {
        $this->db->select('SQL_CALC_FOUND_ROWS *', FALSE)
        ->select('(SELECT COUNT( DISTINCT( member_id )) FROM assignments WHERE unit_id = units.id ) AS member_count', FALSE)
        ->select("(SELECT CONCAT( DATE_FORMAT(MIN(datetime),'%Y-%m-%d'),' - ', DATE_FORMAT(MAX(datetime),'%Y-%m-%d')) FROM events WHERE events.unit_id = `units`.id )  AS days", FALSE);
    }
    
    public function default_join() {
    }
    
    public function select_member() {
        
    }
    
    public function default_where() {
        $this->filter_where('units.class = "Training" AND units.id <> 43');
    }
    
    public function default_order_by() {
        $this->db->order_by('units.abbr DESC');
    }

}