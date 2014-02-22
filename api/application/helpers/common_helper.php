<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

if( ! function_exists('format_date')) {
    function format_date($input = 'now', $type = 'date') {
        // if not a timestamp, convert it to one
		if( ! is_numeric($input)) $input = strtotime($input);
            
        switch($type) {
            case 'datetime': $format = config_item('format_datetime'); break;
            case 'time': $format = config_item('format_time'); break;
            case 'mysqldate': $format = '%Y-%m-%d'; break;
            case 'mysqldatetime': $format = '%Y-%m-%d %H:%M:%S'; break;
            default: $format = config_item('format_date'); break;
        }
		return strftime($format, $input);
	}
}

if( ! function_exists('pluck')) {
    function pluck($key, $data) {
        return array_reduce($data, function($result, $array) use($key) {
            isset($array[$key]) && $result[] = $array[$key];
            return $result;
        }, array());
    }
}

/**
 * Custom helper to nest MySQL JOIN results
 * Give aliases to the fields with a | to use
 * ie. select members.*, ranks.id AS rank|id, ranks.name AS rank|name
 * to have a sub-object called rank with id and name inside it
 */
if( ! function_exists('nest')) {
    function nest($result, $delimiter = '|') {
        //die(print_r($result, true));
        if( ! is_array($result)) $result = (array) $result;
        foreach($result as $key => $val) {
            if(is_array($val)) $result[$key] = nest($val);
            if(($pos = strpos($key, $delimiter)) !== FALSE) {
                $table = substr($key, 0, $pos);
                $field = substr($key, $pos + 1);
                if( ! isset($result[$table])) $result[$table] = array();
                $result[$table][$field] = $val;
                unset($result[$key]);
            }
        }
        return $result;
    }
}

/**
  * Casts specified fields of an active record array to specified types.
  * Possibles values of type  are:
  * "boolean" (or, since PHP 4.2.0, "bool")
  * "integer" (or, since PHP 4.2.0, "int")
  * "float" (only possible since PHP 4.2.0, for older versions use the deprecated variant "double")
  * "string"
  * "array"
  * "object"
  * "null" (since PHP 4.2.0)
  * @param array $record Array from an active record
  * @param array $fieldTypes Array where key=property name, value=type to cast.
  * @return array Returns modified active record array with cast properties
  * http://ellislab.com/forums/viewreply/558011/
*/
if( ! function_exists('cast_fieldtypes')) {
    function cast_fieldtypes($record, $fieldTypes) {
        foreach($record as $fieldName => $value) {
            if(isset($fieldTypes[$fieldName])) {
                $type = $fieldTypes[$fieldName];
                $value = $record[$fieldName];
                switch ($type) {
                    case 'boolean':
                    case 'bool':
                        $value = (bool) $value;
                        break;
                    
                    case 'integer':
                    case 'int':
                        $value = (int) $value;
                        break;
    
                    case 'float':
                        $value = (float) $value;
                        break;
                        
                    case 'string':
                        $value = (string) $value;
                        break;
    
                    default:
                        break;
                }
                $record[$fieldName] = $value;
            }
        }
        return $record;
    }
}
