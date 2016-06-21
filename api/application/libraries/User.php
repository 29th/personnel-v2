<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * $this->user->permission()
 * $this->user->member('short_name')
 * $this->user->member()
 * $this->user->permissions()
 * Note that permission() should work with not logged in users
 */
class User {
    private $cookie;
    private $forum_member_id;
    private $_member = array();
    private $_viewing = array('member' => array(), 'unit' => array());
    
    public function __construct($params) {
        //if(isset($params['cookie'])) $this->cookie = $params['cookie'];
        $this->load->library('Vanilla_Cookie');
    }
    
    /**
     * Enables the use of CI super-global without having to define an extra variable
     */
    public function __get($var) {
        return get_instance()->$var;
    }
    
    /**
     * Get specific member key or member data object
     * If not logged in yet, logs in and fetches member data
     */
    public function member($key = FALSE) {
        if( ! $this->logged_in()) return FALSE;
        
        // If we haven't fetched member data yet, fetch it
        if(empty($this->_member)) {
            $this->load->model('member_model');
            $this->load->model('assignment_model');
            $this->_member = nest($this->member_model->where('members.forum_member_id', $this->forum_member_id)->get()->row_array());
            $this->_member['events'] = $this->add_user_events($this->_member['unit']);
            $this->_member['forum_member_id'] = $this->forum_member_id; // In case the member wasn't found
            $this->_member['classes'] = isset($this->_member['id']) ? $this->assignment_model->get_classes($this->_member['id']) : array();
        }
        return $key !== FALSE ? (isset($this->_member[$key]) ? $this->_member[$key] : null) : $this->_member;
    }
    
    /**
     * Ensures user is logged in
     * Returns forum_member_id
     */
    public function logged_in() {
        // If we've already done this, return the user id
        if(isset($this->forum_member_id)) return $this->forum_member_id;
        
        // Otherwise, check if third-party (forum) cookie is set
        /*if($this->cookie) {
            // Parse cookie
            list($user_id, $password) = unserialize($this->cookie);
            //$user_id = 6804; // DEBUG
            //$user_id = 81683; // DEBUG Non-existent member id
            //$user_id = 6; // Retired member
            // Verify user_id & password from cookie against forum DB
            if($this->authenticate($user_id, $password)) {
                // Verified - save the user_id of the user
                $this->forum_member_id = $user_id;
                return $this->forum_member_id;
            } else {
                // Didn't verify
                return FALSE;
            }
        } else {
            // No cookie set
            return FALSE;
        }*/
        if($user_id = $this->vanilla_cookie->GetIdentity()) {
            $this->forum_member_id = $user_id;
            return $this->forum_member_id;
        } else {
            return FALSE;
        }
        
    }
    
    /**
     * Verify user_id and password against forums db
     * As seen in SMF's Load.php line 366
     */
    public function authenticate($user_id, $password) {
        return true; // DEBUG
        $forums_db = $this->load->database('forums', TRUE);
        $query = $forums_db->query('SELECT id_member FROM smf_members WHERE id_member = ' . $user_id . ' AND SHA1(CONCAT(passwd, password_salt)) = "' . $password . '"');
        $num_rows = $query->num_rows();
        $forums_db->close();
        return $num_rows ? true : false;
    }
    
    /*public function permissions0($member_id = FALSE, $unit_id = FALSE) {
        $permissions = array(
            'class_permissions' => $this->get_class_permissions()
            ,'unit_permissions' => $this->get_unit_permissions()
        );
        if($member_id) $permissions = array_merge($permissions, array('viewing_member_permissions' => $this->get_viewing_member_permissions($member_id)));
        if($unit_id) $permissions = array_merge($permissions, array('viewing_unit_permissions' => $this->get_viewing_unit_permissions($unit_id)));
        return $permissions;
    }*/
    
    public function permissions($member_id = FALSE, $unit_id = FALSE) {
        $permissions = array();
        
        if($member_id) {
            $this->merge_permissions($permissions, $this->get_viewing_member_permissions($member_id));
        }
        else if($unit_id) {
            $this->merge_permissions($permissions, $this->get_viewing_unit_permissions($unit_id));
        }
        // Make sure neither were 0
        else if($member_id == FALSE && $unit_id == FALSE) {
            // Class Permissions
            $this->merge_permissions($permissions, $this->get_class_permissions());
            
            // Get unit permissions and flatten them into a single array
            $unit_permissions = array_reduce(pluck('unit_permissions', $this->get_unit_permissions()), 'array_merge', array());
            $this->merge_permissions($permissions, $unit_permissions);
        }
        
        return array_values($permissions);
    }
    
