<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Alerts_model extends MY_Model {
    public $table = 'members';
    public $primary_key = 'members.id';
    
    public function default_select($member_id = FALSE) {
        $this->db->select(
          "SQL_CALC_FOUND_ROWS `members`.`id` AS `member|id`, " . 
          "CONCAT(ranks.`abbr`, ' ', IF(members.`name_prefix` != '', CONCAT(members.`name_prefix`, ' '), ''), members.`last_name`) AS `member|short_name`, " .
          "COALESCE(`aocc_awardings`.`aocc_count`, 0) AS `aocc_count`, ".
          "COALESCE(`ww1v_awardings`.`ww1v_count`, 0) AS `ww1v_count`"
        , FALSE); // SQL_CALC_FOUND_ROWS allows a COUNT after the query
        $this->filter_join('ranks', 'ranks.id = members.rank_id', 'left');
        $this->filter_join('(SELECT member_id, count(1) AS aocc_count FROM awardings WHERE awardings.award_id = 10 GROUP BY awardings.member_id) AS aocc_awardings', 'aocc_awardings.member_id = members.id', 'left');
        $this->filter_join('(SELECT member_id, count(1) AS ww1v_count FROM awardings WHERE awardings.award_id = 61 GROUP BY awardings.member_id) AS ww1v_awardings', 'ww1v_awardings.member_id = members.id', 'left');
        $this->order_by('ranks.id DESC, members.id DESC');
    }

/*    
    public function default_where() 
    {
        $this->db->where('awardings.award_id',10); //AOCC
    }
*/    
}