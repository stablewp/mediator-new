<?php

if(!defined(ABSPATH)){
    $pagePath = explode('/wp-content/', dirname(__FILE__));
    include_once('../../../../wp-load.php');
}

$worker = new currentCalendar;
$worker->bookingExists();
$allbookings = $worker->bookingdates;

$contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
if($contentType === "application/json"){
  	$data = trim(file_get_contents("php://input"));
  	$posts = json_decode($data, true);

	$calendar = $posts['calendar'];
	$title = $posts['title'];
	$day = $posts['day'];
	$slot = $posts['slot'];

}
// if booking doesnt exist
$found = false;
if($booking_type == 'full'){
	foreach ($allbookings as $booking){
		if($booking['cal'] == $parent){
			if($booking_day == $booking['date']){
				$found = true;
				$exists = 'dayexists';
				break;
			}
		}
	}
}else if($booking_type == 'first' || $booking_type == 'last'){
	foreach ($allbookings as $booking){
		if($booking['cal'] == $parent){
			if($booking_day == $booking['date']){
				if($booking['time'] == 'full'){
					$found = true;
					$exists = 'dayexists';
					break;
				}else if($booking['time'] == $booking_type){
					$found = true;
					$exists = 'timeexists';
					break;
				}
			}
		}
	}
}
if($found){
	echo json_encode(array('message'=>'exists'));
}else {
	// continue with fn
	// insert
	$post = wp_insert_post(array (
	   'post_type' => 'med-booking',
	   'post_parent' => $calendar,
	   'post_title' => $title,
	   'post_content' => '',
	   'post_status' => 'publish',
	   'comment_status' => 'closed',
	   'ping_status' => 'closed',
	));

	if($post){
		update_field('field_5c1cf5a696803',$day,$post);//booking_day
		update_field('field_5c1cf5c796804',$slot,$post);//booking_type
		update_field('field_5c0d2f727e57i','true',$post);
		add_post_meta($post,'book_edited','false');
		update_field('field_5c1a4f8a99447',$calendar,$post);//calendar-define

		echo json_encode(array('message'=>'success','post'=>$post,'slot'=>$slot,'date'=>$day));
	}else {
		echo json_encode(array('message'=>'error'));
	}
}

