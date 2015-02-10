<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Events extends MY_Controller {
    public $model_name = 'event_model';
    public $abilities = array(
        'view_any' => 'event_view_any',
        'view' => 'event_view'
    );

    public function __construct() {
        parent::__construct();
        $this->load->model('attendance_model');
        $this->load->model('assignment_model');
        $this->load->model('eloa_model');
    }
    
    /**
     * PRE-FLIGHT
     */
    public function index_options() { $this->response(array('status' => true)); }
    public function view_options() { $this->response(array('status' => true)); }
    public function aar_options() { $this->response(array('status' => true)); }
    public function excuse_options() { $this->response(array('status' => true)); }
    
    /**
     * INDEX
     * Handled by index_filter_get in MY_Controller, but first allow reported query
     */
    public function index_filter_get($filter_key = FALSE, $filter_value = FALSE) {
        if($this->input->get('reported')) {
            $this->{$this->model_name}->reported($this->input->get('reported') == 'true' ? TRUE : FALSE);
        }
        parent::index_filter_get($filter_key, $filter_value);
    }
    
    /**
     * VIEW
     */
    public function view_get($event_id) {
        // Must have permission to view this units's events or any units's profile
        $event = nest($this->event_model->get_by_id($event_id));
        if( ! $this->user->permission('event_view', $event['unit']['id']) && ! $this->user->permission('event_view_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        // View record
        else {
            $event['attendance'] = nest($this->attendance_model->by_event($event_id)->get()->result_array());
            $this->response(array('status' => true, 'event' => $event));
        }
    }
    
    /**
     * CREATE
     */
    public function index_post() {
        // Must have permission to create this type of record for this unit or for any unit
        if( ! $this->user->permission('event_add', array('unit' => $this->post('unit_id'))) && ! $this->user->permission('event_add_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        // Form validation
        else if($this->event_model->run_validation('validation_rules_add') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->event_model->validation_errors), 400);
        }
        // Create record
        else {
            $this->usertracking->track_this();
            $data = whitelist($this->post(), array('datetime', 'unit_id', 'type', 'mandatory', 'server_id'));

            // Ensure datetime is an array
            if( ! is_array($data['datetime'])) $data['datetime'] = array($data['datetime']);

            $new_records = array();
            $logs = array();
            // For each datetime
            foreach($data['datetime'] as $datetime) {
                $entry_data = $data;
                $entry_data['datetime'] = $datetime;
			
    			// Clean date
    			$entry_data['datetime'] = format_date($entry_data['datetime'], 'mysqldatetime');
                $insert_id = $this->event_model->save(NULL, $entry_data);
                $new_records []= $insert_id ? nest($this->event_model->get_by_id($insert_id)) : null;
            }
            $this->response(array('status' => sizeof($new_records) ? true : false, 'events' => $new_records));
        }
    }
    
    /**
     * UPDATE
     */
    public function view_post($event_id) {
        // Fetch record
        if( ! ($event = nest($this->event_model->get_by_id($event_id)))) {
            $this->response(array('status' => false, 'error' => 'Record not found'), 404);
        }
        // Must have permission to create this type of record for this unit or for any unit
        else if( ! $this->user->permission('event_add', array('unit' => $event['unit']['id'])) && ! $this->user->permission('event_add_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        // Form validation
        else if($this->event_model->run_validation('validation_rules_edit') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->event_model->validation_errors), 400);
        }
        // Update record
        else {
            $this->usertracking->track_this();
            $data = whitelist($this->post(), array('datetime', 'title', 'type', 'mandatory', 'server_id'));
			
			// Clean date
			$data['datetime'] = format_date($data['datetime'], 'mysqldatetime');
			
            $this->event_model->save($event_id, $data);
            $this->response(array('status' => true, 'event' => nest($this->event_model->get_by_id($event_id))));
        }
    }
    
    /**
     * AAR
     */
    public function aar_post($event_id) {
        // Fetch record
        if( ! ($event = nest($this->event_model->get_by_id($event_id)))) {
            $this->response(array('status' => false, 'error' => 'Record not found'), 404);
        }
        // Must have permission to post an AAR for this unit or for any unit
        else if( ! $this->user->permission('event_aar', array('unit' => $event['unit']['id'])) && ! $this->user->permission('event_aar_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        // Form validation
        else if($this->event_model->run_validation('validation_rules_aar') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->event_model->validation_errors), 400);
        }
        // Update record
        else {
            $this->usertracking->track_this();
            // First, update the event record
            $data = whitelist($this->post(), array('report'));
            
            // Update the reporter
            $data['reporter_member_id'] = $this->user->member('id');
            
            // If no report exists already, include the creation date
            if( ! $event['report']) {
                $data['report_posting_date'] = format_date('now', 'mysqldatetime');
            }
            
            // Update the edit date
            $data['report_edit_date'] = format_date('now', 'mysqldatetime');
            
            $result = $this->event_model->save($event_id, $data);
            
            // Second, update the attendance, filtering out anyone not expected
            if($this->post('attended')) {
                $attended = $this->filter_expected($event_id, $this->post('attended'));
                if( ! empty($attended)) $this->attendance_model->set_attendance($event_id, $attended, true);
            }
            if($this->post('absent')) {
                $absent = $this->filter_expected($event_id, $this->post('absent'));
                if( ! empty($absent)) {
                    $this->attendance_model->set_attendance($event_id, $absent, false);

                    // Third, check if any absentees are on Extended LOA and mark them excused
                    $eloas = pluck('member|id', $this->eloa_model->active($event['datetime'])->by_member($absent)->get()->result_array());
                    if(sizeof($eloas)) {
                        $this->attendance_model->set_excused($event_id, $eloas, true);
                    }
                }
            }
            
            $this->response(array('status' => $result ? true : false, 'event' => nest($this->event_model->get_by_id($event_id))));
        }
    }
    
    /**
     * POST ABSENCE
     */
    public function excuse_post($event_id, $member_id = FALSE) {
        $this->excuse($event_id, true, $member_id);
    }
    
    /**
     * CANCEL ABSENCE
     */
    public function excuse_delete($event_id, $member_id = FALSE) {
        $this->excuse($event_id, false, $member_id);
    }
    
    /**
     * HANDLE ABSENCES
     */
    private function excuse($event_id, $excused, $member_id = FALSE) {
        $user_id = $this->user->member('id');
        if( ! $member_id) $member_id = $user_id; // If not posting absence for another member, post absence for self
        
        // Must be logged in, posting absence for self, have permission to post absence for this member or for any member
        if(( ! $user_id || $user_id !== $member_id) && ! $this->user->permission('event_excuse', array('member' => $member_id)) && ! $this->user->permission('event_excuse_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        else {
            $this->usertracking->track_this();
            // Verify event is not more than 24 hours ago
            $event = nest($this->event_model->get_by_id($event_id));
            if(round((strtotime('now') - strtotime($event['datetime']))/3600, 1) > 24) {
                $this->response(array('status' => false, 'error' => 'Event over 24 hours in the past'), 400);
            }
            else {
                // Verify user is expected at this event
                $filtered = $this->filter_expected($event_id, array($member_id));
                if(empty($filtered)) {
                    $this->response(array('status' => false, 'error' => 'Not expected at this event'), 400);
                }
                // Execute
                else {
                    $status = $this->attendance_model->set_excused($event_id, array($member_id), (bool) $excused);
                    $this->response(array('status' => $status));
                }
            }
        }
    }
    
    // Loop through each member and ensure they're expected at the event
    private function filter_expected($event_id, $members) {
        $filtered_members = array();
        if($event_id && is_array($members)) {
            $event = nest($this->event_model->get_by_id($event_id)); // Get the unit
            foreach($members as $member_id) {
                $assignments = nest($this->assignment_model->where('assignments.member_id', $member_id)->by_date('now')->get()->result_array());
                foreach($assignments as $assignment) {
                    $path = preg_split('@/@', $assignment['unit']['path'], NULL, PREG_SPLIT_NO_EMPTY); // use preg_split to ignore empties
                    if(in_array($event['unit']['id'], $path) || $event['unit']['id'] == $assignment['unit']['id']) {
                        array_push($filtered_members, $member_id);
                        continue;
                    }
                }
            }
        }
        return $filtered_members;
    }
}