    private function merge_permissions(&$destination, $source) {
        foreach($source as $permission) {
            if( ! isset($destination[$permission['ability']['abbr']])) {
                $destination[$permission['ability']['abbr']] = $permission['ability'];
            }
        }
    }
    
    /**
     * Wrapper for outside use
     */
    /*public function permission($ability, $member_id = FALSE, $unit_id = FALSE) {
        if($member_id) return $this->unit_permission_on_member($ability, $member_id);
        if($unit_id) return $this->unit_permission_on_unit($ability, $unit_id);
        return ($this->class_permission($ability) || $this->unit_permission($ability));
    }*/
    
    /**
     * Wrapper for outside use
     * ex. $this->user->permission('profile_view', array('member' => $member_id))
     */
    public function permission($ability, $entity = FALSE) {
        if($entity && is_array($entity)) {
            if(isset($entity['member'])) {
                return $this->unit_permission_on_member($ability, $entity['member']);
            }
            if(isset($entity['unit'])) {
                return $this->unit_permission_on_unit($ability, $entity['unit']);
            }
        }
        return ($this->class_permission($ability) || $this->unit_permission($ability));
    }
    
    /**
     * Checks if user has a particular permission based on the classes of the units they're in
     */
    public function class_permission($ability) {
        $class_permissions = $this->get_class_permissions();
        
         // Test if any of the status permissions match $ability
        foreach($class_permissions as $permission) {
            if($permission['ability']['abbr'] == $ability) return TRUE;
        }
        return FALSE;
    }
    
    /**
     * Fetch or return already fetched class-based permissions
     */
    private function get_class_permissions() {
        // If already fetched, return them
        if(isset($this->_member['class_permissions'])) return $this->_member['class_permissions'];
        
        // Otherwise, fetch them
        $this->load->model('class_permission_model');
        // A user. Get user's class permissions
        if($this->logged_in()) {
            //$this->load->model('assignment_model');
            //$classes = $this->assignment_model->get_classes($this->member('id'));
            $classes = $this->member('classes');
            $this->_member['class_permissions'] = nest($this->class_permission_model->by_classes($classes)->get()->result_array());
        }
        // Otherwise, a guest. Get guest class permissions
        else {
            $this->_member['class_permissions'] = nest($this->class_permission_model->by_classes()->get()->result_array());
        }
        return $this->_member['class_permissions'];
    }
    
    /**
     * Checks if user has a particular permission based on the units they're in
     */
    public function unit_permission($ability) {
        if( ! $this->logged_in()) return FALSE; // Guests aren't assigned to units
        
        $unit_permissions = $this->get_unit_permissions();
        
        // Check if the user has the $ability from any of their assignments
        foreach($unit_permissions as $assignment) {
            foreach($assignment['unit_permissions'] as $permission) {
                if($permission['ability']['abbr'] == $ability) return TRUE;
            }
        }
        return FALSE;
    }
    
    /**
     * Fetch or return already fetched unit-based permissions
     */
    private function get_unit_permissions() {
        // If assignments already fetched, return them
        if(isset($this->_member['assignments'])) return $this->_member['assignments'];
        
        // Otherwise, fetch them
        $this->load->model('assignment_model');
        $this->load->model('unit_permission_model');
        
        $this->_member['assignments'] = nest($this->assignment_model->where('assignments.member_id', $this->member('id'))->by_date('now')->get()->result_array());
        
        // Get unit permissions for each assignment
        foreach($this->_member['assignments'] as $index => $assignment) {
            $this->_member['assignments'][$index]['unit_permissions'] = nest($this->unit_permission_model->by_unit($assignment['unit']['id'], $assignment['position']['access_level'])->get()->result_array());
        }
        return $this->_member['assignments'];
    }
    
    private function get_unit_permissions1() {
        // If assignments already fetched, return them
        if(isset($this->_member['unit_permissions'])) return $this->_member['unit_permissions'];
        
        // Otherwise, fetch them
        $this->load->model('assignment_model');
        $this->load->model('unit_permission_model');
        
        if( ! isset($this->_member['assignments'])) {
            $this->_member['assignments'] = nest($this->assignment_model->where('assignments.member_id', $this->member('id'))->by_date('now')->get()->result_array());
        }
        
        // Get unit permissions for each assignment
        $this->_member['unit_permissions'] = array();
        foreach($this->_member['assignments'] as $assignment) {
            $this->_member['unit_permissions'] = array_merge($this->_member['unit_permissions'], nest($this->unit_permission_model->by_unit($assignment['unit']['id'], $assignment['position']['access_level'])->get()->result_array()));
        }
        return $this->_member['unit_permissions'];
    }
    
