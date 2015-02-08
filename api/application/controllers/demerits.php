<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Demerits extends MY_Controller {
     public $model_name = 'demerit_model';
     public $abilities = array(
          'view_any' => 'demerit_view_any',
          'view' => 'demerit_view'
     );

     /**
     * INDEX
     * Handled by index_filter_get in MY_Controller
     */

     /**
     * VIEW
     */
     public function view_get($demerit_id) {
          // Must have permission to view this type of record for this member or for any member
          if( ! $this->user->permission('demerit_view_any')) {
               $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
          }
          // View records
          else {
               $demerit = nest($this->demerit_model->get_by_id($demerit_id));
               $this->response(array('status' => true, 'demerit' => $demerit));
          }
     }
}