<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Vanilla {
    
    private $forums_db;
    
    public function __construct() {
        $this->forums_db = $this->load->database('forums', TRUE);
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
        
        //Adding for officers
        $rank = $member['rank']['abbr'];
        if( $rank == '2Lt.' || $rank == '1Lt.' || $rank == 'Cpt.' || $rank == 'Maj.' || $rank == 'Lt. Col.' || $rank == 'Col.' )
        {
            $roles[] = '73';//$this->get_commisioned_officer_role_id();
        }
        
        // Eliminate duplicates
        $roles = array_values(array_unique($roles));
        
        // Delete all of the user's roles from forums database ** by forum_member_id NOT member_id
        if( ! $this->forums_db->query('DELETE FROM `GDN_UserRole` WHERE `UserID` = ?', $member['forum_member_id'])) 
        {
            //$this->response(array('status' => false, 'error' => 'There was an issue deleting the user\'s old roles'));
            return FALSE;
        } 
        else 
        {
            
            // Insert new roles if there are any (there wouldn't be if member was discharged)
            if( ! empty($roles)) {
                $values = '(' . $member['forum_member_id'] . ', ' . implode('), (' . $member['forum_member_id'] . ', ', $roles) . ')';
                //die($values);
                if( ! $this->forums_db->query('INSERT INTO `GDN_UserRole` (`UserID`, `RoleID`) VALUES ' . $values)) {
                    //$this->response(array('status' => false, 'error' => 'There was an issue adding the user\'s roles'));
                    return FALSE;
                }
            }
            //$this->response(array('status' => true, 'roles' => $roles));
            return $roles; // Won't arrive here if insert failed. Should also arrive here if no roles to add (ie. discharged)
        }
    }
    
    /**
     * Find the steam id associated with the forum member account if it exists
     */
    public function get_steam_id($user_id) {
        return $this->forums_db->query('SELECT `Value` FROM `GDN_UserMeta` WHERE `UserID` = ' . (int) $user_id)->row_array();
    }
    
    public function update_username($member_id) {
        $this->load->model('member_model');
        
        // Get member info
        $member = nest($this->member_model->get_by_id($member_id));
        
        // If no forum_member_id, there's nothing to do
        if( ! $member['forum_member_id']) {
            //$this->response(array('status' => false, 'error' => 'Member does not have a corresponding forum user id'), 400);
            return FALSE;
        }
        
        return $this->forums_db->query('UPDATE GDN_User SET `Name` = ? WHERE UserID = ?', array(str_replace("/","",$member['short_name']), $member['forum_member_id']));
    }
    
    public function get_role_list() {
        return $this->forums_db->query('SELECT `RoleID`, `Name` FROM GDN_Role ORDER BY `Sort`')->result_array();
    }

    public function get_commisioned_officer_role_id() {
        return $this->forums_db->query('SELECT `RoleID` FROM GDN_Role WHEREx `name` = \'Commissioned Officer\'')->row_array()[0];
    }

}