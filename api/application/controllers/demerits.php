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

    public function index_post() {
        // Must be logged in
        if( ! $this->user->permission('demerit_add', array('member' => $this->post('member_id'))) && ! $this->user->permission('demerit_add_any')) {
            $this->response(array('status' => false, 'error' => 'You don\'t have sufficient permissions to add this demerit'), 403);
        }
        // Form validation for both models
        else if($this->demerit_model->run_validation('validation_rules_add') === FALSE) 
        {
            $this->response(array('status' => false, 'error' => $this->demerit_model->validation_errors), 400);
        }
        // Create record
        else 
        {
            $demerit_data = whitelist($this->post(), array('member_id','topic_id', 'date', 'reason'));
            $demerit_data['author_member_id'] = $this->db->query("SELECT id FROM `members` WHERE forum_member_id = " . $this->user->logged_in() )->result_array()[0]['id'];
            $demerit_data['forum_id'] = 'Vanilla';
        
            $insert_id = $this->demerit_model->save(NULL, $demerit_data);
            $new_record = $insert_id ? nest($this->demerit_model->get_by_id($insert_id)) : null;
            $this->response(array('status' => $insert_id ? true : false, 'demerit' => $new_record ));
        }
    }   //index_post

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
               $demerit = nest($this->demerit_model->select_member()->get_by_id($demerit_id));
               $this->response(array('status' => true, 'demerit' => $demerit));
          }
     }

    public function view_post($demerit_id) {
        // Must be logged in
        if( ! ($demerit = nest($this->demerit_model->get_by_id($demerit_id)))) {
            $this->response(array('status' => false, 'error' => 'Demerit not found!'), 404);
        }
        else if( ! $this->user->permission('demerit_add_any')) {
            $this->response(array('status' => false, 'error' => 'You don\'t have sufficient permissions to edit this demerit'), 403);
        }
        // Form validation for both models
        else if($this->demerit_model->run_validation('validation_rules_edit') === FALSE) 
        {
            $this->response(array('status' => false, 'error' => $this->demerit_model->validation_errors), 400);
        }
        // Update record
        else 
        {
            $demerit_data = whitelist($this->post(), array( 'topic_id', 'date', 'reason'));
        
            $result = $this->demerit_model->save($demerit_id, $demerit_data);
            $new_record = $result ? nest($this->demerit_model->get_by_id($result)) : null;
            $this->response(array('status' => $result ? true : false, 'demerit' => $new_record ));
        }
    }   //view_post

}