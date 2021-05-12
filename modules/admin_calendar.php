<div id="bk-med-wrapper">
	<div class="bk-admin-booking-header">
		<div class="bk-admin-cal-select">
			<h1 class="wp-heading-inline">Showing bookings for:</h1>
	        <form id="calendar-parent" method="post" action="admin.php?page=med-bookings">
	            <select name="calendar-select">
	                <?php $currentCal->listall($id) ?>
	            </select>
	        </form>
        </div>
		<div class="bk-admin-cal-arrows">
			<?php  
	            if(isset($_GET['delete']) && $_GET['delete'] == 'success'){
	            ?>
	                <div id="message" class="bk-notice-stay bk-success">
	                    <p><i class="icomoon-user-check"></i>Booking Deleted successfully</p>
	                </div>
	            <?php
	            }else if(isset($_GET['pub_status'])){
	                if($_GET['pub_status'] == 'success'){
	                ?>
	                    <div id="message" class="bk-notice-stay bk-success">
	                        <p><i class="icomoon-user-check"></i>Booking Approved successfully</p>
	                    </div>
	                <?php    
	                }else if($_GET['pub_status'] == 'error'){
	                ?>
	                    <div id="message" class="bk-notice-stay bk-error">
	                        <p><i class="icomoon-cross"></i>Error Approving Booking</p>
	                    </div>
	                <?php   
	                }
	            }else if(isset($_GET['move_status'])){
	                if($_GET['move_status'] == 'success'){
	                ?>
	                    <div id="message" class="bk-notice-stay bk-success">
	                        <p><i class="icomoon-user-check"></i>Booking Moved successfully</p>
	                    </div>
	                <?php    
	                }else if($_GET['move_status'] == 'errorfull'){
	                ?>
	                    <div id="message" class="bk-notice-stay bk-warning">
	                        <p><i class="icomoon-cross"></i>This booking slot is already taken</p>
	                    </div>
	                <?php   
	                }else if($_GET['move_status'] == 'error'){
	                ?>
	                    <div id="message" class="bk-notice-stay bk-error">
	                        <p><i class="icomoon-cross"></i>Error Moving Booking</p>
	                    </div>
	                <?php   
	                }
	            }
	        ?> 
			<div class="actions">
				<!-- <button class="addnew"><a href="post-new.php?post_type=med-booking">Add booking</a></button> -->
				<button class="toggle">Hide calendar</button>
			</div>
			<div class="nav-actions">
				<h2>Change months</h2>
				<button class="bk-btn prev bk-hidden" data-calendar-toggle="previous">
			        <svg height="24" version="1.1" viewbox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
			            <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"></path>
			        </svg>
			    </button>
				<button class="bk-btn next" data-calendar-toggle="next">
			        <svg height="24" version="1.1" viewbox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
			            <path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"></path>
			        </svg>
			    </button>	
		    </div>
	    </div>
	</div>
    <div id="bk-calendar" data-cal="<?php echo $id; ?>" data-monthrange="<?php echo $range; ?>">
        <div class="bk-cals" data-icon="<?php $currentCal->iconSelect() ?>" data-holidaytext="<?php $currentCal->iconTextSelect() ?>">
            <div class="bk-cal first-cal">
            	<div class="bk-admin-col-left">
	                <div class="bk-header">
	                    <div class="bk-header__label" data-calendar-label="month"></div>
	                </div>
                </div>
                <div class="bk-admin-col-right">
	                <div class="bk-week bk-week-default"></div>
	                <div class="bk-body" data-calendar-area="month"></div>
            	</div>
            </div>
            <div class="bk-cal">
				<div class="bk-admin-col-left">
	                <div class="bk-header">
	                    <div class="bk-header__label" data-calendar-label="month"></div>
	                </div>
                </div>
                <div class="bk-admin-col-right">
	                <div class="bk-week bk-week-one"></div>
	                <div class="bk-body" data-calendar-area="month"></div>
                </div>
            </div>
            <div class="bk-cal">
				<div class="bk-admin-col-left">
	                <div class="bk-header">
	                    <div class="bk-header__label" data-calendar-label="month"></div>
	                </div>
                </div>
                <div class="bk-admin-col-right">
	                <div class="bk-week bk-week-two"></div>
	                <div class="bk-body" data-calendar-area="month"></div>
                </div>
            </div>
            <div class="bk-cal">
				<div class="bk-admin-col-left">
	                <div class="bk-header">
	                    <div class="bk-header__label" data-calendar-label="month"></div>
	                </div>
                </div>
                <div class="bk-admin-col-right">
	                <div class="bk-week bk-week-three"></div>
	                <div class="bk-body" data-calendar-area="month"></div>
                </div>
            </div>
            <div class="bk-cal">
				<div class="bk-admin-col-left">
	                <div class="bk-header">
	                    <div class="bk-header__label" data-calendar-label="month"></div>
	                </div>
                </div>
                <div class="bk-admin-col-right">
	                <div class="bk-week bk-week-four"></div>
	                <div class="bk-body" data-calendar-area="month"></div>
                </div>
            </div>
            <div class="bk-cal last-cal">
				<div class="bk-admin-col-left">
	                <div class="bk-header">
	                    <div class="bk-header__label" data-calendar-label="month"></div>
	                </div>
                </div>
                <div class="bk-admin-col-right">
	                <div class="bk-week bk-week-five"></div>
	                <div class="bk-body" data-calendar-area="month"></div>
                </div>
            </div>
        </div>
        <p class="bk-selection chosen-date"></p>
        <p class="bk-selection chosen-time"></p>
    </div>
    <div class="bk-cal-loader la-ball-beat"><div></div><div></div><div></div></div>
</div>