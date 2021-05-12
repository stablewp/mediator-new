<?php 

require('admin_page.php');

function renderBookingList(){
    $currentCal = new currentCalendar;
    $currentCal->select();
    if($currentCal->noCal()){
    	die('<h1 style="font-weight:bold;font-size:18px;margin:50px 50px 10px;color:red;">Error - No calendar:</h1><p style="font-weight:bold;font-size:14px;margin:0 50px;font-style:italic">Please create a calendar to view the bookings page</p>');
    }else {
	    if(isset($_POST['calendar-select']) && !empty($_POST['calendar-select'])){
	        $id = $_POST['calendar-select'];
	        $currentCal->update($id);
	    }else if(isset($_GET['calendar-select']) && !empty($_GET['calendar-select'])){
	    	$id = $_GET['calendar-select'];
	        $currentCal->update($id);
	    }else {
	        $id = $currentCal->id;
	        if(empty($id)){
	        	$id = $currentCal->getfirst();
	        	$currentCal->update($id);
	    	}else if($currentCal->noMatch($id)){
	    		$id = $currentCal->getfirst();
	        	$currentCal->update($id);
	    	}
	    }
    }
    $range = $currentCal->parentRange($parentID);
    
    $bookingPage = new adminPage();
    $bookingPage->type = 'med-booking';
    $bookingPage->currentCal = $id;
    $bookingPage->prepare_items();
    ?>
    <div class="wrap">
   
        <!-- Admin calendar -->
        
            <?php require('admin_calendar.php'); ?>
            
        <!-- End Admin calendar -->
        <div class="bk-booking-list" data-url="<?= MYPLUGIN_PLUGIN_URL?>" data-random="<?= wp_create_nonce('cpt_delete_post')?>">
	        <!-- <h1 class="wp-heading-inline">Bookings:</h1><a href="post-new.php?post_type=med-booking" class="page-title-action">Add New</a> -->

	        <!-- Forms are NOT created automatically, so you need to wrap the table in one to use features like bulk actions -->
	        <form id="bookings" method="get">
	            <!-- For plugins, we also need to ensure that the form posts back to our current page -->
	            <input type="hidden" name="page" value="<?php echo $_REQUEST['page'] ?>" />
	            <!-- Now we can render the completed list table -->
	            <?php $bookingPage->display() ?>
	        </form>
        </div>
        
    </div>
    <?php
}
function renderCalendarList(){
    $bookingPage = new adminPage();
    $bookingPage->type = 'med-calendar';
    $bookingPage->currentCal = null;
    $bookingPage->prepare_items();

    $currentCal = new currentCalendar;
    $currentCal->psuedo();
    $currentCal->listcount();
    $sud = $currentCal->sud;
    $dus = $currentCal->sudunt;
    ?>
    <div class="wrap">
        <?php 
            if(isset($_GET['delete']) && $_GET['delete'] == 'success'){
            ?>
                <div id="message" class="bk-notice-stay updated notice notice-success is-dismissible">
                    <p>Calendar Deleted successfully</p>
                    <button type="button" class="notice-dismiss">
                        <span class="screen-reader-text">Dismiss this notice.</span>
                    </button>
                </div>
            <?php
            }
        ?>
        <h1 class="wp-heading-inline">Calendars:</h1>
        <?php  
        	if($dus < $sud){
        	?>
        		<p style="margin:0 0 20px">Your package allows for up to <?= $sud?> calendars.</p>
        		<a href="post-new.php?post_type=med-calendar" class="page-title-action">Add New</a><hr class="wp-header-end">
        	<?php
        	}else{
        	?>
        		<p style="margin:0 0 20px">Your have created the maximum amount of calendars allowed.</p>
        	<?php
        	}
        ?>
        
        
        <!-- Forms are NOT created automatically, so you need to wrap the table in one to use features like bulk actions -->
        <form id="bookings" method="get">
            <!-- For plugins, we also need to ensure that the form posts back to our current page -->
            <input type="hidden" name="page" value="<?php echo $_REQUEST['page'] ?>" />
            <!-- Now we can render the completed list table -->
            <?php $bookingPage->display() ?>
        </form>
        
    </div>
    <?php
}