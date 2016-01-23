
<?php

$pages = array(
    'abilities' => 'Abilities',
    'assignments' => 'Assignments',
    'attendance' => 'Attendance',
    'awardings' => 'Awardings',
    'awards' => 'Awards',
    'banlog' => 'Ban Log',
    'class_permissions' => 'Class Permissions',
    'class_roles' => 'Class Roles',
    'countries' => 'Countries',
    'demerits' => 'Demerits',
    'discharges' => 'Discharges',
    'eloas' => 'Extended LOAs',
    'enlistments' => 'Enlistments',
    'events' => 'Events',
    'finances' => 'Finances',
    'members' => 'Members',
    'notes' => 'Notes',
    'positions' => 'Positions',
    'promotions' => 'Promotions',
    'qualifications' => 'Qualifications',
    'ranks' => 'Ranks',
    'schedules' => 'Schedules',
    'servers' => 'Servers',
    'standards' => 'Standards',
    'units' => 'Units',
    'unit_permissions' => 'Unit Permissions',
    'unit_roles' => 'Unit Roles',
    'usertracking' => 'User Tracking',
    'weapon_passes' => 'Weapon Passes'
);

?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<title><?php echo $method ? (isset($pages[$method]) ? $pages[$method] : $method) : 'Administration'; ?></title>
	<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.0.3/css/bootstrap.min.css">
<?php if(isset($css_files)): ?>
<?php foreach($css_files as $file): ?>
	<link type="text/css" rel="stylesheet" href="<?php echo $file; ?>" />
<?php endforeach; ?>
<?php endif; ?>

<?php if(isset($js_files)): ?>
<?php foreach($js_files as $file): ?>
	<script src="<?php echo $file; ?>"></script>
<?php endforeach; ?>
<?php endif; ?>

<style type='text/css'>
body { 	font-family: Arial; font-size: 14px; background-color: #4C5844; color: white; }
a { color: blue; text-decoration: none; }
a:hover { text-decoration: underline; }
.nav { margin-bottom: 20px; }
.bDiv thead th { color:white; background-color:#788B6C; }
.flexigrid tr.erow td { background-color: #FFFFE6; } 
.flexigrid tr.erow td:hover { background-color: #96A68C; } 
a.list-group-item.active, a.list-group-item.active:hover, a.list-group-item.active:focus { background-color:#647359; }
a.list-group-item:hover, a.list-group-item:focus { background-color:#96A68C; }
.chzn-container .chzn-results .highlighted {background-color:#96A68C;background-image: -webkit-linear-gradient(top, #647359 20%, #96A68C 90%);}
.form-field-box.even { background-color: #FFFFE6; }

</style>
</head>
<body>
    <div class="container">
        <h1><?php echo $method ? (isset($pages[$method]) ? $pages[$method] : $method) : 'Administration'; ?></h1>
    	<div class="row">
    	    <div class="col-md-3">
        	    <div class="list-group">
        	        <?php foreach($pages as $key => $title): ?>
        	            <?php if(in_array('admin', $permissions) || in_array('admin-' . $key, $permissions)): ?>
        	                <a href="<?= site_url('admin/' . $key) ?>" class="list-group-item<?php if($method == $key) echo ' active'; ?>"><?php echo $title; ?></a>
        	            <?php endif; ?>
        	        <?php endforeach; ?>
        	    </div>
    	    </div>
            <div class="col-md-9">
    		<?php if(isset($output)) echo $output; ?>
            </div>
        </div>
    </div>
</body>
</html>
