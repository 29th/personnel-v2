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
                $safety = 0;
                while ( ($qp = strpos( $note['content'], '[quote' ) ) !== false  && $safety++ < 20 ) 
                {
                    if ($qp)
                        $qe = strpos( $note['content'], ']', $qp )+1;
                    else
                        $qe = strpos( $note['content'], ']' )+1;
                    $optxt = substr( $note['content'], $qp, $qe-$qp );
                    $note['content'] = substr( $note['content'], 0, $qp) . $this->quote_replace( $optxt ) . substr( $note['content'], $qe );
                }
                $note = str_replace( '[/quote]', '</blockquote>', $note );
                $notes[$key] = $note;
            }
            
            $this->response(array('status' => true, 'a' => $optxt, 'notes' => $notes, 'count' => sizeof($notes)  ));
        }
    }
    
    public function quote_replace( $inStr = '' ) {
        $outStr = "<blockquote>";
        $poz1 = strpos( $inStr, 'author=');
        if ( $poz1 !== false ) 
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
        
        
        return $outStr;
    }

}