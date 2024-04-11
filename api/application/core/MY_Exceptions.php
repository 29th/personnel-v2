<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class MY_Exceptions extends CI_Exceptions {
  // Disable showing errors on the page (only log them instead)
  function show_php_error($severity, $message, $filepath, $line) {
    return;
  }
}
