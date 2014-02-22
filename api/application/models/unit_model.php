<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Unit_model extends CRUD_Model {
    public $table = 'units';
    public $primary_key = 'units.id';
    
    public function default_select() {
        $this->db->select('units.*')
            ->select($this->virtual_fields['depth'] . ' AS depth', FALSE)
            ->select($this->virtual_fields['unit_key'] . ' AS unit_key', FALSE)
            ->select($this->virtual_fields['parent_id'] . ' AS parent_id', FALSE);
    }
    
    /*public function default_where() {
        $this->db->where('units.active', 1);
    }*/
    
    public function default_order_by() {
        $this->db->order_by('depth, units.order', FALSE);
    }
    
    public function by_filter($filter, $children = FALSE) {        
        // If looking up by id
        if(is_numeric($filter)) {
            // If getting children, search by path and id
            if($children !== FALSE) {
                $this->filter_where('(units.id = ' . $filter . ' OR units.path LIKE "%/' . $filter . '/%")');
            }
            // Otherwise just get the individual record by id
            else {
                $this->filter_where('units.id', $filter);
            }
        }
        // Otherwise, looking up by unit_key and we don't want children
        else {
            // If looking up by unit_key and we want children, we need to get the unit's id with a separate query
            if($children !== FALSE && $lookup = $this->getByUnitKey($filter)) {
                $this->filter_where('(units.id = ' . $lookup['id'] . ' OR units.path LIKE "%/' . $lookup['id'] . '/%")');
            }
            else {
                $this->filter_where($this->virtual_fields['unit_key'] . ' = ' . $this->db->escape($filter));
            }
        }
        return $this;
    }
    
    private function getByUnitKey($unit_key) {
        $query = $this->db->query("SELECT units.id FROM units WHERE " . $this->virtual_fields['unit_key'] . ' = ' . $this->db->escape($unit_key));
        return $query->row_array();
    }
}