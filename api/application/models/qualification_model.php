<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Qualification_model extends MY_Model {
    public $table = 'qualifications';
    public $primary_key = 'qualifications.id';
    
    public function validation_rules_add() {
        return array(
            array(
                'field' => 'member_id'
                ,'rules' => 'required|numeric'
            )
            ,array(
                'field' => 'standard_id'
                ,'rules' => 'required|numeric'
            )
        );
    }
    
    public function validation_rules_edit() {
        return array(
            array(
                'field' => 'member_id'
                ,'rules' => 'numeric'
            )
            ,array(
                'field' => 'standard_id'
                ,'rules' => 'numeric'
            )
        );
    }
    
    public function default_select() {
        $this->db->select('qualifications.id, qualifications.date')
            ->select('qualifications.author_member_id AS `author|id`')
            ->select('CONCAT(a_ranks.`abbr`, " ", IF(a_members.`name_prefix` != "", CONCAT(a_members.`name_prefix`, " "), ""), a_members.`last_name`) AS `author|short_name`', FALSE)
            ->select('qualifications.standard_id AS `standard|id`, s.weapon AS `standard|weapon`, s.badge AS `standard|badge`, s.description AS `standard|description`');
    }
    
    public function default_join() {
        $this->db->join('standards AS s', 's.id = qualifications.standard_id')
            ->join('members AS a_members', 'a_members.id = qualifications.author_member_id', 'left')
            ->join('ranks AS a_ranks', 'a_ranks.id = a_members.rank_id', 'left');
    }
    
    public function order_by() {
        $this->db->order_by('qualifications.date DESC');
    }

    public function by_unit($unit_id) {
        $this->select('qualifications.member_id AS `member|id`');
        $this->select('CONCAT(m_ranks.`abbr`, " ", IF(m_members.`name_prefix` != "", CONCAT(m_members.`name_prefix`, " "), ""), m_members.`last_name`) AS `member|short_name`', FALSE);
        $this->filter_join('assignments', 'assignments.member_id = ' . $this->table . '.member_id', 'left');
        $this->filter_join('units', 'units.id = assignments.unit_id');
        $this->filter_join('members AS m_members', 'm_members.id = qualifications.member_id', 'left');
        $this->filter_join('ranks AS m_ranks', 'm_ranks.id = m_members.rank_id', 'left');

        if(is_numeric($unit_id)) {
            $this->filter_where('(units.id = ' . $unit_id . ' OR units.path LIKE "%/' . $unit_id . '/%")');
        } elseif($lookup = $this->getByUnitKey($unit_id)) {
            $this->filter_where('(units.id = ' . $lookup['id'] . ' OR (units.path LIKE "%/' . $lookup['id'] . '/%"))');
        }
        $this->filter_where('`assignments`.`end_date` IS NULL AND date BETWEEN CURDATE() - INTERVAL 30 DAY AND CURDATE()');
//        $this->filter_group_by($this->primary_key);
        $this->filter_group_by("qualifications.member_id, qualifications.date");
        $this->order_by();
        return $this;
    }

}