<?php

// Current calendar

class currentCalendar {
	public $id;
	public $range;
	public $icons;
	public $location1;
	public $location2;
	public $location3;
	public $location4;
	public $location5;
	public $location6;
	public $bookingdates = array();
	public $edmmail;
	public $edmname;
	public $hasloc;
	public $sud;
	public $sudunt;
	function select(){
		global $wpdb;
		// get current cal id
		$table = $wpdb->prefix . "med_settings";
		$results = $wpdb->get_results("SELECT * FROM $table WHERE id=1");
		if(!empty($results)){
		    foreach($results as $row){
		    	// make sure only first one if multi rows added in error
		    	if($row->id === '1'){
		    		$this->id = $row->current_calendar;
		    	}
		    }
		}
	}
	function update($id){
		global $wpdb;
	  	$table = $wpdb->prefix . "med_settings";
	  	// echo $id;
	  	$wpdb->update($table, array('current_calendar' => $id),array('id'=>1));
	}
	function exists($name){
		$args = array (
		    'post_type' => 'med-calendar',
		    'posts_per_page' => -1,
		    'meta_key' => 'shortcode',
		);
		$query = new WP_Query($args);
		$found = false;
		while ($query->have_posts()): $query->the_post();
		    $field = str_replace('[med-calendar name="', '', get_field('shortcode'));
		    $field = str_replace('"]', '', $field);
		    if($field == $name){
		    	$found = true;
		    }
		endwhile;
		return !$found ? false : true;
		wp_reset_query();
	}
	function parentID($shortcode){
		$args = array (
		    'post_type' => 'med-calendar',
		    'posts_per_page' => -1,
		    'meta_key' => 'shortcode',
		);
		$query = new WP_Query($args);
		$found = false;
		while ($query->have_posts()): $query->the_post();
		    $field = str_replace('[med-calendar name="', '', get_field('shortcode'));
		    $field = str_replace('"]', '', $field);
		    if($field == $shortcode){
		    	return get_the_ID();
		    }
		endwhile;
		wp_reset_query();
	}
	function parentRange($id){
		return get_field('bookingrange',$id);
	}
	function listall($id){
		// List all calendars
		$loop = new WP_Query(array('post_type' => 'med-calendar'));
	    if($loop->have_posts()){
	        while ($loop->have_posts()){
	        	$loop->the_post();
	        	$selected = get_the_ID() == $id ? 'selected':'';
	        	?>
	        		<option value="<?php echo get_the_ID(); ?>" <?php echo $selected; ?>><?php echo get_the_title(); ?></option>
	        	<?php
	        }
	    }
	}
	function listcount(){
		// List all calendars
		$loop = new WP_Query(array('post_type' => 'med-calendar'));
		$s = 0;
	    if($loop->have_posts()){
	        while ($loop->have_posts()){
	        	$loop->the_post();
	        	$s++;
	        }
	    }
	    $this->sudunt = $s;
	}
	function getfirst(){
		// List all calendars
		$loop = new WP_Query(array('post_type' => 'med-calendar'));
	    if($loop->have_posts()){
	        while ($loop->have_posts()){
	        	$loop->the_post();
	        	return get_the_ID();
	        	break;
	        }
	    }
	}
	function noCal(){
		$loop = new WP_Query(array('post_type' => 'med-calendar'));
	    if($loop->have_posts()){
	        return false;
	    }else {
	    	return true;
	    }
	}
	function noMatch($id){
		$loop = new WP_Query(array('post_type' => 'med-calendar'));
		$ids = array();
	    if($loop->have_posts()){
	        while ($loop->have_posts()){
	        	$loop->the_post();
	        	array_push($ids, get_the_ID());
	        }
	        if(!in_array($id, $ids)){
	        	return true;
	        }else {
	        	return false;
	        }
	    }
	}
	function bookingExists(){
		$loop = new WP_Query(array('post_type' => 'med-booking','post_status' => array('publish','pending')));
	    if($loop->have_posts()){
	        while ($loop->have_posts()){
	        	$loop->the_post();
	        	$booking = array('date'=>get_field('booking_day'),'time'=>get_field('booking_type'),'cal'=>get_field('calendar-define'));
	        	array_push($this->bookingdates, $booking);
	        }
	    }
	}
	function icons(){
		global $wpdb;
		// get current cal id
		$table = $wpdb->prefix . "med_settings";
		$results = $wpdb->get_results("SELECT * FROM $table WHERE id=1");
		if(!empty($results)){
		    foreach($results as $row){
		    	// make sure only first one if multi rows added in error
		    	if($row->id === '1'){
		    		$this->icons = $row->icons;
		    	}
		    }
		}
	}
	function iconSelect(){
		global $wpdb;
		// get current cal id
		$table = $wpdb->prefix . "med_settings";
		$results = $wpdb->get_results("SELECT * FROM $table WHERE id=1");
		if(!empty($results)){
		    foreach($results as $row){
		    	// make sure only first one if multi rows added in error
		    	if($row->id === '1'){
		    		$seticon = 'false';
		    		foreach(json_decode($row->legend,true) as $icon){
		    			if(stripos($icon['icon'], 'icomoon') !== false){
		    				$seticon = $icon['icon'];
		    				break;
		    			}
		    		}
		    		echo $seticon;
		    	}
		    }
		}
	}
	function iconTextSelect(){
		global $wpdb;
		// get current cal id
		$table = $wpdb->prefix . "med_settings";
		$results = $wpdb->get_results("SELECT * FROM $table WHERE id=1");
		if(!empty($results)){
		    foreach($results as $row){
		    	// make sure only first one if multi rows added in error
		    	if($row->id === '1'){
		    		$seticon = 'false';
		    		foreach(json_decode($row->legend,true) as $icon){
		    			if(stripos($icon['icon'], 'icomoon') !== false){
		    				$seticon = $icon['text'];
		    				break;
		    			}
		    		}
		    		echo $seticon;
		    	}
		    }
		}
	}
	function updateIcons($data){
		global $wpdb;
	  	$table = $wpdb->prefix . "med_settings";
	  	// echo $id;
	  	$wpdb->update($table, array('icons' => $data),array('id'=>1));
	}
	function getLocation($cid){
		// List all calendars
		$loop = new WP_Query(array('post_type' => 'med-calendar'));
	    if($loop->have_posts()){
	        while ($loop->have_posts()){
	        	$loop->the_post();
	        	if(get_the_ID() == $cid){
	        		if(!empty(get_field('location1'))){
	        			$this->location1 = get_field('location1');
	        		}
	        		if(!empty(get_field('location2'))){
	        			$this->location2 = get_field('location2');
	        		}
	        		if(!empty(get_field('location3'))){
	        			$this->location3 = get_field('location3');
	        		}
	        		if(!empty(get_field('location4'))){
	        			$this->location4 = get_field('location4');
	        		}
	        		if(!empty(get_field('location5'))){
	        			$this->location5 = get_field('location5');
	        		}
	        		if(!empty(get_field('location6'))){
	        			$this->location6 = get_field('location6');
	        		}
	        	}
	        }
	    }
	}
	function getRecipient($id){
		$email = get_post_meta($id,'email',true);
		$name = get_post_meta($id,'text',true);
		$this->edmmail = $email;
		$this->edmname = $name;
	}
	function getTime($type,$id){
		if($type == 'first'){
			return get_field('time_start1',$id,true);
		}else {
			return get_field('time_start2',$id,true);
		}
	}
	function getTimeRange($type,$id){
		if($type == 'first'){
			return get_field('time_start1',$id,true).' - '.get_field('time_end1',$id,true);
		}else if($type == 'last'){
			return get_field('time_start2',$id,true).' - '.get_field('time_end2',$id,true);
		}else {
			return get_field('time_start0',$id,true).' - '.get_field('time_end0',$id,true);
		}
	}
	function hasLocation($date){
		$loop = new WP_Query(array('post_type' => 'med-booking','post_status' => array('publish','pending')));
		$this->hasloc = false;
	    if($loop->have_posts()){
	        while ($loop->have_posts()){
	        	$loop->the_post();
	        	if(get_field('booking_day') == $date && !empty(get_field('location'))){
	        		$this->hasloc = get_field('location');
	        	}
	        }
	    }
	}
	function psuedo(){
		$this->sud = 3;
	}
}

// End Current calendar

// Get db errors
	// exit(var_dump($wpdb->last_query ));