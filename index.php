<?php 
/*
Plugin Name: Mediation Calendar
Plugin URI: mediator-web.com/documentation
Description: Custom Mediation Booking Calendar.
Version: 1.1.5
Author: Mediator Web
Author URI: mediator-web.com
License: Interal
*/
// Admin definition
	if(!defined('MYPLUGIN_THEME_DIR'))
	    define('MYPLUGIN_THEME_DIR', ABSPATH . 'wp-content/themes/' . get_template());
	 
	if(!defined('MYPLUGIN_PLUGIN_NAME'))
	    define('MYPLUGIN_PLUGIN_NAME', trim(dirname(plugin_basename(__FILE__)), '/'));
	 
	if(!defined('MYPLUGIN_PLUGIN_DIR'))
	    define('MYPLUGIN_PLUGIN_DIR', WP_PLUGIN_DIR . '/' . MYPLUGIN_PLUGIN_NAME);
	 
	if(!defined('MYPLUGIN_PLUGIN_URL'))
	    define('MYPLUGIN_PLUGIN_URL', plugins_url() . '/' . MYPLUGIN_PLUGIN_NAME);
// Admin functions
	require('modules/calendar_worker.php');
	require('modules/settings_worker.php');

	require('modules/admin_templates.php');
	require('modules/admin_init.php');
	
// Client functions
	require('modules/client_init.php');
// Add shortcode
	add_shortcode('med-calendar', 'renderCalendar');
// Add to Admin menu side bar
	add_action('admin_menu', 'adminFN');
// Add sub menu items
	function addMenus(){
        $active_post = [];
        $active_calenders = [];
        $count = 0;
        $posts = get_posts(['numberposts' => -1,'post_status' => 'pending','post_type'  => 'med-booking']);
        $calenders = get_posts(['numberposts' => -1,'post_status' => 'publish','post_type'  => 'med-calendar']);

        foreach ($calenders as $calender) {
            array_push($active_calenders, $calender->ID);
        }

        foreach ($posts as $post){
            $date = get_field('booking_day', $post->ID);
            $calender = get_field('calendar-define', $post->ID);

            if(in_array($calender, $active_calenders)){
                if(strtotime(Date('Y-m-d',strtotime($date))) >= strtotime(Date('Y-m-d'))){
                    array_push($active_post,$post);
                }
            }
        }

        $count = count($active_post);
        add_menu_page(
            'Med Calendar',
             'Med Calendar',
            'manage_options',
            'med-bookings',
            'renderBookingList',
            'dashicons-calendar-alt'
        );
		add_submenu_page('med-bookings','Bookings',$count > 0 ? sprintf('Bookings <span class="awaiting-mod">%d</span>', $count) : 'Bookings','manage_options','med-bookings','renderBookingList');
		add_submenu_page('med-bookings','Settings','Settings','manage_options','med-settings','adminSettings');
		add_submenu_page('med-bookings','Calendars','Calendars','manage_options','med-calendars','renderCalendarList');
		add_submenu_page('med-bookings','Import','Import','manage_options','med-import','adminImport');
		add_action('admin_head', 'menu_highlight');
	}
	function adminFN(){
		addMenus();
		removeMeta();
	}
	function removeMeta(){
		remove_meta_box('slugdiv','med-calendar','normal');
		remove_meta_box('slugdiv','med-booking','normal');
	}
	function menu_highlight(){
		global $parent_file, $submenu_file, $post_type,$pagename;
		if(strrpos($submenu_file, 'post-new') === false){
			if($post_type == 'med-calendar'){
				$parent_file = 'med-bookings';
				$submenu_file = 'med-calendars';
			}else if($post_type == 'med-booking'){
				$parent_file = 'med-bookings';
				$submenu_file = 'med-calendars';
			}
		}
	}
// Now add to activate hook
	register_activation_hook( __FILE__, 'createDB');
// Include ACF
	include_once(MYPLUGIN_PLUGIN_DIR.'/modules/acf/acf.php');
	include_once(MYPLUGIN_PLUGIN_DIR.'/modules/acf/acf-fields.php');
// Custom post types
	add_action('init', 'init');
