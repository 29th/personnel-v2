<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Award_model extends MY_Model {
    public $table = 'awards';
    public $primary_key = 'awards.id';
    
    public function by_game($game) {
        $this->filter_where('game',$game);
        $this->filter_where('active',1);
        $this->order_by('`order` DESC');
    }
}