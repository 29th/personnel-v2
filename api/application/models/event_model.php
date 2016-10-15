<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Event_model extends MY_Model {
    public $table = 'events';
    public $primary_key = 'events.id';
    public $date_field = 'events.datetime';
    
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
        $this->db->select('SQL_CALC_FOUND_ROWS events.id, events.datetime, events.type, events.mandatory, events.report, NOW() > events.datetime AS occurred, events.reporter_member_id AS `reporter|id`, report_posting_date, report_edit_date', FALSE)
            ->select('units.id AS `unit|id`, units.abbr AS `unit|abbr`, units.name AS `unit|name`, units.class AS `unit|class`, units.game AS `unit|game`, units.timezone AS `unit|timezone`')
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
        $this->db->order_by('events.datetime DESC');
    }
    
    /*public function by_date($start = FALSE, $end = FALSE) {
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
    }*/

    public function select_member() {}
    
    public function filter_for_user($unit_ids,$member_id) {
        $this->filter_select('attendance.attended, attendance.excused '); 
        $this->filter_join('attendance','attendance.event_id = events.id AND attendance.member_id = '.$member_id,'left');
        $this->filter_where('events.datetime BETWEEN CURDATE() - INTERVAL 3 DAY AND CURDATE() + INTERVAL 4 DAY');
        $this->filter_where("`units`.`id` IN ($unit_ids)");
        return $this;
    }

    public function by_unit($unit_id) {
        if(is_numeric($unit_id)) {
            $this->filter_where('(units.id = ' . $unit_id . ' OR units.path LIKE "%/' . $unit_id . '/%")');
        } elseif($lookup = $this->getByUnitKey($unit_id)) {
            $this->filter_where('(units.id = ' . $lookup['id'] . ' OR (units.path LIKE "%/' . $lookup['id'] . '/%"))');
        }
        $this->filter_group_by($this->primary_key);
        return $this;
    }

    public function reported($bool) {
        $this->filter_where('events.reporter_member_id IS ' . ($bool ? 'NOT NULL' : 'NULL'));
        return $this;
    }
}