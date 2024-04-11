<style>

</style>

<?php
  $time_start = microtime(true);

  error_reporting(E_ALL);

//  $db_new = mysql_connect(getenv('DB_DEFAULT_HOSTNAME'), getenv('DB_DEFAULT_USERNAME'), getenv('DB_DEFAULT_PASSWORD')) or die("Unable to connect to MySQL");
//  $selected = mysql_select_db(getenv('DB_DEFAULT_DATABASE'), $db_new) or die("Could not select " . getenv('DB_DEFAULT_DATABASE'));
  
  $link_p = mysqli_connect("0.0.0.0", "swomma", "", "personnel_v2") or die("Unable to connect to MySQL");

  if (!$link_p) {
    echo "Error: Unable to connect to MySQL." . PHP_EOL;
    echo "Debugging errno: " . mysqli_connect_errno() . PHP_EOL;
    echo "Debugging error: " . mysqli_connect_error() . PHP_EOL;
    exit;
    }

  
  $link_f = mysqli_connect("0.0.0.0", "swomma", "", "vanilla") or die("Unable to connect to MySQL");

  if (!$link_f) {
    echo "Error: Unable to connect to MySQL." . PHP_EOL;
    echo "Debugging errno: " . mysqli_connect_errno() . PHP_EOL;
    echo "Debugging error: " . mysqli_connect_error() . PHP_EOL;
    exit;
  }

    $query = "SELECT `UserID` ,  `Name` 
FROM  `GDN_User` 
ORDER BY UserID
";

    $res = $link_f->query( $query );
    
    
    while ( $row = $res->fetch_row() )
    {
        $res2 = $link_p->query("SELECT m.id, m.first_name, m.middle_name, m.name_prefix, m.last_name, u.class, r.abbr, r.name, 
        (SELECT type FROM discharges WHERE member_id = m.id ORDER BY date DESC LIMIT 1 ),
        (SELECT id FROM enlistments WHERE member_id = m.id AND status='Pending' ORDER BY date DESC LIMIT 1)
FROM members AS m
LEFT JOIN assignments AS ass ON ass.member_id = m.id AND ass.end_date IS NULL
LEFT JOIN units AS u ON u.id=ass.unit_id
LEFT JOIN ranks AS r ON r.id = m.rank_id
WHERE forum_member_id = " . $row[0] . " ORDER BY class LIMIT 1" );
        $row2 = $res2->fetch_row();
        if ( $row2[0] )
        {
            if ( $row2[5] || $row2[9] )
                print "<span style='color:green'>";
            elseif ( $row2[8]=='Honorable' )
                print "<span style='color:darkblue'>";
            else
                print "<span style='color:red'>";
            if ( $row2[5] || $row2[9] )
            {
                $new_name = ( $row2[6] . " " . ( $row2[3] ? $row2[3] . "." : "" ) .$row2[4] ); 
            }
            elseif ( $row2[8]=='Honorable' )
                $new_name = ( $row2[6] . " " . ( $row2[3] ? $row2[3] . "." : "" ) .$row2[4] . " [Ret.]"); 
            else
            {
                $new_name = ( $row2[7] . " " . $row2[1] . " " . ( $row2[2] ? substr($row2[2],0,1). '. ' : "" ) . ( $row2[3] ? $row2[3] . "." : "" ) .$row2[4] ); 
            }
            $new_name = str_replace( "/", "", $new_name );
            $new_name = str_replace( "'", "\'", $new_name );
//            $new_name = $link_f->real_escape_string($new_name);
            print "F_ID:[".$row[0]."]  P_ID:[" . $row2[0] ."]  S:[" . $row2[5] . "] <b>  [" . $row[1] . "] : => : $new_name</b></span><br>";

            if ($link_f->query( "UPDATE GDN_User SET Name = '$new_name' WHERE UserID =" . $row[0] ) === TRUE) 
            {
                echo "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Record updated successfully<br>";
            } 
            else 
            {
                echo "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Error updating record: " . $link_f->error . "<br>";
            }
        }
    }

    echo "<hr>END<hr>";    
?>
