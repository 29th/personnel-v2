<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Finances extends MY_Controller {
    public $model_name = 'finance_model';
    public $abilities = array(
        'view_any' => 'finance_view_any',
        'view' => 'finance_view'
    );
    
    /**
     * INDEX
     * Handled by index_filter_get in MY_Controller
     */
    /**
     * VIEW
     */
    public function view_get($finance_id) {
		// Must have permission to view this type of record for this member or for any member
		if( ! $this->user->permission('finance_view')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
		// View records
		else {
            $finance = $this->finance_model->get_by_id($finance_id);
            $this->response(array('status' => true, 'finance' => $finance ));
		}
    }
    
    public function balance_get() {
       $balance  = round( $this->db->query("SELECT SUM(amount_received) - SUM(fee) - SUM(amount_paid) AS balance FROM finances")->row_array()['balance'], 2 );
       $this->response(array( 'status' => true, 'balance' => $balance));
    }
}
