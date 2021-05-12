<?php 

// error_reporting(E_ALL);
// ini_set('display_errors', 1);

require('xlsx/XLSXReader.php');
$xlsx = $_FILES['xlsx'];
$file = $xlsx['tmp_name'];
$xlsx = new XLSXReader($file);

$sheets = $xlsx->getSheetNames();



if(empty($_POST)){
    exit;
}
if(!defined(ABSPATH)){
    $pagePath = explode('/wp-content/', dirname(__FILE__));
    include_once('../../../../wp-load.php');
}

$admin = get_admin_url();

function valiDate($date,$format='d.m.Y'){
    $d=DateTime::createFromFormat($format,$date);
    return $d && $d->format($format)==$date;
}

$worker = new currentCalendar;
$worker->bookingExists();
$allbookings = $worker->bookingdates;

$calendar = $_POST['calendar'];
$worker->getLocation($calendar);

$loc1 = $worker->location1;
$loc2 = $worker->location2;
$loc3 = $worker->location3;
$loc4 = $worker->location4;
$loc5 = $worker->location5;
$loc6 = $worker->location6;

$istype = $_FILES['xlsx'];

if($istype['type'] != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
	echo 'type';
}else {
	try {
		$data = $xlsx->getSheetData(reset($sheets));

		$header = array_shift($data);
		$xl = [];
		foreach($data as $i => $row){
			$data[] = array_combine($header, $row);
			$xldate = $row[0];
			$xlslot = $row[1];
			$xlloc = $row[2];

			switch($xlloc){
				case 'A':
					$location = $loc1;
					break;
				case 'B':
					$location = $loc2;
					break;
				case 'C':
					$location = $loc3;
					break;
				case 'D':
					$location = $loc4;
					break;
				case 'E':
					$location = $loc5;
					break;
				case 'F':
					$location = $loc6;
					break;
			}

			$booking_day = wp_strip_all_tags($xldate);
			$usadate = date_create($booking_day);
			$usadate = date_format($usadate,"F d, Y");

			if($xlslot == 'full'){
				$daytxt = 'Full-day booking';
			}else if($xlslot == 'first'){
				$daytxt = 'Morning Booking';
			}else {
				$daytxt = 'Afternoon Booking';
			}

			$title = $usadate.' &hyphen; '.$daytxt.' &hyphen; '.$location;

			$throw = false;
			
			if(preg_match('/^\d{2}\.\d{2}\.\d{4}$/',$xldate)){
				// if past, skip
				$date = str_replace('.', '-', $xldate);
				$date = new DateTime($xldate);
				$now = new DateTime();
				if($date >= $now){
					// if slot right wording
					if($xlslot == 'full' || $xlslot == 'first' || $xlslot == 'last'){
						foreach ($allbookings as $booking){
							if($booking['cal'] == $calendar){
								if($xlslot == 'full'){
									if($xldate == $booking['date']){
										$throw = 'full exists';
									}
								}else {
									if($xldate == $booking['date']){
										if($booking['time'] == 'full'){
											$throw = 'half but full exists';
										}else if($booking['time'] == $xlslot){
											$throw = 'half exists';
										}
									}
								}
							}	
						}
						if(!$throw){
								
							// insert post
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
								$postID = (string)$post;
								update_field('field_5c1a4f8a99447',$calendar,$post);//calendar-define
								update_field('field_5c1cf5a696803',$xldate,$post);//booking_day
								update_field('field_5c1cf5c796804',$xlslot,$post);//booking_type
								update_field('field_5c0d2f727e57i','true',$post);//booked
								update_field('book_edited','true',$post);//booked edited
								update_field('field_5c14c24642415',$location,$post);//location
								// $admin = get_admin_url();
								// wp_redirect(add_query_arg('message','success', $admin.'/admin.php?page=med-import&import_status=success'));
							}

						}

					}	
				}
			}else {
				echo 'invalid date format';
			}

		}
			
		wp_redirect(add_query_arg('message','success', $admin.'/admin.php?page=med-import&import_status=success'));
	}
	catch(Exception $e) {
		wp_redirect(add_query_arg('message','error', $admin.'/admin.php?page=med-import&import_status=error'));
		die();
	}
}



