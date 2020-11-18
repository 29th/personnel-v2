<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

use GuzzleHttp\Client;

class Discourse {
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
      ]
    ]);
  }

  // Enables the use of CI super-global without having to define an extra variable
  public function __get($var) {
      return get_instance()->$var;
  }

  public function update_display_name($member_id) {
    $this->load->model('member_model');

    $member = $this->get_member($member_id);
    $username = $this->get_username($member['forum_member_id']);

    $path = "u/{$username}";
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

  private function get_member($member_id) {
    if ($this->member) return $this->member;

    $this->member = nest($this->member_model->get_by_id($member_id));
    if ( ! $this->member['forum_member_id']) {
      throw new Exception('Member has no forum_member_id');
    }

    return $this->member;
  }

  private function get_username($forum_member_id) {
    if ($this->username) return $this->username;

    $path = "/admin/users/{$forum_member_id}.json";
    $response = $this->client->get($path);
    if ($response->getStatusCode() != 200) {
      throw new Exception('Failed to get username');
    }

    $body = json_decode($response->getBody(), true);
    $this->username = $body['username'];
    return $this->username;
  }
}
