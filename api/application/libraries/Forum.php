<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Forum {
  // Enables the use of CI super-global without having to define an extra variable
  public function __get($var) {
      return get_instance()->$var;
  }

  protected function get_expected_roles($member_id, $forum) {
    $special_roles = $this->get_special_roles($member_id, $forum);
    $unit_roles = $this->get_unit_roles($member_id, $forum);
    $expected_roles = array_filter(array_merge($special_roles, $unit_roles));

    return $expected_roles;
  }

  protected function get_special_roles($member_id, $forum) {
    $special_attributes = ['everyone'];

    if ($this->is_member($member_id)) {
      $special_attributes[] = 'member';
    }

    if ($this->is_honorably_discharged($member_id)) {
      $special_attributes[] = 'honorably_discharged';
    }

    if ($this->is_officer($member_id)) {
      $special_attributes[] = 'officer';
    }

    $this->load->model('special_role_model');

    return pluck('role_id', $this->special_role_model
      ->by_special_attributes($special_attributes)
      ->by_forum($forum)
      ->get()
      ->result_array());
  }

  protected function get_unit_roles($member_id, $forum) {
    $assignments = $this->get_assignments($member_id);
    $this->load->model('unit_role_model');

    $roles = [];
    foreach($assignments as $assignment) {
      $assignment_roles = pluck('role_id', $this->unit_role_model
        ->by_unit($assignment['unit']['id'], $assignment['position']['access_level'])
        ->by_forum($forum)
        ->get()
        ->result_array());
      if ( ! empty($assignment_roles)) {
        $roles = array_merge($roles, $assignment_roles);
      }
    }
    return $roles;
  }

  protected function get_assignments($member_id) {
    $this->load->model('assignment_model');

    return nest($this->assignment_model
      ->where('assignments.member_id', $member_id)
      ->order_by('priority')
      ->by_date()
      ->get()
      ->result_array());
  }

  protected function is_member($member_id) {
    $assignments = $this->get_assignments($member_id);

    $assignment_classes = array_map(function($assignment) {
      return $assignment['unit']['class'];
    }, $assignments);

    return in_array('Combat', $assignment_classes)
      || in_array('Staff', $assignment_classes);
  }

  protected function is_honorably_discharged($member_id) {
    $assignments = $this->get_assignments($member_id);

    $this->load->model('discharge_model');
    $discharges = $this->discharge_model
      ->where('discharges.member_id', $member_id)
      ->get()
      ->result_array(); // sorted by date desc by default

    return empty($assignments)
      && sizeof($discharges) > 0
      && $discharges[0]['type'] == 'Honorable';
  }

  protected function is_officer($member_id) {
    $member = $this->get_member($member_id);

    $officers = ['2Lt.', '1Lt.', 'Cpt.', 'Maj.', 'Lt. Col.', 'Col.'];
    return in_array($member['rank']['abbr'], $officers);
  }

  protected function get_member($member_id) {
    if ($this->member) return $this->member;

    $this->load->model('member_model');
    $this->member = nest($this->member_model->get_by_id($member_id));
    if ( ! $this->member['forum_member_id']) {
      throw new Exception('Member has no forum_member_id');
    }

    return $this->member;
  }
}
