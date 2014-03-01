<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Promotions extends MY_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->model('promotion_model');
        $this->load->library('form_validation');
    }
    
    /*public function index_get() {
        $promotions = $this->promotion_model->get()->result();
        $this->response(array('status' => true, 'promotions' => $promotions));
    }*/
    
    public function index_options() {
        $this->response(array('status' => true));
    }
    public function view_options() {
        $this->response(array('status' => true));
    }
    
    public function view_get($promotion_id) {
        $promotion = nest($this->promotion_model->get_by_id($promotion_id));
        if( ! $this->user->permission('profile_view', $promotion['member_id']) && ! $this->user->permission('profile_view_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        else {
            $this->response(array('status' => true, 'promotion' => $promotion));
        }
    }
    
    public function index_post() {
        if( ! $this->post('member_id')) {
            $this->response(array('status' => false, 'error' => 'No member specified'), 400);
        } else if( ! $this->user->permission('promotion_add', $this->post('member_id')) && ! $this->user->permission('promotion_add_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        } else if($this->form_validation->run('promotion_add') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->form_validation->get_error_array()), 400);
        } else {
            $insert_id = $this->promotion_model->save(NULL, $this->post());
            $this->check_rank($this->post('member_id'), $this->post('date'), $this->post('new_rank_id'));
            $this->response(array('status' => $insert_id ? true : false, 'promotion' => $insert_id ? $this->promotion_model->get_by_id($insert_id) : null));
        }
    }
    
    public function view_post($promotion_id) {
        if( ! ($promotion = $this->promotion_model->get_by_id($promotion_id))) {
            $this->response(array('status' => false, 'error' => 'Promotion not found'), 404);
        } else if( ! $this->user->permission('promotion_add', $promotion['member_id']) && ! $this->user->permission('promotion_add_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        } else if($this->form_validation->run('promotion_add') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->form_validation->get_error_array()), 400);
        } else {
            $this->promotion_model->save($promotion_id, $this->post());
            $this->check_rank($this->post('member_id'), $this->post('date'), $this->post('new_rank_id'));
            $this->response(array('status' => true, 'promotion' => $this->promotion_model->get_by_id($promotion_id)));
        }
    }
    
    public function view_delete($promotion_id) {
        if( ! ($promotion = $this->promotion_model->get_by_id($promotion_id))) {
            $this->response(array('status' => false, 'error' => 'Promotion not found'), 404);
        } else if( ! $this->user->permission('promotion_delete', $promotion['member_id']) && ! $this->user->permission('promotion_delete_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        } else {
            $this->promotion_model->delete($promotion_id);
            $this->last_rank($promotion['member_id']);
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