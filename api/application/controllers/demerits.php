<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Demerits extends MY_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->model('demerit_model');
    }
    
    /**
     * INDEX
     */
    public function index_get($member_id = FALSE) {
		// Must have permission to view this type of record for this member or for any member
		if( ! $this->user->permission('demerits_view_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
		// View records
		else {
            $skip = $this->input->get('skip') ? $this->input->get('skip') : 0;
			$model = $this->demerit_model;
			if($member_id) {
			    $model->where('demerits.member_id', $member_id);
			    $model->get();
			}
			// Otherwise paginate
			else {
			    $model->paginate('', $skip);
			}
			$demerits = nest($model->result_array());
			$count = $this->demerit_model->total_rows;
			$this->response(array('status' => true, 'count' => $count, 'skip' => $skip, 'demerits' => $demerits));
		}
    }
    
    /**
     * VIEW
     */
    public function view_get($demerit_id) {
		// Must have permission to view this type of record for this member or for any member
		if( ! $this->user->permission('demerits_view_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
		// View records
		else {
            $demerit = $this->demerit_model->get_by_id($demerit_id);
            $this->response(array('status' => true, 'demerit' => $demerit));
		}
    }
}