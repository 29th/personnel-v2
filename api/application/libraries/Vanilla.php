<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

use GuzzleHttp\Client;

class Vanilla {
    const PUBLIC_MEMBER_GROUP = 8; // These are vanilla IDs
    const COMMISSIONED_OFFICER_GROUP = 73;
    const HONORABLY_DISCHARGED_GROUP = 80;
    
    private $vanilla_db;
    
    public function __construct() {
        $this->vanilla_db = $this->load->database('vanilla', TRUE);
        $access_token = getenv('FORUMS_ACCESS_TOKEN');
        $this->client = new Client([
            'base_uri' => getenv('FORUMS_BASE_URL') . '/api/v2/',
            'headers' => [ 'Authorization' => 'Bearer ' . $access_token ]
        ]);
    }
    
    /**
     * Enables the use of CI super-global without having to define an extra variable
     */
    public function __get($var) {
        return get_instance()->$var;
    }

    /**
     * Update Member Roles
     * For each active assignment, fetches the forum roles and sets them in the forum, erasing any other roles
     */
    public function update_roles($member_id) {
        $this->load->model('member_model');
        $this->load->model('assignment_model');
        $this->load->model('unit_role_model');
        $this->load->model('class_role_model');
        $this->load->model('discharge_model');

        $roles = array();
        
        // Get member info
        $member = nest($this->member_model->get_by_id($member_id));
        
        // If no forum_member_id, there's nothing to do
        if( ! $member['forum_member_id']) {
            //$this->response(array('status' => false, 'error' => 'Member does not have a corresponding forum user id'), 400);
            return FALSE;
        }
        
        // Get all of the member's assignments
        $assignments = nest($this->assignment_model->where('assignments.member_id', $member_id)->order_by('priority')->by_date()->get()->result_array());
        
        $classes = array_unique(array_map(function($row) {
            return $row['unit']['class'];
        }, $assignments));
        
        // For each assignment, get the corresponding forum roles for the assignment's access level
        foreach($assignments as $assignment) {
            $assignment_roles = $this->unit_role_model->by_unit($assignment['unit']['id'], $assignment['position']['access_level'])->get()->result_array();
            if( ! empty($assignment_roles)) {
                $roles = array_merge($roles, pluck('role_id', $assignment_roles));
            }
        }
        
        // Get forum roles for classes that member is a part of
        $class_roles = $this->class_role_model->by_classes($classes)->get()->result_array();
        if( ! empty($class_roles)) {
            $roles = array_merge($roles, pluck('role_id', $class_roles));
        }
        
        //If not assigned anywhere let's check if member had been HDed
        if (empty($roles) || $roles[0] == self::PUBLIC_MEMBER_GROUP)
        {
            $this->discharge_model->where('discharges.member_id',$member_id);
            $discharge = $this->discharge_model->get()->result_array();
            if ( $discharge && $discharge[0]['type'] == "Honorable")
                $roles[] = self::HONORABLY_DISCHARGED_GROUP;
        }
        
        //Adding for officers
        $rank = $member['rank']['abbr'];
        if( $rank == '2Lt.' || $rank == '1Lt.' || $rank == 'Cpt.' || $rank == 'Maj.' || $rank == 'Lt. Col.' || $rank == 'Col.' )
        {
            $roles[] = self::COMMISSIONED_OFFICER_GROUP;//$this->get_commisioned_officer_role_id();
        }

        // Eliminate duplicates
        $roles = array_values(array_unique($roles));
        
        if( ! empty($roles)) {
            $path = 'users/' . $member['forum_member_id'];
            $data = [ 'roleID' => $roles ];
            $response = $this->client->patch($path, [ 'json' => $data ]);
            if ($response->getStatusCode() != 200) {
                return FALSE;
            }
        }
        return $roles;
    }
    
    /**
     * Find the steam id associated with the forum member account if it exists
     */
    public function update_display_name($member_id) {
        $this->load->model('member_model');
        
        // Get member info
        $member = nest($this->member_model->get_by_id($member_id));

        // If no forum_member_id, there's nothing to do
        if( ! $member['forum_member_id']) {
            //$this->response(array('status' => false, 'error' => 'Member does not have a corresponding forum user id'), 400);
            return FALSE;
        }
        
        if ( $member["unit"]["id"]) 
            $newMemberName = str_replace("/","",$member['short_name']);
        else 
        {
            $this->load->model('discharge_model');
            $this->discharge_model->where('discharges.member_id',$member_id);
                
            $disc = $this->discharge_model->get()->result_array();
            if ( $disc && $disc[0]['type'] == "Honorable")
                $newMemberName = str_replace("/","",$member['short_name']) . " [Ret.]";
            else
                $newMemberName = str_replace("/","",$member['rank']['name'] . " " . $member['full_name']);
            
            
        }
        
        $path = 'users/' . $member['forum_member_id'];
        $data = [ 'name' => $newMemberName ];
        $response = $this->client->patch($path, [ 'json' => $data ]);
        if ($response->getStatusCode() != 200) {
            return FALSE;
        }
        return TRUE;
    }
    
    public function get_steam_id($user_id) {
        return str_replace( 'https://steamcommunity.com/openid/id/', '', $this->vanilla_db->query('SELECT `Value` FROM `GDN_UserMeta` WHERE `Name` = \'Plugin.steamprofile.SteamID64\' AND `UserID` = ' . (int) $user_id)->row_array());
    }
    
    public function get_role_list() {
        $response = $this->client->get('roles');
        return json_decode($response->getBody(), true);
    }

    public function get_user_ip($member_id) {
        $res = $this->vanilla_db->query('SELECT `AllIPAddresses` FROM GDN_User WHERE `UserID` = ' . (int) $member_id)->row_array();
        
        $arr = ( isset( $res['AllIPAddresses'] ) ? explode( ',', $res['AllIPAddresses'] ) : [] );
        $arr2 = [];
        foreach( $arr as $ip )
        {
            if ( strpos( $ip, '0.0.0') === false && substr_count( $ip, '.')==3 )
            {
                $res2 = $this->vanilla_db->query('SELECT `UserID`,`Name` FROM GDN_User WHERE `AllIPAddresses` LIKE \'%' . $ip . '%\' AND `UserID` <> ' . (int) $member_id)->result_array();
                $arr2[] = array('ip' => $ip,'users' => $res2);
            }
        }
        return $arr2;
    }

    public function get_user_email($member_id) {
        $response = $this->client->get('users/' . $member_id);
        $data = json_decode($response->getBody(), true);
        return $data['email'];
    }

    public function get_user_bday($member_id) {
        $res = $this->vanilla_db->query('SELECT `DateOfBirth` FROM GDN_User WHERE `UserID` = ' . (int) $member_id)->row_array();
        return ( $res ? $res['DateOfBirth'] : '' );
    }

    public function get_ban_disputes( $roid ) {
        $res = $this->vanilla_db->query("
            SELECT 
                `DiscussionID` AS `id`, 
                `Name` AS `name`, 
                `DateInserted` AS `start`, 
                `DateLastComment` AS 'last' 
            FROM `GDN_Discussion` 
            WHERE `CategoryID`=92 AND `DiscussionID` IN (
                SELECT `DiscussionID` 
                FROM GDN_Discussion 
                WHERE `Body` LIKE '%$roid%' 
                UNION 
                SELECT `DiscussionID` 
                FROM GDN_Comment 
                WHERE `Body` LIKE '%$roid%'
            )
            ORDER BY `DateLastComment` DESC
            " )->result_array();
        return nest($res);//( $res ? $res['DiscussionID'] : '' );
    }

}
