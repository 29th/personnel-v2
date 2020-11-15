<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

use Firebase\JWT\JWT;

class Forum_Cookie {
  const ALGORITHM = 'HS256';

  private $CookieName;
  private $SecretKey;
  private $ForumUserId;

  public function __construct() {
    $this->CookieName = getenv('FORUM_COOKIE_NAME');
    $this->SecretKey = getenv('FORUM_SECRET_KEY');

    if (empty($this->CookieName)) {
      throw new Exception('Forum cookie name is empty.', 500);
    } else if (empty($this->SecretKey)) {
      throw new Exception('Forum secret key is empty.', 500);
    }
  }

  public function getForumUserId() {
    if (!is_null($this->ForumUserId)) {
      return $this->ForumUserId;
    }

    if (array_key_exists($this->CookieName, $_COOKIE)) {
      $token = $_COOKIE[$this->CookieName];
      $decoded = $this->decode($token);
      if (array_key_exists('sub', $decoded)) {
        $this->ForumUserId = $decoded['sub'];
      }
    }

    return $this->ForumUserId;
  }

  private function decode($token) {
    try {
      $payload = JWT::decode($token, $this->SecretKey, [self::ALGORITHM]);
      return (array) $payload;
    } catch (Exception $e) {
      // log error
    }
  }
}
