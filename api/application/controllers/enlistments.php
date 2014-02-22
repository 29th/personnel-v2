<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Enlistments extends MY_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->model('member_model');
        $this->load->model('enlistment_model');
        $this->load->model('assignment_model');
        $this->load->library('form_validation');
    }
    
    public function index_get() {
        $status = $this->input->get('status');
        $skip = $this->input->get('skip') ? $this->input->get('skip') : 0;
        $model = $this->enlistment_model;
        if($status) $model->by_status($status);
        $enlistments = nest($model->paginate('', $skip)->result_array());
        $count = $this->enlistment_model->total_rows;
        $this->response(array('status' => true, 'count' => $count, 'skip' => $skip, 'enlistments' => $enlistments));
    }
    
    /**
     * Post new enlistment
     * TODO: Prevent enlistment of current members
     */
    public function index_post() {
        if( ! ($forum_member_id = $this->user->logged_in())) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        } else if($this->form_validation->run('enlistment_add') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->form_validation->get_error_array()), 400);
        } else {
            $member_id = $this->user->member('id');
            $data = $this->post();
            // If no member record
            if( ! $member_id) {
                $member_whitelist = array('last_name', 'first_name', 'middle_name', 'country_id', 'email', 'im_type', 'im_handle');
                $member_data = array_intersect_key($data, array_flip($member_whitelist));
                $member_data['forum_member_id'] = $forum_member_id;
                
                // Create member record
                $member_id = $this->member_model->save(NULL, $member_data);
            }
            // Create enlistment record using member_id
            $enlistment_whitelist = array('last_name', 'first_name', 'middle_name', 'country_id', 'email', 'im_type', 'im_handle', 'age', 'timezone', 'game', 'ingame_name', 'steam_name', 'experience', 'recruiter', 'comments');
            $enlistment_data = array_intersect_key($data, array_flip($enlistment_whitelist));
            $enlistment_data['member_id'] = $member_id;
            $enlistment_data['status'] = 'Pending';
            $enlistment_data['date'] = format_date('now', 'mysqldate');
            $insert_id = $this->enlistment_model->save(NULL, $enlistment_data);
            $new_record = $insert_id ? nest($this->enlistment_model->get_by_id($insert_id)) : null;
            $this->response(array('status' => $insert_id ? true : false, 'enlistment' => $new_record));
        }
    }
    
    public function view_get($enlistment_id) {
        $enlistment = nest($this->enlistment_model->get_by_id($enlistment_id));
        $this->response(array('status' => true, 'enlistment' => $enlistment));
    }
    
    // TODO: Set members.primary_assignment_id
    public function view_post($enlistment_id) {
        if( ! $this->user->permission('enlistment_process')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        } else {
            $data = $this->post();
            $data['liaison_member_id'] = $this->user->member('id');
            $this->enlistment_model->save($enlistment_id, $data);
            $enlistment = nest($this->enlistment_model->get_by_id($enlistment_id));
            
            // If accepted
            if($data['status'] == 'Accepted' && $data['unit_id']) {
                $this->assignment_model->save(NULL, array(
                    'member_id' => $enlistment['member_id'],
                    'unit_id' => $data['unit_id'],
                    'start_date' => format_date('now', 'mysqldate')
                ));
            } else {
                $assignment = $this->assignment_model->where('assignments.member_id', $enlistment['member_id'])->where('assignments.unit_id', $data['unit_id'])->where('assignments.end_date IS NULL', NULL, FALSE)->get()->row_array();
                $this->assignment_model->delete($assignment['id']);
            }
            $this->response(array('status' => true, 'enlistment' => $enlistment));
        }
    }
}