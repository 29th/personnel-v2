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
            
            $permissions = $this->get_notes_permissions();
            if($filter_key == 'member' && $member_id && is_numeric( $member_id ) ) {
                $this->note_model->where('notes.member_id', $member_id);
            }
            if ( $this->user->permission('note_view_all') )
                $notes = nest( $this->note_model->get()->result_array() );
            else
                $notes = nest( $this->note_model->by_access($permissions)->get()->result_array() );
                
            $optxt = "";
            foreach( $notes as $key => $note ) 
            {
                $notes[$key]['content'] = $this->format_note( $note['content'] );
            }
            
            $this->response(array('status' => true, 'notes' => $notes, 'count' => sizeof($notes)  ));
        }
    }
    
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

        $inStr = str_replace( '[hr]', '<hr>', $inStr );

        return $inStr;
    }

    public function collapsible_replace( $inStr = '' ) {
        $outStr = "<details><summary>";
        if ( ($poz1 = strpos( $inStr, '=')) !== false ) /* we got author format from SMF forums */
            $outStr .= substr( $inStr, $poz1 + 1, -1 );
        else
            $outStr .= "<b><i>Details:</i></b>";
        $outStr .= "</summary>";
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