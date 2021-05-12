<?php  

// settings worker

class currentSettings {
	public $renderForm;
	public $thanks;
	public $font;
	public $color;
	public $legend;
	public $highlight;
	public $pending;
	public $renderText;
	public $email;
	public $placed;
	public $approved;
	public $changed;
	public $edmin;
	public $edmout;
	public $edmapprovein;
	public $edmpending;
	public $edmapprovepending;
	public $edmchanged;
	public $api;
	function getForm(){
		global $wpdb;
		$table = $wpdb->prefix . "med_settings";
		$results = $wpdb->get_results("SELECT * FROM $table WHERE id=1");
		if(!empty($results)){         
		    foreach($results as $row){
		    	// make sure only first one if multi rows added in error
		    	if($row->id === '1'){
		    		$this->renderForm = json_decode($row->form_fields,true);
		    		$this->thanks = $row->thanks_page;
		    	}
		    }
		}
	}
	function getFont(){
		global $wpdb;
		$table = $wpdb->prefix . "med_settings";
		$results = $wpdb->get_results("SELECT * FROM $table WHERE id=1");
		if(!empty($results)){         
		    foreach($results as $row){
		    	// make sure only first one if multi rows added in error
		    	if($row->id === '1'){
		    		$this->font = $row->font;
		    	}
		    }
		}
	}
	function getColor(){
		global $wpdb;
		$table = $wpdb->prefix . "med_settings";
		$results = $wpdb->get_results("SELECT * FROM $table WHERE id=1");
		if(!empty($results)){         
		    foreach($results as $row){
		    	// make sure only first one if multi rows added in error
		    	if($row->id === '1'){
		    		$this->color = $row->color;
		    		$this->highlight = $row->highlight;
		    		$this->pending = $row->pending;
		    	}
		    }
		}
	}
	function getText(){
		global $wpdb;
		$table = $wpdb->prefix . "med_settings";
		$results = $wpdb->get_results("SELECT * FROM $table WHERE id=1");
		if(!empty($results)){         
		    foreach($results as $row){
		    	// make sure only first one if multi rows added in error
		    	if($row->id === '1'){
		    		$this->renderText = json_decode($row->form_text);
		    	}
		    }
		}
	}
	function getLegend(){
		global $wpdb;
		$table = $wpdb->prefix . "med_settings";
		$results = $wpdb->get_results("SELECT * FROM $table WHERE id=1");
		if(!empty($results)){         
		    foreach($results as $row){
		    	// make sure only first one if multi rows added in error
		    	if($row->id === '1'){
		    		$this->legend = json_decode($row->legend);
		    	}
		    }
		}
	}
	function getEmail(){
		global $wpdb;
		$table = $wpdb->prefix . "med_settings";
		$results = $wpdb->get_results("SELECT * FROM $table WHERE id=1");
		if(!empty($results)){         
		    foreach($results as $row){
		    	// make sure only first one if multi rows added in error
		    	if($row->id === '1'){
		    		 $this->email = $row->email;
		    		$this->placed = $row->email_placed;
		    		$this->approved = $row->email_approved;
		    		$this->changed = $row->email_changed;
		    	}
		    }
		}		
	}

	function getEDM(){
		global $wpdb;
		$table = $wpdb->prefix . "med_settings";
		$results = $wpdb->get_results("SELECT * FROM $table WHERE id=1");
		if(!empty($results)){         
		    foreach($results as $row){
		    	// make sure only first one if multi rows added in error
		    	if($row->id === '1'){
		    		foreach (json_decode($row->form_text) as $key => $value) {
		    			if($key == 'edmin'){
		    				$this->edmin = $value;
		    			}else if($key == 'edmout'){
		    				$this->edmout = $value;
		    			}else if($key == 'edmapprovein'){
		    				$this->edmapprovein = $value;
		    			}else if($key == 'edmapprovepending'){
		    				$this->edmapprovepending = $value;
		    			}else if($key == 'edmpending'){
		    				$this->edmpending = $value;
		    			}else if($key == 'edmchanged'){
		    				$this->edmchanged = $value;
		    			}
		    		}
		    	}
		    }
		}		
	}

	function getAPI(){
		global $wpdb;
		$table = $wpdb->prefix . "med_settings";
		$results = $wpdb->get_results("SELECT * FROM $table WHERE id=1");
		if(!empty($results)){         
		    foreach($results as $row){
		    	// make sure only first one if multi rows added in error
		    	if($row->id === '1'){
		    		if(isset($row->api) && !empty($row->api)){
		    			$this->api = $row->api;
		    		}else {
		    			$this->api = false;
		    		}
		    	}
		    }
		}		
	}
	
}

// End settings worker
