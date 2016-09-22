<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Tps extends MY_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->model('unit_model');
    }
    public $model_name = 'tp_model';
    public $paginate = true;
    public $abilities = array(
        'view_any' => 'profile_view_any',
        'view' => 'profile_view'
    );
    
    /**
     * PRE-FLIGHT
     */
    public function index_options() { $this->response(array('status' => true)); }
    public function view_options() { $this->response(array('status' => true)); }
    
    /**
     * INDEX
     * Handled by index_filter_get in MY_Controller
     */
    
    public function index_get($filter = FALSE) {
		// Must have permission to view any member's profile
		if( ! $this->user->permission('profile_view_any')) {
			$this->response(array('status' => false, 'error' => 'Permission denied'), 403);
		}
		// View record(s)
		else {
		    $skip = $this->input->get('skip') ? $this->input->get('skip', TRUE) : 0;
		    $tps = $this->tp_model;
		    if ( $this->input->get('future') ) 
		    {
		        $tps->only_future_tps();
		    }
		    if ( $this->input->get('active') ) 
		    {
		        $tps->only_active();
		    }
		    $records = nest( $tps->paginate('', $skip)->result_array() );
		    foreach ( $records as $key => $rec )
		    {
		        $records[$key]['bct_days'] = $this->tpAddDays( $rec['id'] );
		    }
		    $count = $tps->total_rows;
			$this->response(array( 'status' => true, 'count' => $count, 'skip' => $skip, 'tps' => $records ));
		}
    }//index_get


    public function view_get($filter = FALSE) {
		// Must have permission to view any member's profile
		if( ! $this->user->permission('profile_view_any')) {
			$this->response(array('status' => false, 'error' => 'Permission denied'), 403);
		}
		// View record(s)
		else {
			$key = 'units'; // for api output
			
			$units = $this->unit_model->by_filter($filter, FALSE, TRUE )->get()->result_array();
			
			// If results found
			if( ! empty($units)) 
			{
				$units = $units[0];
				$members = $this->assignment_model->by_unit($units['id'], FALSE);
				$members = $members->order_by($this->input->get('order') ? $this->input->get('order') : 'name' );
				$members = nest($members->get()->result_array()); // Get members of this unit, including members of this unit's children, who are current
				foreach( $members as $key => $member )
				{
					$members[$key]['att'] = $this->tpAddMemberAttendance( $units['id'], $member['member']['id'] );
					$members[$key]['enlistment'] = $this->tpAddMemberEnlistment( $units['id'], $member['member']['id'] );
				}
				$units['members'] = $members;
				
				//Add BCT days to unit
				$units['bct_days'] = $this->tpAddDays( $units['id'] );
				
			}
			
			$this->response(array( 'status' => true, 'tp' => $units ));
		}
    }//view_get
    
    
    private function tpAddDays( $unit_id ) {
        $res = $this->db->query("
            SELECT `id`,`datetime`,`reporter_member_id`, (SELECT Round(COALESCE( (SUM(`attended`)/COUNT(`attended`))*100, 0)) FROM `attendance` WHERE `event_id` = `events`.`id`) as day_perc  
            FROM `events` 
            WHERE `unit_id` = $unit_id 
            ORDER BY `datetime` ASC
            ")->result_array();
        $re = array( );
        $i = 1;
        foreach( $res as $key => $pos)  {
        	$re[$i++] = $pos;
        }
        return $re;
    }
    
    private function tpAddMemberAttendance( $unit_id, $member_id ) {
        $res = $this->db->query( "
            SELECT `event_id`,`attended` 
            FROM `attendance` 
            WHERE `event_id` IN ( SELECT `id` FROM `events` WHERE `unit_id` = $unit_id) AND `member_id` = $member_id
            " )->result_array();
        //Add missing days on active and future TPs
        for ($i = sizeof($res); $i < 5; $i++) {
             $res[] = array( 'event_id' => "0", 'attended' => "0" );
        }
    	return $res;
    }

    private function tpAddMemberEnlistment( $unit_id, $member_id ) {
        $cSql = "
            SELECT e.id, e.status, 
                e.recruiter_member_id AS `recruiter|id`, 
                CONCAT(r.abbr,' ',m.last_name) AS `recruiter|short`, 
                e.liaison_member_id AS `liaison|id`, 
                CONCAT(r2.abbr,' ',m2.last_name) AS `liaison|short`,
                (SELECT CONCAT(ru.abbr,' - ',ru.game,'/',ru.timezone) FROM assignments AS ra LEFT JOIN units AS ru ON ra.unit_id = ru.id WHERE ra.end_date IS NULL AND ru.class='Combat' AND ra.member_id = e.recruiter_member_id ORDER BY (ru.path) DESC LIMIT 1) AS `recruiter|assignement`
" . /*                poa_result, 
                passed */ "
            FROM `enlistments` AS e
            LEFT JOIN `members` AS m ON e.recruiter_member_id = m.id
            LEFT JOIN `ranks` AS r ON m.rank_id = r.id
            LEFT JOIN `members` AS m2 ON e.liaison_member_id = m2.id
            LEFT JOIN `ranks` AS r2 ON m2.rank_id = r2.id
            WHERE e.`unit_id` = $unit_id AND e.`member_id` = $member_id 
            ORDER BY e.id DESC
            LIMIT 1;" ;
        $res = nest($this->db->query( $cSql )->result_array());
//    	return ( $res ? $res[0] : "");
    	return ( $res ? $res[0] : array() );
    }
}