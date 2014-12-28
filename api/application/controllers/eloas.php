<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class ELOAs extends MY_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->model('eloa_model');
    }
    
    /**
     * INDEX
     */
    public function index_get($member_id = FALSE) {
		// Must have permission to view this type of record for this member or for any member
		if( ! $this->user->permission('eloas_view')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
		// View records
		else {
			$skip = $this->input->get('skip') ? $this->input->get('skip') : 0;
			$model = $this->eloa_model;
			if($member_id) {
			    $model->by_member($member_id);
			}
            if($this->input->get('active')) {
                $model->active();
            }
			$eloas = nest($model->paginate('', $skip)->result_array());
			$count = $this->eloa_model->total_rows;
			$this->response(array('status' => true, 'count' => $count, 'skip' => $skip, 'eloas' => $eloas));
		}
    }
    
    /**
     * VIEW
     */
    public function view_get($loa_id) {
        $eloa = $this->eloa_model->get_by_id($loa_id);
        $this->response(array('status' => true, 'eloa' => $eloa));
    }
}