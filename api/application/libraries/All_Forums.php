<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once('Discourse.php');

class All_Forums extends Discourse {
  public function __construct() {
    parent::__construct();
    $this->load->library('vanilla');
  }

  public function update_display_name($member_id) {
    try {
      $this->vanilla->update_display_name($member_id);
    } catch (NoLinkedForumAccountException $e) {
      error_log($e->getMessage());
    } 
    return parent::update_display_name($member_id);
  }

  public function update_roles($member_id) {
    try {
      $this->vanilla->update_roles($member_id);
    } catch (NoLinkedForumAccountException $e) {
      error_log($e->getMessage());
    }
    return parent::update_roles($member_id);
  }

  public function link_to_personnel_user($member_id) {
    try {
      $this->vanilla->link_to_personnel_user($member_id);
    } catch (NoLinkedForumAccountException $e) {
      error_log($e->getMessage());
    }
    // no vanilla equivalent
  }
}
