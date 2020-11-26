<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

use Firebase\JWT\JWT;

class Forums_Cookie {
  const ALGORITHM = 'HS256';

  private $CookieName;
  private $SecretKey;
  private $ForumsUser;

  public function __construct() {
    $this->CookieName = getenv('FORUMS_COOKIE_NAME');
    $this->SecretKey = getenv('FORUMS_SECRET_KEY');

    if (empty($this->CookieName)) {
      throw new Exception('Forums cookie name is empty.', 500);
    } else if (empty($this->SecretKey)) {
      throw new Exception('Forums secret key is empty.', 500);
    }
  }

  public function getForumsUser() {
    if (!is_null($this->ForumsUser)) {
      return $this->ForumsUser;
    }

    if (array_key_exists($this->CookieName, $_COOKIE)) {
      $token = $_COOKIE[$this->CookieName];
      $decoded = $this->decode($token);
      if (array_key_exists('sub', $decoded)) {
        $this->ForumsUser = [
          'id' => $decoded['sub'],
          'email' => $decoded['name']
        ];
      }
    }

    return $this->ForumsUser;
  }

  private function decode($token) {
    try {
      $payload = JWT::decode($token, $this->SecretKey, [self::ALGORITHM]);
      return (array) $payload;
    } catch (Exception $e) {
      error_log("JWT error: " . $e->getMessage());
    }
  }
}
