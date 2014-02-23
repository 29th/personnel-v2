<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Events extends MY_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->model('event_model');
        $this->load->model('attendance_model');
        $this->load->model('assignment_model');
    }
    
    /*public function index_get($year = FALSE, $month = FALSE) {
        // If no year/month provided, use this month
        if($year === FALSE || $month === FALSE) {
            $year = date('Y');
            $month = date('m');
        }
        $start = $year . '-' . $month . '-1';
        $end = $start . ' next month - 12 hours';
        $events = nest($this->event_model->by_date($start, $end)->get()->result_array());
        $this->response(array('status' => true, 'events' => $events));
    }*/
    
    public function index_get() {
        $from = $this->input->get('from') ? $this->input->get('from') : '30 days ago';
        $to = $this->input->get('to') ? $this->input->get('to') : 'today';
        
        // TODO: Enforce 60 day gap max
        $events = nest($this->event_model->by_date($from, $to)->get()->result_array());
        $this->response(array('status' => true, 'events' => $events));
    }
    
    public function index_post() {
        $insert_id = $this->event_model->save(NULL, $this->post());
        $new_record = $insert_id ? $this->event_model->view($insert_id) : null;
        $this->response(array('status' => true, 'event' => $new_record));
    }
    
    public function view_get($event_id) {
        $event = nest($this->event_model->get_by_id($event_id));
        $event['attendance'] = nest($this->attendance_model->by_event($event_id)->get()->result_array());
        $this->response(array('status' => true, 'event' => $event));
    }
    
    public function view_post($event_id) {
        $event = nest($this->event_model->get_by_id($event_id));
        if( ! $event) {
            $this->response(array('status' => false, 'error' => 'Event not found'), 400);
        }
        else if( ! $this->user->permission('event_aar', null, $event['unit']['id']) && ! $this->user->permission('event_aar_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        else {
            $post_data = $this->post();
            $data['reporter_id'] = $this->user->logged_in();
            if(isset($post_data['report'])) $data['report'] = $post_data['report'];
            if(isset($post_data['attended'])) {
                $attended = $this->filter_expected($event_id, $post_data['attended']);
                if( ! empty($attended)) $this->attendance_model->set_attendance($event_id, $attended, true);
            }
            if(isset($post_data['absent'])) {
                $absent = $this->filter_expected($event_id, $post_data['absent']);
                if( ! empty($absent)) $this->attendance_model->set_attendance($event_id, $absent, false);
            }
            $status = sizeof($data) ? $this->event_model->save($event_id, $data) : true; // huh?
            $this->response(array('status' => $status, 'event' => nest($this->event_model->get_by_id($event_id))));
        }
    }
    
    // Necessary to support OPTIONS method
    public function view_options($event_id) {
        $this->response(array('status' => true));
    }
    public function excuse_options($event_id, $member_id = FALSE) {
        $this->response(array('status' => true));
    }
    
    public function excuse_post($event_id, $member_id = FALSE) {
        $this->excuse($event_id, true, $member_id);
    }
    
    public function excuse_delete($event_id, $member_id = FALSE) {
        $this->excuse($event_id, false, $member_id);
    }
        
    private function excuse($event_id, $excused, $member_id = FALSE) {
        $user_id = $this->user->logged_in();
        if( ! $member_id) $member_id = $user_id;
        if(( ! $user_id || $user_id !== $member_id) && ! $this->user->permission('excuse', $member_id) && ! $this->user->permission('excuse_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        } else {
            // Verify event is not more than 24 hours ago
            $event = nest($this->event_model->get_by_id($event_id));
            if(round((strtotime('now') - strtotime($event['datetime']))/3600, 1) > 24) {
                $this->response(array('status' => false, 'error' => 'Event over 24 hours in the past'), 400);
            } else {
                // Verify user is expected at this event
                $filtered = $this->filter_expected($event_id, array($member_id));
                if(empty($filtered)) {
                    $this->response(array('status' => false, 'error' => 'Not expected at this event'), 400);
                } else {
                    // Post the excuse
                    $status = $this->attendance_model->set_excused($event_id, array($member_id), (bool) $excused);
                    $this->response(array('status' => $status));
                }
            }
        }
    }
    
    // Loop through each member and ensure they're expected at the event
    private function filter_expected($event_id, $members) {
        $filtered_members = array();
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
        return $filtered_members;
    }
}