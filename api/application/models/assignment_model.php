<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/*class Assignment_modelX extends MY_Model {
    
    public function get_by_unit($unit_id, $children = FALSE, $date = FALSE) {
        $this->db->select('assignments.member_id AS id, positions.name AS `position|name`, ranks.filename AS `rank|filename`')
            ->select($this->virtual_fields['short_name'] . ' AS short_name', FALSE)
            ->from('assignments')
            ->join('members', 'members.id = assignments.member_id')
            ->join('positions', 'positions.id = assignments.position_id')
            ->join('ranks', 'ranks.id = members.rank_id');
            
        // If seeking members of child units, look for $unit_id in path or id
        if($children !== FALSE) {
            $this->db->select('assignments.unit_id');
            $this->db->join('units', 'units.id = assignments.unit_id');
            $this->db->where('assignments.unit_id = ' . $unit_id . ' OR units.path LIKE "%/' . $unit_id . '/%"');
        }
        // Otherwise, just get members by in the specific unit
        else {
            $this->db->where('assignments.unit_id', $unit_id);
        }
        
        // If date provided, narrow results to members from that date
        if($date !== FALSE) {
            $date = format_date($date, 'mysqldate'); // Format date string for MySQL
            $this->db->where('(assignments.start_date <= "' . $date . '" OR assignments.start_date IS NULL)');
            $this->db->where('(assignments.end_date > "' . $date . '" OR assignments.end_date IS NULL)');
        }
        
        $this->db->order_by('ranks.order DESC');
        $query = $this->db->get();
        return nest($query->result_array());
    }
    
    public function get($assignment_id) {
        $this->db->select('assignments.id, assignments.start_date, assignments.end_date, assignments.unit_id AS `unit|id`, assignments.access_level')
            ->select('units.abbr AS `unit|abbr`, units.name AS `unit|name`, ' . $this->virtual_fields['unit_key'] . ' AS `unit|key`, units.path AS `unit|path`', FALSE)
            ->from('assignments')
            ->join('units', 'units.id = assignments.unit_id')
            ->where('assignments.id', $assignment_id);
        $query = $this->db->get();
        return nest($query->row_array());
    }
    
    public function get_by_member($member_id, $date = FALSE) {
        $this->db->select('assignments.id, assignments.start_date, assignments.end_date, assignments.unit_id AS `unit|id`, assignments.access_level')
            ->select('units.abbr AS `unit|abbr`, units.name AS `unit|name`, ' . $this->virtual_fields['unit_key'] . ' AS `unit|key`, units.path AS `unit|path`', FALSE)
            ->from('assignments')
            ->join('units', 'units.id = assignments.unit_id')
            ->where('assignments.member_id', $member_id);
        
        // If date provided, narrow results to members from that date
        if($date !== FALSE) {
            $date = format_date($date, 'mysqldate'); // Format date string for MySQL
            $this->db->where('(assignments.start_date <= "' . $date . '" OR assignments.start_date IS NULL)');
            $this->db->where('(assignments.end_date > "' . $date . '" OR assignments.end_date IS NULL)');
        }
        
        $this->db->order_by('assignments.start_date DESC');
        $query = $this->db->get();
        return nest($query->result_array());
    }
    
    public function delete($assignment_id, $member_id) {
        $this->db->from('assignments')
            ->where('assignments.id', $assignment_id);
        if($member_id !== FALSE) $this->db->where('assignments.member_id', $member_id);
        return $this->db->delete();
    }
}*/

class Assignment_model extends CRUD_Model {
    public $table = 'assignments';
    public $primary_key = 'assignments.id';
    
    public function validation_rules_add() {
        return array(
            array(
                'field' => 'member_id'
                ,'rules' => 'required|numeric'
            )
            ,array(
                'field' => 'unit_id'
                ,'rules' => 'required|numeric'
            )
            ,array(
                'field' => 'position_id'
                ,'rules' => 'required|numeric'
            )
            ,array(
                'field' => 'access_level'
                ,'rules' => 'numeric|greater_than[-1]|less_than[2]'
            )
        );
    }
    
    public function validation_rules_edit() {
        return array(
            array(
                'field' => 'member_id'
                ,'rules' => 'numeric'
            )
            ,array(
                'field' => 'unit_id'
                ,'rules' => 'numeric'
            )
            ,array(
                'field' => 'position_id'
                ,'rules' => 'numeric'
            )
            ,array(
                'field' => 'access_level'
                ,'rules' => 'numeric|greater_than[-1]|less_than[2]'
            )
        );
    }
    