// Custom post save hook
// Add back end assets
	add_action('admin_enqueue_scripts', 'adminAssets');
	function adminAssets() {
		wp_enqueue_style('admin', MYPLUGIN_PLUGIN_URL.'/modules/admin/styles.css', false, rand());

		if(strrpos($_SERVER['REQUEST_URI'], 'med-settings')){
			wp_enqueue_script('codemirror', MYPLUGIN_PLUGIN_URL.'/dist/codemirror.js', false, rand(), true);
			wp_enqueue_script('jscolor', MYPLUGIN_PLUGIN_URL.'/modules/admin/jscolor.js', false, rand(), true);
			wp_enqueue_script('fonticon', MYPLUGIN_PLUGIN_URL.'/modules/admin/fonticonpicker.js', false, rand(), true);
			wp_enqueue_script('clipboard', MYPLUGIN_PLUGIN_URL.'/modules/admin/clipboard.min.js', false, rand(), true);
		}

		wp_enqueue_style('timepickcss', MYPLUGIN_PLUGIN_URL.'/dist/time/clockpicker.min.css', false, rand());
		wp_enqueue_script('timepickjs', MYPLUGIN_PLUGIN_URL.'/dist/time/clockpicker.min.js', false, rand(), true);

		if(strrpos($_SERVER['REQUEST_URI'], 'med-bookings')){
			wp_enqueue_script('salsa', MYPLUGIN_PLUGIN_URL.'/modules/admin/client_datepicker.js', false, rand(), true);
			wp_enqueue_script('tippy', MYPLUGIN_PLUGIN_URL.'/modules/admin/tippy.js', false, rand(), true);
			wp_enqueue_script('admincal', MYPLUGIN_PLUGIN_URL.'/modules/admin/calendar.min.js', false, rand(), true);
			wp_localize_script('admincal', 'Ajax', array(
				'ajaxurl' => admin_url('admin-ajax.php'),
				'security' => wp_create_nonce('ajax-string')
			));
		}

		wp_enqueue_script('admin', MYPLUGIN_PLUGIN_URL.'/modules/admin/scripts.min.js', false, rand(), true);
	}

// Add front end assets
	add_action('wp_head', 'loadAssets', 0);
	function loadAssets(){
		wp_enqueue_style('app', MYPLUGIN_PLUGIN_URL.'/dist/styles.css', false, rand());

		$settings = new currentSettings;
		$settings->getFont();
		if(isset($settings->font) && !empty($settings->font)){
			wp_enqueue_style('customfont', $settings->font, false, rand());
			$family = parse_url($settings->font);
			parse_str($family['query'], $query);
			$family = $query['family'];
        	$fontfamily = "
                #bk-calendar,#bk-form {
					font-family: {$query['family']};
				}";
			wp_add_inline_style('customfont',$fontfamily);
		}
		$settings->getColor();
		if(isset($settings->color) && !empty($settings->color)){
			wp_enqueue_style('customcolor', $settings->color, false, rand());
        	$customcolor = "
                :root {
					--bk-admin-base:{$settings->color};
				}";
			wp_add_inline_style('customcolor',$customcolor);
		}
		if(isset($settings->highlight) && !empty($settings->highlight)){
			wp_enqueue_style('customhighlight', $settings->highlight, false, rand());
        	$customhighlight = "
                :root {
					--bk-admin-highlight:{$settings->highlight};
				}";
			wp_add_inline_style('customhighlight',$customhighlight);
		}
		if(isset($settings->pending) && !empty($settings->pending)){
			wp_enqueue_style('custompending', $settings->pending, false, rand());
        	$custompending = "
                :root {
					--bk-admin-pending:{$settings->pending};
				}";
			wp_add_inline_style('custompending',$custompending);
		}

		wp_enqueue_script('app', MYPLUGIN_PLUGIN_URL.'/dist/app.js', false, rand(), true);
        wp_enqueue_script( 'script', "http://code.jquery.com/jquery-1.11.3.min.js");
		wp_enqueue_script('recaptchv2', 'https://www.google.com/recaptcha/api.js', false, rand(), true);
        wp_enqueue_script( 'v2cap_custom', MYPLUGIN_PLUGIN_URL.'/dist/v3captcha.js',array(),rand(),true );
        wp_localize_script('v2cap_custom', 'v2cap_custom', array('ajaxurl' => admin_url('admin-ajax.php')));
		
