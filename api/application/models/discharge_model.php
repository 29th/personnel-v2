<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Discharge_model extends CRUD_Model {
    public $table = 'discharges';
    public $primary_key = 'discharges.id';
    
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
                'field' => 'type'
                ,'rules' => 'required'
            )
            ,array(
                'field' => 'reason'
                ,'rules' => 'required'
            )
            ,array(
                'field' => 'reason'
                ,'rules' => 'required'
            )
            ,array(
                'field' => 'was_reversed'
                ,'rules' => 'numeric|greater_than[-1]|less_than[2]'
            )
            ,array(
                'field' => 'forum_id'
                ,'rules' => 'numeric'
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
            /*,array(
                'field' => 'type'
                ,'rules' => ''
            )*/
            /*,array(
                'field' => 'reason'
                ,'rules' => ''
            )*/
            /*,array(
                'field' => 'reason'
                ,'rules' => ''
            )*/
            ,array(
                'field' => 'was_reversed'
                ,'rules' => 'numeric|greater_than[-1]|less_than[2]'
            )
            ,array(
                'field' => 'forum_id'
                ,'rules' => 'numeric'
            )
            ,array(
                'field' => 'topic_id'
                ,'rules' => 'numeric'
            )
        );
    }
    
    public function default_select() {
        $this->db->select('SQL_CALC_FOUND_ROWS discharges.*, members.id AS `member|id`', FALSE)
            ->select($this->virtual_fields['short_name'] . ' AS `member|short_name`', FALSE);
    }
    
    public function default_join() {
        $this->db->join('members', 'members.id = discharges.member_id')
            ->join('ranks', 'ranks.id = members.rank_id');
    }
    
    public function default_order_by() {
        $this->db->order_by('discharges.date DESC');
    }
}