<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Units extends MY_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->model('unit_model');
        $this->load->model('assignment_model');
        $this->load->model('discharge_model');
        //$this->load->model('permission_model');
    }
    
    /*
     * PRE-FLIGHT
     */
    public function index_options() { $this->response(array('status' => true)); }
    public function view_options() { $this->response(array('status' => true)); }
	
	/*
	  INDEX
	  Just passes to view_get() to consolidate similar functionality
	 */
	public function index_get($filter = FALSE) {
		$this->view_get($filter);
	}
    
    /*
	 * VIEW
     * Get a particular unit or list of units
     * &children=(true|false)   Include child units
     * &inactive=(true|false)     Include inactive units
     * &order=(priority|position) Order by
     * &historic=(true|false)   All members ever assigned, not just currently assigned ones
     */
    public function view_get($filter = FALSE) {
		// Must have permission to view any member's profile
		if( ! $this->user->permission('profile_view_any')) {
			$this->response(array('status' => false, 'error' => 'Permission denied'), 403);
		}
		// View record(s)
		else {
			$key = 'units'; // for api output
			
			// Get units, using ?children=true and inactive=true
			$units = $this->unit_model->by_filter($filter, $this->input->get('children') == 'true' ? TRUE : FALSE, $this->input->get('inactive') == 'true' ? TRUE : FALSE)
				->get()->result_array();
			
			// If results found
			if( ! empty($units)) 
			{
				// Get unit members if ?members=true
				if($this->input->get('members') == 'true') {
					$members = $this->assignment_model->by_unit($units[0]['id'], $this->input->get("children") ? TRUE : FALSE);
					if( $this->input->get("onDate") )
						$members = $members->by_date( $this->input->get("onDate") );
					elseif( ! $this->input->get('historic')) 
						$members = $members->by_date('now');
					
					if($this->input->get('distinct'))
						$members = $members->distinct_members();
					if($this->input->get('position'))
						$members = $members->by_position( $this->input->get('position') );
					$members = $members->order_by($this->input->get('order') ? $this->input->get('order') : ( $units[0]['class'] == 'Training' ? 'name'  : 'rank' ) );
					$members = nest($members->get()->result_array()); // Get members of this unit, including members of this unit's children, who are current
					$units = $this->members_in_parents($members, $units, 'unit_id', 'id', 'members', $this->input->get("flat") ? TRUE : FALSE);
					
					// Calculate number of unique members
					//$unique_members = (array_unique(pluck('id', pluck('member', $members))));
				}
				
				// If we got children, shuffle them
				if($this->input->get('children') == 'true') {
					// Shuffle into hierarchy
					$parent_id = $units[0]['parent_id'];
					$units = $this->sort_hierarchy($units, $parent_id);
				}
					
				// Give back an object instead of an array of objects if we filtered
				if($filter !== FALSE) {
					$key = 'unit';
					$units = $units[0];
					$units['breadcrumbs'] = $this->addUnitsBreadCrumbs($units['path'] . $units['id'] . '/');
				}
					
			}
			$this->response(array('status' => true, $key => $units));
		}
    }
	
	public function addUnitsBreadCrumbs( $unitPath = FALSE ) {
		if (!$unitPath || strlen( $unitPath ) <= 3 ) return array();
		$tempTab = explode( ' ', trim(str_replace( '/', ' ', substr( $unitPath , 2 ) )));
		$retTab = array();
		foreach( $tempTab as $key => $rec ) 
		{
			$tempTab[$key] = $this->db->query("SELECT `abbr`,`name` FROM `units` WHERE id =" . $tempTab[$key] )->result_array();
			$retTab[] = array( 'id' => str_replace(array('Co. HQ',' HQ'), array('',''), $tempTab[$key][0]['abbr']), 'name' => str_replace(', ', '', substr( $tempTab[$key][0]['name'], strrpos( $tempTab[$key][0]['name'], ', ' ) ) ) );
		}
		return $retTab;
	}

	/*
	 * CREATE
	 */
	
	public function index_post() {
		$path = preg_split('@/@', $this->post('path'), NULL, PREG_SPLIT_NO_EMPTY); // use preg_split to ignore empties
		$parent_unit_id = $path[sizeof($path)-1];
		
        // Must have permission to create a unit within this unit or within any unit
        if( ! $this->user->permission('unit_add', array('unit' => $parent_unit_id)) && ! $this->user->permission('unit_add_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
		// Form validation
		else if($this->unit_model->run_validation('validation_rules_add') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->unit_model->validation_errors), 400);
        }
		// Create record
		else {
		    $this->usertracking->track_this();
			$data = whitelist($this->post(), array('name', 'abbr', 'path', 'order', 'timezone', 'class', 'active'));
			$insert_id = $this->unit_model->save(NULL, $data);
			$this->response(array('status' => $insert_id ? true : false, 'unit' => $insert_id ? $this->unit_model->get_by_id($insert_id) : null));
		}
	}
    
    /**
     * UPDATE
     */
	public function view_post($filter) {
		$path = preg_split('@/@', $this->post('path'), NULL, PREG_SPLIT_NO_EMPTY); // use preg_split to ignore empties
		$parent_unit_id = $path[sizeof($path)-1];
		
		// Get unit ID
		if(is_numeric($filter)) {
		    $unit_id = $filter;
		}
		else {
		    $unit = $this->unit_model->by_filter($filter)->get()->row_array();
		    $unit_id = isset($unit['id']) ? $unit['id'] : NULL;
		}
        
		// Must have permission to create a unit within this unit and within the proposed unit or within any unit
		if(( ! $this->user->permission('unit_add', array('unit' => $unit_id)) || ! $this->user->permission('unit_add', array('unit' => $parent_unit_id))) && ! $this->user->permission('unit_add_any')) {
			$this->response(array('status' => false, 'error' => 'Permission denied'), 403);
		}
		// Form validation
		else if($this->unit_model->run_validation('validation_rules_edit') === FALSE) {
            $this->response(array('status' => false, 'error' => $this->unit_model->validation_errors), 400);
        }
		// Update record
		else {
		    $this->usertracking->track_this();
			$data = whitelist($this->post(), array('name', 'abbr', 'path', 'order', 'timezone', 'class', 'active'));
			$result = $this->unit_model->save($unit_id, $data);
			$this->response(array('status' => $result ? true : false, 'unit' => $this->unit_model->get_by_id($unit_id)));
		}
	}
    
	/**
	 * DELETE
	 */
    public function view_delete($filter) {
		// Get unit ID
		if(is_numeric($filter)) {
		    $unit_id = $filter;
		}
		else {
		    $unit = $this->unit_model->by_filter($filter)->get()->row_array();
		    $unit_id = isset($unit['id']) ? $unit['id'] : NULL;
		}
		// Must have permission to delete this type of record for this member or for any member
		if( ! $this->user->permission('unit_delete', array('unit' => $unit_id)) && ! $this->user->permission('unit_delete_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
		// Delete record
		else {
		    $this->usertracking->track_this();
            $this->unit_model->delete($unit_id);            
            $this->response(array('status' => true));
        }
    }
    
	/**
	 * UNIT ATTENDANCE
	 */
    public function attendance_get($filter) {
        $this->load->model('attendance_model');
        
		// Get unit ID
		if(is_numeric($filter)) {
		    $unit_id = $filter;
		}
		else {
		    $unit = $this->unit_model->by_filter($filter)->get()->row_array();
		    $unit_id = isset($unit['id']) ? $unit['id'] : NULL;
		}
        
		// Must have permission to view this type of record for this member or for any member
		if( ! $this->user->permission('unit_stats', array('unit' => $unit_id)) && ! $this->user->permission('unit_stats_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
		// View records
		else {
			$skip = $this->input->get('skip') ? $this->input->get('skip') : 0;
			$attendance = nest($this->attendance_model->by_unit($unit_id)->paginate('', $skip)->result_array());
			$count = $this->attendance_model->total_rows;
			$this->response(array('status' => true, 'count' => $count, 'skip' => $skip, 'attendance' => $attendance));
		}
    }
    
	/**
	 * UNIT STATS
	 */
    public function stats_get($filter) {
        $this->load->model('attendance_model');
		// Get unit ID
	    $unit = $this->unit_model->by_filter($filter)->get()->row_array();
		if(is_numeric($filter)) {
		    $unit_id = $filter;
		}
		else {
		    $unit_id = isset($unit['id']) ? $unit['id'] : NULL;
		}
        
		// Must have permission to view this type of record for this member or for any member
		if( false && !$this->user->permission('unit_stats', array('unit' => $unit_id)) && ! $this->user->permission('unit_stats_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
		// View records
		else {
			$cSql = 
			"(SELECT DISTINCT m.id AS `member|id`, r.abbr AS `member|rank`, m.last_name AS `member|last_name`" .
			", p.id AS `position|id`, p.name AS `position|name`, p.ait AS `position|ait`".
			", u.id AS `unit|id`, u.abbr AS `unit|abbr`, u.name AS `unit|name`, u.path AS `unit|path`, u.order AS `unit|order`, u.class AS `unit|class`" .
			", (SELECT Round( ( SUM(attended) / COUNT(1) )*100 ) FROM attendance AS a LEFT JOIN events AS e ON a.event_id = e.id WHERE a.member_id = m.id AND e.mandatory = 1 AND DATEDIFF( NOW( ) , e.datetime ) <30 ) as `percentage|d30`" .
			", (SELECT Round( ( SUM(attended) / COUNT(1) )*100 ) FROM attendance AS a LEFT JOIN events AS e ON a.event_id = e.id WHERE a.member_id = m.id AND e.mandatory = 1 AND DATEDIFF( NOW( ) , e.datetime ) <60 ) as `percentage|d60`" .
			", (SELECT Round( ( SUM(attended) / COUNT(1) )*100 ) FROM attendance AS a LEFT JOIN events AS e ON a.event_id = e.id WHERE a.member_id = m.id AND e.mandatory = 1 AND DATEDIFF( NOW( ) , e.datetime ) <90 ) as `percentage|d90`" .
			", (SELECT Round( ( SUM(attended) / COUNT(1) )*100 ) FROM attendance AS a LEFT JOIN events AS e ON a.event_id = e.id WHERE a.member_id = m.id AND e.mandatory = 1 ) as `percentage|dall` " .
			"FROM members AS m " .
			"LEFT JOIN assignments AS a ON m.id = a.member_id " .
			"LEFT JOIN positions AS p ON a.position_id = p.id " .
			"LEFT JOIN ranks AS r ON m.rank_id = r.id " .
			"LEFT JOIN units AS u ON a.unit_id = u.id " .
			"LEFT JOIN awardings AS aw ON aw.member_id = m.id AND aw.award_id = 22 " .
			"WHERE a.end_date IS NULL AND a.unit_id IN (SELECT id FROM units AS u WHERE u.active=1 AND (u.id = $unit_id OR u.path LIKE '%/$unit_id/%') ) ".
			"ORDER BY `u`.`class`,".
				" (CASE WHEN `u`.`abbr` = 'Bn. Hq' THEN '00001' WHEN `u`.`abbr` = 'Rsrv S1' THEN '00002' ELSE `u`.`abbr` END), `p`.`order` DESC, `m`.`rank_id` DESC, `a`.`start_date` ASC ) as `aaa` ";
			
			$stats1 = nest( $this->db->get($cSql)->result_array() );
			$stats = array();
			
			switch ($unit['game']) {
				case 'RS': $aFillter = 'ro2'; break;
				case 'DH': $aFillter = 'dh'; break;
				case 'Arma 3': $aFillter = 'a3'; break;
				default: $aFillter = 'xx'; break;
			}

			$res = ( $this->db->get("(SELECT DISTINCT `weapon` FROM `standards` WHERE game='" . $unit['game'] . "' ) wl")->result_array() );
			$wpn_list = array( 'EIB' => '', 'SLT' => '' );
			foreach ( $res as $row )
				$wpn_list[ str_replace( array('RS','ARMA'), array('',''), $row['weapon'] ) ] = '';

			foreach ( $stats1 as $val  ) {
				//getting data about badges and tics
//				$readiness = array('badges' => array(), 'tics' => array());  //for tests
				$readiness = $this->get_readiness( $val['member']['id'], $val['unit']['id'], $unit['game'] );
				$val['readiness'] = $wpn_list;
				//now we fill in the array with appropriate data

				foreach ( $readiness['badges'] as $badge )
				{
					if ( $badge['code'] == 'eib')
					{
						$val['readiness']['EIB'] = 'EIB';
					}
					if ( $badge['code'] == 'anpdr')
					{
						$val['readiness']['SLT'] = 'NCO';
					}
					elseif ( strpos( $badge['name'], ': Automatic Rifle (' )  )
					{
						if (!$val['readiness']['Automatic Rifle']) $val['readiness']['Automatic Rifle'] = substr( $badge['name'], 0, strpos( $badge['name'], ' ') );
					}
					elseif ( strpos( $badge['name'], ': Rifle (' )  )
					{
						if (!$val['readiness']['Rifle']) $val['readiness']['Rifle'] = substr( $badge['name'], 0, strpos( $badge['name'], ' ') );
					}
					elseif ( strpos( $badge['name'], ': Machine Gun (' )  )
					{
						if (!$val['readiness']['Machine Gun']) $val['readiness']['Machine Gun'] = substr( $badge['name'], 0, strpos( $badge['name'], ' ') );
					}
					elseif ( strpos( $badge['name'], ': Armor (' )  )
					{
						if (!$val['readiness']['Armor']) $val['readiness']['Armor'] = substr( $badge['name'], 0, strpos( $badge['name'], ' ') );
					}
					elseif ( strpos( $badge['name'], ': Bazooka (' )  )
					{
						if (!$val['readiness']['Combat Engineer']) $val['readiness']['Combat Engineer'] = substr( $badge['name'], 0, strpos( $badge['name'], ' ') );
					}
					elseif ( strpos( $badge['name'], ': Submachine Gun (' )  )
					{
						if (!$val['readiness']['Submachine Gun']) $val['readiness']['Submachine Gun'] = substr( $badge['name'], 0, strpos( $badge['name'], ' ') );
					}
					elseif ( strpos( $badge['name'], ': Sniper (' )  )
					{
						if (!$val['readiness']['Sniper']) $val['readiness']['Sniper'] = substr( $badge['name'], 0, strpos( $badge['name'], ' ') );
					}
					elseif ( strpos( $badge['name'], ': Mortar (' )  )
					{
						if (!$val['readiness']['Mortar']) $val['readiness']['Mortar'] = substr( $badge['name'], 0, strpos( $badge['name'], ' ') );
					}
					elseif ( strpos( $badge['name'], ': Pilot (' )  )
					{
						if (!$val['readiness']['Pilot']) $val['readiness']['Pilot'] = substr( $badge['name'], 0, strpos( $badge['name'], ' ') );
					}
				}
				
				foreach ( $readiness['tics'] as $tic )
				{
					$wpn = str_replace( array('RS','ARMA'), array('',''), $tic['weapon'] );
					if (!$val['readiness'][$wpn])
						$val['readiness'][$wpn] = strval( round(($tic['licz']/$tic['suma'])*100) . '%' );
					elseif ( $this->badge_order( $val['readiness'][$wpn], $tic['badge'] ) )
						$val['readiness'][$wpn] .= ' + ' . strval( round(($tic['licz']/$tic['suma'])*100) . '%' );
				}

				$stats[$val['unit']['abbr']][] = $val; 
//				$stats[$val['unit']['abbr']] = 'x';
			}
			
			$this->response(array( 'ait_list' => $wpn_list, 'status' => true, 'stats' => $stats ));
		}
    }
    
    private function badge_order( $a , $b )
    {
    	if ( $b == 'Marksman' || $a == 'Expert' || $a == 'EIB' ) return false;
    	if ( $b == 'Expert' ) return true;
    	if ( $a == 'Marksman' && ( $b == 'Sharpshooter' || $b == 'Expert' ) ) return true;
    	if ( $a == 'Sharpshooter' && $b == 'Expert' ) return true;
    	return false;
    }
    
    private function get_readiness( $member_id, $unit_id, $aFillter ) 
    {
		$this->discharge_model->where('type !=','Honorable');
		$this->discharge_model->where('discharges.member_id',$member_id);
    	$this->discharge_model->order_by('date DESC');
		$gdDate = $this->discharge_model->get()->result_array();
		$gdDate = ( sizeof($gdDate) ? $gdDate[0]['date'] : null );

    	$bSQL = "
    		(SELECT a.id AS `id`, a.title AS `name`,  a.code AS `code`, a.game AS `game`
    		FROM `awardings` AS aw
    		LEFT JOIN `awards` AS a ON aw.award_id = a.id
    		WHERE aw.member_id = $member_id
				AND (a.game = '$aFillter' OR a.id = 22 OR a.id = 111 )" . ( $gdDate ? " AND aw.date > '$gdDate' "  : '') . "
			ORDER BY a.game, aw.date DESC
    	) AS bb";
    	$badges = $this->db->get($bSQL)->result_array();

    	$qSQL = "
    		(SELECT 
    			COUNT(1) AS `licz`, 
    			(SELECT COUNT(1) FROM `standards` AS `s1` WHERE `s1`.`game`=`s`.`game` AND `s1`.`weapon`=`s`.`weapon` AND `s1`.`badge` = `s`.`badge`) AS `suma`, 
    			`game`, 
    			`weapon`, 
    			`badge` FROM `qualifications` AS `q`
			LEFT JOIN `standards` AS `s` ON `q`.`standard_id` = `s`.`id`
			WHERE `q`.`member_id` = $member_id
				AND (`s`.`game` = '$aFillter' OR `s`.`weapon` = 'EIB' OR `s`.`weapon` = 'SLT')
			GROUP BY `game`, `weapon`, `badge` ORDER BY `game`, `weapon`, `badge`) qq`"; //Yes, "qq" should have apostrophy in front but framework is dumb
    	$qualifications = $this->db->get($qSQL)->result_array();

    	return array( 'badges' => $badges, 'tics' => $qualifications );	
    }
    
    /**
     * UNIT DISCHARGES
     */
    
    public function discharges_get($filter) {
        $this->load->model('discharge_model');
        
		// Get unit ID
		if(is_numeric($filter)) {
		    $unit_id = $filter;
		}
		else {
		    $unit = $this->unit_model->by_filter($filter)->get()->row_array();
		    $unit_id = isset($unit['id']) ? $unit['id'] : NULL;
		}
        
		// Must have permission to view this type of record for this member or for any member
		if( ! $this->user->permission('unit_stats', array('unit' => $unit_id)) && ! $this->user->permission('unit_stats_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
		// View records
        else {
			$skip = $this->input->get('skip') ? $this->input->get('skip') : 0;
			$discharges = nest($this->discharge_model->by_unit($unit_id)->paginate('', $skip)->result_array());
			$count = $this->discharges->total_rows;
			$this->response(array('status' => true, 'count' => $count, 'skip' => $skip, 'discharges' => $discharges));
        }
    }
    
    /**
     * AWOLs
     * TODO: Add day param
     */
    public function awols_get($filter) {
        $this->load->model('attendance_model');
        $days = $this->input->get('days') ? (int) $this->input->get('days') : 30;
        
		// Get unit ID
		if(is_numeric($filter)) {
		    $unit_id = $filter;
		}
		else {
		    $unit = $this->unit_model->by_filter($filter)->get()->row_array();
		    $unit_id = isset($unit['id']) ? $unit['id'] : NULL;
		}
        
		// Must have permission to view this type of record for this member or for any member
		if( ! $this->user->permission('unit_stats', array('unit' => $unit_id)) && ! $this->user->permission('unit_stats_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
		// View records
		else 
		{
			$members = pluck('member|id', $this->assignment_model->by_date('now')->by_unit($unit_id, TRUE)->get()->result_array()); // Include children
			$awols = nest($this->attendance_model->awols($members, $days, true)->get()->result_array());
			$grouped_and_sorted = $this->sort_awols($this->group_awols($awols));
			$this->response(array('status' => true, 'awols' => $grouped_and_sorted));
		}
    }
    /**
     * Helper Function
     * Put each member into parent's members array according to a key
     */
    private function members_in_parents($members, $parents, $member_key, $parent_key, $array_name, $is_flat) {
        // Ensure each parent has a members array (for api happiness)
        foreach($parents as &$parent) $parent[$array_name] = array();
        
        // Put each member in the appropriate parent
        foreach($members as $member) {
            foreach($parents as &$parent) {
                if($parent[$parent_key] == $member[$member_key]) {
                    unset($member[$member_key]); // Redundant
                    iF ( $is_flat )
                      array_push($parents[0], $member);
                    else
                      array_push($parent[$array_name], $member);
                    break;
                }
            }
        }
        return $parents;
    }
    
    /**
     * Helper Function
     * Shuffle array into hierarchy based on parent_id
     * When initially called, the $parent_id field should be the parent_id of the top-level item, typically null or 0
     */
    private function sort_hierarchy($input, $parent_id, $output = array()) {
        $output = array();
        foreach($input as $key => $item) {
            if($item['id'] === $parent_id || $item['parent_id'] === $parent_id) {
                unset($input[$key]);
                $item['children'] = $this->sort_hierarchy($input, $item['id'], $output);
                $output[] = $item;
                if($item['id'] === $parent_id) break;
            }
        }
        return $output;
    }
    
    private function group_awols($awols) {
        $grouped = array();
        foreach($awols as $awol) {
            if( ! isset($grouped[$awol['member']['id']]))
            	$grouped[$awol['member']['id']] = array('member' => $awol['member'], 'dates' => array());
            if( ! isset($grouped[$awol['member']['id']]['dates'][$awol['event']['date']]))
            	$grouped[$awol['member']['id']]['dates'][$awol['event']['date']] = array('date' => $awol['event']['date'], 'events' => array());
            array_push($grouped[$awol['member']['id']]['dates'][$awol['event']['date']]['events'], $awol['event']);
        }
        foreach ( $grouped as $gKey => $gArr )
           $grouped[$gKey]['dates'] = array_values($gArr['dates']) ;
         
        return array_values($grouped);
    }
    
    private function sort_awols($awols) {
        usort($awols, function($a, $b) {
            $countA = count($a['dates']);
            $countB = count($b['dates']);
            return ($countA === $countB ? 0 : ($countA < $countB ? 1 : -1));
        });
        return $awols;
    }
}