<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Discharge_model extends MY_Model {
    public $table = 'discharges';
    public $primary_key = 'discharges.id';
    
    public function validation_rules_add() {
        return array(
            array(
                'field' => 'member_id'
                ,'rules' => 'required|numeric'
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
        $this->db->select('SQL_CALC_FOUND_ROWS discharges.id, discharges.date, discharges.type, discharges.reason, discharges.was_reversed, discharges.forum_id, discharges.topic_id', FALSE);
    }
    
    public function default_join() {
    }
    
    public function default_order_by() {
        $this->db->order_by('discharges.date DESC');
    }

    /*
     * Override to include past members
     * Should match MY_Model's method except filtering by active assignments
     */ 
    public function by_unit($unit_id) {
        $this->filter_join('assignments', 'assignments.member_id = ' . $this->table . '.member_id', 'left');
        $this->filter_join('units', 'units.id = assignments.unit_id');

        if(is_numeric($unit_id)) {
            $this->filter_where('(units.id = ' . $unit_id . ' OR units.path LIKE "%/' . $unit_id . '/%")');
        } elseif($lookup = $this->getByUnitKey($unit_id)) {
            $this->filter_where('(units.id = ' . $lookup['id'] . ' OR (units.path LIKE "%/' . $lookup['id'] . '/%"))');
        }
        $this->filter_group_by($this->primary_key);
        return $this;
    }
}