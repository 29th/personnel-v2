<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Units extends MY_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->model('unit_model');
        $this->load->model('assignment_model');
        //$this->load->model('permission_model');
        $this->load->model('attendance_model');
        $this->load->library('form_validation');
    }
    
    /**
     * Get a particular unit or list of units
     */
    public function view_get($filter = FALSE) {
        $key = 'units'; // for api output
        
        // Get units, using ?children=true
        $units = $this->unit_model->by_filter($filter, $this->input->get('children') == 'true' ? TRUE : FALSE)->get()->result_array();
        
        // If results found
        if( ! empty($units)) {
            // Get unit members if ?members=true
            if($this->input->get('members') == 'true') {
                $members = nest($this->assignment_model->by_unit($units[0]['id'], $this->input->get("children") ? TRUE : FALSE)->by_date('now')->get()->result_array()); // Get members of this unit, including members of this unit's children, who are current
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
    
    /**
     * Only works on UPDATE at the moment
     */
    public function view_post($filter) {
        // Get unit_id
        if(is_numeric($filter)) $unit_id = $filter;
        else {
            $unit = $this->unit_model->by_filter($filter)->get()->row_array();
            $unit_id = $unit['id'];
        }
        
        if( ! $this->user->permission('unit_edit', NULL, $unit_id) && ! $this->user->permission('unit_edit_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        else if($this->form_validation->run('unit_edit') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->form_validation->get_error_array()), 400);
        } else {
            $insert_id = $this->unit_model->save($unit_id, $this->post()); // Can FALSE suffice for NULL?
            $this->response(array('status' => true, 'unit' => $insert_id ? nest($this->unit_model->get_by_id($insert_id)) : null));
        }
    }
    
    /*public function permissions_get($unit_id) {
        $access_level = is_numeric($this->input->get('access_level')) ? $this->input->get('access_level') : FALSE;
        $this->response(array('status' => true, 'permissions' => $this->unit_permission_model->by_unit($unit_id, $access_level)));
    }
    
    public function permissions_post($unit_id) {
        $data = $this->post();
        $data['unit_id'] = $unit_id;
        $status = $this->permission_model->save('permissions', $data);
        $new_record = $status ? $this->permission_model->get($this->permission_model->get_insert_id()) : null;
        $this->response(array('status' => $status, 'permission' => $new_record));
    }*/
    
    public function attendance_get($filter) {
        if(is_numeric($filter)) $unit_id = $filter;
        else {
            $unit = $this->unit_model->by_filter($filter)->get()->row_array();
            $unit_id = $unit['id'];
        }
    
        $skip = $this->input->get('skip') ? $this->input->get('skip') : 0;
        $attendance = nest($this->attendance_model->by_unit($unit_id)->paginate('', $skip)->result_array());
        $count = $this->attendance_model->total_rows;
        $this->response(array('status' => true, 'count' => $count, 'skip' => $skip, 'attendance' => $attendance));
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