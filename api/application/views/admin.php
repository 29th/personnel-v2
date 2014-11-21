
<?php

$pages = array(
    'abilities' => 'Abilities',
    'assignments' => 'Assignments',
    'attendance' => 'Assignments',
    'awardings' => 'Awardings',
    'awards' => 'Awards',
    'class_permissions' => 'Class Permissions',
    'class_roles' => 'Class Roles',
    'countries' => 'Countries',
    'demerits' => 'Demerits',
    'discharges' => 'Discharges',
    'enlistments' => 'Enlistments',
    'events' => 'Events',
    'finances' => 'Finances',
    'loa' => 'LOA',
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
    'usertracking' => 'User Tracking'
);

?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<title><?php echo $method; ?></title>
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
body
{
	font-family: Arial;
	font-size: 14px;
}
a {
    color: blue;
    text-decoration: none;
}
a:hover
{
	text-decoration: underline;
}
.nav { margin-bottom: 20px; }
</style>
</head>
<body>
    <div class="container">
        <h1>Administration</h1>
    	<div class="row">
    	    <div class="col-md-3">
        	    <div class="list-group">
        	        <?php foreach($pages as $key => $title): ?>
        	        <a href="<?= site_url('admin/' . $key) ?>" class="list-group-item<?php if($method == $key) echo ' active'; ?>"><?php echo $title; ?></a>
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
