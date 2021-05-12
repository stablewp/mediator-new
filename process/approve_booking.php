<?php 
if(!defined(ABSPATH)){
    $pagePath = explode('/wp-content/', dirname(__FILE__));
    include_once('../../../../wp-load.php');
}

$site = get_bloginfo('name');

// require sendgrid
require '../modules/sendgrid/vendor/autoload.php';

$id = $_POST['id'];
$fields = get_field('form_fields',$id,false);
$edmtime = get_field('booking_type',$id,false);

if($edmtime == 'full'){
	$edmtime = $_POST['full'];
}else if($edmtime == 'first'){
	$edmtime = $_POST['first'];
}else {
	$edmtime = $_POST['last'];
}

$edmdate = date_create(get_field('booking_day',$id,false));
$edmdate = date_format($edmdate,"l F d, Y");

$mailserver = stripos($_SERVER['HTTP_HOST'], 'localhost') !== false ? 'webserver.co.za': $_SERVER['HTTP_HOST'];

if($wpdb->query($wpdb->prepare("UPDATE $wpdb->posts SET post_status = '%s' WHERE ID = %d",'publish',$id))){

	$worker = new currentCalendar;
	$worker->select();
	$worker->getRecipient($worker->id);
	$edmname = $worker->edmname;

	$settings = new currentSettings;
	$settings->getEmail();
	$settings->getForm();
	$settings->getEDM();
	$settings->getAPI();
    $admin_email = $worker->edmmail;

	$dbfields = $settings->renderForm;
	$primaries = array();
	foreach($dbfields as $i => $field){
		if($field['primary'] == 'true'){
			array_push($primaries, $field['name']);
		}
	}
	$primaries = array_unique($primaries);
	$prime_emails = array();

	$thefields = get_field('form_fields',$id);
	$thefields = json_decode($thefields,true);
	$location = get_field('location',$id);

	// form fields

	$formfields = '';
	$count = 0;
	$hr = true;
	foreach ($dbfields as $i => $field){
		if($field['type'] != 'file'){
			if($field['type'] == 'title'){
				$formfields .= $hr ? '<hr>':'';
				$formfields .= '<p style="line-height: 45px; font-size: 12px; margin: 0;font-size: 18px; color: #000000;">'.$field['value'].'</p>';
				$hr = false;
			}else {
				$count++;
				$formfields .= '<p style="font-size: 14px; line-height: 25px; text-align: left; margin: 0;"><span style="font-size: 17px; mso-ansi-font-size: 18px;"><b>'.$field['value'].': </b>'.$thefields[$count - 1]['value'].'</p>';
			}
		}	
		if($value['endcol'] == true){
			$formfields .= '<hr>';
		}
	}
	// include edm template
	require '../modules/sendgrid/templates/template__.php';

	if($settings->approved == 1 && !empty($settings->api)){
		foreach(json_decode($fields,true) as $field){
			if(filter_var($field['value'],FILTER_VALIDATE_EMAIL)){
				if(in_array(str_replace('sf-form-', '', $field['name']), $primaries)){
					array_push($prime_emails, $field['value']);
				}
			}
		}
		$prime_emails = array_unique($prime_emails);
		foreach($prime_emails as $address){
			$email = new \SendGrid\Mail\Mail();
			$email->setFrom($admin_email, $site);
            $email->setReplyTo($admin_email);
			$email->setSubject("Your Mediation booking has been approved");
			$email->addTo($address, "Mediation Client");
			$email->addContent(
			    "text/html", $approvededm
			);
			$sendgrid = new \SendGrid($settings->api);
			try {
			    $response = $sendgrid->send($email);
			}catch (Exception $e) {
			    
			}
		}
	}
	echo 'success';
}else {
	echo 'error';
}