    public function db_array() {
        $db_array = parent::db_array();
        
        // Clean dates or set them to NULL if they're empty
        if(isset($db_array['start_date'])) {
            $db_array['start_date'] = $db_array['start_date'] ? format_date($db_array['start_date'], 'mysqldate') : NULL;
        }
        
        if(isset($db_array['end_date'])) {
            $db_array['end_date'] = $db_array['end_date'] ? format_date($db_array['end_date'], 'mysqldate') : NULL;
        }
        
        return $db_array;
    }
    
    public function default_select() {
        $this->db->select('assignments.id, assignments.start_date, assignments.end_date, assignments.unit_id, assignments.access_level') // Leave `unit_id` for tree sorting
            ->select('units.id AS `unit|id`, units.abbr AS `unit|abbr`, units.name AS `unit|name`, ' . $this->virtual_fields['unit_key'] . ' AS `unit|key`, units.class AS `unit|class`, units.path AS `unit|path`, ' . $this->virtual_fields['depth'] . ' AS `unit|depth`', FALSE)
            ->select('positions.id AS `position|id`, positions.name AS `position|name`, positions.order AS `position|order`');
    }
    
    public function default_join() {
        $this->db->join('units', 'units.id = assignments.unit_id', 'left')
            ->join('positions', 'positions.id = assignments.position_id', 'left');
    }
    
    public function default_order_by() {
        //$this->db->order_by('assignments.start_date DESC'); // TODO: Temporarily commenting this out...need to have it added via a function since it messes up the roster
    }
    
    /**
     * Optionally provide date string (ie. 'now') to get members active at a particular time
     */
    public function by_date($date = 'now') {
        $date = format_date($date, 'mysqldate'); // Format date string for MySQL
        $this->filter_where('(assignments.start_date <= "' . $date . '")');
        $this->filter_where('(assignments.end_date > "' . $date . '" OR assignments.end_date IS NULL)');
        return $this;
    }
    
    /**
     * Get members by unit id
     */
    public function by_unit($unit_id, $children = FALSE) {
        $this->filter_select('assignments.member_id AS id, positions.name AS `position|name`, ranks.name AS `rank|name`, ranks.abbr AS `rank|abbr`, ranks.filename AS `rank|filename`');
        $this->filter_select($this->virtual_fields['short_name'] . ' AS short_name', FALSE);
        $this->filter_select('countries.abbr AS `country|abbr`, countries.name AS `country|name`');
        $this->filter_join('members', 'members.id = assignments.member_id');
        $this->filter_join('ranks', 'ranks.id = members.rank_id');
        $this->filter_join('countries', 'countries.id = members.country_id');
        
        // If seeking members of child units, look for $unit_id in path or id
        if($children !== FALSE) {
            $this->filter_where('(assignments.unit_id = ' . $unit_id . ' OR units.path LIKE "%/' . $unit_id . '/%")');
        } else {
            $this->filter_where('assignments.unit_id', $unit_id);
        }
        
        //$this->filter_order_by('ranks.order DESC');
        
        return $this;
    }
    
    public function select_member() {
        $this->filter_select('assignments.member_id AS `member|id`');
        $this->filter_select($this->virtual_fields['short_name'] . ' AS `member|short_name`', FALSE);
        $this->filter_join('members', 'members.id = assignments.member_id');
        $this->filter_join('ranks', 'ranks.id = members.rank_id');
        return $this;
    }
    
    public function order_by($by = FALSE) {
        switch($by) {
            case 'priority':
                $this->filter_order_by('units.class, `unit|depth`, positions.order DESC'); break;
            case 'position':
                $this->filter_order_by('positions.order DESC'); break;
            default:
                $this->filter_order_by('ranks.order DESC'); break;
        }
        return $this;
    }
    
    /*public function order_for_member() {
        $this->filter_order_by('units.class, `unit|depth`, positions.order DESC');
        return $this;
    }*/
    
    public function get_classes($member_id) {
        $this->db->select('units.class')
            ->from('assignments')
            ->join('units', 'units.id = assignments.unit_id')
            ->where('assignments.member_id', $member_id)
            ->where('(assignments.start_date <= CURDATE() OR assignments.start_date IS NULL)')
            ->where('(assignments.end_date > CURDATE() OR assignments.end_date IS NULL)')
            ->group_by('units.class');
        $query = $this->db->get();
        $result = $query->result_array();
        return pluck('class', $result);
    }
    
    public function discharge($member_id, $date = 'now') {
        $date = format_date($date, 'mysqldate'); // Format date string for MySQL
        $this->db->where('assignments.member_id', $member_id)
            ->where('(assignments.end_date IS NULL OR assignments.end_date > "' . $date . '")', NULL, FALSE)
            ->update($this->table, array('assignments.end_date' => $date));
    }
}