<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Units extends MY_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->model('unit_model');
        $this->load->model('assignment_model');
        //$this->load->model('permission_model');
        $this->load->model('attendance_model');
    }
    
    /**
     * PRE-FLIGHT
     */
    public function index_options() { $this->response(array('status' => true)); }
    public function view_options() { $this->response(array('status' => true)); }
	
	/**
	 * INDEX
	 * Just passes to view_get() to consolidate similar functionality
	 */
	public function index_get($filter = FALSE) {
		$this->view_get($filter);
	}
    
    /**
	 * VIEW
     * Get a particular unit or list of units
     * &children=(true|false)   Include child units
     * &active=(true|false)     Only include active units
     * &order=(priority|position) Order by
     * &historic=(true|false)   All members ever assigned, not just currently assigned ones
     */
    public function view_get($filter = FALSE) {
		// Must have permission to view any member's profile
		if( ! $this->user->permission('profile_view_any') {
			$this->response(array('status' => false, 'error' => 'Permission denied'), 403);
		}
		// View record(s)
		else {
			$key = 'units'; // for api output
			
			// Get units, using ?children=true
			$units = $this->unit_model->by_filter($filter, $this->input->get('children') == 'true' ? TRUE : FALSE);
			if($this->input->get('active')) $units = $units->where('units.active', TRUE);
			$units = $units->get()->result_array();
			
			// If results found
			if( ! empty($units)) {
				// Get unit members if ?members=true
				if($this->input->get('members') == 'true') {
					$members = $this->assignment_model->by_unit($units[0]['id'], $this->input->get("children") ? TRUE : FALSE);
					if( ! $this->input->get('historic')) $members = $members->by_date('now');
					$members = $members->order_by($this->input->get('order') ? $this->input->get('order') : 'rank');
					$members = nest($members->get()->result_array()); // Get members of this unit, including members of this unit's children, who are current
					$units = $this->members_in_parents($members, $units, 'unit_id', 'id', 'members');
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
				}
			}
			
			$this->response(array('status' => true, $key => $units));
		}
    }
	
	/**
	 * CREATE
	 */
	public function index_post() {
		$path = preg_split('@/@', $this->post('path'), NULL, PREG_SPLIT_NO_EMPTY); // use preg_split to ignore empties
		$parent_unit_id = $path[sizeof($path)-1];
		
        // Must have permission to create a unit within this unit or within any unit
        if( ! $this->user->permission('unit_add', null, $parent_unit_id) && ! $this->user->permission('unit_add_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
		// Form validation
		else if($this->unit_model->run_validation('validation_rules_add') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->unit_model->validation_errors), 400);
        }
		// Create record
		else {
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
		
		// Fetch record
        if( ! ($unit = $this->unit_model->by_filter($filter)->get()->row_array())) {
            $this->response(array('status' => false, 'error' => 'Record not found'), 404);
        }
		// Must have permission to create a unit within this unit and within the proposed unit or within any unit
		if(( ! $this->user->permission('unit_add', null, $unit['id']) || ! $this->user->permission('unit_add', null, $parent_unit_id)) && ! $this->user->permission('unit_add_any')) {
			$this->response(array('status' => false, 'error' => 'Permission denied'), 403);
		}
		// Form validation
		else if($this->unit_model->run_validation('validation_rules_edit') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->unit_model->validation_errors), 400);
        }
		// Update record
		else {
			$data = whitelist($this->post(), array('name', 'abbr', 'path', 'order', 'timezone', 'class', 'active'));
			$result = $this->unit_model->save($unit_id, $data);
			$this->response(array('status' => $result ? true : false, 'unit' => $this->unit_model->get_by_id($unit['id'])));
		}
	}
    
	/**
	 * DELETE
	 */
    public function view_delete($filter) {
		// Fetch record
        if( ! ($unit = $this->unit_model->by_filter($filter)->get()->row_array())) {
            $this->response(array('status' => false, 'error' => 'Record not found'), 404);
        }
		// Must have permission to delete this type of record for this member or for any member
		else if( ! $this->user->permission('unit_delete', null, $unit['id']) && ! $this->user->permission('unit_delete_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
		// Delete record
		else {
            $this->unit_model->delete($unit['id']);            
            $this->response(array('status' => true));
        }
    }
    
	/**
	 * UNIT ATTENDANCE
	 */
    public function attendance_get($filter) {
		// Fetch record
        if( ! ($unit = $this->unit_model->by_filter($filter)->get()->row_array())) {
            $this->response(array('status' => false, 'error' => 'Record not found'), 404);
        }
		// Must have permission to view this type of record for this member or for any member
		else if( ! $this->user->permission('unit_attendance', null, $unit['id']) && ! $this->user->permission('unit_attendance_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
		// View records
		else {    
			$skip = $this->input->get('skip') ? $this->input->get('skip') : 0;
			$attendance = nest($this->attendance_model->by_unit($unit['id'])->paginate('', $skip)->result_array());
			$count = $this->attendance_model->total_rows;
			$this->response(array('status' => true, 'count' => $count, 'skip' => $skip, 'attendance' => $attendance));
		}
    }
    
    /**
     * Helper Function
     * Put each member into parent's members array according to a key
     */
    private function members_in_parents($members, $parents, $member_key, $parent_key, $array_name) {
        // Ensure each parent has a members array (for api happiness)
        foreach($parents as &$parent) $parent[$array_name] = array();
        
        // Put each member in the appropriate parent
        foreach($members as $member) {
            foreach($parents as &$parent) {
                if($parent[$parent_key] == $member[$member_key]) {
                    unset($member[$member_key]); // Redundant
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
}