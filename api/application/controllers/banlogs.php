<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Banlogs extends MY_Controller {
    public $model_name = 'banlog_model';
    public $abilities = array(
        'view_any' => 'profile_view_any',
        'view' => 'profile_view'
    );
    
    /**
     * INDEX
     * Handled by index_filter_get in MY_Controller
     */
    /**
     * VIEW
     */
    public function view_get($banlog_id) {
		// Must have permission to view this type of record for this member or for any member
		if( ! $this->user->permission('profile_view_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
		// View records
		else {
            $banlog = nest( $this->banlog_model->select_member()->get_by_id($banlog_id) );
            $this->response(array('status' => true, 'banlog' => $banlog, 'a' => 'a' ));
		}
    }
    
}
