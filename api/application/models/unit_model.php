<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Unit_model extends MY_Model {
    public $table = 'units';
    public $primary_key = 'units.id';
    
    public function validation_rules_add() {
        return array(
            array(
                'field' => 'name'
                ,'rules' => 'required|max_length[64]'
            )
            ,array(
                'field' => 'abbr'
                ,'rules' => 'required|max_length[32]'
            )
            ,array(
                'field' => 'path'
                ,'rules' => 'required|max_length[32]'
            )
            ,array(
                'field' => 'order'
                ,'rules' => 'required|numeric'
            )
            ,array(
                'field' => 'timezone'
                ,'rules' => 'max_length[3]'
            )
			,array(
                'field' => 'class'
                ,'rules' => 'required'
            )
            ,array(
                'field' => 'active'
                ,'rules' => 'numeric|greater_than[-1]|less_than[2]'
            )
        );
    }
    
    public function validation_rules_edit() {
        return array(
            array(
                'field' => 'name'
                ,'rules' => 'min_length[1]|max_length[64]'
            )
            ,array(
                'field' => 'abbr'
                ,'rules' => 'min_length[1]|max_length[32]'
            )
            ,array(
                'field' => 'path'
                ,'rules' => 'min_length[1]|max_length[32]'
            )
            ,array(
                'field' => 'order'
                ,'rules' => 'min_length[1]|numeric'
            )
            ,array(
                'field' => 'timezone'
                ,'rules' => 'max_length[3]'
            )
			,array(
                'field' => 'class'
                ,'rules' => 'min_length[1]'
            )
            ,array(
                'field' => 'active'
                ,'rules' => 'numeric|greater_than[-1]|less_than[2]'
            )
        );
    }
    
    public function default_select() {
        $this->db->select('units.*')
            ->select($this->virtual_fields['depth'] . ' AS depth', FALSE)
            ->select($this->virtual_fields['unit_key'] . ' AS `key`', FALSE)
            ->select($this->virtual_fields['parent_id'] . ' AS parent_id', FALSE)
            ->select("(SELECT CONCAT( DATE_FORMAT(MIN(datetime),'%d %b %Y'),' - ', DATE_FORMAT(MAX(datetime),'%d %b %Y')) FROM events WHERE events.unit_id = `units`.id )  AS days", FALSE);
    }
    
    /*public function default_where() {
        $this->db->where('units.active', 1);
    }*/
    
    public function default_order_by() {
        $this->db->order_by('depth, units.order, units.name', FALSE);
    }
    
    public function by_filter($filter, $children = FALSE, $inactive = FALSE) {        
        // If looking up by id
        if(is_numeric($filter)) {
            // If getting children, search by path and id
            if($children !== FALSE) {
                $this->filter_where('(units.id = ' . $filter . ' OR (' . ( ! $inactive ? 'units.active = 1 AND ' : '') . 'units.path LIKE "%/' . $filter . '/%"))');
            }
            // Otherwise just get the individual record by id
            else {
                $this->filter_where('units.id', $filter);
            }
        }
        // Otherwise, looking up by unit_key and we don't want children
        else if($filter) {
            // If looking up by unit_key and we want children, we need to get the unit's id with a separate query
            if($children !== FALSE && $lookup = $this->getByUnitKey($filter)) {
                $this->filter_where('(units.id = ' . $lookup['id'] . ' OR (' . ( ! $inactive ? 'units.active = 1 AND ' : '') . 'units.path LIKE "%/' . $lookup['id'] . '/%"))');
            }
            else {
                $this->filter_where($this->virtual_fields['unit_key'] . ' = ' . $this->db->escape($filter));
            }
        }
        else if( ! $inactive) {
            $this->filter_where('units.active', 1);
        }
        return $this;
    }
}