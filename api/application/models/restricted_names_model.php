<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Restricted_names_model extends MY_Model {
    public $table = 'restricted_names';
    public $primary_key = 'restricted_names.id';
    
    public function validation_rules_add() {
        return array(
            array(
                'field' => 'last_name'
                ,'rules' => 'is_unique[restricted_names.name]'
            )
        );
    }
    
}