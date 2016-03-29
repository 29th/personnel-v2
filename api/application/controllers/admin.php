<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Admin extends CI_Controller {
    public function __construct() {
        parent::__construct();
        $this->load->library('grocery_CRUD');
        
        // Load user library and pass it third-party (forum) cookie
        // Normally done by MY_Controller, but this is not a sub-class of that
        $this->load->library('user', array('cookie' => $this->input->cookie(config_item('third_party_cookie'))));
        
        if( ! $this->user->permission('admin') && ! $this->user->permission('admin-' . $this->router->method)) {
            die('Permission denied');
        }
        
        // Log changes
        $this->grocery_crud->callback_after_insert(array($this->usertracking, 'track_this'));
	    $this->grocery_crud->callback_after_update(array($this->usertracking, 'track_this'));
	    $this->grocery_crud->callback_before_delete(array($this->usertracking, 'track_this'));
    }
	
	private function output($output, $method = '') {
	    $output->method = $method;
	    $output->permissions = pluck('abbr', $this->user->permissions());
	    $this->load->view('admin.php', $output);
	}
	
	public function home() {
	    $this->load->helper('url');
	    $this->output(new stdClass());
	}
	
	public function abilities()
	{
	    $this->grocery_crud->set_table('abilities')
	        ->display_as('abbr', 'Abbreviation')
	        ->required_fields('name', 'abbr');
        $output = $this->grocery_crud->render();
 
        $this->output($output, 'abilities');
	}
	
	public function assignments()
	{
	    $this->grocery_crud->set_table('assignments')
	        ->columns('member_id', 'unit_id', 'position_id', 'start_date', 'end_date')
	        ->fields('member_id', 'unit_id', 'position_id', 'start_date', 'end_date')
	        ->required_fields('member_id', 'unit_id', 'position_id', 'start_date')
	        ->set_relation('member_id', 'members', '{last_name}, {first_name} {middle_name}')->display_as('member_id', 'Member')
	        ->set_relation('unit_id', 'units', 'abbr')->display_as('unit_id', 'Unit')
	        ->set_relation('position_id', 'positions', 'name')->display_as('position_id', 'Position');
        $this->grocery_crud->callback_after_insert(array($this, '_callback_assignments_after_change'));
	    $this->grocery_crud->callback_after_update(array($this, '_callback_assignments_after_change'));
	    $this->grocery_crud->callback_before_delete(array($this, '_callback_assignments_before_delete'));
        $output = $this->grocery_crud->render();
 
        $this->output($output, 'assignments');
	}
	
    // Update roles after change
	function _callback_assignments_after_change($data, $id = null) {
        $this->load->library('vanilla');
        $roles = $this->vanilla->update_roles($data['member_id']);
	}
	
	// This one has to be done before because after, the promotion record doesn't exist so we don't know which member to update...ugh
	function _callback_assignments_before_delete($id) {
	    $this->load->model('assignment_model');
	    $data = (array) $this->assignment_model->get_by_id($id);
	    $data = ! empty($data) ? nest($data) : $data;
	    
	    $this->assignment_model->save($id, array('end_date' => format_date('yesterday', 'mysqldate'))); // Set an end date in the past so the role update doesn't include this
	    
	    // Update roles
	    if($data['member']['id']) {
            $this->load->library('vanilla');
            $roles = $this->vanilla->update_roles($data['member']['id']);
	    }
	}
	
	public function attendance()
	{
	    $this->grocery_crud->set_table('attendance')
	        ->required_fields('event_id', 'member_id')
	        ->set_relation('event_id', 'events', '{datetime} {title}')->display_as('event_id', 'Event')
	        ->set_relation('member_id', 'members', '{last_name}, {first_name} {middle_name}')->display_as('member_id', 'Member');
        $output = $this->grocery_crud->render();
 
        $this->output($output, 'attendance');
	}
	
	public function awardings()
	{
	    $this->grocery_crud->set_table('awardings')
	        ->required_fields('member_id', 'date', 'award_id')
	        ->display_as('forum_id', 'Forum')
	        ->set_relation('member_id', 'members', '{last_name}, {first_name} {middle_name}')->display_as('member_id', 'Member')
	        ->set_relation('award_id', 'awards', 'title')->display_as('award_id', 'Award')
	        ->callback_after_insert(array($this, '_callback_awardings_after_update'))
	        ->callback_after_update(array($this, '_callback_awardings_after_update'))
	        ->callback_before_delete(array($this, '_callback_awardings_before_delete'));
        $output = $this->grocery_crud->render();
 
        $this->output($output, 'awardings');
	}
	
	public function _callback_awardings_after_update($data, $id = null) {
        $this->load->library('servicecoat');
	    
        // Update username
        $this->servicecoat->update($data['member_id']);
	}
	
	// This one has to be done before because after, the record doesn't exist so we don't know which member to update...ugh
	function _callback_awardings_before_delete($id) {
        $this->load->model('awarding_model');
        $this->load->library('servicecoat');
        
	    $data = (array) nest($this->awarding_model->members()->get_by_id($id));
        
        // Update coat
        $this->load->library('servicecoat');
        $this->servicecoat->update($data['member']['id']);
	}
	
	public function awards()
	{
	    $this->grocery_crud->set_table('awards')
	        ->required_fields('code', 'title');
        $output = $this->grocery_crud->render();
 
        $this->output($output, 'awards');
	}
	
	public function banlog()
	{
	    $this->grocery_crud->set_table('banlog')
	        ->columns('date', 'handle', 'roid', 'id_admin')
	        ->fields('date', 'handle', 'roid', 'uid', 'guid', 'ip', 'id_admin', 'id_poster', 'reason', 'comments')
	        ->required_fields('date', 'handle', 'roid', 'id_admin', 'reason')
	        ->display_as('roid', 'ROID')
	        ->display_as('uid', 'Unique ID')
	        ->display_as('guid', 'GUID')
	        ->display_as('ip', 'IP')
	        ->set_relation('id_admin', 'members', '{last_name}, {first_name} {middle_name}')->display_as('id_admin', 'Admin')
	        ->set_relation('id_poster', 'members', '{last_name}, {first_name} {middle_name}')->display_as('id_poster', 'Poster');
        $output = $this->grocery_crud->render();
 
        $this->output($output, 'banlog');
	}
	
	public function class_permissions()
	{
	    $this->grocery_crud->set_table('class_permissions')
	        ->required_fields('ability_id')
	        ->set_relation('ability_id', 'abilities', 'abbr')->display_as('ability_id', 'Ability');
        $output = $this->grocery_crud->render();
 
        $this->output($output, 'class_permissions');
	}
	
	public function class_roles()
	{
	    $this->grocery_crud->set_table('class_roles')
	        ->required_fields('role_id');
	    
        $this->load->library('vanilla');
        $roles = $this->role_list_to_dropdown($this->vanilla->get_role_list());
        
        $this->grocery_crud->field_type('role_id', 'dropdown', $roles)->display_as('role_id', 'Role');
        
        $output = $this->grocery_crud->render();
 
        $this->output($output, 'class_roles');
	}
	
	private function role_list_to_dropdown($roles) {
        $dropdown = array();
        foreach($roles as $role) {
            $dropdown[$role['RoleID']] = $role['Name'];
        }
        return $dropdown;
	}
	
	public function countries()
	{
	    $this->grocery_crud->set_table('countries')
	        ->display_as('abbr', 'Abbreviation')
	        ->required_fields('abbr', 'name');
        $output = $this->grocery_crud->render();
 
        $this->output($output, 'countries');
	}
	
	public function demerits()
	{
	    $this->grocery_crud->set_table('demerits')
	        ->required_fields('member_id', 'author_member_id', 'date', 'reason')
	        /*->field_type('forum_id', 'dropdown', array('1' => 'PHPBB', '2' => 'SMF', '3' => 'Vanilla'))*/->display_as('forum_id', 'Forum')
	        ->set_relation('member_id', 'members', '{last_name}, {first_name} {middle_name}')->display_as('member_id', 'Member')
	        ->set_relation('author_member_id', 'members', '{last_name}, {first_name} {middle_name}')->display_as('author_member_id', 'Author');
        $output = $this->grocery_crud->render();
 
        $this->output($output, 'demerits');
	}
	
	public function discharges()
	{
	    $this->grocery_crud->set_table('discharges')
	    	->columns('member_id', 'date', 'type', 'reason')
	        ->required_fields('member_id', 'date', 'type', 'reason')
	        /*->field_type('forum_id', 'dropdown', array('1' => 'PHPBB', '2' => 'SMF', '3' => 'Vanilla'))*/->display_as('forum_id', 'Forum')
	        ->set_relation('member_id', 'members', '{last_name}, {first_name} {middle_name}')->display_as('member_id', 'Member');
        $output = $this->grocery_crud->render();
 
        $this->output($output, 'discharges');
	}
	
	public function eloas()
	{
	    $this->grocery_crud->set_table('eloas')
	    	->columns('member_id', 'start_date', 'end_date', 'reason', 'availability')
	    	->fields('member_id', 'start_date', 'end_date', 'posting_date', 'reason', 'availability')
	    	->required_fields('member_id', 'start_date', 'end_date', 'posting_date')
	    	->order_by('posting_date', 'desc')
	        ->set_relation('member_id', 'members', '{last_name}, {first_name} {middle_name}')->display_as('member_id', 'Member');
        $output = $this->grocery_crud->render();
 
        $this->output($output, 'eloas');
	}
	
	public function enlistments()
	{
	    $this->grocery_crud->set_table('enlistments')
	    	->columns('member_id', 'date', 'unit_id', 'status')
	        ->required_fields('member_id', 'date')
	        /*->field_type('forum_id', 'dropdown', array('1' => 'PHPBB', '2' => 'SMF', '3' => 'Vanilla'))*/->display_as('forum_id', 'Forum')
	        ->set_relation('member_id', 'members', '{last_name}, {first_name} {middle_name}')->display_as('member_id', 'Member')
	        ->set_relation('liaison_member_id', 'members', '{last_name}, {first_name} {middle_name}')->display_as('liaison_member_id', 'Liaison')
	        ->set_relation('unit_id', 'units', 'abbr')->display_as('unit_id', 'TP')
	        ->set_relation('country_id', 'countries', 'abbr')->display_as('country_id', 'Country');
        $output = $this->grocery_crud->render();
 
        $this->output($output, 'enlistments');
	}
	
	public function events()
	{
	    $this->grocery_crud->set_table('events')
	        ->columns('datetime', 'unit_id', 'type', 'mandatory', 'server_id')
	        ->fields('datetime', 'unit_id', 'type', 'mandatory', 'server_id', 'report', 'reporter_member_id')
	        ->display_as('datetime', 'Date/time')
	        ->required_fields('datetime', 'unit_id', 'type')
	        ->set_relation('unit_id', 'units', 'abbr')->display_as('unit_id', 'Unit')
	        ->set_relation('server_id', 'servers', '{name} ({game})')->display_as('server_id', 'Server')
	        ->set_relation('reporter_member_id', 'members', '{last_name}, {first_name} {middle_name}')->display_as('reporter_member_id', 'Reporter');
        $output = $this->grocery_crud->render();
 
        $this->output($output, 'events');
	}
	
	public function finances()
	{
	    $this->grocery_crud->set_table('finances')
	        ->columns('date', 'member_id', 'vendor', 'amount_received', 'amount_paid', 'fee', 'notes')
	        ->required_fields('date') // not sure how to do OR here
	        /*->field_type('forum_id', 'dropdown', array('1' => 'PHPBB', '2' => 'SMF', '3' => 'Vanilla'))*/->display_as('forum_id', 'Forum')
	        ->set_relation('member_id', 'members', '{last_name}, {first_name} {middle_name}')->display_as('member_id', 'Member');
        $output = $this->grocery_crud->render();
 
        $this->output($output, 'finances');
	}
    
    public function members()
	{
        $crud = new grocery_CRUD();
        $crud->set_model('My_Grocery_model');
        
	    $crud->set_table('members')
	        ->set_subject('Member')
	        ->columns('last_name', 'first_name', 'middle_name', 'rank_id', 'country_id', 'steam_id', 'forum_member_id'/*, 'units', 'classes'*/)
	        ->fields('id', 'last_name', 'first_name', 'middle_name', 'forum_member_id', 'country_id', 'city', 'steam_id', 'email')
	        ->required_fields('last_name', 'first_name')
	        ->set_relation('country_id', 'countries', 'abbr')->display_as('country_id', 'Country')
	        ->set_relation('rank_id', 'ranks', 'abbr')->display_as('rank_id', 'Rank')
	        ->display_as('forum_member_id', 'Forum ID')
	        ->callback_column('steam_id', array($this, '_callback_members_steam_id'))
	        ->callback_after_update(array($this, '_callback_members_after_update'));
	    
	    // This seemed to delete assignments when I update a member for some reason...
	    //$crud->set_relation_n_n('units', 'assignments', 'units', 'member_id', 'unit_id', 'abbr', null, '(start_date <= CURDATE() OR start_date IS NULL) AND (end_date > CURDATE() OR end_date IS NULL)');
	    //$crud->set_relation_n_n('classes', 'assignments', 'units', 'member_id', 'unit_id', 'class', null, '(start_date <= CURDATE() OR start_date IS NULL) AND (end_date > CURDATE() OR end_date IS NULL)');
        
        // Log changes (not applied in constructor since this method doesn't use $this)
        /*$crud->callback_after_insert(array($this->usertracking, 'track_this'));
	    $crud->callback_after_update(array($this->usertracking, 'track_this'));
	    $crud->callback_before_delete(array($this->usertracking, 'track_this'));*/
 
        $output = $crud->render();
        $this->output($output, 'members');
	}
	
	public function _callback_members_steam_id($value, $row) {
	    return $value ? '<a href="http://steamcommunity.com/profiles/' . $value . '" target="_blank">' . $value . '</a>' : '';
	}
	
	public function _callback_members_after_update($data, $id = null) {
        $this->load->library('vanilla');
	    
        // Update username
        $this->vanilla->update_username($id);
	}
	
	/**
	 * Excluded because permissions not brought over
	 */
	/*public function notes()
	{
	    $this->grocery_crud->set_table('notes')
	        ->set_relation('subject_member_id', 'members', '{last_name}, {first_name} {middle_name}')->display_as('subject_member_id', 'Subject')
	        ->set_relation('author_member_id', 'members', '{last_name}, {first_name} {middle_name}')->display_as('author_member_id', 'Author');
        $output = $this->grocery_crud->render();
 
        $this->output($output, 'notes');
	}*/
	
	public function notes()
	{
	    $this->grocery_crud->set_table('notes')
	        ->columns('date_add', 'member_id', 'subject', 'access','content')
	        ->required_fields('member_id', 'author_member_id','subject', 'date_add','access')
	        ->display_as('forum_id', 'Forum')
	        ->set_relation('member_id', 'members', '{last_name}, {first_name} {middle_name}')->display_as('member_id', 'Member')
	        ->set_relation('author_member_id', 'members', '{last_name}, {first_name} {middle_name}')->display_as('author_member_id', 'Author');
        $output = $this->grocery_crud->render();
 
        $this->output($output, 'notes');
	}
    
	public function positions()
	{
	    $this->grocery_crud->set_table('positions')
	        ->columns('name', 'active', 'order', 'access_level')
	        ->required_fields('name', 'access_level')
	        ->field_type('access_level', 'dropdown', array('0' => 'Default', '5' => 'Elevated', '10' => 'Leadership'));
        $output = $this->grocery_crud->render();
 
        $this->output($output, 'positions');
	}
	
	public function promotions()
	{
	    $this->grocery_crud->set_table('promotions')
	        ->columns('member_id', 'date', 'old_rank_id', 'new_rank_id')
	        ->required_fields('member_id', 'date', 'old_rank_id', 'new_rank_id')
	        /*->field_type('forum_id', 'dropdown', array('1' => 'PHPBB', '2' => 'SMF', '3' => 'Vanilla'))*/->display_as('forum_id', 'Forum')
	        ->set_relation('member_id', 'members', '{last_name}, {first_name} {middle_name}')->display_as('member_id', 'Member')
	        ->set_relation('old_rank_id', 'ranks', 'abbr')->display_as('old_rank_id', 'Old Rank')
	        ->set_relation('new_rank_id', 'ranks', 'abbr')->display_as('new_rank_id', 'New Rank');
        $this->grocery_crud->callback_after_insert(array($this, '_callback_promotions_after_change'));
	    $this->grocery_crud->callback_after_update(array($this, '_callback_promotions_after_change'));
	    $this->grocery_crud->callback_before_delete(array($this, '_callback_promotions_before_delete'));
        $output = $this->grocery_crud->render();
 
        $this->output($output, 'promotions');
	}
	
	function _callback_promotions_after_change($data, $id = null) {
        $this->load->model('member_model');
        $this->load->model('promotion_model');
        $this->load->library('vanilla');
        
	    // Update member's rank to last one TODO: What about when the user has no promotions? (PFC demoted to Pvt)
        if($newest = nest($this->promotion_model->where('promotions.member_id', $data['member_id'])->limit(1)->get()->row_array())) {
            if(isset($newest['new_rank']['id'])) { // Make sure the query actually got a valid result
                $this->member_model->save($data['member_id'], array('rank_id' => $newest['new_rank']['id']));
            
                // Update username
                $this->vanilla->update_username($data['member_id']);
                
                // Update coat
                $this->load->library('servicecoat');
                $this->servicecoat->update($data['member_id']);
            }
        }
	}
	
	// This one has to be done before because after, the promotion record doesn't exist so we don't know which member to update...ugh
	function _callback_promotions_before_delete($id) {
        $this->load->model('member_model');
        $this->load->model('promotion_model');
        $this->load->library('vanilla');
        
	    $data = (array) $this->promotion_model->get_by_id($id);
        
	    // Update member's rank to last one TODO: What about when the user has no promotions? (PFC demoted to Pvt)
        if($data['member_id'] && $newest = nest($this->promotion_model->where(array('promotions.member_id' => $data['member_id'], 'promotions.id !=' => $data['id']))->limit(1)->get()->row_array())) {
            if(isset($newest['new_rank']['id'])) { // Make sure the query actually got a valid result
                $this->member_model->save($data['member_id'], array('rank_id' => $newest['new_rank']['id']));
            
                // Update username
                $this->vanilla->update_username($data['member_id']);
                
                // Update coat
                $this->load->library('servicecoat');
                $this->servicecoat->update($data['member_id']);
            }
        }
	}
	
	public function qualifications()
	{
	    $this->grocery_crud->set_table('qualifications')
	        ->required_fields('member_id', 'standard_id')
	        ->set_relation('member_id', 'members', '{last_name}, {first_name} {middle_name}')->display_as('member_id', 'Member')
	        ->set_relation('standard_id', 'standards', '({weapon}:{badge}) {description}')->display_as('standard_id', 'Standard')
	        ->set_relation('author_member_id', 'members', '{last_name}, {first_name} {middle_name}')->display_as('author_member_id', 'Author');
        $output = $this->grocery_crud->render();
 
        $this->output($output, 'qualifications');
	}
	
	public function ranks()
	{
	    $this->grocery_crud->set_table('ranks')
	        ->required_fields('name', 'abbr');
        $output = $this->grocery_crud->render();
 
        $this->output($output, 'ranks');
	}
	
	public function schedules()
	{
	    $this->grocery_crud->set_table('schedules')
	        ->required_fields('unit_id', 'type', 'day_of_week', 'hour_of_day')
	        ->set_relation('unit_id', 'units', 'abbr')->display_as('unit_id', 'Unit')
	        ->set_relation('server_id', 'servers', 'name')->display_as('server_id', 'Server');
        $output = $this->grocery_crud->render();
 
        $this->output($output, 'schedules');
	}
	
	public function servers()
	{
	    $this->grocery_crud->set_table('servers')
	        ->required_fields('name', 'abbr', 'address', 'game');
        $output = $this->grocery_crud->render();
 
        $this->output($output, 'servers');
	}
	
	public function standards()
	{
	    $this->grocery_crud->set_table('standards')
	        ->columns('weapon', 'game', 'badge', 'description')
	        ->required_fields('weapon', 'badge', 'description');
        $output = $this->grocery_crud->render();
 
        $this->output($output, 'standards');
	}
	
	public function units()
	{
	    $this->grocery_crud->set_table('units')
	        ->columns('name', 'abbr', 'path', 'order', 'game', 'timezone', 'class', 'active')
	        ->fields('id', 'name', 'abbr', 'path', 'order', 'game', 'timezone', 'class', 'active', 'steam_group_abbr', 'slogan', 'nickname','logo' )
	        ->required_fields('name', 'abbr', 'path', 'class')
	        ->display_as('abbr', 'Abbreviation')
	        ->display_as('steam_group_abbr', 'Steam Group')
	        ->display_as('slogan', 'Motto')
	        ->callback_after_update(array($this, '_callback_units_after_update'));
        $output = $this->grocery_crud->render();
 
        $this->output($output, 'units');
	}
	
	public function _callback_units_after_update($data, $id = null) {
		if($id && $data['active'] == 0) {
        	$this->load->model('assignment_model');

        	$assignments = pluck('id', $this->assignment_model->by_date('now')->by_unit($id)->get()->result_array());
			$this->assignment_model->save($assignments, array('end_date' => format_date('now', 'mysqldate')));
        }
	}
	
	public function unit_permissions()
	{
	    $this->grocery_crud->set_table('unit_permissions')
	        ->required_fields('unit_id', 'access_level', 'ability_id')
	        ->set_relation('unit_id', 'units', 'abbr')->display_as('unit_id', 'Unit')
	        ->set_relation('ability_id', 'abilities', 'abbr')->display_as('ability_id', 'Ability')
	        ->field_type('access_level', 'dropdown', array('0' => 'Default', '5' => 'Elevated', '10' => 'Leadership'));
        $output = $this->grocery_crud->render();
 
        $this->output($output, 'unit_permissions');
	}
	
	public function unit_roles()
	{
	    $this->grocery_crud->set_table('unit_roles')
	        ->required_fields('unit_id', 'access_level', 'role_id')
	        ->set_relation('unit_id', 'units', 'abbr')->display_as('unit_id', 'Unit')
	        ->field_type('access_level', 'dropdown', array('0' => 'Default', '5' => 'Elevated', '10' => 'Leadership'));
	    
        $this->load->library('vanilla');
        $roles = $this->role_list_to_dropdown($this->vanilla->get_role_list());
        
        $this->grocery_crud->field_type('role_id', 'dropdown', $roles)->display_as('role_id', 'Role');
        
        $output = $this->grocery_crud->render();
 
        $this->output($output, 'unit_roles');
	}

	public function weapon_passes()
	{
	    $this->grocery_crud->set_table('passes')
	        ->columns('add_date', 'member_id', 'start_date', 'end_date', 'type',  'reason')
	        ->fields('add_date', 'member_id', 'author_id', 'recruit_id', 'start_date', 'end_date', 'type', 'reason')
	        ->required_fields('add_date', 'member_id', 'author_id', 'start_date', 'end_date', 'type', 'reason')
	        ->display_as('type','Type of Pass')
	        ->display_as('add_date','Date of Adding')
			->set_relation('member_id', 'members', '{last_name}, {first_name} {middle_name}')->display_as('member_id', 'Member')
	        ->set_relation('author_id', 'members', '{last_name}, {first_name} {middle_name}')->display_as('author_id', 'Author')
	        ->set_relation('recruit_id', 'members', '{last_name}, {first_name} {middle_name}')->display_as('recruit_id', 'Recruit');
        $output = $this->grocery_crud->render();
 
        $this->output($output, 'weapon_passes');
	}
	
	
	/*
	 * USER TRACKING
	 * Read-only (editing disabled)
	 */
	public function usertracking()
	{
	    $this->grocery_crud->set_table('usertracking')
	        ->columns('datetime', 'user_identifier', 'request_uri', 'request_method', 'client_ip')
	        ->order_by('datetime', 'desc')
	        ->set_relation('user_identifier', 'members', '{last_name}, {first_name} {middle_name}')->display_as('user_identifier', 'Member')
	        ->display_as('session_id', 'Session')->display_as('request_uri', 'URL')->display_as('request_method', 'Method')->display_as('datetime', 'Date/time')
	        ->unset_add()->unset_edit()->unset_delete();
        $output = $this->grocery_crud->render();
 
        $this->output($output, 'usertracking');
	}
}