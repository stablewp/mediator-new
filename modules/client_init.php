<?php 
// Render content from shortcode
function renderCalendar($atts){
	$name = $atts['name'];
	$currentCal = new currentCalendar;
	$found = $currentCal->exists($name);
	$parentID = $currentCal->parentID($name);
	$range = $currentCal->parentRange($parentID);
	$currentCal->getLocation($parentID);
	// Get form fields
	$settings = new currentSettings;
	$settings->getForm();
	$settings->getText();
	$settings->getLegend();

	// legend
	$legendLoop = '';
	$count = 0;
	foreach ($settings->legend as $key => $lg) {
		$count++;
		if($count < 5){
			if(!empty($lg->text)){
				if($count == 1){
					$legendLoop .= '<div class="bk-legend-item style-icon-full">';
					$legendLoop .= '<div class="bk-lg-icon"><i class="style-icon-full"></i></div>';
					$legendLoop .= '<div class="bk-lg-txt">'.$lg->text.'</div>';
					$legendLoop .= '</div>';
				}else if($count == 2){
					$legendLoop .= '<div class="bk-legend-item style-icon-half">';
					$legendLoop .= '<div class="bk-lg-icon"><i class="style-icon-half"></i></div>';
					$legendLoop .= '<div class="bk-lg-txt">'.$lg->text.'</div>';
					$legendLoop .= '</div>';
				}else if($count == 3){
					$legendLoop .= '<div class="bk-legend-item style-icon-pending">';
					$legendLoop .= '<div class="bk-lg-icon"><i class="style-icon-pending"></i></div>';
					$legendLoop .= '<div class="bk-lg-txt">'.$lg->text.'</div>';
					$legendLoop .= '</div>';
				}else if($count == 4){
					$legendLoop .= '<div class="bk-legend-item style-icon-pending-half">';
					$legendLoop .= '<div class="bk-lg-icon"><i class="style-icon-pending-half"></i></div>';
					$legendLoop .= '<div class="bk-lg-txt">'.$lg->text.'</div>';
					$legendLoop .= '</div>';
				}
			}
		}else {
			if(!empty($lg->icon) && !empty($lg->text)){
				if(stripos($lg->icon, 'icomoon') !== false){
					$legendLoop .= '<div class="bk-legend-item bk-legend-withicon style-'.$lg->icon.'" data-icon="'.$lg->icon.'">';
					$legendLoop .= '<div class="bk-lg-icon"><i class="'.$lg->icon.'"></i></div>';
					$legendLoop .= '<div class="bk-lg-txt">'.$lg->text.'</div>';
					$legendLoop .= '</div>';
				}else {
					$legendLoop .= '<div class="bk-legend-item style-'.$lg->icon.'">';
					$legendLoop .= '<div class="bk-lg-icon"><i class="'.$lg->icon.'"></i></div>';
					$legendLoop .= '<div class="bk-lg-txt">'.$lg->text.'</div>';
					$legendLoop .= '</div>';
				}	
			}
		}
	}
	// location

	$count = 0;
	if(isset($currentCal->location1)){
		$loc1 = '<option value="'.$currentCal->location1.'">'.$currentCal->location1.'</option>';
		$count++;
	}else {
		$loc1 = '';
	}
	if(isset($currentCal->location2)){
		$loc2 = '<option value="'.$currentCal->location2.'">'.$currentCal->location2.'</option>';
		$count++;
	}else {
		$loc2 = '';
	}
	if(isset($currentCal->location3)){
		$loc3 = '<option value="'.$currentCal->location3.'">'.$currentCal->location3.'</option>';
		$count++;
	}else {
		$loc3 = '';
	}
	if(isset($currentCal->location4)){
		$loc4 = '<option value="'.$currentCal->location4.'">'.$currentCal->location4.'</option>';
		$count++;
	}else {
		$loc4 = '';
	}
	if(isset($currentCal->location5)){
		$loc5 = '<option value="'.$currentCal->location5.'">'.$currentCal->location5.'</option>';
		$count++;
	}else {
		$loc5 = '';
	}
	if(isset($currentCal->location6)){
		$loc6 = '<option value="'.$currentCal->location6.'">'.$currentCal->location6.'</option>';
		$count++;
	}else {
		$loc6 = '';
	}
	$locdefault = $count == 1 ? '': '<option selected disabled>Please select a booking location</option>';
	$locready = $count == 1 ? 'ready': '';
	$locstatus = $count == 1 ? '': 'bk-status-is';
	// form
	$form = '<div class="bk-form-group bk-form-booking bk-required bk-status-is">
				<label>Booking time:</label>
				<div class="bk-select">
					<select name="booking_type" required>
						<option selected disabled>Please select a date first</option>
					</select>
					<!--<div class="bk-select-icon">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="#646464" d="M119.5 326.9L3.5 209.1c-4.7-4.7-4.7-12.3 0-17l7.1-7.1c4.7-4.7 12.3-4.7 17 0L128 287.3l100.4-102.2c4.7-4.7 12.3-4.7 17 0l7.1 7.1c4.7 4.7 4.7 12.3 0 17L136.5 327c-4.7 4.6-12.3 4.6-17-.1z" class=""></path></svg>
					</div>-->
				</div>
				<div class="bk-form-status">
					<p><sup>*</sup>Please select a booking on the calendar.</p>
				</div>
			</div>
			<div class="bk-form-group bk-form-location bk-required '.$locstatus.' '.$locready.'">
				<label>Booking location:</label>
				<div class="bk-select">
					<select name="booking_location" required>
						'.$locdefault.'
						'.$loc1.'
						'.$loc2.'
						'.$loc3.'
						'.$loc4.'
						'.$loc5.'
						'.$loc6.'
					</select>
					<!--<div class="bk-select-icon">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="#646464" d="M119.5 326.9L3.5 209.1c-4.7-4.7-4.7-12.3 0-17l7.1-7.1c4.7-4.7 12.3-4.7 17 0L128 287.3l100.4-102.2c4.7-4.7 12.3-4.7 17 0l7.1 7.1c4.7 4.7 4.7 12.3 0 17L136.5 327c-4.7 4.6-12.3 4.6-17-.1z" class=""></path></svg>
					</div>-->
				</div>
				<div class="bk-form-status">
					<p><sup>*</sup>Please select a booking location.</p>
				</div>
			</div><br>';
	$formtitle = '';
	foreach ($settings->renderForm as $i => $field){
		$type = $field['type'];
		$endcol = $field['endcol'];
		$name = $field['value'];
		$value = $field['name'];
		$required = $field['required'];
		$break = $field['break'];
		$border = $field['border'];

		if($required){
			$req = 'bk-required';
			$isrequire = 'required';
			$star = '*';
		}else {
			$req = '';
			$star = '';
			$isrequire = '';
		}
		if($endcol == 'true'){
			$child = 'endcol';
		}else {
			$child = '';
		}
		if($type == 'title'){
			$form .= '
			<div class="bk-form-col">
				<div class="bk-form-group bk-form-title">
					<h3>'.$name.'</h3>
				</div>';
		}else if($type == 'file'){
			$form .= '
			<div class="bk-form-group bk-form-file '.$req.' bk-status-is '.$child.'">
				'.$formtitle.'
				<label>'.$name.$star.':</label>
				<div class="bk-file-wrap">
					<input type="'.$type.'" name="sf-form-file" '.$isrequire.'>
					<p class="bk-file-text">Select document<br><span>Only .PDF and .DOCX supported</span></p>
				</div>
				<div class="bk-form-status">
					<p><sup>*</sup>.PDF or .DOCX upload required when making a booking.</p>
				</div>
			</div>';
		}else if($type == 'number'){
			$form .= '
			<div class="bk-form-group '.$req.' '.$child.'">
				'.$formtitle.'
				<label>'.$name.$star.':</label>
				<input type="tel" name="sf-form-'.$value.'" '.$isrequire.' class="bk-input-number" pattern="[0-9.]*">
				<div class="bk-form-status">
					<p><sup>*</sup>Please enter a valid number.</p>
				</div>
			</div>';
		}else if($type == 'email'){
			$form .= '
			<div class="bk-form-group '.$req.' '.$child.'">
				'.$formtitle.'
				<label>'.$name.$star.':</label>
				<input type="email" name="sf-form-'.$value.'" '.$isrequire.' class="bk-input-email">
				<div class="bk-form-status">
					<p><sup>*</sup>Please enter a valid email address.</p>
				</div>
			</div>';
		}else if($type == 'textarea'){
			$form .= '
			<div class="bk-form-group bk-form-textarea '.$req.' '.$child.'">
				'.$formtitle.'
				<label>'.$name.$star.':</label>
				<textarea name="sf-form-'.$value.'" '.$isrequire.'></textarea>
				<div class="bk-form-status">
					<p><sup>*</sup>Please complete this field.</p>
				</div>
			</div>';
		}else{
			$form .= '
			<div class="bk-form-group '.$req.' '.$child.'">
				'.$formtitle.'
				<label>'.$name.$star.':</label>
				<input type="text" name="sf-form-'.$value.'" '.$isrequire.'>
				<div class="bk-form-status">
					<p><sup>*</sup>Please complete this field.</p>
				</div>
			</div>';
		}	
		if($endcol == 'true'){
			$form .= '</div>';
		}
		if($break && !$border){
			$form .= '<br>';
		}
		if($break && $border){
			$form .= '<hr>';
		}

	}
	if(isset($settings->renderText->side_panel_content) && !empty($settings->renderText->side_panel_content)){
		$sidepanel = '
			<div id="bk-side-notice">
				'.$settings->renderText->side_panel_content.'
			</div>';
		$sidestate = 'bk-hasside';
	}else {
		$sidepanel = '';
		$sidestate = '';
	}
// status
	if(isset($_GET['med_status'])){
		if($_GET['med_status'] == 'success'){
			$bkstatus = '
				<div class="bk-med-status bk-success">
					<p>Booking placed successfully</p>
				</div><br>';
		}else if($_GET['med_status'] == 'timeexists'){
			$bkstatus = '
				<div class="bk-med-status bk-error">
					<p>Oops, someone has just booked this. Please choose another time.</p>
				</div><br>';
		}else if($_GET['med_status'] == 'dayexists'){
			$bkstatus = '
				<div class="bk-med-status bk-error">
					<p>Oops, someone has just booked this. Please choose another date.</p>
				</div><br>';
		}else if($_GET['med_status'] == 'format'){
			$bkstatus = '
				<div class="bk-med-status bk-error">
					<p>Incorrect format. Please upload .PDF or .DOCX only</p>
				</div><br>';
		}else if($_GET['med_status'] == 'size'){
			$bkstatus = '
				<div class="bk-med-status bk-error">
					<p>File too large. Please upload file lower than 2MB only</p>
				</div><br>';
		}else if($_GET['med_status'] == 'errorfile'){
			$bkstatus = '
				<div class="bk-med-status bk-error">
					<p>File Error. Please check your file and try again</p>
				</div><br>';
		}else if($_GET['med_status'] == 'error'){
			$bkstatus = '
				<div class="bk-med-status bk-error">
					<p>Error whilst making your booking. Please try again</p>
				</div><br>';
		}else {
			$bkstatus = '';
		}
	}else {
		$bkstatus = '';
	}
// Date/User schema correct
	if(!$found){
		return '<p style="font-size:14px"><span style="color:red;"><b>Shortcode error:</b></span> Please make sure your shortcode name matches an existing calendar</p>';
	}else {
		return '
		<div id="bk-med-wrapper" class="bk-loading">
			'.$bkstatus.'
			<div class="bk-cal-loader-wrap">
				<div class="bk-cal-loader la-ball-beat"><div></div><div></div><div></div></div>
			</div>
			<div id="bk-calendar" data-cal="'.$parentID.'" data-monthrange="'.$range.'" class="'.$sidestate.'">
				<div class="bk-cals">
					<div class="bk-cal bk-cal-prev">
						<div class="bk-header">
							<button class="bk-btn prev bk-hidden" data-calendar-toggle="previous">
								<svg height="24" version="1.1" viewbox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
									<path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"></path>
								</svg>
							</button>
							<div class="bk-header__label" data-calendar-label="month">
								March 2017
							</div>
							<button class="bk-btn next bk-mobi-next" data-calendar-toggle="next">
								<svg height="24" version="1.1" viewbox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
									<path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"></path>
								</svg>
							</button>
						</div>
						<div class="bk-week">
							<span>Sun</span>
							<span>Mon</span>
							<span>Tue</span>
							<span>Wed</span>
							<span>Thu</span>
							<span>Fri</span>
							<span>Sat</span>
						</div>
						<div class="bk-body" data-calendar-area="month"></div>
					</div>
					<div class="bk-cal">
						<div class="bk-header">
							<div class="bk-header__label" data-calendar-label="month">
								March 2017
							</div>
							<button class="bk-btn next" data-calendar-toggle="next">
								<svg height="24" version="1.1" viewbox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
									<path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"></path>
								</svg>
							</button>
						</div>
						<div class="bk-week">
							<span>Sun</span>
							<span>Mon</span>
							<span>Tue</span>
							<span>Wed</span>
							<span>Thu</span>
							<span>Fri</span>
							<span>Sat</span>
						</div>
						<div class="bk-body" data-calendar-area="month"></div>
					</div>
				</div>
				<p class="bk-selection chosen-date"></p>
				<p class="bk-selection chosen-time"></p>
				<style>
				.bk-lg-icon-white {
    width: 24px;
    height: 24px;
    background: #fff;
    margin-right: 4px;
    border: 1px solid #ccc;
}
@media screen and (max-width: 480px) {
  div#bk-calendar p.bk-selection.chosen-time {
    float: none!important;
}
}
.grecaptcha-badge{
	z-index:9999;
}
				</style>
				<div class="bk-legend">
                    <div class="bk-legend-item style-icon-available-white">
                        <div class="bk-lg-icon-white"></div>
                    <div class="bk-lg-txt">Available</div>
                    </div>
				'.$legendLoop.'
				</div>
			</div>
			'.$sidepanel.'
			<form id="bk-form" action="'.MYPLUGIN_PLUGIN_URL.'/process/process_booking.php" method="post" enctype="multipart/form-data">
				<h1>'.$settings->renderText->form_heading.' <span>* = required.</span></h1>
				<h2>'.$settings->renderText->form_description.'</h2>
				'.$form.'
				<div class="hidden">
					<input type="text" id="booking_day" name="booking_day" readonly>
					<input type="text" name="redirect" value="'.$settings->thanks.'" readonly>
					<input type="number" name="parent" value="'.$parentID.'" readonly>
					<input type="text" name="first" value="'.$currentCal->getTime('first',$parentID).'" readonly>
					<input type="text" name="last" value="'.$currentCal->getTime('last',$parentID).'" readonly>
					<input type="text" name="fullrange" value="'.$currentCal->getTimeRange('full',$parentID).'" readonly>
					<input type="text" name="firstrange" value="'.$currentCal->getTimeRange('first',$parentID).'" readonly>
					<input type="text" name="lastrange" value="'.$currentCal->getTimeRange('last',$parentID).'" readonly>
					<input type="hidden" name="v3cap_token" id="v3cap_token" value="" readonly>
				</div>
				<br>
				<div class="g-recaptcha" data-sitekey="6Ld178gZAAAAAFYBy2S7Akpn1RcLXW8JhfLhzJhu"></div>
				<div class="captcha-error"></div>
				<input type="submit" class="bk-submit" disabled value="'.$settings->renderText->submit_text.'">
				<p class="bk-submit-info in">To enable this form. Please make sure all fields are filled in correctly &amp; that there are no red errors underneath the fields.</p>
			</form>
		</div>';
	}
}