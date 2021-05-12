<?php
// WP list fn
	if(!class_exists('WP_List_Table')){
	    require_once( ABSPATH . 'wp-admin/includes/class-wp-list-table.php' );
	}
	class adminPage extends WP_List_Table {
	    function __construct(){
	        global $status, $page;
	        parent::__construct( array(
	            'singular' => 'med-calendar',
	            'plural' => 'med-calendars', 
	            'ajax' => false 
	        ));  
	    }
	    function column_title($item){
	    	$delete_nonce = wp_create_nonce('cpt_delete_post');
	    	$type = get_post_type($item['ID']);
	  		if($type == 'med-booking'){
	  			$settings = new currentSettings;
	  			$settings->getForm();
	  			$formletts = $settings->renderForm; 
	  			$fields = get_fields($item['ID']);
		    	$panel = '';
		    	foreach ($fields as $key => $value) {
		    		if($key != 'calendar-define' && $key != 'booked' && $key != 'form_fields' && !empty($value)){	
		    			if($key == 'booking_type') {
		    				if($value == 'first'){
		    					$slot = 'First session';
		    				}else if($value == 'last'){
		    					$slot = 'Last session';
		    				}else {
		    					$slot = 'Full session';
		    				}
		    				$panel .= '
							<div class="med-panel-item">
								<p><b style="text-transform:capitalize">'.str_replace('-',' ',str_replace('_', ' ', $key)).': </b><br>'.$slot.'</p>
							</div>';
		    			}else {
		    				$panel .= '
							<div class="med-panel-item">
								<p><b style="text-transform:capitalize">'.preg_replace('/[0-9]+/', '', str_replace('-',' ',str_replace('_', ' ', $key))).': </b><br>'.$value.'</p>
							</div>';
		    			}
					}
		    	}
		    	// Custom Fields
		    	if(isset($fields['form_fields'])){
		    		// foreach (json_decode($fields['form_fields'],true) as $field){
		    		//$ufields = json_decode($fields['form_fields'],true);
		    		$ufields = json_decode(str_replace("'","\'",$fields['form_fields']),true);
		    		foreach ($formletts as $i => $field){
		    			if($field['type'] == 'title'){
		    				$panel .= '
									<div class="med-panel-item med-panel-title">
										<p><b style="text-transform:capitalize">'.$field['value'].'</b></p>
									</div>';
		    			}else {
				    		if($field['type'] == 'file'){
				    			foreach ($ufields as $key => $value) {
				    				if($value['name'] == 'sf_form_file_upload'){
				    					$formvalue = $value['value'];
				    					$panel .= '
										<div class="med-panel-item">
											<p><b style="text-transform:capitalize">File Upload - Click URL to view: </b><br><a href="'.$formvalue.'" target="_blank">'.$formvalue.'</a></p>
										</div>';
										break;
				    				}else {
				    					$formvalue = '';
				    				}
				    			}
				    		}else {
				    			foreach ($ufields as $key => $value) {
				    				if($value['name'] == $field['name']){
				    					$formvalue = $value['value'];
				    				}
				    			}
				    			$panel .= '
								<div class="med-panel-item">
									<p><b style="text-transform:capitalize">'.$field['value'].': </b><br>
									'.$formvalue.'</p>
								</div>';
				    		}
				    	}
			    	}
		    	}
			    	

		    	// End Custom Fields

		    	$item_date = new DateTime(get_field('booking_day',$item['ID']));
		    	$current_date = new DateTime;
		    	$current_date->setTime(0, 0);

		    	$past = $item_date < $current_date ? ' - Expired': '';
		    	$ispast = $item_date < $current_date ? true : false;

		    	// different actions for book off day
		    	
	    		$actions = strrpos($fields['booked'], 'true') !== false ? 
	    		  array(
                      'move' => sprintf('<a href="#" class="move-select" data-url="'.plugins_url().'/'.MYPLUGIN_PLUGIN_NAME.'" data-postid="'.$item['ID'].'">Move to calendar</a>'),
		            'delete' => sprintf('<a href="?page=%s&action=%s&medpost=%s&_wpnonce=%s" data-day="'.$fields['booking_day'].'" data-id="'.$item['ID'].'" class="delete-prompt">Delete</a>', esc_attr($_REQUEST['page']),'delete',absint($item['ID']),$delete_nonce)
		          )
	    		: array(
		            // 'edit' => sprintf('<a href="post.php?post='.$item['ID'].'&action=edit">Edit</a>',$_REQUEST['page'],'edit',$item['ID']),
		            'move' => sprintf('<a href="#" class="move-select" data-url="'.plugins_url().'/'.MYPLUGIN_PLUGIN_NAME.'" data-postid="'.$item['ID'].'">Move to calendar</a>'),
		            'delete' => sprintf('<a href="?page=%s&action=%s&medpost=%s&_wpnonce=%s" data-day="'.$fields['booking_day'].'" data-id="'.$item['ID'].'" class="delete-prompt">Delete</a>', esc_attr($_REQUEST['page']),'delete',absint($item['ID']),$delete_nonce)
		        );


				$title = str_replace('hyphen;', '-', $item['title']);
				$title = preg_replace('/[^A-Za-z0-9\-]/', '', $title);
				$title = str_replace('amp;', '', $item['title']);

		        // $rowtitle = strrpos($fields['booked'], 'true') !== false ? 
		        $rowtitle = '<strong><a href="#" class="row-title bk-srcdelete" data-day="'.$fields['booking_day'].'">'. $title .'<span style="color:#c03">'.$past.'</span></a></strong>';
		        // : '<strong><a class="row-title" href="post.php?post='.$item['ID'].'&action=edit">'.$item['title'].'<span style="color:#c03">'.$past.'</span></a></strong>';

		        return sprintf('%1$s %3$s',
		            $rowtitle,
		            $item['ID'],
		            $this->row_actions($actions)
		        ).'<div class="med-booking-panel"><div class="panel-flex">'.$panel.'</div></div>';
		    }else {
		    	$actions = array(
		            'edit' => sprintf('<a href="post.php?post='.$item['ID'].'&action=edit">Edit</a>',$_REQUEST['page'],'edit',$item['ID']),
		            'delete' => sprintf('<a href="?page=%s&action=%s&medpost=%s&_wpnonce=%s" data-day="'.$fields['booking_day'].'" data-id="'.$item['ID'].'" class="delete-prompt">Delete</a>', esc_attr($_REQUEST['page']),'delete',absint($item['ID']),$delete_nonce),
		        );
		        return sprintf('%1$s %3$s',
		            '<strong><a class="row-title" href="admin.php?page=med-bookings&calendar-select='.$item['ID'].'">'.$item['title'].'</a></strong>',
		            $item['ID'],
		            $this->row_actions($actions)
		        );
		    }
	    }
	    function column_date($item){
	    	$type = get_post_type($item['ID']);
	  		if($type == 'med-booking'){
		    	$fields = get_fields($item['ID']);
		    	if(strrpos($fields['booked'], 'true') !== false){
		    		$status = '<div class="bk-status-ball admin-setting"></div><p>Set by admin</p>';
			        $bactions = '';//'<div class="med-booking-actions"><p class="bk-edit" data-day="'.$fields['booking_day'].'" data-id="'.$item['ID'].'">Update</p></div>';
			        return sprintf('%1$s',
			            '<div class="med-booking-status admin-set">'.$status.'</div><div class="med-booking-expand"><p>Expand</p></div>'.$bactions,
			            $item['ID']
			        );
		    	}else {
		    		$status = $item['status'] == 'pending' ? '<div class="bk-status-ball pending"></div><p>Pending</p>': '<div class="bk-status-ball"></div><p>Approved</p>';
			        $bactions = $item['status'] == 'pending' ? '<div class="med-booking-actions"><p class="bk-approve" data-url="'.plugins_url().'/'.MYPLUGIN_PLUGIN_NAME.'" data-id="'.$item['ID'].'">Accept</p><p class="bk-deny">Reject</p></div>': '<div class="med-booking-actions">
                    <!--<p class="bk-cancel">Cancel</p>-->
                    </div>';
			        return sprintf('%1$s',
			            '<div class="med-booking-status">'.$status.'</div><div class="med-booking-expand"><p>Expand</p></div>'.$bactions,
			            $item['ID']
			        );
		    	}
	    	}
	    }
	    function column_cb($item){
	        return sprintf(
	            '<input type="checkbox" name="%1$s[]" value="%2$s" />',
	            $this->_args['singular'],
	            $item['ID']
	        );
	    }
	    function get_columns(){
	        $columns = array(
	            'cb' => '<input type="checkbox" />',
	            'title' => 'Title'
	        );
	        return $columns;
	    }
	    function get_b_columns(){
	        $bcolumns = array(
	            'cb' => '<input type="checkbox" />',
	            'title' => 'Title',
	            'date' => 'Actions'
	        );
	        return $bcolumns;
	    }
	    function get_sortable_columns() {
	        $sortable_columns = array(
	            // 'date' => array('date',false)
	        );
	        return $sortable_columns;
	    }
	    // function get_bulk_actions() {
	    //     $actions = array(
	    //         'delete' => 'Delete'
	    //     );
	    //     return $actions;
	    // }
	    public static function delete_post($id){
			global $wpdb;
			wp_delete_post($id,true);
		}
	    function process_bulk_action(){
	        if('delete'===$this->current_action()){
	        	$nonce = esc_attr($_REQUEST['_wpnonce']);
	        	if(!wp_verify_nonce($nonce, 'cpt_delete_post')){
					die('Insecure request detected - aborting');
				}else {
					self::delete_post(absint($_GET['medpost']));
				}   
	        }  
	        // bulk
	  //       if((isset($_POST['action']) && $_POST['action'] == 'bulk-delete') || (isset($_POST['action2']) && $_POST['action2'] == 'bulk-delete')){

			// 	$delete_ids = esc_sql($_POST['bulk-delete']);

			// 	foreach ($delete_ids as $id) {
			// 		self::delete_post($id);
			// 	}
			// }
	    }
	    public $type; public $currentCal;
	    function prepare_items() {
	        global $wpdb;
	        $type = $this->type;
	        $currentCal = $this->currentCal;
	        $per_page = 15;
	        $columns = $type == 'med-booking' ? $this->get_b_columns() : $this->get_columns();
	        $hidden = array();
	        $sortable = $this->get_sortable_columns();
	        $this->_column_headers = array($columns, $hidden, $sortable);
	        $this->process_bulk_action();

	        $data = array();

	       	$results = $type == 'med-booking' ? 
	       	$wpdb->get_results("SELECT * FROM $wpdb->posts WHERE post_type='$type' AND post_parent='$currentCal' AND post_status<>'auto-draft' AND post_status<>'trash'") : 
	       	$wpdb->get_results("SELECT * FROM $wpdb->posts WHERE post_type='$type' AND post_status<>'auto-draft' AND post_status<>'trash'");
	       	foreach ($results as $k => $v) {
	       		if(get_post_meta($v->ID,'booking_type',true) == 'full'){
	       			$arrange = 1;
	       		}else if(get_post_meta($v->ID,'booking_type',true) == 'first'){
	       			$arrange = 1;
	       		}else if(get_post_meta($v->ID,'booking_type',true) == 'last'){
	       			$arrange = 2;
	       		}
	       		if($type == 'med-booking'){
	       			$item_date = new DateTime(get_field('booking_day',$v->ID));
			    	$current_date = new DateTime;
			    	$current_date->setTime(0, 0);
			    	$ispast = $item_date < $current_date ? true : false;

			    	if(!$ispast){
			    		if(get_post_meta($v->ID,'booked',true) == 'false'){
		       				$data[] = array(
				                'ID' => $v->ID,
				                'title' => $v->post_title,
				                'date' => $v->post_date,
				                'status' => $v->post_status,
				                'bk-date' => strtotime(get_post_meta($v->ID,'booking_day',true)),
				                'bk-slot' => $arrange
					        );
		       			}else {
		       				if(get_post_meta($v->ID,'book_edited',true) == 'true'){
		       					$data[] = array(
					                'ID' => $v->ID,
					                'title' => $v->post_title,
					                'date' => $v->post_date,
					                'status' => $v->post_status,
					                'bk-date' => strtotime(get_post_meta($v->ID,'booking_day',true)),
					                'bk-slot' => $arrange
						        );
		       				}
		       			}
			    	}
		       			
	       		}else {
	       			$data[] = array(
		                'ID' => $v->ID,
		                'title' => $v->post_title,
		                'date' => $v->post_date,
		                'status' => $v->post_status,
		                'bk-date' => strtotime(get_post_meta($v->ID,'booking_day',true)),
		                'bk-slot' => $arrange
			        );
	       		}
	       	}
	       	// Sort by acf date
	       	// array_multisort($data, SORT_STRING);
// 	      	function cmp($a, $b){
// 				$date = strcmp($a["bk-date"], $b["bk-date"]);
// 			    if($date === 0){
// 			        return $a['bk-slot'] - $b['bk-slot'];
// 			    }
// 			    return $date;
// 			}
// 			usort($data, "cmp");


            $pending = [];
            $approved = [];
            foreach ($data as $item){
                if($item['status'] === 'pending'){
                    $pending[] = $item;
                }else{
                    $approved[] = $item;
                }
            }
            array_multisort($pending);
            $pendingItemsArray = array();
            foreach($pending as $items){
                foreach($items as $key=>$value){
                    if(!isset($pendingItemsArray[$key])){
                        $pendingItemsArray[$key] = array();
                    }
                    $pendingItemsArray[$key][] = $value;
                }
            }

            array_multisort($approved);
            $approvedItemsArray = array();
            foreach($approved as $items){
                foreach($items as $key=>$value){
                    if(!isset($approvedItemsArray[$key])){
                        $approvedItemsArray[$key] = array();
                    }
                    $approvedItemsArray[$key][] = $value;
                }
            }

            $orderby = "bk-date"; //change this to whatever key you want from the array
            array_multisort($pendingItemsArray[$orderby],SORT_ASC,$pending);
            array_multisort($approvedItemsArray[$orderby],SORT_ASC,$approved);

            $data = array_merge($pending,$approved);

	        $current_page = $this->get_pagenum();
	        $total_items = count($data);
	        $data = array_slice($data,(($current_page-1)*$per_page),$per_page);
	        $this->items = $data;
	        $this->set_pagination_args(array(
	            'total_items' => $total_items,
	            'per_page' => $per_page,
	            'total_pages' => ceil($total_items/$per_page)
	        )); 
	    }
	}
// End WP list fn