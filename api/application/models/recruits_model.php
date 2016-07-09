<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Recruits_model extends MY_Model 
{
    public $table = 'enlistments';
//    public $primary_key = 'enlistments.recruiter_member_id';
    
    public function default_select() 
    {
        $this->db->select("enlistments.member_id AS `member|id`")
            ->select("(SELECT abbr FROM ranks WHERE id = (SELECT new_rank_id FROM promotions WHERE member_id = enlistments.member_id ORDER BY date DESC LIMIT 1 ) )  AS `member|rank` ")
            ->select("mem1.`first_name`  AS `member|first_name` ")
            ->select("mem1.`middle_name` AS `member|middle_name` ")
            ->select("mem1.`last_name` AS `member|last_name` ")
            ->select("enlistments.id AS `enl|id` ")
            ->select("enlistments.date AS `enl|date` ")
            ->select("enlistments.recruiter_member_id AS `recruiter|recruiter_id` ")
            ->select("(SELECT abbr FROM ranks WHERE id = (SELECT new_rank_id FROM promotions WHERE member_id = enlistments.recruiter_member_id ORDER BY date DESC LIMIT 1 ) )  AS `recruiter|rank` ")
            ->select("mem2.last_name AS `recruiter|last_name` ")
            ->select("enlistments.status AS `enl|status` ")
            ->select("u1.abbr AS `tp|tp` ")
            ->select("u1.id AS `tp|id` ");
    }
    
    public function default_join() 
    {
        $this->db->join('units AS u1', 'u1.id = enlistments.unit_id', 'left')
            ->join('members AS mem1', 'mem1.id = enlistments.member_id', 'left')
            ->join('members AS mem2', 'mem2.id = enlistments.recruiter_member_id', 'left');
    }
    
    public function default_order_by() 
    {
        $this->db->order_by('u1.abbr DESC, enlistments.date DESC');
    }

    public function default_group_by() 
    {
    }

    public function default_where() 
    {
        $this->db->where('enlistments.status','Accepted');
    }
    
    public function by_member($member_id) 
    {
        $this->db->where('enlistments.recruiter_member_id', $member_id );
    }

    public function by_unit($unit_id) {
        if(is_numeric($unit_id)) {
            $this->filter_where('enlistments.recruiter_member_id IN ( SELECT member_id FROM `assignments` WHERE end_date IS NULL AND unit_id IN ( SELECT id FROM `units` WHERE (units.id = ' . $unit_id . ' OR units.path LIKE "%/' . $unit_id . '/%") ) )');
        } elseif($lookup = $this->getByUnitKey($unit_id)) {
            $this->filter_where('enlistments.recruiter_member_id IN ( SELECT member_id FROM `assignments` WHERE end_date IS NULL AND unit_id IN ( SELECT id FROM `units` WHERE (units.id = ' . $lookup['id'] . ' OR units.path LIKE "%/' . $lookup['id'] . '/%") ) )');
        }
        return $this;
    }

    public function recruited_only() {
        $this->filter_where('enlistments.recruiter_member_id IS NOT NULL');
    }

    public function select_member() {}
}