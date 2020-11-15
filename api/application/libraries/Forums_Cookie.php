<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

use Firebase\JWT\JWT;

class Forums_Cookie {
  const ALGORITHM = 'HS256';

  private $CookieName;
  private $SecretKey;
  private $ForumsUserId;

  public function __construct() {
    $this->CookieName = getenv('FORUMS_COOKIE_NAME');
    $this->SecretKey = getenv('FORUMS_SECRET_KEY');

    if (empty($this->CookieName)) {
      throw new Exception('Forums cookie name is empty.', 500);
    } else if (empty($this->SecretKey)) {
      throw new Exception('Forums secret key is empty.', 500);
    }
  }

  public function getForumsUserId() {
    if (!is_null($this->ForumsUserId)) {
      return $this->ForumsUserId;
    }

    if (array_key_exists($this->CookieName, $_COOKIE)) {
      $token = $_COOKIE[$this->CookieName];
      $decoded = $this->decode($token);
      if (array_key_exists('sub', $decoded)) {
        $this->ForumsUserId = $decoded['sub'];
      }
    }

    return $this->ForumsUserId;
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
