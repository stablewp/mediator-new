<?php  

if(!defined(ABSPATH)){
    $pagePath = explode('/wp-content/', dirname(__FILE__));
    include_once('../../../../wp-load.php');
}

$contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
if($contentType === "application/json"){
  	$data = trim(file_get_contents("php://input"));
  	$posts = json_decode($data, true);

	$worker = new currentCalendar;
	$worker->icons();

	$cal = $posts['cal'];

	$icons = json_decode($worker->icons,true);
	$sets = array();

	foreach($icons as $icon){
		if($icon['cal'] == $cal){
			array_push($sets, $icon['day']);
		}
	}
	echo json_encode($sets);
}



