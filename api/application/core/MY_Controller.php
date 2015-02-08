<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
require(APPPATH.'libraries/REST_Controller.php');

class MY_Controller extends REST_Controller {
    public $abilities;
    public $model_name;

    public function __construct() {
        parent::__construct();

        if($this->model_name) {
        	$this->load->model($this->model_name);
        }
        
        // Load user library and pass it third-party (forum) cookie
        $this->load->library('user', array('cookie' => $this->input->cookie(config_item('third_party_cookie'))));
    }

    // Standard GET index allowing filtering by member and unit. Common across many controllers.
    public function index_filter_get($filter_key = FALSE, $filter_value = FALSE) {
        if( ! $this->user->permission($this->abilities['view_any'])
            && ($filter_key && ! $this->user->permission($this->abilities['view'], array($filter_key => $filter_value))) ) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        } else {
            $skip = $this->input->get('skip') ? $this->input->get('skip') : 0;
            $model = $this->{$this->model_name};
            
            // Filter by member
            if($filter_key == 'member') {
                $model->where($model->table . '.member_id', $filter_value);
            }

            // Filter by unit
            elseif($filter_key == 'unit') {
                $model->by_unit($filter_value);
                $model->select_member(); // include members
            }

            // No filter
            else {
                $model->select_member(); // include members
            }

            $records = nest($model->paginate('', $skip)->result_array());
            $count = $this->{$this->model_name}->total_rows;
            $this->response(array('status' => true, 'count' => $count, 'skip' => $skip, $model->table => $records));
        }
    }
}