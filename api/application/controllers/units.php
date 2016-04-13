<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Units extends MY_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->model('unit_model');
        $this->load->model('assignment_model');
        //$this->load->model('permission_model');
    }
    
    /*
     * PRE-FLIGHT
     */
    public function index_options() { $this->response(array('status' => true)); }
    public function view_options() { $this->response(array('status' => true)); }
	
	/*
	  INDEX
	  Just passes to view_get() to consolidate similar functionality
	 */
	public function index_get($filter = FALSE) {
		$this->view_get($filter);
	}
    
    /*
	 * VIEW
     * Get a particular unit or list of units
     * &children=(true|false)   Include child units
     * &inactive=(true|false)     Include inactive units
     * &order=(priority|position) Order by
     * &historic=(true|false)   All members ever assigned, not just currently assigned ones
     */
    public function view_get($filter = FALSE) {
		// Must have permission to view any member's profile
		if( ! $this->user->permission('profile_view_any')) {
			$this->response(array('status' => false, 'error' => 'Permission denied'), 403);
		}
		// View record(s)
		else {
			$key = 'units'; // for api output
			
			// Get units, using ?children=true and inactive=true
			$units = $this->unit_model->by_filter($filter, $this->input->get('children') == 'true' ? TRUE : FALSE, $this->input->get('inactive') == 'true' ? TRUE : FALSE)
				->get()->result_array();
			
			// If results found
			if( ! empty($units)) 
			{
				// Get unit members if ?members=true
				if($this->input->get('members') == 'true') {
					$members = $this->assignment_model->by_unit($units[0]['id'], $this->input->get("children") ? TRUE : FALSE);
					if( $this->input->get("onDate") )
						$members = $members->by_date( $this->input->get("onDate") );
					elseif( ! $this->input->get('historic')) 
						$members = $members->by_date('now');
					
					if($this->input->get('distinct'))
						$members = $members->distinct_members();
					if($this->input->get('position'))
						$members = $members->by_position( $this->input->get('position') );
					$members = $members->order_by($this->input->get('order') ? $this->input->get('order') : ( $units[0]['class'] == 'Training' ? 'name'  : 'rank' ) );
					$members = nest($members->get()->result_array()); // Get members of this unit, including members of this unit's children, who are current
					$units = $this->members_in_parents($members, $units, 'unit_id', 'id', 'members', $this->input->get("flat") ? TRUE : FALSE);
					
					// Calculate number of unique members
					//$unique_members = (array_unique(pluck('id', pluck('member', $members))));
				}
				
				// If we got children, shuffle them
				if($this->input->get('children') == 'true') {
					// Shuffle into hierarchy
					$parent_id = $units[0]['parent_id'];
					$units = $this->sort_hierarchy($units, $parent_id);
				}
					
				// Give back an object instead of an array of objects if we filtered
				if($filter !== FALSE) {
					$key = 'unit';
					$units = $units[0];
					$units['breadcrumbs'] = $this->addUnitsBreadCrumbs($units['path'] . '/' . $units['id']);
				}
					
			}
			$this->response(array('status' => true, $key => $units));
		}
    }
	
	public function addUnitsBreadCrumbs( $unitPath = FALSE ) {
		if (!$unitPath || strlen( $unitPath ) <= 3 ) return array();
		$tempTab = explode( ' ', trim(str_replace( '/', ' ', substr( $unitPath , 2 ) )));
		$retTab = array();
		foreach( $tempTab as $key => $rec ) 
		{
			$tempTab[$key] = $this->db->query("SELECT `abbr`,`name` FROM `units` WHERE id =" . $tempTab[$key] )->result_array();
			$retTab[] = array( 'id' => str_replace(array('Co. HQ',' HQ'), array('',''), $tempTab[$key][0]['abbr']), 'name' => str_replace(', ', '', substr( $tempTab[$key][0]['name'], strrpos( $tempTab[$key][0]['name'], ', ' ) ) ) );
		}
		return $retTab;
	}

	/*
	 * CREATE
	 */
	
	public function index_post() {
		$path = preg_split('@/@', $this->post('path'), NULL, PREG_SPLIT_NO_EMPTY); // use preg_split to ignore empties
		$parent_unit_id = $path[sizeof($path)-1];
		
        // Must have permission to create a unit within this unit or within any unit
        if( ! $this->user->permission('unit_add', array('unit' => $parent_unit_id)) && ! $this->user->permission('unit_add_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
		// Form validation
		else if($this->unit_model->run_validation('validation_rules_add') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->unit_model->validation_errors), 400);
        }
		// Create record
		else {
		    $this->usertracking->track_this();
			$data = whitelist($this->post(), array('name', 'abbr', 'path', 'order', 'timezone', 'class', 'active'));
			$insert_id = $this->unit_model->save(NULL, $data);
			$this->response(array('status' => $insert_id ? true : false, 'unit' => $insert_id ? $this->unit_model->get_by_id($insert_id) : null));
		}
	}
    
    /**
     * UPDATE
     */
	public function view_post($filter) {
		$path = preg_split('@/@', $this->post('path'), NULL, PREG_SPLIT_NO_EMPTY); // use preg_split to ignore empties
		$parent_unit_id = $path[sizeof($path)-1];
		
		// Get unit ID
		if(is_numeric($filter)) {
		    $unit_id = $filter;
		}
		else {
		    $unit = $this->unit_model->by_filter($filter)->get()->row_array();
		    $unit_id = isset($unit['id']) ? $unit['id'] : NULL;
		}
        
		// Must have permission to create a unit within this unit and within the proposed unit or within any unit
		if(( ! $this->user->permission('unit_add', array('unit' => $unit_id)) || ! $this->user->permission('unit_add', array('unit' => $parent_unit_id))) && ! $this->user->permission('unit_add_any')) {
			$this->response(array('status' => false, 'error' => 'Permission denied'), 403);
		}
		// Form validation
		else if($this->unit_model->run_validation('validation_rules_edit') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->unit_model->validation_errors), 400);
        }
		// Update record
		else {
		    $this->usertracking->track_this();
			$data = whitelist($this->post(), array('name', 'abbr', 'path', 'order', 'timezone', 'class', 'active'));
			$result = $this->unit_model->save($unit_id, $data);
			$this->response(array('status' => $result ? true : false, 'unit' => $this->unit_model->get_by_id($unit_id)));
		}
	}
    
	/**
	 * DELETE
	 */
    public function view_delete($filter) {
		// Get unit ID
		if(is_numeric($filter)) {
		    $unit_id = $filter;
		}
		else {
		    $unit = $this->unit_model->by_filter($filter)->get()->row_array();
		    $unit_id = isset($unit['id']) ? $unit['id'] : NULL;
		}
		// Must have permission to delete this type of record for this member or for any member
		if( ! $this->user->permission('unit_delete', array('unit' => $unit_id)) && ! $this->user->permission('unit_delete_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
		// Delete record
		else {
		    $this->usertracking->track_this();
            $this->unit_model->delete($unit_id);            
            $this->response(array('status' => true));
        }
    }
    
	/**
	 * UNIT ATTENDANCE
	 */
    public function attendance_get($filter) {
        $this->load->model('attendance_model');
        
		// Get unit ID
		if(is_numeric($filter)) {
		    $unit_id = $filter;
		}
		else {
		    $unit = $this->unit_model->by_filter($filter)->get()->row_array();
		    $unit_id = isset($unit['id']) ? $unit['id'] : NULL;
		}
        
		// Must have permission to view this type of record for this member or for any member
		if( ! $this->user->permission('unit_stats', array('unit' => $unit_id)) && ! $this->user->permission('unit_stats_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
		// View records
		else {
			$skip = $this->input->get('skip') ? $this->input->get('skip') : 0;
			$attendance = nest($this->attendance_model->by_unit($unit_id)->paginate('', $skip)->result_array());
			$count = $this->attendance_model->total_rows;
			$this->response(array('status' => true, 'count' => $count, 'skip' => $skip, 'attendance' => $attendance));
		}
    }
    
	/**
	 * UNIT STATS
	 */
    public function stats_get($filter) {
        $this->load->model('attendance_model');
		// Get unit ID
		if(is_numeric($filter)) {
		    $unit_id = $filter;
		}
		else {
		    $unit = $this->unit_model->by_filter($filter)->get()->row_array();
		    $unit_id = isset($unit['id']) ? $unit['id'] : NULL;
		}
        
		// Must have permission to view this type of record for this member or for any member
		if( false && !$this->user->permission('unit_stats', array('unit' => $unit_id)) && ! $this->user->permission('unit_stats_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
		// View records
		else {
			$cSql = 
			"(SELECT m.id AS `member|id`, r.abbr AS `member|rank`, m.last_name AS `member|last_name`, " .
			"u.id AS `unit|id`, u.abbr AS `unit|abbr`, u.name AS `unit|name`, u.path AS `unit|path`, u.order AS `unit|order`, u.class AS `unit|class`, " .
			"(SELECT Round( ( SUM(attended) / COUNT(1) )*100 ) FROM attendance AS a LEFT JOIN events AS e ON a.event_id = e.id WHERE a.member_id = m.id AND e.mandatory = 1 AND DATEDIFF( NOW( ) , e.datetime ) <30 ) as `percentage|d30`, " .
			"(SELECT Round( ( SUM(attended) / COUNT(1) )*100 ) FROM attendance AS a LEFT JOIN events AS e ON a.event_id = e.id WHERE a.member_id = m.id AND e.mandatory = 1 AND DATEDIFF( NOW( ) , e.datetime ) <60 ) as `percentage|d60`, " .
			"(SELECT Round( ( SUM(attended) / COUNT(1) )*100 ) FROM attendance AS a LEFT JOIN events AS e ON a.event_id = e.id WHERE a.member_id = m.id AND e.mandatory = 1 AND DATEDIFF( NOW( ) , e.datetime ) <90 ) as `percentage|d90`, " .
			"(SELECT Round( ( SUM(attended) / COUNT(1) )*100 ) FROM attendance AS a LEFT JOIN events AS e ON a.event_id = e.id WHERE a.member_id = m.id AND e.mandatory = 1 ) as `percentage|dall` " .
			"FROM members AS m " .
			"LEFT JOIN assignments AS a ON m.id = a.member_id " .
			"LEFT JOIN positions AS p ON a.position_id = p.id " .
			"LEFT JOIN ranks AS r ON m.rank_id = r.id " .
			"LEFT JOIN units AS u ON a.unit_id = u.id " .
			"WHERE a.end_date IS NULL AND a.unit_id IN (SELECT id FROM units AS u WHERE u.active=1 AND (u.id = $unit_id OR u.path LIKE '%/$unit_id/%') ) ".
			"ORDER BY u.class, u.name, p.order DESC, m.rank_id DESC, m.last_name ) as aaa ";
			
			$stats1 = nest( $this->db->get($cSql)->result_array() );
			$stats = array();
			foreach ( $stats1 as $val  ) {
				$stats[$val['unit']['abbr']][] = $val; 
			}
//			ksort($stats);
			$this->response(array('status' => true, 'stats' => $stats ));
		}
    }
    
    /**
     * UNIT DISCHARGES
     */
    
    public function discharges_get($filter) {
        $this->load->model('discharge_model');
        
		// Get unit ID
		if(is_numeric($filter)) {
		    $unit_id = $filter;
		}
		else {
		    $unit = $this->unit_model->by_filter($filter)->get()->row_array();
		    $unit_id = isset($unit['id']) ? $unit['id'] : NULL;
		}
        
		// Must have permission to view this type of record for this member or for any member
		if( ! $this->user->permission('unit_stats', array('unit' => $unit_id)) && ! $this->user->permission('unit_stats_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
		// View records
        else {
			$skip = $this->input->get('skip') ? $this->input->get('skip') : 0;
			$discharges = nest($this->discharge_model->by_unit($unit_id)->paginate('', $skip)->result_array());
			$count = $this->discharges->total_rows;
			$this->response(array('status' => true, 'count' => $count, 'skip' => $skip, 'discharges' => $discharges));
        }
    }
    
    /**
     * AWOLs
     * TODO: Add day param
     */
    public function awols_get($filter) {
        $this->load->model('attendance_model');
        $days = $this->input->get('days') ? (int) $this->input->get('days') : 30;
        
		// Get unit ID
		if(is_numeric($filter)) {
		    $unit_id = $filter;
		}
		else {
		    $unit = $this->unit_model->by_filter($filter)->get()->row_array();
		    $unit_id = isset($unit['id']) ? $unit['id'] : NULL;
		}
        
		// Must have permission to view this type of record for this member or for any member
		if( ! $this->user->permission('unit_stats', array('unit' => $unit_id)) && ! $this->user->permission('unit_stats_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
		// View records
		else 
		{
			$members = pluck('member|id', $this->assignment_model->by_date('now')->by_unit($unit_id, TRUE)->get()->result_array()); // Include children
			$awols = nest($this->attendance_model->awols($members, $days, true)->get()->result_array());
			$grouped_and_sorted = $this->sort_awols($this->group_awols($awols));
			$this->response(array('status' => true, 'awols' => $grouped_and_sorted));
		}
    }
    /**
     * Helper Function
     * Put each member into parent's members array according to a key
     */
    private function members_in_parents($members, $parents, $member_key, $parent_key, $array_name, $is_flat) {
        // Ensure each parent has a members array (for api happiness)
        foreach($parents as &$parent) $parent[$array_name] = array();
        
        // Put each member in the appropriate parent
        foreach($members as $member) {
            foreach($parents as &$parent) {
                if($parent[$parent_key] == $member[$member_key]) {
                    unset($member[$member_key]); // Redundant
                    iF ( $is_flat )
                      array_push($parents[0], $member);
                    else
                      array_push($parent[$array_name], $member);
                    break;
                }
            }
        }
        return $parents;
    }
    
    /**
     * Helper Function
     * Shuffle array into hierarchy based on parent_id
     * When initially called, the $parent_id field should be the parent_id of the top-level item, typically null or 0
     */
    private function sort_hierarchy($input, $parent_id, $output = array()) {
        $output = array();
        foreach($input as $key => $item) {
            if($item['id'] === $parent_id || $item['parent_id'] === $parent_id) {
                unset($input[$key]);
                $item['children'] = $this->sort_hierarchy($input, $item['id'], $output);
                $output[] = $item;
                if($item['id'] === $parent_id) break;
            }
        }
        return $output;
    }
    
    private function group_awols($awols) {
        $grouped = array();
        foreach($awols as $awol) {
            if( ! isset($grouped[$awol['member']['id']]))
            	$grouped[$awol['member']['id']] = array('member' => $awol['member'], 'dates' => array());
            if( ! isset($grouped[$awol['member']['id']]['dates'][$awol['event']['date']]))
            	$grouped[$awol['member']['id']]['dates'][$awol['event']['date']] = array('date' => $awol['event']['date'], 'events' => array());
            array_push($grouped[$awol['member']['id']]['dates'][$awol['event']['date']]['events'], $awol['event']);
        }
        foreach ( $grouped as $gKey => $gArr )
           $grouped[$gKey]['dates'] = array_values($gArr['dates']) ;
         
        return array_values($grouped);
    }
    
    private function sort_awols($awols) {
        usort($awols, function($a, $b) {
            $countA = count($a['dates']);
            $countB = count($b['dates']);
            return ($countA === $countB ? 0 : ($countA < $countB ? 1 : -1));
        });
        return $awols;
    }
}