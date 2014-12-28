<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Finances extends MY_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->model('finance_model');
    }
    
    /**
     * INDEX
     */
    public function index_get($member_id = FALSE) {
		// Must have permission to view this type of record for this member or for any member
		if( ! $this->user->permission('finances_view')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
		// View records
		else {
			$skip = $this->input->get('skip') ? $this->input->get('skip') : 0;
			$model = $this->finance_model;
			if($member_id) {
			    $model->where('finances.member_id', $member_id);
			}
			$finances = nest($model->paginate('', $skip)->result_array());
			$count = $this->finance_model->total_rows;
			$this->response(array('status' => true, 'count' => $count, 'skip' => $skip, 'finances' => $finances));
		}
    }
    
    /**
     * VIEW
     */
    public function view_get($finance_id) {
        $finance = $this->finance_model->get_by_id($finance_id);
        $this->response(array('status' => true, 'finance' => $finance));
    }
}