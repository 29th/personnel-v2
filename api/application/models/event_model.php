<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Event_model extends CRUD_Model {
    public $table = 'events';
    public $primary_key = 'events.id';
    
    public function validation_rules_add() {
        return array(
            array(
                'field' => 'datetime'
                ,'rules' => 'required'
            )
            ,array(
                'field' => 'unit_id'
                ,'rules' => 'required|numeric'
            )
            ,array(
                'field' => 'type'
                ,'rules' => 'required|max_length[32]'
            )
            ,array(
                'field' => 'mandatory'
                ,'rules' => 'numeric|greater_than[-1]|less_than[2]'
            )
            ,array(
                'field' => 'server_id'
                ,'rules' => 'required|numeric'
            )
        );
    }
    
    public function validation_rules_edit() {
        return array(
            /*array(
                'field' => 'datetime'
                ,'rules' => ''
            )*/
            array(
                'field' => 'title'
                ,'rules' => 'min_length[1]||max_length[64]'
            )
            ,array(
                'field' => 'type'
                ,'rules' => 'min_length[1]||max_length[32]'
            )
            ,array(
                'field' => 'mandatory'
                ,'rules' => 'numeric|greater_than[-1]|less_than[2]'
            )
            ,array(
                'field' => 'server_id'
                ,'rules' => 'numeric'
            )
        );
    }
    
    public function validation_rules_aar() {
        return array(
            array(
                'field' => 'report'
                ,'rules' => 'required'
            )
        );
    }
    
    public function default_select() {
        $this->db->select('events.id, events.datetime, events.type, events.mandatory, events.report, NOW() > events.datetime AS occurred, events.reporter_member_id AS `reporter|id`, report_posting_date, report_edit_date')
            ->select('units.id AS `unit|id`, units.abbr AS `unit|abbr`, units.name AS `unit|name`')
            ->select($this->virtual_fields['unit_key'] . ' AS `unit|key`', FALSE)
            ->select($this->virtual_fields['short_name'] . ' AS `reporter|short_name`', FALSE)
            ->select('events.server_id AS `server|id`, servers.name AS `server|name`, servers.abbr AS `server|abbr`');
    }
    
    public function default_join() {
        $this->db->join('units', 'units.id = events.unit_id', 'left')
            ->join('servers', 'servers.id = events.server_id', 'left')
            ->join('members', 'members.id = events.reporter_member_id', 'left')
            ->join('ranks', 'ranks.id = members.rank_id', 'left');;
    }
    
    public function default_order_by() {
        $this->db->order_by('events.datetime');
    }
    
    public function by_date($start = FALSE, $end = FALSE) {
        if($start !== FALSE && $end !== FALSE) {
            $start = format_date($start, 'mysqldate');
            $end = format_date($end, 'mysqldate');
            $this->filter_where('events.datetime >=', $start)
                ->filter_where('events.datetime <=', $end);
        } else {
            $this->filter_where('MONTH(events.datetime) = MONTH(NOW())')
                ->filter_where('YEAR(events.datetime) = YEAR(NOW())');
        }
        return $this;
    }
}