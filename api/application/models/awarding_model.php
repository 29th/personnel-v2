<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Awarding_model extends MY_Model {
    public $table = 'awardings';
    public $primary_key = 'awardings.id';
    
    public function validation_rules_add() {
        return array(
            array(
                'field' => 'member_id'
                ,'rules' => 'required|numeric'
            )
            ,array(
                'field' => 'date'
                ,'rules' => 'required'
            )
            ,array(
                'field' => 'award_id'
                ,'rules' => 'required|numeric'
            )
            ,array(
                'field' => 'topic_id'
                ,'rules' => 'numeric'
            )
        );
    }
    
    public function validation_rules_edit() {
        return array(
            array(
                'field' => 'member_id'
                ,'rules' => 'numeric'
            )
            /*,array(
                'field' => 'date'
                ,'rules' => ''
            )*/
            ,array(
                'field' => 'award_id'
                ,'rules' => 'numeric'
            )
            ,array(
                'field' => 'topic_id'
                ,'rules' => 'numeric'
            )
        );
    }
    
    public function default_select() {
        $this->db->select('SQL_CALC_FOUND_ROWS awardings.id, awardings.date, awardings.forum_id, awardings.topic_id', FALSE)
            ->select('a.code AS `award|abbr`, a.title AS `award|name`, a.image AS `award|filename`, a.game AS `award|game`, a.bar AS `award|bar`'); // Change code to abbr, title to name, image to filename
    }
    
    public function default_join() {
        $this->db->join('awards as a', 'a.id = awardings.award_id');
    }
    
    public function default_order_by() {
        $this->db->order_by('awardings.date DESC');
    }
    
    public function only_badges() {
        $this->db->where("a.game <> 'N/A'");
    }
}