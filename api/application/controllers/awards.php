<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Awards extends MY_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->model('award_model');
    }
    
    /**
     * INDEX
     */
    public function index_get() {
        $awards = $this->award_model;
        if( $this->input->get('game') )
            $awards->by_game( $this->input->get('game') );
        $awards = $awards->get()->result();
        $this->response(array('status' => true, 'awards' => $awards));
    }
    
    /**
     * VIEW
     */
    public function view_get($award_id) {
        $award = $this->award_model->get_by_id($award_id);
        if( $this->input->get('members') )
            $award->awardings = nest( $this->add_members($award_id) );
        $this->response(array('status' => true, 'award' => $award));
    }
    
    private function add_members( $award_id ) {
        $res = $this->db->query("
            SELECT aw.member_id AS `member|id`, aw.date, CONCAT (r.abbr,' ', m.last_name) AS `member|short_name`, aw.forum_id AS 'forums|id', aw.topic_id AS 'forums|topic'
            FROM `awardings` AS aw
            LEFT JOIN `members` AS m ON m.id = aw.member_id
            LEFT JOIN `ranks` AS r ON m.rank_id = r.id
            WHERE aw.award_id = " . $award_id . "
            ORDER BY aw.date DESC")->result_array();
        return $res;
    }


    /*public function index_post() {
        if($this->form_validation->run('award_add') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->form_validation->get_error_array()));
        } else {
            $insert_id = $this->award_model->save(NULL, $this->post());
            $this->response(array('status' => $insert_id ? true : false, 'award' => $insert_id ? $this->award_model->get_by_id($insert_id) : null));
        }
    }
    
    public function view_post($award_id) {
        if($this->form_validation->run('award_add') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->form_validation->get_error_array()));
        } else {
            $this->award_model->save($award_id, $this->post());
            $this->response(array('status' => true, 'award' => $this->award_model->get_by_id($award_id)));
        }
    }
    
    public function view_delete($award_id) {
        $this->award_model->delete($award_id);
        $this->response(array('status' => true));
    }*/
}