<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Promotions extends MY_Controller {
    public $model_name = 'promotion_model';
    public $abilities = array(
        'view_any' => 'profile_view_any',
        'view' => 'profile_view'
    );

    public function __construct() {
        parent::__construct();
        $this->load->library('form_validation');
        $this->load->library('servicecoat');
    }
    
    /**
     * PRE-FLIGHT
     */
    public function index_options() { $this->response(array('status' => true)); }
    public function view_options() { $this->response(array('status' => true)); }
    
	/**
     * INDEX
     * Handled by index_filter_get in MY_Controller
     */
    
	/**
	 * VIEW
	 */
    public function view_get($promotion_id) {
        // Must have permission to view this member's profile or any member's profile
        $promotion = nest($this->promotion_model->get_by_id($promotion_id));
        if( ! $this->user->permission('profile_view', array('member' => $promotion['member_id'])) && ! $this->user->permission('profile_view_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
		// View record
        else {
            $this->response(array('status' => true, 'promotion' => $promotion));
        }
    }
    
	/**
	 * CREATE
	 */
    public function index_post() {
        // Must have permission to create this type of record for this member or for any member
		if( ! $this->user->permission('promotion_add', array('member' => $this->post('member_id'))) && ! $this->user->permission('promotion_add_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
		// Form validation
		else if($this->promotion_model->run_validation('validation_rules_add') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->promotion_model->validation_errors), 400);
        }
		// Create record
		else {
		    $this->usertracking->track_this();
			$data = whitelist($this->post(), array('member_id', 'date', 'old_rank_id', 'new_rank_id', 'forum_id', 'topic_id'));
			
			// Clean date
			$data['date'] = format_date($data['date'], 'mysqldate');
			
            $insert_id = $this->promotion_model->save(NULL, $data);
			
			// Update rank if necessary
            $this->latest_rank($data['member_id'], $data['date'], $data['new_rank_id']);
            
            // Update service coat
            $this->servicecoat->update($data['member_id']);
            
            // Update username
            $this->load->library('vanilla');
            $this->vanilla->update_username($data['member_id']);
            
            $this->response(array( 'status' => $insert_id ? true : false, 'promotions' => $insert_id ? $this->promotion_model->get_by_id($insert_id) : null));
        }
    }
    
	/**
	 * UPDATE
	 */
    public function view_post($promotion_id) {
		// Fetch record
        if( ! ($promotion = $this->promotion_model->get_by_id($promotion_id))) {
            $this->response(array('status' => false, 'error' => 'Record not found'), 404);
        }
		// Must have permission to create this type of record for this member or for any member
		else if( ! $this->user->permission('promotion_add', array('member' => $promotion['member_id'])) && ! $this->user->permission('promotion_add_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
		// Form validation
		else if($this->promotion_model->run_validation('validation_rules_edit') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->promotion_model->validation_errors), 400);
        }
		// Update record
		else {
		    $this->usertracking->track_this();
			$data = whitelist($this->post(), array('date', 'old_rank_id', 'new_rank_id', 'forum_id', 'topic_id'));
			
			// Clean date
			$data['date'] = format_date($data['date'], 'mysqldate');
			
            $result = $this->promotion_model->save($promotion_id, $data);
			
			// Update rank if necessary
            $this->latest_rank($this->post('member_id'), $this->post('date'), $this->post('new_rank_id'));
            
            // Update service coat
            $this->servicecoat->update($member_id);
            
            // Update username
            $this->load->library('vanilla');
            $this->vanilla->update_username($member_id);
            
            $this->response(array('status' => $result ? true : false, 'promotion' => $this->promotion_model->get_by_id($promotion_id)));
        }
    }
    
	/**
	 * DELETE
	 */
    public function view_delete($promotion_id) {
		// Fetch record
        if( ! ($promotion = $this->promotion_model->get_by_id($promotion_id))) {
            $this->response(array('status' => false, 'error' => 'Record not found'), 404);
        }
		// Must have permission to delete this type of record for this member or for any member
		else if( ! $this->user->permission('promotion_delete', array('member' => $promotion['member_id'])) && ! $this->user->permission('promotion_delete_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
		// Delete record
		else {
		    $this->usertracking->track_this();
            $this->promotion_model->delete($promotion_id);
			
			// Update rank if necessary
            $this->last_rank($promotion['member_id']);
            
            // Update service coat
            $this->servicecoat->update($member_id);
            
            // Update username
            $this->load->library('vanilla');
            $this->vanilla->update_username($member_id);
            
            $this->response(array('status' => true));
        }
    }
    
    // Check if this is the newest promotion; if so, change rank_id in members table
    private function latest_rank($member_id, $date, $new_rank_id) {
        $this->load->model('member_model');
        $newer_promotions = $this->promotion_model->by_newer($member_id, $date)->get()->num_rows();
        if( ! $newer_promotions) {
            $this->member_model->save($member_id, array('rank_id' => $new_rank_id));
        }
    }
    
    // Update member's rank to last promotion, or the default rank if no other promotions exist
    private function last_rank($member_id) {
        if($newest = nest($this->promotion_model->where('promotions.member_id', $member_id)->limit(1)->get()->row_array())) {
            $this->member_model->save($member_id, array('rank_id' => isset($newest['new_rank']['id']) ? $newest['new_rank']['id'] : 'DEFAULT'));
        }
    }
}