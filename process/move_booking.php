<?php 
if(!defined(ABSPATH)){
    $pagePath = explode('/wp-content/', dirname(__FILE__));
    include_once('../../../../wp-load.php');
}

$calendar = $_POST['calendar'];
$postid = $_POST['post'];

// !!!insert check if slot available
$thepost = array(
  	'ID' => $postid,
  	'post_parent' => $calendar
);

// check if slot available on other calendar

$moving_date = get_field('booking_day',$postid);
$moving_type = get_field('booking_type',$postid);
$nodate = true;

$worker = new currentCalendar;
$worker->bookingExists();
$allbookings = $worker->bookingdates;

foreach ($allbookings as $booking){
	if($booking['cal'] == $calendar){
		$date = $booking['date'];
		if($date == $moving_date){
			$nodate = false;
			$slot = $booking['time'];
			if($slot == 'full'){
				echo 'full';
				break;
			}else {
				if($slot == $moving_type){
					echo 'full';
					break;
				}else {
					// Update the post into the database
					if(update_post_meta($postid,'calendar-define',$calendar) && wp_update_post($thepost)){
						echo 'success';
						break;
					}else {
						echo 'error';
						break;
					}
				}
			}
		}
	}
}
if($nodate){
	if(update_post_meta($postid,'calendar-define',$calendar) && wp_update_post($thepost)){
		echo 'success';
	}else {
		echo 'error';
	}
}

					
