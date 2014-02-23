<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

$config = array(
    /**
     * Profile
     */
    'profile_add' => array(
        array(
            'field' => 'first_name'
            ,'rules' => 'required'
        )
        ,array(
            'field' => 'last_name'
            ,'rules' => 'required'
        )
        ,array(
            'field' => 'status'
            ,'rules' => 'required'
        )
        ,array(
            'field' => 'rank_id'
            ,'rules' => 'required'
        )
    )
    ,'profile_edit' => array(
        array(
            'field' => 'first_name'
            ,'rules' => 'min_length[1]|max_length[32]'
        )
        ,array(
            'field' => 'last_name'
            ,'rules' => 'min_length[1]|max_length[32]'
        )
        ,array(
            'field' => 'middle_name'
            ,'rules' => 'max_length[32]'
        )
        /*,array(
            'field' => 'name_prefix'
            ,'rules' => 'max_length[8]'
        )*/
        ,array(
            'field' => 'steam_id'
            ,'rules' => 'numeric'//|valid_base64'
        )
    )
    /**
     * Rank
     */
    ,'rank_add' => array(
        array(
            'field' => 'name'
            ,'rules' => 'required'
        )
        ,array(
            'field' => 'abbr'
            ,'rules' => 'required'
        )
        ,array(
            'field' => 'order'
            ,'rules' => 'required'
        )
    )
    ,'rank_edit' => array(
        array(
            'field' => 'name'
            ,'rules' => 'min_length[1]|max_length[32]'
        )
        ,array(
            'field' => 'abbr'
            ,'rules' => 'min_length[1]|max_length[8]'
        )
        ,array(
            'field' => 'grade'
            ,'rules' => 'max_length[4]'
        )
        ,array(
            'field' => 'filename'
            ,'rules' => 'max_length[32]'
        )
        ,array(
            'field' => 'order'
            ,'rules' => 'is_unique[ranks.order]|numeric'
        )
    )
    /**
     * Standard
     */
    ,'standard_add' => array(
        array(
            'field' => 'weapon'
            ,'rules' => 'required'
        )
        ,array(
            'field' => 'badge'
            ,'rules' => 'required'
        )
        ,array(
            'field' => 'description'
            ,'rules' => 'required'
        )
    )
    /**
     * Award
     */
    ,'award_add' => array(
        array(
            'field' => 'code'
            ,'rules' => 'required'
        )
        ,array(
            'field' => 'title'
            ,'rules' => 'required|max_length[255]'
        )
        ,array(
            'field' => 'description'
            ,'rules' => 'required'
        )
    )
    /**
     * Promotion
     */
    ,'promotion_add' => array(
        array(
            'field' => 'old_rank_id'
            ,'rules' => 'numeric'
        )
        ,array(
            'field' => 'new_rank_id'
            ,'rules' => 'required|numeric'
        )
        ,array(
            'field' => 'date'
            ,'rules' => 'required'
        )
    )
    /**
     * Awarding
     */
    ,'awarding_add' => array()
    /**
     * Qualification
     */
    ,'qualification_add' => array()
    /**
     * Assignment
     */
    ,'assignment_add' => array()
    /**
     * Unit
     */
    ,'unit_edit' => array(
        array(
            'field' => 'abbr'
            ,'rules' => 'max_length[32]'
        )
    )
    /**
     * Enlistment
     */
    ,'enlistment_add' => array(
        array(
            'field' => 'last_name'
            ,'rules' => 'required'
        )
    )
);