<?php 
	function createDB(){
		global $wpdb;
		require_once(ABSPATH.'wp-admin/includes/upgrade.php');
		
   		$table = $wpdb->prefix . "med_settings";
		if($wpdb->get_var("SHOW TABLES LIKE '$table'") != $table){
			$charset_collate = $wpdb->get_charset_collate();

			$sql = "CREATE TABLE $table (
			  	id mediumint(9) NOT NULL AUTO_INCREMENT,
			  	type varchar(255) DEFAULT '' NOT NULL,
			  	font varchar(255) DEFAULT '' NOT NULL,
			  	color varchar(255) DEFAULT '' NOT NULL,
			  	highlight varchar(255) DEFAULT '' NOT NULL,
			  	pending varchar(255) DEFAULT '' NOT NULL,
			  	email varchar(255) DEFAULT '' NOT NULL,
			  	thanks_page varchar(255) DEFAULT '' NOT NULL,
			  	current_calendar varchar(255) DEFAULT '' NOT NULL,
			  	form_fields text NOT NULL,
			  	form_text text NOT NULL,
			  	legend text NOT NULL,
			  	email_placed tinyint(255) DEFAULT 0 NOT NULL,
			  	email_approved tinyint(255) DEFAULT 0 NOT NULL,
			  	email_changed tinyint(255) DEFAULT 0 NOT NULL,
			  	icons text NOT NULL,
			  	api varchar(255) DEFAULT '' NOT NULL,
			  	PRIMARY KEY (id)
			)$charset_collate;";
			dbDelta($sql); 

			// Now insert row
		  	$wpdb->insert($table, array(
		  		'type' => '',
		  		'font' => '',
		  		'color' => '#5183ca',
		  		'highlight' => '#60a0f3',
		  		'pending' => '#c78503',
		  		'email' => '',
		  		'current_calendar' => '',
		  		'form_fields' => '[]',
				'form_text' => '{"submit_text":"Submit booking","form_heading":"Schedule a Mediation","form_description":"Select a mediation date by clicking on an available or partially booked date above.","edmin":"Your Mediation booking has been successful","edmout":"Thank you for your interest","edmapprovein":"Your booking has been approved.","edmpending":"Your bookings is still pending approval, if approved we will notify you.","edmapprovepending":"Your booking was approved by the mediator.","edmchanged":"Your booking has changed","side_panel_content":""}',
				'legend' => '{"legend1":{"icon":"","text":""},"legend2":{"icon":"","text":""},"legend3":{"icon":"","text":""},"legend4":{"icon":"","text":""},"legend5":{"icon":"","text":""},"legend6":{"icon":"","text":""}}',
				'icons' => '[]',
				'api' => ''
				));
		}else {
			// $row = $wpdb->get_results("SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = '$table' AND column_name = 'newcolumn'");

	  //       if(empty($row)){
	  //       	$wpdb->query( "ALTER TABLE $table ADD COLUMN `newcolumn` VARCHAR(55) NOT NULL");
	  //       }
		}
	}
	function postTypes(){
		// Calendars
		register_post_type('med-calendar',
	        array(
	            'labels' => array(
	                'name' => __('Calendars'),
	                'singular_name' => __('Calendar'),
	                'add_new_item' => __('Add new calendar'),
	                'edit_item' => __('Edit calendar'),
	                'new_item' => __('New calendar'),
	                'view_item' => __('View calendar')
	            ),
	            'public' => false, 
				'publicly_queryable' => true,
				'show_ui' => true, 
				'exclude_from_search' => true, 
				'show_in_nav_menus' => false,
				'has_archive' => false,
				'rewrite' => false,
	            'show_in_menu' => false,
	            'supports' => array('title','custom-fields')
	        )
	    );
	    // Bookings
	    register_post_type('med-booking',
	        array(
	            'labels' => array(
	                'name' => __('Bookings'),
	                'singular_name' => __('Booking'),
	                'add_new_item' => __('Add new booking'),
	                'edit_item' => __('Edit booking'),
	                'new_item' => __('New booking'),
	                'view_item' => __('View booking')
	            ),
	            'public' => false, 
				'publicly_queryable' => true,
				'show_ui' => true, 
				'exclude_from_search' => true, 
				'show_in_nav_menus' => false,
				'has_archive' => false,
				'rewrite' => false,
	            'show_in_menu' => false,
	            'supports' => array('title','custom-fields')
	        )
	    );
	}
	// function deleteHandle(){
	// 	if(isset($_GET['medpost']) && !empty($_GET['medpost']) && $_GET['action'] == 'delete'){
	// 		wp_redirect('admin.php?page='.$_GET['page'].'&delete=success');
	// 	}
	// }
	// post messages filter
	function post_published($messages){
	   	$messages['post'][6] = 'Item created successfully';
	    return $messages;
	}
	// Filters
	function filters(){
		// Edit view post message
		add_filter('post_updated_messages', 'post_published');
	}
	// Populate new booking calendar select
	function selectPopulate($field){ 
		$currentCal = new currentCalendar;
	    $currentCal->select();

		$field['choices'] = array();
		$field['default_value'] = array();
		$loop = new WP_Query(array('post_type' => 'med-calendar'));
	    if($loop->have_posts()){
	        while ($loop->have_posts()){
	        	$loop->the_post(); 
	        	$eID = get_the_ID();
	        	$eT = get_the_title();
            	$field['choices'][$eID] = $eT;	
            	if($eID == $currentCal->id){
            		$field['default_value'][0] = $eID;	
            	}
	        }
	    }
	    return $field;
	}
	// shortcode syntax
	function shortcodeSyntax($value){
		$value = '[med-calendar name="'.$value.'"]'; 
    	return $value;	
	}
	// custom fn on save acf
	function update_post_data($id){
    
	    // update post parent
		    $value = get_field('calendar-define',$id);
		    
		    $update = array(
			    'ID' => $id,
			    'post_parent' => $value,
			);
			wp_update_post($update);
		// update post shortcode
			$post = get_post($id); 
			$slug = $post->post_name;
			update_field('shortcode', $slug, $id);
	}
	// init custom ACF
	function initACF(){
		// Custom ACF path
			add_filter('acf/settings/path', 'acf_path');
			function acf_path($path){
			    // update path
			    $path = MYPLUGIN_PLUGIN_DIR.'/modules/acf/';
			    // return
			    return $path;
			}
			add_filter('acf/settings/dir', 'acf_dir');
			function acf_dir($dir){
			    // update path
			    $dir = MYPLUGIN_PLUGIN_URL.'/modules/acf/';
			    // return
			    return $dir;
			}
		// Populate new booking calendar select
			add_filter('acf/load_field/name=calendar-define', 'selectPopulate');
		// Add shortcode syntax on post page only
			add_filter('acf/load_value/name=shortcode', 'shortcodeSyntax');
		// Custom save hook
			add_action('acf/save_post', 'update_post_data');
		// Hide ACF in menu
			add_filter('acf/settings/show_admin', '__return_false');
	}
	function init(){
		postTypes();
		initACF();
		// deleteHandle();
		filters();
	}
	// Render settings page
	function adminSettings() {
		require 'admin_settings.php';
	}
	// Render import page
	function adminImport() {
		require 'admin_import.php';
	}