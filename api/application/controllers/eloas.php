<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class ELOAs extends MY_Controller {
    public $model_name = 'eloa_model';
    public $abilities = array(
        'view_any' => 'eloa_view_any',
        'view' => 'eloa_view'
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
		// Must have permission to view any member's profile
		if( ! $this->user->permission('profile_view_any')) {
			$this->response(array('status' => false, 'error' => 'Permission denied'), 403);
		}
		// View record(s)
		else {
		    $eloas = $this->eloa_model;
		    $skip = $this->input->get('skip') ? $this->input->get('skip', TRUE) : 0;
            if ( $filter_key = 'member' )
                $eloas->by_member($filter_value); // include members

		    if ( $this->input->get('status') ) 
		    {
		        if ( $this->input->get('status') == 'active' )
		            $eloas->active();
		        elseif ( $this->input->get('status') == 'future' )
		            $eloas->future();
		    }
		    $records = nest( $eloas->paginate('', $skip)->result_array() );
		    $count = $eloas->total_rows;
			$this->response(array( 'status' => true, 'count' => $filter_key, 'skip' => $skip, 'eloas' => $records ));
		}
    }//index_get

    
    /**
     * VIEW
     */
    //public function view_get($loa_id) {}
    
    /**
     * CREATE
     */
    public function index_post() {
        // Must have permission to create this member's eloas or any member's eloas
        if( ! $this->user->permission('eloa_add', array('member' => $this->post('member_id'))) && ! $this->user->permission('eloa_add_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        // Form validation
        else if($this->eloa_model->run_validation('validation_rules_add') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->eloa_model->validation_errors), 400);
        }
        // Ensure start date is not in the past
        else if(strtotime($this->post('start_date')) < strtotime('midnight')) {
            $this->response(array('status' => false, 'error' => 'Start date cannot be in the past'), 400);
        }
        // Ensure start date is not after end date
        else if(strtotime($this->post('start_date')) > strtotime($this->post('end_date'))) {
            $this->response(array('status' => false, 'error' => 'Start date cannot be after end date'), 400);
        }
        // Update record
        else {
            $this->usertracking->track_this();
            $data = whitelist($this->post(), array('member_id', 'start_date', 'end_date', 'reason', 'availability'));

            // Set datetime of posting
            $data['posting_date'] = format_date('now', 'mysqldatetime');

            // Clean dates
            $data['start_date'] = format_date($data['start_date'], 'mysqldate');
            $data['end_date'] = format_date($data['end_date'], 'mysqldate');
            
            $insert_id = $this->eloa_model->save(NULL, $data);
            $new_record = $insert_id ? nest($this->eloa_model->get_by_id($insert_id)) : null;
            $this->response(array('status' => $insert_id ? true : false, 'eloa' => $new_record));
        }
    }
    
    /**
     * UPDATE
     */
    public function view_post($eloa_id) {
        // Must have permission to edit this member's eloas or any member's eloas
        $eloa = nest($this->eloa_model->get_by_id($eloa_id));
        if( ! $this->user->permission('eloa_add', array('member' => $eloa['member']['id'])) && ! $this->user->permission('eloa_add_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        // Form validation
        /*else if($this->eloa_model->run_validation('validation_rules_edit') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->eloa_model->validation_errors), 400);
        }*/
        // Ensure start date is not in the past
        else if(strtotime($this->post('start_date')) < strtotime('midnight')) {
            $this->response(array('status' => false, 'error' => 'Start date cannot be in the past'), 400);
        }
        // Ensure start date is not after end date
        else if(strtotime($this->post('start_date')) > strtotime($this->post('end_date'))) {
            $this->response(array('status' => false, 'error' => 'Start date cannot be after end date'), 400);
        }
        // Update record
        else {
            $this->usertracking->track_this();
            $data = whitelist($this->post(), array('start_date', 'end_date', 'reason', 'availability'));
                
            $result = $this->eloa_model->save($eloa_id, $data);
            
            $this->response(array('status' => $result ? true : false, 'eloa' => nest($this->eloa_model->get_by_id($eloa_id))));
        }
    }
}