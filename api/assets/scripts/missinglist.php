<style>
<!--
  td {
    border:1px solid black;
    padding:5px;
  }
//-->
</style>

<?php
  $time_start = microtime(true);

  error_reporting(E_ALL);

  $db_new = mysql_connect(getenv('DB_DEFAULT_HOSTNAME'), getenv('DB_DEFAULT_USERNAME'), getenv('DB_DEFAULT_PASSWORD')) or die("Unable to connect to MySQL");
  $selected = mysql_select_db(getenv('DB_DEFAULT_DATABASE'), $db_new) or die("Could not select " . getenv('DB_DEFAULT_DATABASE'));
  $dat_arr = array();

  $cSql = "
  SELECT 
  (
    SELECT abbr
    FROM ranks
    WHERE m.rank_id = id
  ) AS rank, 
  m.last_name, 
  m.id, 
  u.abbr
FROM members m
LEFT JOIN assignments a ON a.member_id = m.id
LEFT JOIN units u ON a.unit_id = u.id
WHERE m.id IN 
  (
    SELECT DISTINCT member_ID
    FROM assignments
    WHERE end_date IS NULL
  )
  AND m.forum_member_id =0
  AND a.end_date IS NULL 
  AND u.class <>  'Staff'
ORDER BY abbr, rank_id DESC, last_name
";
  
  $members = mysql_query( $cSql, $db_new );

  $curr_unit = "";
  print "<table>";
  print "<tr><th>Rank</th><th>Name</th><th>ID</th></tr>";
  while ( $row = mysql_fetch_assoc($members) )
  {
    if ( $row['abbr'] != $curr_unit )
    {
      $curr_unit = $row['abbr'];
      print "<tr><td colspan='3' style='background-color:black;color:white;'><b>$curr_unit</b></td></tr>";
    }
    print "<tr>
      <td>" . $row['rank'] . "</td>
      <td>" . $row['last_name'] . "</td>
      <td>" . $row['id'] . "</td>
    </tr>";
  }
  print "</table>";
  
?>