<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Award_model extends CRUD_Model {
    public $table = 'awards';
    public $primary_key = 'awards.id';
}