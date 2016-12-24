<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
if( ! class_exists('CRUD_Model')) {
    require_once(APPPATH.'libraries/CRUD_Model.php');
}

class MY_Model extends CRUD_Model {
    protected $virtual_fields = array(
        'depth' => 'LENGTH(units.`path`) - (LENGTH(REPLACE(units.`path`, "/", "")))',
        'parent_id' => 'NULLIF(SUBSTRING_INDEX(SUBSTRING_INDEX(units.`path`, "/", -2), "/", 1), "")',
        'unit_key' => 'REPLACE(REPLACE(REPLACE(REPLACE(units.`abbr`, " HQ", ""), " Co", ""), ".", ""), " ", "")',
        'short_name' => 'CONCAT(ranks.`abbr`, " ", IF(members.`name_prefix` != "", CONCAT(members.`name_prefix`, ". "), ""), members.`last_name`)',
        'full_name' => 'CONCAT(members.`first_name`, " ", IF(members.`middle_name` != "", CONCAT(LEFT(members.`middle_name`, 1), ". "), ""), members.`last_name`)',
    );
    
    public function select_member($join_type = 'left') {
        $this->filter_select($this->table . '.member_id AS `member|id`');
        $this->filter_select($this->virtual_fields['short_name'] . ' AS `member|short_name`', FALSE);
        $this->filter_join('members', 'members.id = ' . $this->table . '.member_id', $join_type);
        $this->filter_join('ranks', 'ranks.id = members.rank_id', $join_type);
        return $this;
    }

    public function by_member($member_id) {
        $this->filter_where($this->table . '.member_id', $member_id);
        return $this;
    }

    public function by_unit($unit_id) {
        $this->filter_join('assignments', 'assignments.member_id = ' . $this->table . '.member_id');
        $this->filter_join('units', 'units.id = assignments.unit_id');

        if(is_numeric($unit_id)) {
            $this->filter_where('(units.id = ' . $unit_id . ' OR units.path LIKE "%/' . $unit_id . '/%")');
        } elseif($lookup = $this->getByUnitKey($unit_id)) {
            $this->filter_where('(units.id = ' . $lookup['id'] . ' OR (units.path LIKE "%/' . $lookup['id'] . '/%"))');
        }
        $this->filter_where('assignments.end_date IS NULL'); // Only include current members
        $this->filter_group_by($this->primary_key);
        return $this;
    }
    
    public function by_unit2($unit_id, $key = '' ) {
        //better version of by_unit - giving list of member_ids for where clause
        if (!$key)
          $key = $this->primary_key;
        $_where_clause = $key . ' IN (
          SELECT member_id
          FROM  `assignments` 
          LEFT JOIN  `units` ON  `units`.`id` =  `assignments`.`unit_id` 
          WHERE ( `assignments`.`end_date` IS NULL ';


/*        
        $this->filter_join('assignments', 'assignments.member_id = ' . $this->table . '.member_id');
        $this->filter_join('units', 'units.id = assignments.unit_id');
*/
        if(is_numeric($unit_id)) {
            $_where_clause .= ' AND (units.id = ' . $unit_id . ' OR units.path LIKE "%/' . $unit_id . '/%")';
        } elseif($lookup = $this->getByUnitKey($unit_id)) {
            $_where_clause .= ' AND (units.id = ' . $lookup['id'] . ' OR (units.path LIKE "%/' . $lookup['id'] . '/%"))';
        }
/*
        $this->filter_where('assignments.end_date IS NULL'); // Only include current members
*/
        $_where_clause .= ' ) ) ';
        $this->filter_where($_where_clause);
        $this->filter_group_by($this->primary_key);
        return $this;
    }
    
    protected function getByUnitKey($unit_key) {
        $query = $this->db->query("SELECT units.id FROM units WHERE " . $this->virtual_fields['unit_key'] . ' = ' . $this->db->escape($unit_key));
        return $query->row_array();
    }
    
    public function by_date($start = FALSE, $end = FALSE) {
        $date_field = isset($this->date_field) ? $this->date_field : $this->table . '.date';
        if($start) $this->filter_where($date_field . ' >=', format_date($start, 'mysqldate'));
        if($end) $this->filter_where($date_field . ' <=', format_date($end, 'mysqldate'));
        return $this;
    }
}