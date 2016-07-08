<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Recruits extends MY_Controller {
    public $model_name = 'recruits_model';
    public $abilities = array(
        'view_any' => 'event_view_any',
        'view' => 'event_view'
    );
    
    /**
     * PRE-FLIGHT
     */
    public function index_options() { $this->response(array('status' => true)); }
    public function view_options() { $this->response(array('status' => true)); }
    
    /**
     * INDEX
     * Handled by index_filter_get in MY_Controller
     */
    public function index_get($filter_key = FALSE, $filter_value = FALSE) {
        if( ! $this->user->permission('profile_view', array('member' => $filter_value)) && ! $this->user->permission('profile_view_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        else 
        {
            $model = $this->recruits_model;
            
            // Filter by member
            if($filter_key == 'member') {
                $model->by_member($filter_value);
            }
            // Filter by unit
            elseif($filter_key == 'unit') {
                $model->by_unit($filter_value);
            }

            // If date range
            if($this->input->get('from') && $this->input->get('to')) {
                $model->by_date($this->input->get('from'), $this->input->get('to'))->get();
            }
            // Or just get the records
            else {
                $model->get();
            }

            $records = nest($model->result_array());
            $count = sizeof($records);//$this->recruits_model->total_rows;
            $this->response(array('status' => true, 'count' => $count, 'recruits' => $records));
        }
    }
}