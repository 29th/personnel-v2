<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

define('DAY', 60*60*24);

class Alerts extends MY_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->model('assignment_model');
        $this->load->model('discharge_model');
    }
    public $model_name = 'alerts_model';
    public $abilities = array(
        'view_any' => 'event_view_any',
        'view' => 'event_view'
    );
    
    /**
     * PRE-FLIGHT
     */
    public function index_options() { $this->response(array('status' => true)); }
    public function view_options() { $this->response(array('status' => true)); }
    
/*
    public function index_get($filter_key = FALSE, $filter_value = FALSE) {
        if( ! $this->user->permission($this->abilities['view_any'])
            && ($filter_key && ! $this->user->permission($this->abilities['view'], array($filter_key => $filter_value))) ) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        } else {
            $skip = $this->input->get('skip') ? $this->input->get('skip') : 0;
            $model = $this->alerts_model;
            $ass_model = $this->assignment_model;
            
            // Filter by unit
            if($filter_key == 'unit') {$model->by_unit2($filter_value);}
            
            
            $model->select_member('right'); // include members
            $model->get();

            $records = nest($model->result_array());
            $aoccs = array();

            //Getting duration counted by units of 6 months to compare to number of AOCCs already awarded
            foreach ( $records as $klucz => $rec_obj)
            {
                $ass_model->where('assignments.member_id', $rec_obj['member']['id'] );
                $assignments = nest($ass_model->order_by('priority')->get()->result_array());
                list($duration, $discharge_date) = $this->calculate_duration($assignments, $rec_obj['member']['id']);
                $records[$klucz]['member']['duration'] = floor( $duration/182.625 );
//                  print_r( array( $records[$klucz]['member']['duration'], (int)$records[$klucz]['aocc_count'] ) );
                if ( $records[$klucz]['member']['duration'] > (int)$rec_obj['aocc_count'] )
                {
                  $aoccs[] = $records[$klucz];
                }
            }
            
            $count = sizeof( $aoccs );//$this->alerts_model->total_rows;
            $this->response(array(
                'status' => true, 
                'count' => $count, 
                'alerts' => array( 'aoccs' => $aoccs ),
                'all_recs' => $records,
                'all_cnt' => sizeof( $records )
            ));
        }
    }
*/

    public function index_get($filter_key = FALSE, $filter_value = FALSE) {
        if( ! $this->user->permission($this->abilities['view_any'])
            && ($filter_key && ! $this->user->permission($this->abilities['view'], array($filter_key => $filter_value))) ) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        } else {
//            $skip = $this->input->get('skip') ? $this->input->get('skip') : 0;
            $model = $this->alerts_model;
            $ass_model = $this->assignment_model;
            
            //
            $cabs_levels = array(
                  1 => 2,
                  2 => 5,
                  3 => 10,
                  4 => 20
                );

            // Filter by unit
            if($filter_key == 'unit') {$model->by_unit2($filter_value);}

            $model->get();
            
            $records = nest($model->result_array());
            $aoccs = $aqbs = $cabs = array();

            //Getting duration counted by units of 6 months to compare to number of AOCCs already awarded
            foreach ( $records as $klucz => $rec_obj)
            {
                $ass_model->where('assignments.member_id', $rec_obj['member']['id'] );
                $assignments = nest($ass_model->order_by('priority')->get()->result_array());
                list($duration, $discharge_date) = $this->calculate_duration($assignments, $rec_obj['member']['id']);
                $records[$klucz]['aoocs_due'] = floor( $duration/182.625 );
                $records[$klucz]['ww1vs_due'] = floor( $duration/730.5 );
                
                //check for AOCC/WWIVM
                if ( $records[$klucz]['aoocs_due'] > (int)$rec_obj['aocc_count'] || $records[$klucz]['ww1vs_due'] > (int)$rec_obj['ww1v_count'] )
                {
                  $aoccs[] = $records[$klucz];
                }
                
                //check for CABs
                //lvl5 is recruiter's badge, in that case no other CABs are awarded
                if ($rec_obj['last_enl_date'] > '2014-02-09' && $rec_obj['cab_lvl']<5) 
                {
                  if ( $rec_obj['rec_cnt'] >= $cabs_levels["4"] && $rec_obj['cab_lvl'] < 4 )  {
                    $cabs[] = array( 'current_cab_lvl' => $rec_obj['cab_lvl'], 'due_cab_level' => 4, 'rec_cnt' => $rec_obj['rec_cnt'], 'member' => $rec_obj['member'], 'last_enl_date' => $rec_obj['last_enl_date'] );
                  }
                  elseif (  $rec_obj['rec_cnt'] >= $cabs_levels["3"] && $rec_obj['cab_lvl'] < 3 ) {
                    $cabs[] = array( 'current_cab_lvl' => $rec_obj['cab_lvl'], 'due_cab_level' => 3, 'rec_cnt' => $rec_obj['rec_cnt'], 'member' => $rec_obj['member'], 'last_enl_date' => $rec_obj['last_enl_date'] );
                  }
                  elseif (  $rec_obj['rec_cnt'] >= $cabs_levels["2"] && $rec_obj['cab_lvl'] < 2 ) {
                    $cabs[] = array( 'current_cab_lvl' => $rec_obj['cab_lvl'], 'due_cab_level' => 2, 'rec_cnt' => $rec_obj['rec_cnt'], 'member' => $rec_obj['member'], 'last_enl_date' => $rec_obj['last_enl_date'] );
                  }
                  elseif (  $rec_obj['rec_cnt'] >= $cabs_levels["1"] && $rec_obj['cab_lvl'] < 1 ) {
                    $cabs[] = array( 'current_cab_lvl' => $rec_obj['cab_lvl'], 'due_cab_level' => 1, 'rec_cnt' => $rec_obj['rec_cnt'], 'member' => $rec_obj['member'], 'last_enl_date' => $rec_obj['last_enl_date'] );
                  }
                }
            }
            
            $count = sizeof( $aoccs );//$this->alerts_model->total_rows;
            $this->response(array(
                'status' => true, 
                'count' => $count, 
                'alerts' => array( 'aoccs' => $aoccs, 'aqbs' => '', 'cabs' => $cabs )/*,
                'all_recs' => $records, 
                'all_cnt' => sizeof( $records ) */
            ));
        }
    }

    private function calculate_duration($assignments, $member_id) {
        $days = array();
        $this->discharge_model->where('type !=','Honorable');
        $this->discharge_model->where('discharges.member_id',$member_id);
        $this->discharge_model->order_by('date DESC');
        $gdDate = $this->discharge_model->get()->result_array();
        $gdDate = ( sizeof($gdDate) ? $gdDate[0]['date'] : null );
        foreach($assignments as $assignment) 
        {
          if ( !($assignment['unit']['class'] == 'Training') ) 
          {  
            $start_date = strtotime($assignment['start_date']);
            $end_date = strtotime($assignment['end_date'] ?: format_date('now', 'mysqldate'));
            if ( format_date($start_date, 'mysqldate') > $gdDate ) 
            {  
              for($i = $start_date; $i < $end_date; $i = $i + DAY) 
              {
                $days[format_date($i, 'mysqldate')] = true;
              }
            }
          }
        }
        return array( sizeof($days), $gdDate );
    }

}