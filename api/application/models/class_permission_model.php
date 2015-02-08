<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Class_Permission_model extends MY_Model {
    public $table = 'class_permissions';
    public $primary_key = 'class_permissions.id';
    
    public function default_select() {
        $this->db->select('class_permissions.id')
            ->select('abilities.name AS `ability|name`, abilities.abbr AS `ability|abbr`, abilities.description AS `ability|description`');
    }
    
    public function default_join() {
        $this->db->join('abilities', 'abilities.id = class_permissions.ability_id');
    }
    
    public function by_classes($classes = NULL) {
        if($classes === NULL || empty($classes)) {
            $this->filter_where('class_permissions.class IS NULL');
        } else {
            // Include OR IS NULL because anyone logged in / with a class should inherit the permissions that guests have
            $this->filter_where_in('class_permissions.class', $classes);
            $this->filter_or_where('class_permissions.class IS NULL');
        }
        return $this;
    }
}