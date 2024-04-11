<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class My_Grocery_model extends grocery_CRUD_Model {
    
	/*
	// http://www.grocerycrud.com/forums/topic/1963-simple-guide-to-executing-custom-queries/
	private  $query_str = '';
 
	function get_list() {
		$query=$this->db->query($this->query_str);
 
		$results_array=$query->result();
		return $results_array;		
	}
 
	public function set_query_str($query_str) {
		$this->query_str = $query_str;
	}*/

    protected function relation_n_n_queries($select)
    {
    	$this_table_primary_key = $this->get_primary_key();
    	foreach($this->relation_n_n as $relation_n_n)
    	{
    		list($field_name, $relation_table, $selection_table, $primary_key_alias_to_this_table,
    					$primary_key_alias_to_selection_table, $title_field_selection_table, $priority_field_relation_table, $where_clause) = array_values((array)$relation_n_n);

    		$primary_key_selection_table = $this->get_primary_key($selection_table);

	    	$field = "";
	    	$use_template = strpos($title_field_selection_table,'{') !== false;
	    	$field_name_hash = $this->_unique_field_name($title_field_selection_table);
	    	if($use_template)
	    	{
	    		$title_field_selection_table = str_replace(" ", "&nbsp;", $title_field_selection_table);
	    		$field .= "CONCAT('".str_replace(array('{','}'),array("',COALESCE(",", ''),'"),str_replace("'","\\'",$title_field_selection_table))."')";
	    	}
	    	else
	    	{
	    		$field .= "$selection_table.$title_field_selection_table";
	    	}

    		//Sorry Codeigniter but you cannot help me with the subquery!
    		$select .= ", (SELECT GROUP_CONCAT(DISTINCT $field) FROM $selection_table "
    			."LEFT JOIN $relation_table ON $relation_table.$primary_key_alias_to_selection_table = $selection_table.$primary_key_selection_table "
    			."WHERE $relation_table.$primary_key_alias_to_this_table = `{$this->table_name}`.$this_table_primary_key "
    			.($where_clause ? " AND (" . $where_clause . ") ": "")
    			."GROUP BY $relation_table.$primary_key_alias_to_this_table) AS $field_name";
    	}

    	return $select;
    }
}