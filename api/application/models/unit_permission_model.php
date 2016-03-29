<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Unit_Permission_model extends MY_Model {
    public $table = 'unit_permissions';
    public $primary_key = 'unit_permissions.id';
    
    public function default_select() {
        $this->db->select('unit_permissions.id, unit_permissions.access_level')
            ->select('abilities.name AS `ability|name`, abilities.abbr AS `ability|abbr`, abilities.description AS `ability|description`');
    }
    
    public function default_join() {
        $this->db->join('abilities', 'abilities.id = unit_permissions.ability_id');
    }
    
    public function by_unit($unit_id, $access_level = FALSE) {
        $this->filter_where('unit_permissions.unit_id', $unit_id);
        if($access_level !== FALSE) $this->filter_where('unit_permissions.access_level = ', $access_level); //used to be <=
        return $this;
    }
}