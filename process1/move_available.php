<?php 
if(!defined(ABSPATH)){
    $pagePath = explode('/wp-content/', dirname(__FILE__));
    include_once('../../../../wp-load.php');
}

$post = $_POST['post'];
$moving_date = $_POST['day'];
$moving_type = $_POST['slot'];

echo $post.'<Br>';
echo $moving_date.'<Br>';
echo $moving_type.'<Br>';

$nodate = true;

// $worker = new currentCalendar;
// $worker->bookingExists();
// $allbookings = $worker->bookingdates;

// foreach ($allbookings as $booking){
// 	if($booking['cal'] == $calendar){
// 		$date = $booking['date'];
// 		if($date == $moving_date){
// 			$nodate = false;
// 			$slot = $booking['time'];
// 			if($slot == 'full'){
// 				echo 'full';
// 				break;
// 			}else {
// 				if($slot == $moving_type){
// 					echo 'full';
// 					break;
// 				}else {
// 					// Update the post into the database
// 					if(update_post_meta($postid,'calendar-define',$calendar) && wp_update_post($thepost)){
// 						echo 'success';
// 						break;
// 					}else {
// 						echo 'error';
// 						break;
// 					}
// 				}
// 			}
// 		}
// 	}
// }
// if($nodate){
// 	if(update_post_meta($postid,'calendar-define',$calendar) && wp_update_post($thepost)){
// 		echo 'success';
// 	}else {
// 		echo 'error';
// 	}
// }

					
