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

	$state = $posts['state'];
	$day = $posts['day'];
	$cal = $posts['cal'];
	$new = array();
	$new['day'] = $day;
	$new['cal'] = $cal;

	$icons = json_decode($worker->icons,true);
	
	if(!$state){
		foreach($icons as $key => $icon){
			if($icon['day'] == $day && $icon['cal'] == $cal){
				unset($icons[$key]);
			}
		}
		$worker->updateIcons(json_encode($icons));
		echo json_encode('rm');
	}else {
		foreach ($icons as $icon){
			if($icon['day'] == $day && $icon['cal'] == $cal){
				die(json_encode('exists'));
			}
		}
		array_push($icons, $new);
		$worker->updateIcons(json_encode($icons));
		echo json_encode(0);
	}
	
}



