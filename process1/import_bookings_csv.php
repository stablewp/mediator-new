<?php 

// error_reporting(E_ALL);
// ini_set('display_errors', 1);


$delimiters = array(
    ';' => 0,
    ',' => 0,
    "\t" => 0,
    "|" => 0
);

$handle = fopen($_FILES['csv']['tmp_name'], "r");
$firstLine = fgets($handle);
fclose($handle); 
foreach ($delimiters as $delimiter => &$count) {
    $count = count(str_getcsv($firstLine, $delimiter));
}

$delimiter = array_search(max($delimiters), $delimiters);


if(empty($_POST)){
    exit;
}
if(!defined(ABSPATH)){
    $pagePath = explode('/wp-content/', dirname(__FILE__));
    include_once('../../../../wp-load.php');
}

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

$csv = $_FILES['csv'];

if($csv['type'] != 'text/csv'){
	echo 'type';
}else {
	$data = $_FILES['csv']['tmp_name'];
	if($delimiter == ';'){
		$rows = array_map(function($v){return str_getcsv($v, ";");}, file($data));
	}else if($delimiter == '\t'){
		$rows = array_map(function($v){return str_getcsv($v, "\t");}, file($data));
	}else if($delimiter == '|'){
		$rows = array_map(function($v){return str_getcsv($v, "|");}, file($data));
	}else {
		$rows = array_map(function($v){return str_getcsv($v, ",");}, file($data));
	}
	
	$header = array_shift($rows);
	$csv = [];
	foreach($rows as $i => $row){
		$csv[] = array_combine($header, $row);
		// if($i != 0){
			$csvdate = $row[0];
			$csvslot = $row[1];
			$csvloc = $row[2];
			
			switch($csvloc){
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

			$booking_day = wp_strip_all_tags($csvdate);
			$usadate = date_create($booking_day);
			$usadate = date_format($usadate,"F d, Y");

			if($csvslot == 'full'){
				$daytxt = 'Full-day booking';
			}else if($csvslot == 'first'){
				$daytxt = 'Morning Booking';
			}else {
				$daytxt = 'Afternoon Booking';
			}

			$title = $usadate.' &hyphen; '.$daytxt.' &hyphen; '.$location;

			$throw = false;
			
			if(preg_match('/^\d{2}\.\d{2}\.\d{4}$/',$csvdate)){
				// if past, skip
				$date = str_replace('.', '-', $csvdate);
				$date = new DateTime($csvdate);
				$now = new DateTime();
				if($date >= $now){
					// if slot right wording
					if($csvslot == 'full' || $csvslot == 'first' || $csvslot == 'last'){
						foreach ($allbookings as $booking){
							if($booking['cal'] == $calendar){
								if($csvslot == 'full'){
									if($csvdate == $booking['date']){
										$throw = 'full exists';
									}
								}else {
									if($csvdate == $booking['date']){
										if($booking['time'] == 'full'){
											$throw = 'half but full exists';
										}else if($booking['time'] == $csvslot){
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
								update_field('field_5c1cf5a696803',$csvdate,$post);//booking_day
								update_field('field_5c1cf5c796804',$csvslot,$post);//booking_type
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
		
		$admin = get_admin_url();
		wp_redirect(add_query_arg('message','success', $admin.'/admin.php?page=med-import&import_status=success'));

	// }

}



