<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Passes extends MY_Controller {
    public $model_name = 'pass_model';
    public $abilities = array(
        'view_any' => 'profile_view_any',
        'view' => 'profile_view'
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
    public function index_get($option = FALSE, $member_id = FALSE) {
        // Must have permission to view any member's profile
        if( ! $this->user->permission('profile_view_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        // Index records
        else {
            $skip = $this->input->get('skip') ? $this->input->get('skip', TRUE) : 0;
            $model = $this->pass_model;
            if ( $option == 'member' && is_numeric($member_id) )
                $model->by_member( $member_id );
            $passes = nest($model->select_member()->paginate('', $skip)->result_array());
            $count = $model->total_rows;
            $this->response(array( 'status' => true, 'count' => $count, 'skip' => $skip, 'passes' => $passes));
        }
    }
    
}