<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Notes extends MY_Controller {
    public $model_name = 'note_model';
    public $abilities = array(
        'view_any' => 'note_view_any',
        'view' => 'note_view'
    );
    
    /**
     * PRE-FLIGHT
     */
    public function index_options() { $this->response(array('status' => true)); }
    public function view_options() { $this->response(array('status' => true)); }
    
    public function index_get($filter_key = FALSE, $member_id = FALSE) {
        // Must have permission to view any member's profile
        if(!$this->user->permission('note_view_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        // Index records
        else {
            
            $skip = $this->input->get('skip') ? $this->input->get('skip', TRUE) : 0;
            $permissions = $this->get_notes_permissions();
            $model =  $this->note_model;
            if ( $this->user->permission('note_view_all') ) 
            {
            }
            else
            {
                $model->by_access($permissions);
            }
            if($filter_key == 'member' && $member_id && is_numeric( $member_id ) ) 
            {
                $model->where('notes.member_id', $member_id)->get();
            }
            else 
            {
                $model->paginate('', $skip);
            }
            $notes = nest( $model->result_array() );
            $optxt = "";
            foreach( $notes as $key => $note ) 
            {
                if ( $this->input->get('no_content') && $this->input->get('no_content') == 'false' )
                    $notes[$key]['content'] = $this->format_note( $note['content'] );
                else    
                    $notes[$key]['content'] = ''; //Unsetting disturbs APP
            }
            $this->response(array('status' => true, 'skip' => $skip, 'notes' => $notes, 'count' => $model->total_rows  ));
        }
    }
    
    public function index_post() {
        // Must be logged in
        if( ! $this->user->permission('note_view_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        // Form validation for both models
        else if($this->note_model->run_validation('validation_rules_add') === FALSE) 
        {
            $this->response(array('status' => false, 'error' => $this->note_model->validation_errors), 400);
        }
        // Create record
        else 
        {
            $note_data = whitelist($this->post(), array('member_id', 'access', 'subject', 'content'));
            $note_data['author_member_id'] = $this->db->query("SELECT id FROM `members` WHERE forum_member_id = " . $this->user->logged_in() )->result_array()[0]['id'];
            $note_data['date_add'] = Date('Y-m-d');
        
            $insert_id = $this->note_model->save(NULL, $note_data);
            $new_record = $insert_id ? nest($this->note_model->get_by_id($insert_id)) : null;
            $this->response(array('status' => $insert_id ? true : false, 'note' => $new_record ));
        }
    }   //index_post

    public function view_post($note_id) {
        // Must be logged in
        if( ! ($note = nest($this->note_model->get_by_id($note_id)))) {
            $this->response(array('status' => false, 'error' => 'Note not found!'), 404);
        }
        else if( ! $this->user->permission('note_view_any')) {
            $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
        }
        // Form validation for both models
        else if($this->note_model->run_validation('validation_rules_add') === FALSE) 
        {
            $this->response(array('status' => false, 'error' => $this->note_model->validation_errors), 400);
        }
        // Update record
        else 
        {
/*
*/
            $note_data = whitelist($this->post(), array( 'access', 'subject', 'content'));
            $note_data['date_mod'] = Date('Y-m-d H:i:s');
        
            $result = $this->note_model->save($note_id, $note_data);
            $new_record = $result ? nest($this->note_model->get_by_id($result)) : null;
            $this->response(array('status' => $result ? true : false, 'note' => $new_record ));
        }
    }   //view_post

     public function view_get($note_id) {
          // Must have permission to view this type of record for this member or for any member
          if( ! $this->user->permission('note_view_any')) {
               $this->response(array('status' => false, 'error' => 'Permission denied'), 403);
          }
          // View records
          else {
            $permissions = $this->get_notes_permissions();
            if ( $this->user->permission('note_view_all') )
               $note = nest($this->note_model->select_member()->get_by_id($note_id));
            else
               $note = nest($this->note_model->by_access($permissions)->select_member()->get_by_id($note_id));
            $note['content'] = $this->format_note( $note['content'] );
            $this->response(array('status' => true, 'note' => $note));
          }
     }

    public function get_notes_permissions() {
        $permissions = Array('Public','Members Only');
        if ( $this->user->permission('note_view_mp') )
            $permissions[] = 'Military Police';
        if ( $this->user->permission('note_view_mp') || $this->user->permission('note_view_co') )
            $permissions[] = 'Company Level';
        if ( $this->user->permission('note_view_mp') || $this->user->permission('note_view_co') || $this->user->permission('note_view_pl') )
            $permissions[] = 'Platoon Level';
        if ( $this->user->permission('note_view_mp') || $this->user->permission('note_view_co') || $this->user->permission('note_view_pl') || $this->user->permission('note_view_sq') )
            $permissions[] = 'Squad Level';
        if ( $this->user->permission('note_view_mp') || $this->user->permission('note_view_lh') )
            $permissions[] = 'Lighthouse';
            
        return $permissions;    
    }
    
    public function format_note( $inStr = '' ) {
        $safety = 0;
        //Fixing quotes into blockquotes
        while ( ($qp = strpos( $inStr, '[quote' ) ) !== false  && $safety++ < 20 ) 
        {
            if ($qp)
                $qe = strpos($inStr, ']', $qp )+1;
            else
                $qe = strpos( $inStr, ']' )+1;
            $optxt = substr( $inStr, $qp, $qe-$qp );
            $inStr = substr( $inStr, 0, $qp) . $this->quote_replace( $optxt ) . substr( $inStr, $qe );
        }
        $inStr = str_replace( '[/quote]', '</blockquote>', $inStr );

        //Fixing collapsibles
        while ( ($qp = strpos( $inStr, '[collapsible' ) ) !== false  && $safety++ < 20 ) 
        {
            if ($qp)
                $qe = strpos($inStr, ']', $qp )+1;
            else
                $qe = strpos( $inStr, ']' )+1;
            $optxt = substr( $inStr, $qp, $qe-$qp );
            $inStr = substr( $inStr, 0, $qp) . $this->collapsible_replace( $optxt ) . substr( $inStr, $qe );
        }
        $inStr = str_replace( '[/collapsible]', '</details>', $inStr );


        //Fixing letter
        while ( ($qp = strpos( $inStr, '[letter' ) ) !== false  && $safety++ < 20 ) 
        {
            if ($qp)
                $qe = strpos($inStr, ']', $qp )+1;
            else
                $qe = strpos( $inStr, ']' )+1;
            $optxt = substr( $inStr, $qp, $qe-$qp );
            $inStr = substr( $inStr, 0, $qp) . $this->letter_replace( $optxt ) . substr( $inStr, $qe );
        }
        $inStr = str_replace( '[/letter]', '</blockquote>', $inStr );

        $inStr = str_replace( '[hr]', '<hr>', $inStr );

        return $inStr;
    }

    public function collapsible_replace( $inStr = '' ) {
        $outStr = "<details><summary>";
        if ( ($poz1 = strpos( $inStr, '=')) !== false ) /* we got author format from SMF forums */
            $outStr .= substr( $inStr, $poz1 + 1, -1 );
        else
            $outStr .= "Details:";
        $outStr .= "</summary>";
        return $outStr;
    }
    
    public function letter_replace( $inStr = '' ) {
        $outStr = "<blockquote class='quote_letter'><span>29TH INFANTRY DIVISION<br>116TH REGIMENT, 1ST BN<br>";
        if ( ($poz1 = strpos( $inStr, '=')) !== false ) /* we got author format from SMF forums */
            $outStr .= substr( $inStr, $poz1 + 1, -1 ) . "<br>";

        $outStr .= "</span><center><img src='http://29th.org/images/116thicon.gif' /></center>";
        return $outStr;
    }
    
    public function quote_replace( $inStr = '' ) {
        $outStr = "<blockquote>";
        
        if ( ($poz1 = strpos( $inStr, 'author=')) !== false ) /* we got author format from SMF forums */
        {
            $poz2 = strpos( $inStr, 'link=' );
            $author = substr( $inStr, $poz1 + 7, $poz2-$poz1-8 );
            $poz3 = strpos( $inStr, ';u=' )+3;
            $poz4 = strpos( $inStr, ' ', $poz3 );
            $link = substr( $inStr, $poz3, $poz4-$poz3 );
            $poz5 = strpos( $inStr, 'date=') + 5;
            $date = Date( 'Y-m-d', substr( $inStr, $poz5, -1) );
            $outStr .= '<span class="quote_author">';
            if ( $link )
                $outStr .= "<a href='http://personnel.29th.org/#members/$link'>$author</a>";
            else
                $outStr .= $author;
            $outStr .= " said";
            if ( $date )
               $outStr .= " on " . $date;
             
            $outStr .=':</span><br>';
        }
        elseif ( ($poz1 = strpos( $inStr, '=')) !== false )
        {
            $outStr .= '<span class="quote_author">' . substr( $inStr, $poz1 + 1, -1 ) . '</span>';
        }
        
        
        return $outStr;
    }

}