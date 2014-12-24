<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Finances extends MY_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->model('finance_model');
    }
    
    /**
     * INDEX
     */
    public function index_get() {
		// Must have permission to view this type of record for this member or for any member
		if( ! $this->user->permission('finances_view')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
		// View records
		else {
			$skip = $this->input->get('skip') ? $this->input->get('skip') : 0;
			$finances = nest($this->finance_model->paginate('', $skip)->result_array());
			$count = $this->finance_model->total_rows;
			$this->response(array('status' => true, 'count' => $count, 'skip' => $skip, 'finances' => $finances));
		}
    }
    
    /**
     * VIEW
     */
    public function view_get($ability_id) {
        $ability = $this->finance_model->get_by_id($ability_id);
        $this->response(array('status' => true, 'finances' => $ability));
    }
}