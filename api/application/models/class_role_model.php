<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Class_Role_model extends MY_Model {
    public $table = 'class_roles';
    public $primary_key = 'class_roles.id';
    
    public function by_classes($classes = NULL) {
        if($classes === NULL || empty($classes)) {
            $this->filter_where('class_roles.class IS NULL');
        } else {
            // Include OR IS NULL because anyone logged in / with a class should inherit the permissions that guests have
            $this->filter_where_in('class_roles.class', $classes);
            $this->filter_or_where('class_roles.class IS NULL');
        }
        return $this;
    }
}
