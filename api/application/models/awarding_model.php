<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Awarding_model extends CRUD_Model {
    public $table = 'awardings';
    public $primary_key = 'awardings.id';
    
    public function default_select() {
        $this->db->select('awardings.id, awardings.date, awardings.topic_id') // Add awardings.forum_id
            ->select('a.code AS `award|abbr`, a.title AS `award|name`, a.image AS `award|filename`'); // Change code to abbr, title to name, image to filename
    }
    
    public function default_join() {
        $this->db->join('awards as a', 'a.id = awardings.award_id');
    }
    
    public function default_order_by() {
        $this->db->order_by('awardings.date DESC');
    }
}