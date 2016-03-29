<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Unit_Role_model extends MY_Model {
    public $table = 'unit_roles';
    public $primary_key = 'unit_roles.id';
    
    public function by_unit($unit_id, $access_level = FALSE) {
        $this->filter_where('unit_roles.unit_id', $unit_id);
        if($access_level !== FALSE) $this->filter_where('unit_roles.access_level = ', $access_level); //used to be <=
        return $this;
    }
}