<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Attendance extends MY_Controller {
    public $model_name = 'attendance_model';
    public $abilities = array(
        'view_any' => 'event_view_any',
        'view' => 'event_view'
    );
    
    /**
     * PRE-FLIGHT
     */
    public function index_options() { $this->response(array('status' => true)); }
    public function view_options() { $this->response(array('status' => true)); }
    
    public function percentage_get($filter_key = FALSE, $filter_value = FALSE) 
    { /* */
        $from_date = null;
        if ( $filter_key <> 'unit' ) { 
          $this->load->model('discharge_model');
          $this->discharge_model->where('type !=','Honorable');
          $this->discharge_model->where('discharges.member_id',$filter_value);
          $this->discharge_model->order_by('date DESC');
          $gdDate = $this->discharge_model->get()->result_array();
          $from_date = ( sizeof($gdDate) ? $gdDate[0]['date'] : null );
        }
        
        $perc_arr = array( 
            "d30" => $this->attendance_model->percentage( 30, $filter_key, $filter_value, $from_date ),
            "d60" => $this->attendance_model->percentage( 60, $filter_key, $filter_value, $from_date ),
            "d90" => $this->attendance_model->percentage( 90, $filter_key, $filter_value, $from_date ),
            "all" => $this->attendance_model->percentage( '', $filter_key, $filter_value, $from_date )
        );
        
        $this->response(  array( 'percentages' => $perc_arr, 'status' => true ) );
    }
    
    /*
     * INDEX
     * Handled by index_filter_get in MY_Controller
     */
/* 
    public function index_get($member_id = FALSE) {
        // Must have permission to view this member's profile or any member's profile
        if( ! $this->user->permission('profile_view', array('member' => $member_id)) && ! $this->user->permission('profile_view_any')) {
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
            $this->response(array('status' => true, 'count' => $count, 'skip' => $skip, 'attendance' => $attendance ));
        }
    }
*/
}