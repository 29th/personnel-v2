<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once('Forum.php');
use GuzzleHttp\Client;

class Discourse extends Forum {
  public $member_id_key = 'forum_member_id';
  public $linked_user_field = '1';

  private $client;
  private $username;

  public function __construct() {
    $base_uri = getenv('DISCOURSE_BASE_URL');
    $api_key = getenv('DISCOURSE_API_KEY');
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

  public function update_display_name($member_id) {
    $member = $this->get_member($member_id);
    $forum_user = $this->get_forum_user($member[$this->member_id_key]);

    $path = "u/{$forum_user['username']}";
    $payload = ['name' => $member['short_name']];
    $response = $this->client->put($path, ['json' => $payload]);

    if ($response->getStatusCode() != 200) {
      throw new Exception('Failed to update display name');
    }
  }

  public function link_to_personnel_user($member_id) {
    $member = $this->get_member($member_id);
    $forum_user = $this->get_forum_user($member[$this->member_id_key]);

    $path = "u/{$forum_user['username']}";
    $payload = ['user_fields' => [$this->linked_user_field => $member_id]];
    $response = $this->client->put($path, ['json' => $payload]);

    if ($response->getStatusCode() != 200) {
      throw new Exception('Failed to link forum account to personnel user');
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
    $expected_roles = $this->get_expected_roles($member_id, 'discourse');
    $current_roles = $this->get_current_roles($member_id);

    $roles_to_delete = array_diff($current_roles, $expected_roles);
    array_walk($roles_to_delete, [$this, 'delete_role'], $member[$this->member_id_key]);

    $roles_to_add = array_diff($expected_roles, $current_roles);
    array_walk($roles_to_add, [$this, 'add_role'], $member[$this->member_id_key]);

    return [
      'forum_member_id' => $member[$this->member_id_key],
      'expected_roles' => $expected_roles,
      'current_roles' => $current_roles,
      'roles_to_delete' => $roles_to_delete,
      'roles_to_add' => $roles_to_add
    ];
  }

  public function get_steam_id($forum_member_id) {
    // noop
    return;
  }

  public function get_user_ip($member_id) {
    $member = $this->get_member($member_id);
    $forum_user = $this->get_forum_user($member[$this->member_id_key]);

    $ips = array_filter([
      $forum_user['registration_ip_address'],
      $forum_user['ip_address']
    ]);

    $formatted_ips = array_map(function ($ip) {
      $users = $this->get_users_by_ip($ip);
      return ['ip' => $ip, 'users' => $users];
    }, $ips);

    return $formatted_ips;
  }

  public function get_user_bday($member_id) {
    // noop
    return;
  }

  public function get_user_email($member_id) {
    $member = $this->get_member($member_id);
    $forum_user = $this->get_forum_user($member[$this->member_id_key]);

    $path = "/u/{$forum_user['username']}/emails.json";
    $response = $this->client->get($path);

    if ($response->getStatusCode() != 200) {
      throw new Exception("Failed to get email for forum member {$member[$this->member_id_key]}");
    }

    $body = json_decode($response->getBody(), true);

    return $body['email'];
  }

  public function get_ban_disputes($roid) {
    return;
  }

  private function get_users_by_ip($ip) {
    $path = "/admin/users/list.json";
    $response = $this->client->get($path, ['query' => ['ip' => $ip]]);

    if ($response->getStatusCode() != 200) {
      return; // not important enough to throw
    }

    $body = json_decode($response->getBody(), true);

    $ips_in_vanilla_format = array_map(function ($user) {
      return ['UserID' => $user['id'], 'Name' => $user['username']];
    }, $body);

    return $ips_in_vanilla_format;
  }

  private function get_current_roles($member_id) {
    $member = $this->get_member($member_id);
    $forum_user = $this->get_forum_user($member[$this->member_id_key]);

    // Omits automatic roles, e.g. trust groups
    function is_custom_role($role) {
      return ! $role['automatic'];
    }

    return pluck('id', array_filter($forum_user['groups'], is_custom_role));
  }

  private function delete_role($role, $index, $forum_member_id) {
    error_log("Deleting role {$role} from member {$forum_member_id}");
    $path = "/admin/users/{$forum_member_id}/groups/{$role}";
    $response = $this->client->delete($path);

    if ($response->getStatusCode() != 200) {
      throw new Exception("Failed to delete role {$role} from forum member {$forum_member_id}");
    }
  }

  private function add_role($role, $index, $forum_member_id) {
    $path = "/admin/users/{$forum_member_id}/groups";
    $payload = ['group_id' => $role];
    $response = $this->client->post($path, ['json' => $payload]);

    if ($response->getStatusCode() != 200) {
      throw new Exception("Failed to add role {$role} to forum member {$forum_member_id}");
    }
  }

  private function get_forum_user($forum_member_id) {
    if ($this->forum_user) return $this->forum_user;

    $path = "/admin/users/{$forum_member_id}.json";
    $response = $this->client->get($path);
    if ($response->getStatusCode() != 200) {
      throw new Exception("Failed to get username for user {$forum_member_id}");
    }

    $this->forum_user = json_decode($response->getBody(), true);
    return $this->forum_user;
  }
}
