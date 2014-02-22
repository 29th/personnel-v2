<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Ability_model extends CRUD_Model {
    public $table = 'abilities';
    public $primary_key = 'abilities.id';
}