    /**
     * Checks if user has a particular permission over a subordinate member based on the units they're in
     */
    public function unit_permission_on_member($ability, $member_id) {
        if( ! $this->logged_in()) return FALSE; // Guests aren't assigned to units
        
        $viewing_member_permissions = $this->get_viewing_member_permissions($member_id);
        
        // Test if any of the unit permissions match $ability
        foreach($viewing_member_permissions as $permission) {
            if($permission['ability']['abbr'] == $ability) return TRUE;
        }
        return FALSE;
    }
    
    /**
     * Fetch or return already fetched unit-based permissions over a particular member
     */
    private function get_viewing_member_permissions($member_id) {
        if(isset($this->_viewing['member']['id']) && $this->_viewing['member']['id'] === $member_id) return $this->_viewing['member']['permissions'];
        
        // Otherwise, fetch them
        $this->load->model('assignment_model');
        
        $this->_viewing['member']['id'] = $member_id;
        $this->_viewing['member']['assignments'] = nest($this->assignment_model->where('assignments.member_id', $member_id)->by_date('now')->get()->result_array());
        
        // Get array of paths, each exploded into an array of units
        $this->_viewing['member']['paths'] = array();
        foreach($this->_viewing['member']['assignments'] as $assignment) {
            $this->_viewing['member']['paths'][$assignment['unit']['id']] = preg_split('@/@', $assignment['unit']['path'], NULL, PREG_SPLIT_NO_EMPTY); // use preg_split to ignore empties
        }
        
        // Loop through each of the user's units and check if they're the same or a parent of any of the viewing member's
        $this->_viewing['member']['permissions'] = array();
        $unit_permissions = $this->get_unit_permissions(); // Get user's unit permissions
        foreach($unit_permissions as $assignment) {
            foreach($this->_viewing['member']['paths'] as $id => $path) {
                // If the same unit or a child unit
                if($assignment['unit']['id'] == $id || in_array($assignment['unit']['id'], $path)) {
                    $this->_viewing['member']['permissions'] = array_merge($this->_viewing['member']['permissions'], $assignment['unit_permissions']);
                    continue;
                }
            }
        }
        return $this->_viewing['member']['permissions'];
    }
    
    /**
     * Checks if user has a particular permission over a subordinate unit based on the units they're in
     */
    public function unit_permission_on_unit($ability, $unit_id) {
        if( ! $this->logged_in()) return FALSE; // Guests aren't assigned to units
        
        $viewing_unit_permissions = $this->get_viewing_unit_permissions($unit_id);
        
        // Test if any of the unit permissions match $ability
        foreach($viewing_unit_permissions as $permission) {
            if($permission['ability']['abbr'] == $ability) return TRUE;
        }
        return FALSE;
    }
    
    /**
     * Fetch or return already fetched unit-based permissions over a particular unit
     */
    private function get_viewing_unit_permissions($unit_id) {
        if(isset($this->_viewing['unit']['id']) && $this->_viewing['unit']['id'] === $unit_id) return $this->_viewing['unit']['permissions'];
        
        // Otherwise, fetch them
        $this->load->model('unit_model');
        
        $this->_viewing['unit'] = $this->unit_model->by_filter($unit_id)->get()->row_array();
        $path = preg_split('@/@', $this->_viewing['unit']['path'], NULL, PREG_SPLIT_NO_EMPTY); // use preg_split to ignore empties
        
        // Loop through each of the user's units and check if they're the same or a parent of this unit
        $this->_viewing['unit']['permissions'] = array();
        $unit_permissions = $this->get_unit_permissions();
        foreach($unit_permissions as $assignment) {
            if($assignment['unit']['id'] == $unit_id || in_array($assignment['unit']['id'], $path)) {
                $this->_viewing['unit']['permissions'] = array_merge($this->_viewing['unit']['permissions'], $assignment['unit_permissions']);
                continue;
            }
        }
        return $this->_viewing['unit']['permissions'];
    }
    
    private function add_user_events( $unit )
    {
        if (! $unit['id'] )
            return array();
        $unit_id_list = $unit['id'] . ( $unit['id'] <> 1 ? ',' . str_replace(' ',',',trim( str_replace('/',' ', $unit['path']))) : '' );
        $this->load->model('event_model');
        $events = $this->event_model->filter_for_user($unit_id_list)->get()->result_array();
        return nest( $events );
    }
}