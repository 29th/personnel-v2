<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

use GuzzleHttp\Client;

class Discourse {
  const COMMISSIONED_OFFICER_GROUP = 73; // TODO: These are vanilla IDs
  const HONORABLY_DISCHARGED_GROUP = 80;

  private $client;
  private $username;

  public function __construct() {
    $base_uri = getenv('FORUMS_BASE_URL');
    $api_key = getenv('FORUMS_ACCESS_TOKEN');
    $api_username = 'system';

    $this->client = new Client([
      'base_uri' => $base_uri,
      'headers' => [
        'Api-Key' => $api_key,
        'Api-Username' => $api_username
      ],
      'http_errors' => false
    ]);
  }

  // Enables the use of CI super-global without having to define an extra variable
  public function __get($var) {
      return get_instance()->$var;
  }

  public function update_display_name($member_id) {
    $member = $this->get_member($member_id);
    $forum_user = $this->get_forum_user($member['forum_member_id']);

    $path = "u/{$forum_user['username']}";
    $payload = ['name' => $member['short_name']];
    $response = $this->client->put($path, ['json' => $payload]);

    if ($response->getStatusCode() != 200) {
      throw new Exception('Failed to update display name');
    }
  }

  public function get_role_list() {
    $response = $this->client->get('groups.json');
    $body = json_decode($response->getBody(), true);

    // Match key names of vanilla API
    return array_map(function ($row) {
      $row['roleID'] = $row['id'];
      unset($row['id']);
      return $row;
    }, $body['groups']);
  }

  public function update_roles($member_id) {
    $member = $this->get_member($member_id);
    $expected_roles = $this->get_expected_roles($member_id);
    $current_roles = $this->get_current_roles($member_id);

    $roles_to_delete = array_diff($current_roles, $expected_roles);
    array_walk($roles_to_delete, [$this, 'delete_role'], $member['forum_member_id']);

    $roles_to_add = array_diff($expected_roles, $current_roles);
    array_walk($roles_to_add, [$this, 'add_role'], $member['forum_member_id']);

    return [
      'forum_member_id' => $member['forum_member_id'],
      'expected_roles' => $expected_roles,
      'current_roles' => $current_roles,
      'roles_to_delete' => $roles_to_delete,
      'roles_to_add' => $roles_to_add
    ];
  }

  private function get_expected_roles($member_id) {
    $assignments = $this->get_assignments($member_id);
    $class_roles = $this->get_class_roles_for_assignments($assignments);
    $unit_roles = $this->get_unit_roles_for_assignments($assignments);
    $expected_roles = array_filter(array_merge($class_roles, $unit_roles));

    // TODO: Check whether this logic still makes sense in Discourse
    // (is there a public member group?)
    if (empty($assignments) && $this->is_honorably_discharged($member_id)) {
        $expected_roles[] = self::HONORABLY_DISCHARGED_GROUP;
    }

    if (strpos($member['rank']['grade'], 0, 2) == 'O-') {
      $expected_roles[] = self::COMMISSIONED_OFFICER_GROUP;
    }

    return $expected_roles;
  }

  private function get_current_roles($member_id) {
    $member = $this->get_member($member_id);
    $forum_user = $this->get_forum_user($member['forum_member_id']);

    // Omits automatic roles, e.g. trust groups
    function is_custom_role($role) {
      return ! $role['automatic'];
    }

    return pluck('id', array_filter($forum_user['groups'], is_custom_role));
  }

  private function delete_role($role, $index, $member_id) {
    error_log("Deleting role {$role} from member {$member_id}");
    $path = "/admin/users/{$member_id}/groups/{$role}";
    $response = $this->client->delete($path);

    if ($response->getStatusCode() != 200) {
      throw new Exception("Failed to delete role {$role} from member {$member_id}");
    }
  }

  private function add_role($role, $index, $member_id) {
    $path = "/admin/users/{$member_id}/groups";
    $payload = ['group_id' => $role];
    $response = $this->client->post($path, ['json' => $payload]);

    if ($response->getStatusCode() != 200) {
      throw new Exception("Failed to add role {$role} to member {$member_id}");
    }
  }

  private function get_assignments($member_id) {
    $this->load->model('assignment_model');

    return nest($this->assignment_model
      ->where('assignments.member_id', $member_id)
      ->order_by('priority')
      ->by_date()
      ->get()
      ->result_array());
  }

  private function get_class_roles_for_assignments($assignments) {
    $this->load->model('class_role_model');

    $classes = array_unique(array_map(function($row) {
      return $row['unit']['class'];
    }, $assignments));

    return pluck('role_id', $this->class_role_model
      ->by_classes($classes)
      ->get()
      ->result_array());
  }

  private function get_unit_roles_for_assignments($assignments) {
    $this->load->model('unit_role_model');

    $roles = [];
    foreach($assignments as $assignment) {
      $assignment_roles = pluck('role_id', $this->unit_role_model
        ->by_unit($assignment['unit']['id'], $assignment['position']['access_level'])
        ->get()
        ->result_array());
      if ( ! empty($assignment_roles)) {
        $roles = array_merge($roles, $assignment_roles);
      }
    }
    return $roles;
  }

  private function is_honorably_discharged($member_id) {
    $this->load->model('discharge_model');

    $discharges = $this->discharge_model->get()->result_array(); // sorted by date desc by default
    return ($discharges && $discharge[0]['type'] == 'Honorable');
  }

  private function get_member($member_id) {
    if ($this->member) return $this->member;

    $this->load->model('member_model');
    $this->member = nest($this->member_model->get_by_id($member_id));
    if ( ! $this->member['forum_member_id']) {
      throw new Exception('Member has no forum_member_id');
    }

    return $this->member;
  }

  private function get_forum_user($forum_member_id) {
    if ($this->forum_user) return $this->forum_user;

    $path = "/admin/users/{$forum_member_id}.json";
    $response = $this->client->get($path);
    if ($response->getStatusCode() != 200) {
      throw new Exception('Failed to get username');
    }

    $this->forum_user = json_decode($response->getBody(), true);
    return $this->forum_user;
  }
}
