<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once('Forum.php');
use GuzzleHttp\Client;

class Vanilla extends Forum {
    public $member_id_key = 'vanilla_forum_member_id';

    private $vanilla_db;
    
    public function __construct() {
        $this->vanilla_db = $this->load->database('vanilla', TRUE);
        $access_token = getenv('VANILLA_API_KEY');
        $this->client = new Client([
            'base_uri' => getenv('VANILLA_BASE_URL') . '/api/v2/',
            'headers' => [ 'Authorization' => "Bearer {$access_token}" ]
        ]);
    }
    
    public function update_roles($member_id) {
        $member = $this->get_member($member_id);
        $expected_roles = $this->get_expected_roles($member_id, 'vanilla');

        if (!empty($expected_roles)) {
            $path = "users/{$member[$this->member_id_key]}";
            $payload = ['roleID' => $expected_roles];
            $response = $this->client->patch($path, ['json' => $payload]);

            if ($response->getStatusCode() != 200) {
                throw new Exception("Failed to update member roles");
            }
        }

        return [
            'forum_member_id' => $member[$this->member_id_key],
            'expected_roles' => $expected_roles
        ];
    }
    
    /**
     * Find the steam id associated with the forum member account if it exists
     */
    public function update_display_name($member_id) {
        $this->load->model('member_model');
        
        // Get member info
        $member = nest($this->member_model->get_by_id($member_id));

        // If no forum_member_id, there's nothing to do
        if( ! $member[$this->member_id_key]) {
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
        
        $path = 'users/' . $member[$this->member_id_key];
        $data = [ 'name' => $newMemberName ];
        $response = $this->client->patch($path, [ 'json' => $data ]);
        if ($response->getStatusCode() != 200) {
            return FALSE;
        }
        return TRUE;
    }
    
    public function get_steam_id($member_id) {
        $member = $this->get_member($member_id);
        $user_id = $member[$this->member_id_key];
        return str_replace( 'https://steamcommunity.com/openid/id/', '', $this->vanilla_db->query('SELECT `Value` FROM `GDN_UserMeta` WHERE `Name` = \'Plugin.steamprofile.SteamID64\' AND `UserID` = ' . (int) $user_id)->row_array());
    }
    
    public function get_role_list() {
        $response = $this->client->get('roles');
        return json_decode($response->getBody(), true);
    }

    public function get_user_ip($member_id) {
        $member = $this->get_member($member_id);
        $forum_member_id = $member[$this->member_id_key];
        $res = $this->vanilla_db->query('SELECT `AllIPAddresses` FROM GDN_User WHERE `UserID` = ' . (int) $forum_member_id)->row_array();
        
        $arr = ( isset( $res['AllIPAddresses'] ) ? explode( ',', $res['AllIPAddresses'] ) : [] );
        $arr2 = [];
        foreach( $arr as $ip )
        {
            if ( strpos( $ip, '0.0.0') === false && substr_count( $ip, '.')==3 )
            {
                $res2 = $this->vanilla_db->query('SELECT `UserID`,`Name` FROM GDN_User WHERE `AllIPAddresses` LIKE \'%' . $ip . '%\' AND `UserID` <> ' . (int) $forum_member_id)->result_array();
                $arr2[] = array('ip' => $ip,'users' => $res2);
            }
        }
        return $arr2;
    }

    public function get_user_email($member_id) {
        $member = $this->get_member($member_id);
        $forum_member_id = $member[$this->member_id_key];
        $response = $this->client->get('users/' . $forum_member_id);
        $data = json_decode($response->getBody(), true);
        return $data['email'];
    }

    public function get_user_bday($member_id) {
        $member = $this->get_member($member_id);
        $forum_member_id = $member[$this->member_id_key];
        $res = $this->vanilla_db->query('SELECT `DateOfBirth` FROM GDN_User WHERE `UserID` = ' . (int) $forum_member_id)->row_array();
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
