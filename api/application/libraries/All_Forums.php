<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once('Vanilla.php');

class All_Forums extends Vanilla {
  public function __construct() {
    parent::__construct();
    $this->load->library('discourse');
  }

  public function update_display_name($member_id) {
    try {
      $this->discourse->update_display_name($member_id);
    } catch (NoLinkedForumAccountException $e) {
      error_log($e->getMessage());
    } 
    return parent::update_display_name($member_id);
  }

  public function update_roles($member_id) {
    try {
      $this->discourse->update_roles($member_id);
    } catch (NoLinkedForumAccountException $e) {
      error_log($e->getMessage());
    }
    return parent::update_roles($member_id);
  }
}
