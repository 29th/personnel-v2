<style>
<!--
  td {
    border:1px solid black;
    padding:5px;
    color:white;
  }
//-->
</style>

<?php
  $time_start = microtime(true);

  error_reporting(E_ALL);

  $db_new = mysql_connect(getenv('DB_DEFAULT_HOSTNAME'), getenv('DB_DEFAULT_USERNAME'), getenv('DB_DEFAULT_PASSWORD')) or die("Unable to connect to MySQL");
  $selected = mysql_select_db(getenv('DB_DEFAULT_DATABASE'), $db_new) or die("Could not select " . getenv('DB_DEFAULT_DATABASE'));
  $dat_arr = array();

  define('DAY',60*60*24, true);
  define('MONTH',30, true);
  define('YEAR',365.25, true);

  if ( $_GET['id'] )
  {
    $num = getTimeOfService( $_GET['id'], $db_new, true ); 
    print "<br><br>IN TOTAL for member # " . $_GET['id'] . " : $num days == " . daysIntoYears($num);
  }
  else
  {
    print "<h1>Time of service of active 29th ID Member</h1>";

    $members = mysql_query( "SELECT id, last_name, status FROM members WHERE status='Active Duty' ", $db_new );

    print "<table>";
    print "<tr><th>Id</th><th>Name</th><th>Status</th><th>#Days (All)</th><th>Period (All)</th><th>#Days (Non-Staff)</th><th>Period (Non-Staff)</th></tr>";
    while ( $row_m = mysql_fetch_assoc($members) )
    {
      $num = getTimeOfService( $row_m['id'], $db_new, false, false );
      $num2 = getTimeOfService( $row_m['id'], $db_new, false, true );
      print "<tr style='background-color:" . ( $num == $num2 ? 'green' : 'red') . ";'><td>" . $row_m['id'] . "</td><td><a href='duration.php?id=" .$row_m['id'] . "' target='_blank' title='Assignments of single member'>" . $row_m['last_name']  . "</a></td><td>" . $row_m['status']. "</td><td>$num days</td><td>" . daysIntoYears($num) . "</td><td>$num2 days</td><td>" . daysIntoYears($num2) . "</td></tr>";
    }
    print "</table>";
  }
  $time_end = microtime(true);
  $execution_time = round ( ($time_end - $time_start),4);
  echo '<hr><b>Total Execution Time:</b> '.$execution_time.' seconds';

//---------------------

function getTimeOfService( $id, $db_new, $verbose = false, $nonStaff = false )
{
    $res =  mysql_query( "SELECT start_date, end_date, class FROM assignments a LEFT JOIN units u ON a.unit_id = u.id WHERE member_id = $id " . ( $nonStaff ? "AND class<>'Staff'" : "") .  " ORDER BY start_date ", $db_new );

  while ( $row = mysql_fetch_assoc($res) )
  {
    if ($verbose)
      print "[" . $row['start_date'] . "][" . $row['end_date'] . "][" . $row['class'] . "]<br>";
    for ($i = strtotime( $row['start_date'] ); $i < strtotime( ( $row['end_date'] ? $row['end_date'] : date("Y-m-d") )  ); $i = $i + DAY ) {
      $dat_arr[ date( 'Y-m-d', $i) ] = 1;
    }
  }
//  ksort( $dat_arr );
//  print_r( $dat_arr );
  return sizeof($dat_arr);
}

//---------------------

function daysIntoYears( $DateDifference ) {
    $ReturnArray = array();

    //$SDSplit = explode('/',$StartDateString);
    //$StartDate = mktime(0,0,0,$SDSplit[0],$SDSplit[1],$SDSplit[2]);

    //$EDSplit = explode('/',$EndDateString);
    //$EndDate = mktime(0,0,0,$EDSplit[0],$EDSplit[1],$EDSplit[2]);

    $StartDate  = strtotime( "-" . $DateDifference . " days"  );
    $EndDate    = strtotime( "now" );

    $DateDifference = $EndDate-$StartDate;

    $ReturnArray['YearsSince'] = $DateDifference/60/60/24/365;
    $ReturnArray['MonthsSince'] = $DateDifference/60/60/24/365*12;
    $ReturnArray['DaysSince'] = $DateDifference/60/60/24;
    $ReturnArray['HoursSince'] = $DateDifference/60/60;
    $ReturnArray['MinutesSince'] = $DateDifference/60;
    $ReturnArray['SecondsSince'] = $DateDifference;

    $y1 = date("Y", $StartDate);
    $m1 = date("m", $StartDate);
    $d1 = date("d", $StartDate);
    $y2 = date("Y", $EndDate);
    $m2 = date("m", $EndDate);
    $d2 = date("d", $EndDate);

    $diff = '';
    $diff2 = '';
    if (($EndDate - $StartDate)<=0) {
        // Start date is before or equal to end date!
        $diff = "0 days";
        $diff2 = "Days: 0";
    } else {

        $y = $y2 - $y1;
        $m = $m2 - $m1;
        $d = $d2 - $d1;
        $daysInMonth = date("t",$StartDate);
        if ($d<0) {$m--;$d=$daysInMonth+$d;}
        if ($m<0) {$y--;$m=12+$m;}
        $daysInMonth = date("t",$m2);

        // Nicestring ("1 year, 1 month, and 5 days")
        if ($y>0) $diff .= $y==1 ? "1 year" : "$y years";
        if ($y>0 && $m>0) $diff .= ", ";
        if ($m>0) $diff .= $m==1? "1 month" : "$m months";
        if (($m>0||$y>0) && $d>0) $diff .= " and ";
        if ($d>0) $diff .= $d==1 ? "1 day" : "$d days";

        // Nicestring 2 ("Years: 1, Months: 1, Days: 1")
        if ($y>0) $diff2 .= $y==1 ? "Years: 1" : "Years: $y";
        if ($y>0 && $m>0) $diff2 .= ", ";
        if ($m>0) $diff2 .= $m==1? "Months: 1" : "Months: $m";
        if (($m>0||$y>0) && $d>0) $diff2 .= ", ";
        if ($d>0) $diff2 .= $d==1 ? "Days: 1" : "Days: $d";

    }
    $ReturnArray['NiceString'] = $diff;
    $ReturnArray['NiceString2'] = $diff2;
    return $ReturnArray['NiceString'];
} 

