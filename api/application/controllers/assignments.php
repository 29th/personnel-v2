<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

define('DAY', 60*60*24);

class Assignments extends MY_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->model('assignment_model');
        $this->load->model('discharge_model');
    }
    
    /**
     * PRE-FLIGHT
     */
    public function index_options() { $this->response(array('status' => true)); }
    public function view_options() { $this->response(array('status' => true)); }
    
    /**
     * INDEX
     */
    public function index_get($member_id = FALSE, $unit_id = FALSE ) {
        // Must have permission to view this member's profile or any member's profile
        if( ! $this->user->permission('profile_view', array('member' => $member_id)) && ! $this->user->permission('profile_view_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        elseif ($member_id == 'unit') 
        {
            $model = $this->assignment_model;
            $model->select_member();

            $model->by_unit2($unit_id,'member_id');

            if ( $this->input->get('to') )
              $model->where('start_date <', format_date($this->input->get('to'), 'mysqldate' ) );
            if ( $this->input->get('from') )
              $model->where('start_date >=', format_date($this->input->get('from'), 'mysqldate' ) );
            
            $assignments = nest($model->order_by('priority')->get()->result_array());
            $this->response(array('status' => true, 'assignments' => $assignments, 'unit' => $unit_id ));
        }
/*
        elseif ($this->input->get('current')) {
            $model = $this->assignment_model; 
            $assignments = nest($model->result_array());
            $this->response(array('status' => true, 'assignments' => $assignments ));
        }
*/
        else 
        {
            $duration = $discharge_date = '';
            $model = $this->assignment_model; 
            if( is_numeric($member_id)) {
                $model->where('assignments.member_id', $member_id);
            }
            if($this->input->get('current')) 
                $model->by_date();
            $assignments = nest($model->order_by('priority')->get()->result_array());
            if ( $member_id )
                list($duration, $discharge_date) = $this->calculate_duration($assignments, $member_id);
            $status = $this->get_member_status($member_id);   
            $this->response(array('status' => true, 'duration' => $duration, 'discharge_date' => $discharge_date, 'assignments' => $assignments, 'member_status' => $status ));
        }
    }
    
    private function calculate_duration($assignments, $member_id) {
        $days = array();
        $this->discharge_model->where('type !=','Honorable');
        $this->discharge_model->where('discharges.member_id',$member_id);
        $this->discharge_model->order_by('date DESC');
        $gdDate = $this->discharge_model->get()->result_array();
        $gdDate = ( sizeof($gdDate) ? $gdDate[0]['date'] : null );
        foreach($assignments as $assignment) 
        {
          if ( !($assignment['unit']['class'] == 'Training') ) 
          {  
            $start_date = strtotime($assignment['start_date']);
            $end_date = strtotime($assignment['end_date'] ?: format_date('now', 'mysqldate'));
            if ( format_date($start_date, 'mysqldate') > $gdDate ) 
            {  
              for($i = $start_date; $i < $end_date; $i = $i + DAY) 
              {
                $days[format_date($i, 'mysqldate')] = true;
              }
            }
          }
        }
        return array( sizeof($days), $gdDate );
    }
    
    private function get_member_status( $member_id ) 
    {
        $res = $this->db->query("SELECT `type` FROM discharges WHERE `member_id`=$member_id ORDER BY date DESC LIMIT 1")->result_array();
        $ret = ( $res ? str_replace('able', 'ab', $res[0]['type']) . 'ly Discharged' : '');
        if (!$ret)
        {
            $res = $this->db->query("SELECT Count(1) AS cnt FROM `enlistments` WHERE member_id = $member_id AND `status` = 'Pending';")->result_array();
            $ret = ( $res && $res[0]['cnt'] > 0  ? "Enlistee " : "Public Member" );
        }
        return $ret;
    }
    
    /**
     * VIEW
     */
    public function view_get($assignment_id) {
        // Must have permission to view this member's profile or any member's profile
        $assignment = nest($this->assignment_model->select_member()->get_by_id($assignment_id));
        if( ! $this->user->permission('profile_view', array('member' => $assignment['member']['id'])) && ! $this->user->permission('profile_view_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        // View record
        else {
            $this->response(array('status' => true, 'assignment' => $assignment));
        }
    }
    
    /**
     * CREATE
     */
    public function index_post() {
        // Must have permission to assign to this unit or any unit
        if( ! $this->user->permission('assignment_add', array('unit' => $this->post('unit_id'))) && ! $this->user->permission('assignment_add_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        // Form validation
        else if($this->assignment_model->run_validation('validation_rules_add') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->assignment_model->validation_errors), 400);
        }
        // Create record
        else {
            $this->usertracking->track_this();
            $data = whitelist($this->post(), array('member_id', 'unit_id', 'position_id', 'start_date', 'end_date'));
            
            // Clean dates or set to NULL if empty
            if(isset($data['start_date'])) $data['start_date'] = $data['start_date'] ? format_date($data['start_date'], 'mysqldate') : NULL;
            if(isset($data['end_date'])) $data['end_date'] = $data['end_date'] ? format_date($data['end_date'], 'mysqldate') : NULL;
            
            $insert_id = $this->assignment_model->save(NULL, $data);
            
            // Update roles
            $this->load->library('vanilla');
            $roles = $this->vanilla->update_roles($data['member_id']);
            
            $this->response(array('status' => $insert_id ? true : false, 'assignment' => $insert_id ? nest($this->assignment_model->select_member()->get_by_id($insert_id)) : null));
        }
    }
    
    /**
     * UPDATE
     */
    public function view_post($assignment_id) {
        // Fetch record
        if( ! ($assignment = nest($this->assignment_model->select_member()->get_by_id($assignment_id)))) {
            $this->response(array('status' => false, 'error' => 'Assignment not found'), 404);
        }
        // Must have permission to assign to the new unit and the old unit, or permission to assign to any unit
        else if( ! ($this->user->permission('assignment_add', array('unit' => $assignment['unit']['id']))
                    && ( $this->post('unit_id') == NULL || $this->user->permission('assignment_add', array('unit' => $this->post('unit_id') ) ) )
                ) && ! $this->user->permission('assignment_add_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        // Form validation
        else if($this->assignment_model->run_validation('validation_rules_edit') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->assignment_model->validation_errors), 400);
        }
        // Update record
        else {
            $this->usertracking->track_this();
            $data = whitelist($this->post(), array('unit_id', 'position_id', 'start_date', 'end_date'));
            
            // Clean dates or set to NULL if empty
            if(isset($data['start_date'])) $data['start_date'] = $data['start_date'] ? format_date($data['start_date'], 'mysqldate') : NULL;
            if(isset($data['end_date'])) $data['end_date'] = $data['end_date'] ? format_date($data['end_date'], 'mysqldate') : NULL;
            
            $result = $this->assignment_model->save($assignment_id, $data);
            
            // Update roles
            $this->load->library('vanilla');
            $roles = $this->vanilla->update_roles($assignment['member']['id']);
            
            $this->response(array('status' => $result ? true : false, 'assignment' => nest($this->assignment_model->select_member()->get_by_id($assignment_id))));
        }
    }
    
    /**
     * DELETE
     * Should only be done to correct an error. Otherwise just set the end_date to end an assignment.
     */
    public function view_delete($assignment_id) {
        // Fetch record
        if( ! ($assignment = nest($this->assignment_model->select_member()->get_by_id($assignment_id)))) {
            $this->response(array('status' => false, 'error' => 'Assignment not found'), 404);
        }
        // Must have permission to delete this type of record for this member or for any member
        else if( ! $this->user->permission('assignment_delete', array('member' => $assignment['member']['id'])) && ! $this->user->permission('assignment_delete_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        // Delete record
        else {
            $this->usertracking->track_this();
            $this->assignment_model->delete($assignment_id);
            
            // Update roles
            $this->load->library('vanilla');
            $roles = $this->vanilla->update_roles($assignment['member']['id']);
            
            $this->response(array('status' => true));
        }
    }
}
