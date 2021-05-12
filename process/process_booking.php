<?php 
if(empty($_POST)){
    exit;
}

if(!defined(ABSPATH)){
    $pagePath = explode('/wp-content/', dirname(__FILE__));
    include_once('../../../../wp-load.php');
}

$site = get_bloginfo('name');
//require MYPLUGIN_PLUGIN_DIR.'/modules/sendgrid/vendor/autoload.php';
require '../modules/sendgrid/vendor/autoload.php';
$worker = new currentCalendar;
$worker->bookingExists();
$allbookings = $worker->bookingdates;
$worker->select();
$worker->getRecipient($worker->id);
$edmmail = $worker->edmmail;
$edmname = $worker->edmname;
$settings = new currentSettings;
$settings->getEDM();
$settings->getEmail();
$settings->getForm();
$settings->getAPI();
$current_booking_cal_id = wp_strip_all_tags($_POST['parent']);
$name_of_mediator = get_post_meta($current_booking_cal_id,'text')[0];
$edmmail = get_post_meta($current_booking_cal_id,'email')[0];
$admin_email = $edmmail;

$dbfields = $settings->renderForm;
$primaries = array();
foreach($dbfields as $i => $field){
	if($field['primary'] == 'true'){
		array_push($primaries, $field['name']);
	}
}
$prime_emails = array();

$booking_day = wp_strip_all_tags($_POST['booking_day']);
$usadate = date_create($booking_day);
$usadate = date_format($usadate,"l F d, Y");
$booking_type = wp_strip_all_tags($_POST['booking_type']);
$location = wp_strip_all_tags($_POST['booking_location']);
if(file_exists($_FILES['sf-form-file']['tmp_name']) || is_uploaded_file($_FILES['sf-form-file']['tmp_name'])){
	$file = $_FILES['sf-form-file'];
}

// Custom  

$fields = array();
$maildetails = array();
foreach($_POST as $key => $value){
	if(stripos($key, 'sf-form') !== false){
		// if(!empty($value)){
			$key = str_replace('sf-form-', '', $key);
			$field = array('name'=>$key,'value'=>$value);	
			array_push($fields, $field);
			array_push($maildetails, $value);
		// }
	}
}

// End Custom fields

$parent = wp_strip_all_tags($_POST['parent']);
$calendar_name =  get_post_meta($parent, 'text', true);
$calendar_email = get_post_meta($parent, 'email', true);
$redirect = wp_strip_all_tags($_POST['redirect']);
$auth = get_post_field( 'post_title', $parent );
if($booking_type == 'first'){
    $slot = 'Morning Booking';
}else if($booking_type == 'last'){
    $slot = 'Afternoon Booking';
}else {
    $slot = 'Full-day Booking';
}
if($booking_type == 'full'){
    $slot = str_replace('PM', 'pm', str_replace('AM', 'am', $_POST['fullrange']));
    $daytxt = 'Full-day booking';
}else if($booking_type == 'first'){
    $slot = str_replace('PM', 'pm', str_replace('AM', 'am', $_POST['firstrange']));
    $daytxt = 'Morning Booking';
}else {
    $slot = str_replace('PM', 'pm', str_replace('AM', 'am', $_POST['lastrange']));
    $daytxt = 'Afternoon Booking';
}
$title = $usadate.' &hyphen; '.$daytxt.' &hyphen; '.$location;

if(file_exists($_FILES['sf-form-file']['tmp_name']) || is_uploaded_file($_FILES['sf-form-file']['tmp_name'])){
    $target_dir = ABSPATH."/wp-content/uploads/bk-calendar-files/";
    $siteurl = get_site_url()."/wp-content/uploads/bk-calendar-files/";
    if(!file_exists($target_dir)){
        mkdir($target_dir, 0777, true);
    }
    $target_file = $target_dir . basename($file['name']);
    $type = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));
}

$mailserver = stripos($_SERVER['HTTP_HOST'], 'localhost') !== false ? 'webserver.co.za': $_SERVER['HTTP_HOST'];

