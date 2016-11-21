<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Alerts_model extends MY_Model {
    public $table = 'members';
    public $primary_key = 'members.id';
    
    public function default_select($member_id = FALSE) {
        $this->db->select(
          "SQL_CALC_FOUND_ROWS `members`.`id` AS `member|id`, " . 
          "CONCAT(ranks.`abbr`, ' ', IF(members.`name_prefix` != '', CONCAT(members.`name_prefix`, ' '), ''), members.`last_name`) AS `member|short_name`, " .
          "0 as aocc_count, 0 AS ww1v_count, ".
          "COALESCE(`aocc_awardings`.`aocc_list`, '') AS `aocc_list`, ".
          "COALESCE(`ww1v_awardings`.`ww1v_list`, '') AS `ww1v_list`, ".
          "COALESCE(`cabs_awardings`.`cab_lvl`, 0) AS `cab_lvl`, ".
          "COALESCE(`recuits`.`rec_cnt`, 0) AS `rec_cnt`, ".
          "last_enl_date"
        , FALSE); // SQL_CALC_FOUND_ROWS allows a COUNT after the query
    }

    public function default_join($member_id = FALSE) {
        $this->filter_join('ranks', 'ranks.id = members.rank_id', 'left');
        $this->filter_join('(SELECT member_id, GROUP_CONCAT(date) AS aocc_list FROM awardings WHERE awardings.award_id = 10 GROUP BY awardings.member_id) AS aocc_awardings', 'aocc_awardings.member_id = members.id', 'left');
        $this->filter_join('(SELECT member_id, GROUP_CONCAT(date) AS ww1v_list FROM awardings WHERE awardings.award_id = 61 GROUP BY awardings.member_id) AS ww1v_awardings', 'ww1v_awardings.member_id = members.id', 'left');
        $this->filter_join('(SELECT member_id, Max(award_id)-27 AS cab_lvl FROM awardings WHERE awardings.award_id IN (28,29,30,31,32) GROUP BY awardings.member_id) AS cabs_awardings', 'cabs_awardings.member_id = members.id', 'left');
        $this->filter_join('(SELECT recruiter_member_id AS id, Count(1) as rec_cnt, Max(date) AS last_enl_date FROM enlistments WHERE status="Accepted" AND recruiter_member_id IS NOT NULL GROUP BY recruiter_member_id) AS recuits', 'recuits.id = members.id', 'left');
    }

    public function default_order_by($member_id = FALSE) {
        $this->order_by('ranks.id DESC, members.id DESC');
    }
}