//         wp_enqueue_script( 'v3cap_custom', MYPLUGIN_PLUGIN_URL.'/dist/v3captcha.js',array(),1.2,true );
// 		wp_localize_script('v3cap_custom', 'v3cap_custom', array('ajaxurl' => admin_url('admin-ajax.php')));
//         wp_enqueue_script('recaptcha3', 'https://www.google.com/recaptcha/api.js?render=6LeLsukUAAAAACbL_TxX6lIg2Aht5oxhCtknpNex');//Site key here
		wp_enqueue_script('find-polyfill', 'https://cdn.polyfill.io/v3/polyfill.min.js?features=default,Array.prototype.includes,Array.prototype.find', false, rand(), true);
		wp_enqueue_script('fetch-polyfill', 'https://cdn.polyfill.io/v2/polyfill.js?features=fetch', false, rand(), true);
		
		wp_localize_script('app', 'Ajax', array(
			'ajaxurl' => admin_url('admin-ajax.php'),
			'security' => wp_create_nonce('ajax-string')
		));
	}

// Ajax functions

function ajax_bookings(){
  	check_ajax_referer('ajax-string', 'security');
	// get all post acf
	$type = $_POST['type'];
	$admin = $_POST['admin'];
	if($type == 'bookings'){
		$bookings = array();
		$posts = get_posts([
		  	'post_type' => 'med-booking',
		  	'post_status' => array('publish','pending'),
		  	'numberposts' => '-1'
		]);
		$previous = '';
		foreach ($posts as $i => $post){

			$date = get_field('booking_day', $post->ID);
			$time = get_field('booking_type', $post->ID);
			$parent = get_field('calendar-define', $post->ID);
			$id = $post->ID;
			$status = get_post_status($post->ID);
			$location = get_field('location', $post->ID);
			$booked = get_field('booked', $post->ID);
			$edited = get_field('book_edited', $post->ID);
				
			if($admin == 'true'){
				if($time == 'first'){
					$slot = 'First session';
				}else if($time == 'last'){
					$slot = 'Last session';
				}else {
					$slot = 'Full session';
				}
				$isbooked = get_post_meta($post->ID,'booked',true);
	    		$isedited = get_post_meta($post->ID,'book_edited',true);
	    		if($isbooked == 'true'){
	    			if($isedited == 'true'){
	    				$details = $slot.' - Booked off edited';
	    				$clientloc = get_field('location', $post->ID);
	    			}else {
	    				$details = $slot.' - Booked off';
	    				$clientloc = '';
	    			}
	    			$isclient = false;
	    		}else {
	    			$isclient = true;
	    			$clientloc = get_field('location', $post->ID);
	    			$details = $slot.' - '.get_field('location', $post->ID);
	    		}

				$blank = 'false';
				if($time != 'full' && $isbooked == 'true' && $edited == 'false'){
					foreach ($posts as $j => $other){
						$otherbooked = get_field('booked', $other->ID);
						$otheredited = get_field('book_edited', $other->ID);
						$othertime = get_field('booking_type', $other->ID);
						$otherdate = get_field('booking_day', $other->ID);
						if($date == $otherdate){
							if($otherbooked == 'true' && $otheredited == 'false' && $othertime != $time){
								$blank = 'true';
							}
						}
					}
				}

				$details = array($details);
				$id = array($post->ID);
			}else {
				$details = false;
			}

			$booking = array('date'=> $date,'type'=>$time,'parent'=>$parent,'id'=>$id,'status'=>$status,'details'=>$details,'location'=>$location,'blank'=>$blank,'client'=>$isclient,'clientloc'=>$clientloc,'booked'=>$isbooked,'edited'=>$isedited);
			if(strtotime($date) >= strtotime(date('d.m.Y'))){
				array_push($bookings, $booking);	
			}
			$previous = $date;
		}
		$list = json_encode($bookings,JSON_UNESCAPED_SLASHES);
		echo $list;
	  	die(); 
	}else if($type == 'calendar'){
		$id = $_POST['id'];
		$color = get_field('color', $id);
		$time0 = get_field('time_start0', $id);
		$length0 = get_field('time_end0', $id);
		$time1 = get_field('time_start1', $id);
		$length1 = get_field('time_end1', $id);
		$time2 = get_field('time_start2', $id);
		$length2 = get_field('time_end2', $id);
		$settings = array(
			'color'=>$color,
			'time_start0'=>$time0,
			'time_end0'=>$length0,
			'time_start1'=>$time1,
			'time_end1'=>$length1,
			'time_start2'=>$time2,
			'time_end2'=>$length2,
		);
		$settings = json_encode($settings,JSON_UNESCAPED_SLASHES);
		echo $settings;
	  	die(); 
	}else if($type == 'listpopup'){
		$id = $_POST['id'];
		$parent = $_POST['parent'];
		$first = $_POST['first'];
		$last = $_POST['last'];
		$is_lacation = false;
		$listed = array();
		$templates = array();
		$filtertemplates = array();
		$specific = array();
		$fields = get_fields($id);
		// get book status
    		$isbooked = get_post_meta($id,'booked',true);
    		$isedited = get_post_meta($id,'book_edited',true);
    	// end get book status
    	foreach ($fields as $key => $value){
    		if($key != 'calendar-define' && $key != 'booked' && $key != 'book_edited' && $key != 'form_fields' && !empty($value)){	
    			if($key == 'booking_type'){
    				$key = 'Booking session';
    			}

                if($key == 'location' && !empty($value)){
                    $is_lacation = true;
                }

                array_push($listed, array('key' => $key, 'value' => $value));
			}
    	}
    	$settings = new currentSettings;
    	$settings->getForm();
    	$template_fields = $settings->renderForm;
    	foreach($template_fields as $template){
    		if($template['type'] != 'title'){
    			array_push($filtertemplates, $template);
    		}
    	}
    	foreach(json_decode(str_replace("\'","'",$fields['form_fields']),true) as $i => $field){
    		array_push($listed, array('key'=>$field['name'],'value'=>$field['value'],'type'=>$filtertemplates[$i]['type']));
    	}

    	array_push($listed, array('key'=>'booked','value'=>$isbooked));
    	array_push($listed, array('key'=>'edited','value'=>$isedited));
    	// push location for book offs
    	
    	$worker = new currentCalendar;
    	$worker->hasLocation(get_field('booking_day',$id,true));
    	$locations = array();
    	$loc_template = array();

    	foreach (get_fields($parent) as $key => $value){
    		if(stripos($key, 'location') !== false){
    			if(stripos($key, '1') !== false || stripos($key, '2') !== false || stripos($key, '3') !== false || stripos($key, '4') !== false || stripos($key, '5') !== false || stripos($key, '6') !== false){
	    			if(!empty($value)){
	    				$loc = array('name'=>$key,'value'=>$value);
		    			array_push($loc_template, $loc);
	    			}
	    		}
    		}
    	}
    	if($worker->hasloc == false){
	    	foreach (get_fields($parent) as $key => $value){
	    		if(stripos($key, 'location') !== false){
	    			if(stripos($key, '1') !== false || stripos($key, '2') !== false || stripos($key, '3') !== false || stripos($key, '4') !== false || stripos($key, '5') !== false || stripos($key, '6') !== false){
		    			if(!empty($value)){
		    				$loc = array('name'=>$key,'value'=>$value);
			    			array_push($locations, $loc);
		    			}
		    		}
	    		}
	    	}
    	}else {
    		foreach (get_fields($parent) as $key => $value){
	    		if(stripos($key, 'location') !== false){
	    			if($value == $worker->hasloc){
	    				$loc = array('name'=>$key,'value'=>$worker->hasloc);
		    			array_push($locations, $loc);
		    		}
	    		}
	    	}
    	}
	    	
    	if($isbooked == 'true' && $is_lacation == false){
    		array_push($listed, array('key'=>'location','value'=>$locations));
    	}

    	$settings = new currentSettings;
    	$settings->getForm();
    	$template_fields = $settings->renderForm;
		foreach($template_fields as $field){
			array_push($templates, array('key'=>$field['name'],'value'=>$field['value'],'type'=>$field['type'],'required'=>$field['required']));
		}


    	if($fields['booking_type'] == 'first'){
    		$slot = 'First session';
    	}else if($fields['booking_type'] == 'last'){
			$slot = 'Last session';
    	}else {	
			$slot = 'Full session';
    	}
    	$usadate = date_create($fields['booking_day']);
		$usadate = date_format($usadate,"F d, Y");
    	if($isbooked && !$isedited){
    		$specific['name'] = $slot.' for '.$usadate;
    	}else {
    		$specific['name'] = $slot.' for '.$usadate;
    	}
    	$specific['id'] = $id;
    	$specific['delete'] = wp_nonce_url('?page=med-bookings&action=delete&medpost='.$id,'cpt_delete_post');

    	$listing = array('listed'=>$listed,'specific'=>$specific,'templates'=>$templates,'loc_template'=>$loc_template);
		$listing = json_encode($listing);
		echo $listing;
		die();
	}else if($type == 'icon'){
		$worker = new currentCalendar;
		$worker->icons();

		$cal = $_POST['cal'];

		$icons = json_decode($worker->icons,true);
		$sets = array();
		
		foreach($icons as $icon){
			if($icon['cal'] == $cal){
				array_push($sets, $icon['day']);
			}
		}
		echo json_encode($sets);
		die();
	}
}
add_action('wp_ajax_call', 'ajax_bookings');
add_action('wp_ajax_nopriv_call', 'ajax_bookings');

