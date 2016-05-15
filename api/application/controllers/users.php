<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Users
 * Gets info about current logged in user
 */
class Users extends MY_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->model('assignment_model');
    }
    
	/**
	 * INDEX
	 * Noop
	 */
	//public function index_get() {}
	
	/**
	 * VIEW
	 * Gets basic user information
	 */
    public function view_get() {
        if($this->user->logged_in()) 
        {
            $this->response(array('status' => true, 'user' => $this->user->member()));
        } 
        else 
        {
            $this->response(array('status' => false, 'error' => 'Not logged in'));
        }
    }
    
	/**
	 * USER PERMISSIONS
	 */
    public function permissions_get($member_id = FALSE, $unit_id = FALSE) {
        if($this->user->logged_in()) {
            $this->response(array('status' => true, 'permissions' => $this->user->permissions($member_id, $unit_id)));
        } else {
            $this->response(array('status' => false, 'error' => 'Not logged in'));
        }
    }
    
	/**
	 * USER ASSIGNMENTS
	 */
    public function assignments_get() {
        if($this->user->logged_in()) {
            $model = $this->assignment_model->where('assignments.member_id', $this->user->member('id'));
            if($this->input->get('current')) $model->by_date();
            $assignments = nest($model->get()->result_array());
            $this->response(array('status' => true, 'assignments' => $assignments));
        } else {
            $this->response(array('status' => false, 'error' => 'Not logged in'));
        }
    }
    
    public function associate_get() {
        $this->load->model('member_model');
        $this->load->library('vanilla');
        // Ensure user is logged into forums
        if( ! ($user_id = $this->user->logged_in())) {
            $this->response(array('status' => false, 'error' => 'Not logged in to forums'));
        } else {
            // Find user's Steam ID in forum database
            $result = $this->vanilla->get_steam_id($user_id);
            // If no Steam ID found
            if( empty($result) || ! is_numeric($result['Value'])) {
                $this->response(array('status' => false, 'error' => 'No Steam ID found in forum profile'));
            } else {
                // Update personnel members table with Steam ID
                $member = $this->member_model->where('steam_id', $result['Value'])->get()->row_array();
                // If no personnel member record found
                if(empty($member)) {
                    $this->response(array('status' => false, 'error' => 'No personnel member record with that Steam ID found'));
                } else {
                    //$this->usertracking->track_this();
                    $result = $this->member_model->save($member['id'], array('forum_member_id' => $user_id));
            
                    // Update username
                    $this->vanilla->update_username($member['id']);
                    
                    // Update forum roles
                    if($roles = $this->vanilla->update_roles($member['id'])) {
                        $this->response(array('status' => true, 'roles' => $roles));
                    } else {
                        $this->response(array('status' => false, 'error' => 'There was an issue updating the user\'s roles'));
                    }
                }
            }
        }
    }
}