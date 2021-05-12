<?php 

// !!add textarea
include_once('../../../../wp-load.php');

global $wpdb;
$admin = get_admin_url();

$table = $wpdb->prefix . 'med_settings';

$value = $_POST['value'];

// get settings db for active fields
$results = $wpdb->get_results("SELECT * FROM $table WHERE id=1");
if(!empty($results)){         
    foreach($results as $row){
    	// make sure only first one if multi rows added in error
    	if($row->id === '1'){
    		$form = json_decode($row->form_fields,true);
    		foreach ($form as $i => $field){
    			if($field['name'] == $value){
    				unset($form[$i]);
    			}
    		}
    	}
    }
}


	// Update settings db for active fields
		$wpdb->update($table, array(
			'form_fields' => json_encode($form),
		),array('id'=>1));

		echo 'success';
		die();
	

		
		
	
