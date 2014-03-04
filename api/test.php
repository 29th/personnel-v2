<?php
function numeric($str)
{
	return (bool)preg_match( '/^[\-+]?[0-9]*\.?[0-9]+$/', $str);

}

$val = 4;
echo "Is {$val} numeric: " . numeric($val);