// Skip trash on post edit page

function skipTrash($id){
    if(get_post_type($id) == 'med-calendar'){
        // Force delete
        wp_delete_post($id, true);
        wp_redirect('admin.php?page=med-calendars&delete=success');
        exit;
    }else if(get_post_type($id) == 'med-booking'){
        // Force delete
        wp_delete_post($id, true);
        wp_redirect('admin.php?page=med-bookings&delete=success');
        exit;
    }
} 
add_action('wp_trash_post', 'skipTrash');

function filter_plugin_updates( $value ) {
    unset( $value->response['calendar/index.php'] );
    return $value;
}
add_filter('site_transient_update_plugins','filter_plugin_updates');



// !!!!!THIS IS IF SAVES AS DRAFT
add_filter('wp_insert_post_data', 'filter_post_data');

function filter_post_data($postData){

	if($postData['post_type'] == 'med-booking' || $postData['post_type'] == 'med-calendar'){
	    if($postData['post_status'] == 'draft'){
	        $postData['post_status'] = 'publish';
	    }
	}

    return $postData;
}


add_action('wp_ajax_check_authorized_user', 'check_authorized_user');
add_action('wp_ajax_nopriv_check_authorized_user', 'check_authorized_user');
// add_action("init","check_authorized_user");
function check_authorized_user() {
//     if(isset($_POST["v3cap_token"]) && !empty($_POST["v3cap_token"])){
//         $url = "https://www.google.com/recaptcha/api/siteverify";
//         $data = [
//             'secret' => '6LeLsukUAAAAALa-mftYM5RRjh5ujaeXKcKa6LfI',//secret key here
//             'response' => $_POST['v3cap_token'],
//             'remoteip' => $_SERVER['REMOTE_ADDR']
//         ];

//         $options = array(
//             'http' => array(
//                 'header' => "Content-type: application/x-www-form-urlencoded\r\n",
//                 'method' => 'POST',
//                 'content' => http_build_query($data)
//             )
//         );

//         $context = stream_context_create($options);
//         $response = file_get_contents($url, false,$context);
//         $resp = json_decode($response, true);

// 		echo json_encode($resp);
// 		wp_die();
//     }
		if(isset($_POST["response"]) && !empty($_POST["response"])){
        $secret = "6Ld178gZAAAAAKiMxcZuroBZA2azs2qKk_VJj2qz";
        $response = $_POST["response"];
        $verify = file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret={$secret}&response={$response}");
        $resp = json_decode($verify, true);
        echo json_encode($resp);
    }else{
        echo json_encode(['success' => false]);
    }

    wp_die();

}


// AJAX UPDATE BOOKING
// disable tippy on rm FORM LIST
// ajax available update json attr, and delete

// if typed email validate
// move booking email
// move booking check

// same structure btns,selects etc popups
// if half booked but free, dont limit half session
// email on change booking

// err deleting client booking half test
// not required fill in
// do edit bookings front, and editable slot book off
// 1. Error inline on booking list page
// 2. WP messages coming up in Calendar


// FRONT END DAYS DONT STOP!!
// test wp mail rather

// approve from popup


// file input edm
// update settigns edm txt