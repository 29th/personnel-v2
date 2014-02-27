<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Event_model extends CRUD_Model {
    public $table = 'events';
    public $primary_key = 'events.id';
    
    public function default_select() {
        $this->db->select('events.id, events.datetime, events.type, events.mandatory, events.report, NOW() > events.datetime AS occurred')
            ->select('units.id AS `unit|id`, units.abbr AS `unit|abbr`, units.name AS `unit|name`')
            ->select($this->virtual_fields['unit_key'] . ' AS `unit|key`', FALSE)
            ->select('events.server_id AS `server|id`, servers.name AS `server|name`, servers.abbr AS `server|abbr`');
    }
    
    public function default_join() {
        $this->db->join('units', 'units.id = events.unit_id', 'left')
            ->join('servers', 'servers.id = events.server_id', 'left');
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