$post = wp_insert_post(array (
    'post_type' => 'med-booking',
    'post_parent' => $parent,
    'post_title' => $title,
    'post_content' => '',
    'post_status' => 'pending',
    'comment_status' => 'closed',
    'ping_status' => 'closed',
));

$formfields = '';
$count = 0;
$hr = true;
foreach ($dbfields as $key => $value) {
	if($value['type'] != 'file'){
		if($value['type'] == 'title'){
			$formfields .= $hr ? '<hr>':'';
			$formfields .= '<p style="line-height: 45px; font-size: 12px; margin: 0;font-size: 18px; color: #000000;">'.$value['value'].'</p>';
			$hr = false;
		}else {
			$count++;
			$formfields .= '<p style="font-size: 14px; line-height: 25px; text-align: left; margin: 0;"><span style="font-size: 17px; mso-ansi-font-size: 18px;"><b>'.$value['value'].': </b>'.$maildetails[$count - 1].'</p>';
		}
	}
	if($value['endcol'] == true){
		$formfields .= '<hr>';
	}
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

// include edm template
//require MYPLUGIN_PLUGIN_DIR.'/modules/sendgrid/templates/template.php';
require '../modules/sendgrid/templates/template__.php';
require '../modules/sendgrid/vendor/autoload.php';

function removePost($post){
	wp_delete_post($post);
}
if($found){
	header('Location:'.$_SERVER["HTTP_REFERER"].'?med_status='.$exists);
}else {
    if($post){
        $postID = (string)$post;
        if(file_exists($_FILES['sf-form-file']['tmp_name']) || is_uploaded_file($_FILES['sf-form-file']['tmp_name'])){
            if($type != 'pdf' && $type != 'docx'){
                // format
                header('Location:'.$_SERVER["HTTP_REFERER"].'?med_status=format');
                removePost($postID);
            }else {
                if($file["size"] > 2000000){
                    // size
                    header('Location:'.$_SERVER["HTTP_REFERER"].'?med_status=size');
                    removePost($postID);
                }else {
                    if(!file_exists($target_dir.$postID)){
                        mkdir($target_dir.$postID, 0777, true);
                    }
                    if(!move_uploaded_file($file["tmp_name"], $target_dir.$postID.'/'.$postID.'.'.$type)){
                        // cannot upload
                        header('Location:'.$_SERVER["HTTP_REFERER"].'?med_status=errorfile');
                        removePost($postID);
                    }else {
                        update_field('field_5c1cf5a696803',$booking_day,$post);//booking_day
                        update_field('field_5c1cf5c796804',$booking_type,$post);//booking_type
                        update_field('field_5c14c24642415',$location,$post);//booking location
                        update_field('field_5c0d2f727e57i','false',$post);

                        $file_path = $siteurl.$postID.'/'.$postID.'.'.$type;

                        // include edm template
//							require MYPLUGIN_PLUGIN_DIR.'/modules/sendgrid/templates/template.php';
                        require '../modules/sendgrid/vendor/autoload.php';

                        $fileset = array('name'=>'sf_form_file_upload','value'=>$siteurl.$postID.'/'.$postID.'.'.$type);
                        array_push($fields, $fileset);
                        $fields = json_encode($fields);
                        update_field('field_5c14c45f42426',$fields,$post);//save form values
                        update_field('field_5c1a4f8a99447',$parent,$post);//calendar-define

                        // Success
                        if(isset($redirect) && !empty($redirect)){
                            header('Location:'.$redirect);
                        }else {
                            header('Location:'.$_SERVER["HTTP_REFERER"].'?med_status=success');
                        }

                        // Email notify with attachment
                        foreach($_POST as $key => $value){
                            if(filter_var($value,FILTER_VALIDATE_EMAIL)){
                                if(in_array(str_replace('sf-form-', '', $key), $primaries)){
                                    array_push($prime_emails, $value);
                                }
                            }
                        }

                        //Attached file to admin mail
                        if(!empty($edmmail) && filter_var($edmmail, FILTER_VALIDATE_EMAIL) && !empty($settings->api)){
                            $email = new \SendGrid\Mail\Mail();
                            $attachment = $siteurl.$postID.'/'.$postID.'.'.$type;
                            $content    = file_get_contents($attachment);
                            $attachment = new \SendGrid\Mail\Attachment();
                            $attachment->setContent($content);
                            $attachment->setType("application/pdf");
                            $attachment->setFilename($postID.'.'.$type);
                            $attachment->setDisposition("attachment");


                            $email->setFrom($prime_emails[0], $site);
                            $email->setReplyTo($prime_emails[0]);
                            $email->setSubject("You have a new Mediation booking");
                            $email->addTo($edmmail, "Mediator");
                            $email->addContent("text/html", $adminedm);
                            $email->addAttachment($attachment);
                            $sendgrid = new \SendGrid($settings->api);
                            try {
                                $response = $sendgrid->send($email);
                            }catch (Exception $e) {}
                        }
                        
                        //Attached file to customer mail
                        if($settings->placed == 1 && !empty($settings->api)){
                            $prime_emails = array_unique($prime_emails);
                            foreach($prime_emails as $address){
                                $email = new \SendGrid\Mail\Mail();
                                $attachment = $siteurl.$postID.'/'.$postID.'.'.$type;
                                $content    = file_get_contents($attachment);
                                $attachment = new \SendGrid\Mail\Attachment();
                                $attachment->setContent($content);
                                $attachment->setType("application/pdf");
                                $attachment->setFilename($postID.'.'.$type);
                                $attachment->setDisposition("attachment");

                                $email->setFrom($calendar_email, $site);
                                $email->setReplyTo($edmmail);
                                $email->setSubject("Booking placed successfully");
                                $email->addTo($address, "Mediation Client");
                                $email->addContent("text/html", $pendingedm);
                                $email->addAttachment($attachment);
                                $sendgrid = new \SendGrid($settings->api);
                                try {
                                    $response = $sendgrid->send($email);
                                }catch (Exception $e) {}
                            }
                        }
                    }
                }
            }
        }else {

            update_field('field_5c1cf5a696803',$booking_day,$post);//booking_day
            update_field('field_5c1cf5c796804',$booking_type,$post);//booking_type
            update_field('field_5c14c24642415',$location,$post);//booking location
            update_field('field_5c0d2f727e57i','false',$post);
            $fields = json_encode($fields);
            update_field('field_5c14c45f42426',$fields,$post);//save form values
            update_field('field_5c1a4f8a99447',$parent,$post);//calendar-define

            // Success

            if(isset($redirect) && !empty($redirect)){
                header('Location:'.$redirect);
            }else {
                header('Location:'.$_SERVER["HTTP_REFERER"].'?med_status=success');
            }

            // Notify
            foreach($_POST as $key => $value){
                if(filter_var($value,FILTER_VALIDATE_EMAIL)){
                    if(in_array(str_replace('sf-form-', '', $key), $primaries)){
                        array_push($prime_emails, $value);
                    }
                }
            }

            if(!empty($edmmail) && filter_var($edmmail, FILTER_VALIDATE_EMAIL) && !empty($settings->api)){
                $email = new \SendGrid\Mail\Mail();
                $email->setFrom($prime_emails[0], $site);
                $email->setSubject("You have a new Mediation booking");
                $email->addTo($edmmail, "Mediator");
                $email->addContent(
                    "text/html", $adminedm
                );
                $sendgrid = new \SendGrid($settings->api);
                try {
                    $response = $sendgrid->send($email);
                }catch (Exception $e) {

                }
            }

            if($settings->placed == 1 && !empty($settings->api)){
                $prime_emails = array_unique($prime_emails);
                foreach($prime_emails as $address){
                    $email = new \SendGrid\Mail\Mail();
                    $email->setFrom($admin_email, $site);
                    $email->setSubject("Booking placed successfully");
                    $email->addTo($address, "Mediation Client");
                    $email->addContent(
                        "text/html", $pendingedm
                    );
                    $sendgrid = new \SendGrid($settings->api);
                    try {
                        $response = $sendgrid->send($email);
                    }catch (Exception $e) {

                    }
                }
            }
        }

    }else {
        header('Location:'.$_SERVER["HTTP_REFERER"].'?med_status=error');
    }
}



