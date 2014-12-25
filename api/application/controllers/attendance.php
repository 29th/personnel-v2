<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Attendance extends MY_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->model('attendance_model');
    }
    
    /**
     * PRE-FLIGHT
     */
    public function index_options() { $this->response(array('status' => true)); }
    public function view_options() { $this->response(array('status' => true)); }
    
    /**
     * INDEX
     */
    public function index_get($member_id = FALSE) {
        // Must have permission to view this member's profile or any member's profile
        if( ! $this->user->permission('profile_view', $member_id) && ! $this->user->permission('profile_view_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        else {
            $skip = $this->input->get('skip') ? $this->input->get('skip') : 0;
            $model = $this->attendance_model;
            if($member_id) {
                $model->by_member($member_id);
            }
            $attendance = nest($this->attendance_model->paginate('', $skip)->result_array());
            $count = $this->attendance_model->total_rows;
            $this->response(array('status' => true, 'count' => $count, 'skip' => $skip, 'attendance' => $attendance));
        }
    }
}