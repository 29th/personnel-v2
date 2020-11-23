<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Special_Role_model extends MY_Model {
    public $table = 'special_roles';
    public $primary_key = 'special_roles.id';

    public function by_forum($forum) {
      return $this->filter_where('special_roles.forum_id', $forum);
    }
    
    public function by_special_attributes($attributes) {
        return $this->filter_where_in('special_roles.special_attribute', $attributes);
    }
}
