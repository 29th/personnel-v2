<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Recruits_model extends MY_Model 
{
    public $table = 'enlistments';
//    public $primary_key = 'enlistments.recruiter_member_id';
    
    public function default_select() 
    {
        $this->db->select("enlistments.member_id AS `member|id`")
            ->select("enlistments.id AS `enl|id` ")
            ->select("enlistments.date AS `enl|date` ")
            ->select("enlistments.recruiter_member_id AS `recruiter|recruiter_id` ")
            ->select("(SELECT abbr FROM ranks WHERE id = (SELECT new_rank_id FROM promotions WHERE member_id = enlistments.recruiter_member_id ORDER BY date DESC LIMIT 1 ) )  AS `recruiter|rank` ")
            ->select("mem2.last_name AS `recruiter|last_name` ")
            ->select("(SELECT abbr FROM ranks WHERE id = (SELECT new_rank_id FROM promotions WHERE member_id = enlistments.member_id ORDER BY date DESC LIMIT 1 ) )  AS `member|rank` ")
            ->select("members.`first_name`  AS `member|first_name` ")
            ->select("members.`middle_name` AS `member|middle_name` ")
            ->select("members.`last_name` AS `member|last_name` ")
            ->select("units.abbr AS `tp|tp` ")
            ->select("units.id AS `tp|id` ");
    }
    
    public function default_join() 
    {
        $this->db->join('units', 'units.id = enlistments.unit_id', 'left')
            ->join('members', 'members.id = enlistments.member_id', 'left')
            ->join('members AS mem2', 'mem2.id = enlistments.recruiter_member_id', 'left');
    }
    
    public function default_order_by() 
    {
        $this->db->order_by('units.abbr DESC');
    }

    public function default_from() 
    {
        $this->db->order_by('enlistments');
    }

    public function default_where() 
    {
        $this->db->where('enlistments.status','Accepted');
    }
    
    public function by_member($member_id) 
    {
        $this->db->where('enlistments.recruiter_member_id', $member_id );
    }

    public function by_unit($unit_id) {}
    
    public function select_member() {}
}