<?php 

include_once('../../../../wp-load.php');

global $wpdb;
$admin = get_admin_url();

$fields = array();
// $exists = array();
$field_exists = array();
$dupe_array = array();
$all = array();
$count_file = 0;
$count_exists = 0;
$count = 0;

function post_dupes($array){
   return count($array) !== count(array_unique($array));
}

foreach($_POST as $key => $values){
	if(stripos($key, 'sf-form') !== false || stripos($key, 'sf-title') !== false){
		if(isset($values[0]) && isset($values[1])){
			if(!empty($values[0]) && !empty($values[1])){

				$count++;

				$value = $values[0];
				$type = $values[1];
				$required = isset($_POST['sf-required-'.str_replace('sf-form-', '', $key)]) ? true : false;
				$break = isset($_POST['sf-break-'.str_replace('sf-form-', '', $key)]) ? true : false;
				$border = isset($_POST['sf-border-'.str_replace('sf-form-', '', $key)]) ? true : false;
				$endcol = isset($_POST['sf-endcol-'.str_replace('sf-form-', '', $key)]) ? true : false;
				$primary = isset($_POST['sf-primary-'.str_replace('sf-form-', '', $key)]) ? true : false;
				// sanitize value

			   	$value = preg_replace('/[^A-Za-z0-9\- ]/', '', $value);
			   	$value = ucwords($value);
			   	$name = preg_replace('/[^A-Za-z0-9\-]/', '', $value);
			   	$name = str_replace(' ', '_', $value); 
			   	$name = preg_replace('/-+/', '_', $name);
			   	$name = strtolower($name);

			   	if($type == 'file'){
			   		$field = array('name'=>'sf-form-file','value'=>$value,'type'=>$type,'required'=>$required,'break'=>$break,'border'=>$border,'endcol'=>$endcol,'primary'=>$primary);
			   	}else {
			   		if($type == 'title'){
				   		$field = array('name'=>$key,'value'=>$value,'type'=>'title','required'=>'','break'=>'','border'=>'');	
				   	}else {	
						$field = array('name'=>$name.$count,'value'=>$value,'type'=>$type,'required'=>$required,'break'=>$break,'border'=>$border,'endcol'=>$endcol,'primary'=>$primary);
				   	}
			   	}
				array_push($fields, $field);
			}
		}
	}
}




$thanks = $_POST['thanks-page'];
$font = $_POST['font'];
if(isset($_POST['color']) && !empty($_POST['color'])){
	$color = $_POST['color'];
}else {
	$color = '5183ca';
}
if(isset($_POST['highlight']) && !empty($_POST['highlight'])){
	$highlight = $_POST['highlight'];
}else {
	$color = '60a0f3';
}
if(isset($_POST['pending']) && !empty($_POST['pending'])){
	$pending = $_POST['pending'];
}else {
	$color = 'c78503';
}

$lgicon1 = $_POST['legend-icon-1'];
$lgtxt1 = $_POST['legend1'];
$lgicon2 = $_POST['legend-icon-2'];
$lgtxt2 = $_POST['legend2'];
$lgicon3 = $_POST['legend-icon-3'];
$lgtxt3 = $_POST['legend3'];
$lgicon4 = $_POST['legend-icon-4'];
$lgtxt4 = $_POST['legend4'];
$lgicon5 = $_POST['legend-icon-5'];
$lgtxt5 = $_POST['legend5'];
$lgicon6 = $_POST['legend-icon-6'];
$lgtxt6 = $_POST['legend6'];

$submit_text = $_POST['submit_text'];
$form_heading = $_POST['form_heading'];
$form_description = $_POST['form_description'];
$side_panel_content = $_POST['side_panel_content'];
$edmin = $_POST['edmin'];
$edmout = $_POST['edmout'];
$edmapprovein = $_POST['edmapprovein'];
$edmpending = $_POST['edmpending'];
$edmapprovepending = $_POST['edmapprovepending'];
$edmchanged = $_POST['edmchanged'];

$admin_email = $_POST['admin-email'];
$email_placed = isset($_POST['email-placed']) ? 1 : 0;
$email_approved = isset($_POST['email-approved']) ? 1 : 0;
$email_changed = isset($_POST['email-changed']) ? 1 : 0;
$api = $_POST['api'];

$table = $wpdb->prefix . 'med_settings';

// get settings db for active fields
$results = $wpdb->get_results("SELECT * FROM $table WHERE id=1");
if(!empty($results)){         
    foreach($results as $row){
    	// make sure only first one if multi rows added in error
    	if($row->id === '1'){


    		$form = json_decode($row->form_fields,true);
    		// foreach($form as $field){
    		// 	array_push($exists, $field['name']);
    		// }
    		foreach ($fields as $field){
    // 			if(in_array($field['name'], $exists)){
				// 	$count_exists++;
				// 	break;
				// }else {
					array_push($all, $field);
				// }
    		}
    		

            $text = json_decode($row->form_text,true);
            $text['submit_text'] = $submit_text;
            $text['form_heading'] = $form_heading;
            $text['form_description'] = $form_description;
            $text['edmin'] = $edmin;
            $text['edmout'] = $edmout;
            $text['edmapprovein'] = $edmapprovein;
            $text['edmpending'] = $edmpending;
            $text['edmapprovepending'] = $edmapprovepending;
            $text['edmchanged'] = $edmchanged;
            $text['side_panel_content'] = $_POST['side_panel_content'];
            $text['side_panel_content'] = str_replace("\'", "'", $text['side_panel_content']);

            $legend = json_decode($row->legend,true);
            $legend['legend1']['icon'] = $lgicon1;
			$legend['legend1']['text'] = $lgtxt1;
            $legend['legend2']['icon'] = $lgicon2;
			$legend['legend2']['text'] = $lgtxt2;
            $legend['legend3']['icon'] = $lgicon3;
			$legend['legend3']['text'] = $lgtxt3;
            $legend['legend4']['icon'] = $lgicon4;
			$legend['legend4']['text'] = $lgtxt4;
            $legend['legend5']['icon'] = $lgicon5;
			$legend['legend5']['text'] = $lgtxt5;
            $legend['legend6']['icon'] = $lgicon6;
         	$legend['legend6']['text'] = $lgtxt6;
    	}
    }
}

// Validation or save
	foreach ($fields as $field){
		$type = $field['type'];
		if($type == 'file'){
			$count_file++;
		}
	}
	if($count_file > 1){
		wp_redirect(add_query_arg('message','file', $admin.'/admin.php?page=med-settings'));
		die();
	}
	if($count_exists > 0){
		wp_redirect(add_query_arg('message','exists', $admin.'/admin.php?page=med-settings'));
		die();
	}
	// Update settings db for active fields
		$wpdb->update($table, array(
			'font' => $font,
			'color' => '#'.$color,
			'highlight' => '#'.$highlight,
			'pending' => '#'.$pending,
			'email' => $admin_email,
			'thanks_page' => $thanks,
			'form_fields' => json_encode($all),
			'form_text' => json_encode($text,JSON_UNESCAPED_SLASHES),
			'legend' => json_encode($legend),
			'email_placed' => $email_placed,
			'email_approved' => $email_approved,
			'email_changed' => $email_changed,
			'api' => $api,
		),array('id'=>1));

		// Direct back
		wp_redirect(add_query_arg('message','success', $admin.'/admin.php?page=med-settings'));
			die();
		
	
