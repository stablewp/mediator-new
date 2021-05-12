<?php

if(!defined(ABSPATH)){
    $pagePath = explode('/wp-content/', dirname(__FILE__));
    include_once('../../../../wp-load.php');
}

$contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
if($contentType === "application/json"){
    $data = trim(file_get_contents("php://input"));
    $posts = json_decode($data, true);

    $id = $posts['id'];
    $fields = $posts['fields'];
    $type = $posts['type'];
    $addvalues = array();
    $booking_day = '';
    $booking_type = '';
    $location = '';
    $extra_field = array();
    $maildetails = array();
    foreach ($fields as $value){
        if($value['name'] == 'location'){
            $loc = $value['value'];
            update_field('field_5c14c24642415',$value['value'],$id);
            $location = $value['value'];
        }else if($value['name'] == 'booking_day'){
            update_field('field_5c1cf5a696803',$value['value'],$id);
            $booking_day = $value['value'];
            $edmdate = $value['value'];
        }else if($value['name'] == 'booking_type'){
            update_field('field_5c1cf5c796804',$value['value'],$id);
            $booking_type = $value['value'];
        }else {
            if($value['name'] == 'sf-form-file'){
                $field = array('name'=>'sf_form_file_upload','value'=>$value['value']);
            }else {
                $field = array('name'=>$value['name'],'value'=>$value['value']);
            }
            if(isset($value['value']) && !empty($value['value'])){
                array_push($extra_field, $value['value']);
            }
            array_push($addvalues, $field);
            array_push($maildetails, $value['value']);
        }
    }
    $addvalues = json_encode($addvalues);

    // build title
    if($booking_type == 'first'){
        $daytxt = 'Morning booking';
    }else if($booking_type == 'last'){
        $daytxt = 'Afternoon Booking';
    }else {
        $daytxt = 'Full-day Booking';
    }
    $usadate = date_create($booking_day);
    $usadate = date_format($usadate,"F d, Y");
    $title = $usadate.' &hyphen; '.$daytxt.' &hyphen; '.$location;
    // end build title

    $updatePost = array(
        'ID' => $id,
        'post_title' => $title
    );
    $timings = '';
    if(wp_update_post($updatePost)){
        update_field('field_5c14c45f42426',$addvalues,$id);
            update_post_meta($id, 'book_edited', !empty($extra_field)?'true':'false');
        echo json_encode('success');

        if($type == 'client'){
            $worker = new currentCalendar;
            $worker->select();
            $worker->getRecipient($worker->id);
            $edmname = $worker->edmname;
            $settings = new currentSettings;
            $settings->getEmail();
            $settings->getForm();
            $settings->getAPI();
            $settings->getEDM();
            $admin_email = $worker->edmmail;

            if($booking_type == 'first'){
                $timings = $worker->getTimeRange('first',$posts['parent']);
            }else if($booking_type == 'last'){
                $timings = $worker->getTimeRange('last',$posts['parent']);
            }else {
                $timings = $worker->getTimeRange('full',$posts['parent']);
            }

            $dbfields = $settings->renderForm;
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

            $primaries = array();
            foreach($dbfields as $i => $field){
                if($field['primary'] == 'true'){
                    array_push($primaries, $field['name']);
                }
            }
            $prime_emails = array();
            if($settings->changed == 1 && !empty($settings->api)){
                foreach($fields as $value){
                    if(filter_var($value['value'],FILTER_VALIDATE_EMAIL)){
                        if(in_array($value['name'], $primaries)){
                            array_push($prime_emails, $value);
                        }
                    }
                }
                $prime_emails = array_unique($prime_emails);
                foreach($prime_emails as $address){
                    $site = get_bloginfo('name');
                    $mailserver = stripos($_SERVER['HTTP_HOST'], 'localhost') !== false ? 'webserver.co.za': $_SERVER['HTTP_HOST'];
                    // require sendgrid
                    require '../modules/sendgrid/vendor/autoload.php';
                    // include edm template
                    require '../modules/sendgrid/templates/template.php';

                    $email = new \SendGrid\Mail\Mail();
                    $email->setFrom($admin_email, $site);
                    $email->setReplyTo($admin_email);
                    $email->setSubject("Your Mediation booking has changed");
                    $email->addTo($address['value'], "Mediation Client");
                    $email->addContent(
                        "text/html", $movededm
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
        echo json_encode('error');
    }
}