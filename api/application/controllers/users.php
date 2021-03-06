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
            $member = $this->user->member();
            $this->response(array('status' => true, 'user' => $member));
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

    // Post-transition associate method
    /*public function associate_post() {
        if( ! $forum_member_id = $this->user->logged_in()) {
            $this->response(array('status' => false, 'error' => 'Not logged in'), 401);
        } elseif ($this->user->member('id')) {
            $this->response(array('status' => false, 'error' => 'Already associated'));
        } else {
            $this->load->model('member_model');
            $forum_email = $this->user->member('forum_email');
            $matches = $this->member_model->where('email', $forum_email)->get()->result_array();
            if (empty($matches)) {
                $this->response(array('status' => false, 'error' => "No member found with email {$forum_email}"), 404);
            } else if (sizeof($matches) > 1) {
                $this->response(array('status' => false, 'error' => "Multiple members found"), 409);
            } else if ($matches[0]['forum_member_id'] != NULL) {
                $this->response(array('status' => false, 'error' => "Member with email {$forum_email} is already associated with a forum user"), 409);
            } else {
                $member = $matches[0];
                $this->member_model->save($member['id'], array('forum_member_id' => $forum_member_id));

                $this->forums->update_display_name($member['id']);
                $this->forums->update_roles($member['id']);

                $this->response(array('status' => true, 'member' => $member));
            }
        }
    }*/

    public function associate_post() {
        $discourse_session = $this->user->get_discourse_session();

        if( ! $discourse_session) {
            $this->response(array('status' => false, 'error' => 'Not logged in to discourse'), 401);
        } elseif ( ! $this->user->logged_in()) {
            $this->response(array('status' => false, 'error' => 'Not logged in to vanilla'), 401);
        } elseif ($this->user->member('discourse_forum_member_id')) {
            $this->response(array('status' => false, 'error' => 'Already associated'));
        } else {
            $personnel_member_id = $this->user->member('id');
            $discourse_member_id = $discourse_session['id'];

            $this->member_model->save($personnel_member_id, array('discourse_forum_member_id' => $discourse_member_id));

            // update both forums
            // $this->forums->link_to_personnel_user($personnel_member_id);
            $this->forums->update_display_name($personnel_member_id);
            $this->forums->update_roles($personnel_member_id);

            $this->response(array('status' => true));
        }
    }
}
