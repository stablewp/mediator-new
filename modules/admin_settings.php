<?php 
	$settings = new currentSettings;
	$settings->getForm();
	$settings->getFont();
	$settings->getColor();
	$settings->getText();
	$settings->getLegend();
	$settings->getEmail();
	$settings->getAPI();
?>
<div class="wrap bk-settings-wrap">
	<?php  
		if(isset($_GET['message']) && !empty($_GET['message'])){
			if($_GET['message'] == 'success'){
			?>
				<div id="message" class="bk-notice-stay updated notice notice-success is-dismissible">
	                <p>Settings saved successfully</p>
	                <button type="button" class="notice-dismiss">
	                    <span class="screen-reader-text">Dismiss this notice.</span>
	                </button>
	            </div>
			<?php
			}else if($_GET['message'] == 'file'){
				?>
				<div id="message" class="bk-notice-stay notice notice-error is-dismissible">
	                <p>Error saving Form Fields: You can only have one file field.</p>
	                <button type="button" class="notice-dismiss">
	                    <span class="screen-reader-text">Dismiss this notice.</span>
	                </button>
	            </div>
			<?php
			}else if($_GET['message'] == 'exists'){
				?>
				<div id="message" class="bk-notice-stay notice notice-error is-dismissible">
	                <p>Error saving Form Fields: Field with same name exists.</p>
	                <button type="button" class="notice-dismiss">
	                    <span class="screen-reader-text">Dismiss this notice.</span>
	                </button>
	            </div>
			<?php
			}
			
		}
	?>
	<h1>Settings</h1>
	<form method="post" class="settings-form" data-url="<?= MYPLUGIN_PLUGIN_URL?>" action="<?= MYPLUGIN_PLUGIN_URL?>/process/save-settings.php" enctype="multipart/form-data">

		<input type="submit" value="Save settings" absubmit>

		<h2>Create Your Form:</h2>
		<p>
			Create form fields for your calendars.
		</p>



		<div class="create-fields">
			<div class="fields">
				<?php  
				
					$fields = $settings->renderForm;
					$count = 0;
					$tcount = 0;
					foreach($fields as $i => $field){
						if($field['type'] == 'title'){
							$tcount++;
						?>
						<br class="titlebreak"/>
						<div class="field field-title">
							<div class="field-wrap">
								<p sublabel>Column title</p>
								<input type="text" name="sf-title-<?= $tcount?>[]" value="<?= $field['value']?>" formtitle placeholder="Enter column title">
								<div class="removefield">&times;</div>
								<input type="text" name="sf-title-<?= $tcount?>[]" value="title" hidden readonly>
							</div>
						</div>		
					<?php
						}else {
							$count++;
						?>
						<div class="field">
							<div class="field-wrap">
								<p sublabel>Form field</p><br>
								<input type="text" name="sf-form-<?= $count?>[]" value="<?= $field['value']?>">
								<div class="sf-typeselect">
									<select name="sf-form-<?= $count?>[]">
										<option value="text" <?= $field['type'] == 'text' ? 'selected':''?>>Text</option>
										<option value="email" <?= $field['type'] == 'email' ? 'selected':''?>>Email</option>
										<option value="number" <?= $field['type'] == 'number' ? 'selected':''?>>Number</option>
										<option value="file" <?= $field['type'] == 'file' ? 'selected':''?>>File</option>
										<option value="textarea" <?= $field['type'] == 'textarea' ? 'selected':''?>>Textarea</option>
									</select>
								</div>
								<div class="removefield">&times;</div>
								<div class="bk-cal-loader la-ball-beat"><div></div><div></div><div></div></div>
							</div>
							<div class="sf-form-required">
								<input id="sf-required-<?= $count?>" type="checkbox" name="sf-required-<?= $count?>" <?= $field['required'] == true ? 'checked':''?>>
								<label for="sf-required-<?= $count?>">Required?</label>
							</div>
							<div class="sf-form-break">
								<input id="sf-break-<?= $count?>" type="checkbox" name="sf-break-<?= $count?>" <?= $field['break'] == true ? 'checked':''?> class="<?= $field['break'] == true ? 'itcheck' : ''?>">
								<label for="sf-break-<?= $count?>">Break line</label>
							</div>
							<div class="sf-form-border">
								<input id="sf-border-<?= $count?>" type="checkbox" name="sf-border-<?= $count?>" <?= $field['border'] == true ? 'checked':''?>>
								<label for="sf-border-<?= $count?>">Bottom border</label>
							</div>
							<div class="sf-form-col">
								<input id="sf-endcol-<?= $count?>" type="checkbox" name="sf-endcol-<?= $count?>" <?= $field['endcol'] == true ? 'checked':''?>>
								<label for="sf-endcol-<?= $count?>">Close column</label>
							</div>
							<?php 
								if($field['type'] == 'email'){
								?>
									<div class="sf-form-primary">
										<input id="sf-primary-<?= $count?>" type="checkbox" name="sf-primary-<?= $count?>" <?= $field['primary'] == true ? 'checked':''?>>
										<label for="sf-primary-<?= $count?>">Send mail</label>
									</div>
								<?php
								}
							?>
						</div>
						<?= $field['break'] == true ? '<br class="linebreaker"/>':''?>
					<?php
						}
					}

				?>
			</div>
			<button type="button" addfield>Add form field</button>
			<button type="button" addtitle>Add column title</button>
		</div>

		<hr>
		<h2>Form text:</h2>
		<br><br>
		<div class="formstate-item required">
			<label><b>Form title</b><br><span style="font-size: 12px;text-transform: none;">Enter the title for your form. (If blank, title will not show)</span></label>
			<input type="text" name="form_heading" value="<?php echo $settings->renderText->form_heading; ?>">
		</div>
		<br>
		<div class="formstate-item required wide">
			<label><b>Form description</b><br><span style="font-size: 12px;text-transform: none;">Enter subtext or instructions to introduce your form.</span></label>
			<textarea name="form_description" height="200"><?php echo $settings->renderText->form_description; ?></textarea>
		</div>
		<div class="formstate-item required">
			<label><b>Submit button</b><br><span style="font-size: 12px;text-transform: none;">Enter the text that will appear on your submit button. (If blank, button will read ‘Submit Booking’)</span></label>
			<input type="text" name="submit_text" value="<?php echo $settings->renderText->submit_text; ?>">
		</div>
		<hr>

		<h2>Colours &amp; Font:</h2>
		<p>Select custom theme colours for your calendar. </p>
		<div class="formstate-item required">
			<label><b>Calendar theme colour</b></label>
			<input class="jscolor" name="color" value="<?php echo $settings->color; ?>">
		</div>
		<div class="formstate-item required">
			<label><b>calendar highlight color</b></label>
			<input class="jscolor" name="highlight" value="<?php echo $settings->highlight; ?>">
		</div>
		<div class="formstate-item required">
			<label><b>calendar pending color</b></label>
			<input class="jscolor" name="pending" value="<?php echo $settings->pending; ?>">
		</div>
		<br>
		<p>Enter a Google font URL. (If blank your current theme font will be used)<br>
			<b>example: https://fonts.googleapis.com/css?family=ZCOOL+XiaoWei</b></p>
		<div class="formstate-item required">
			<label><b>Custom google font</b></label>
			<input name="font" value="<?php echo $settings->font; ?>">
		</div>
		<hr>
		<?php  
			function adjustBrightness($hex, $steps) {
			    // Steps should be between -255 and 255. Negative = darker, positive = lighter
			    $steps = max(-255, min(255, $steps));

			    // Normalize into a six character long hex string
			    $hex = str_replace('#', '', $hex);
			    if (strlen($hex) == 3) {
			        $hex = str_repeat(substr($hex,0,1), 2).str_repeat(substr($hex,1,1), 2).str_repeat(substr($hex,2,1), 2);
			    }

			    // Split into three parts: R, G and B
			    $color_parts = str_split($hex, 2);
			    $return = '#';

			    foreach ($color_parts as $color) {
			        $color   = hexdec($color); // Convert to decimal
			        $color   = max(0,min(255,$color + $steps)); // Adjust color
			        $return .= str_pad(dechex($color), 2, '0', STR_PAD_LEFT); // Make two char hex code
			    }

			    return $return;
			}
			$icons = '
				<option value="">No icon</option>
				<option>icomoon-home</option>
				<option>icomoon-newspaper</option>
				<option>icomoon-pencil</option>
				<option>icomoon-bullhorn</option>
				<option>icomoon-book</option>
				<option>icomoon-books</option>
				<option>icomoon-library</option>
				<option>icomoon-file-text</option>
				<option>icomoon-profile</option>
				<option>icomoon-file-text2</option>
				<option>icomoon-clock</option>
				<option>icomoon-clock2</option>
				<option>icomoon-alarm</option>
				<option>icomoon-bell</option>
				<option>icomoon-stopwatch</option>
				<option>icomoon-calendar</option>
				<option>icomoon-bubbles</option>
				<option>icomoon-user</option>
				<option>icomoon-users</option>
				<option>icomoon-user-check</option>
				<option>icomoon-user-tie</option>
				<option>icomoon-hour-glass</option>
				<option>icomoon-spinner</option>
				<option>icomoon-key</option>
				<option>icomoon-cog</option>
				<option>icomoon-trophy</option>
				<option>icomoon-gift</option>
				<option>icomoon-glass</option>
				<option>icomoon-mug</option>
				<option>icomoon-hammer2</option>
				<option>icomoon-briefcase</option>
				<option>icomoon-airplane</option>
				<option>icomoon-clipboard</option>
				<option>icomoon-earth</option>
				<option>icomoon-flag</option>
				<option>icomoon-star-empty</option>
				<option>icomoon-cool</option>
				<option>icomoon-point-up</option>
				<option>icomoon-warning</option>
				<option>icomoon-notification</option>
				<option>icomoon-question</option>
				<option>icomoon-cancel-circle</option>
				<option>icomoon-cross</option>';
		?>
		<h2>Legend:</h2>
		<p>Customize the legend for your calendars. <br>
			You can choose an icon to indicate a special day.</p>
		<div class="formstate-item required">
			<h3>Full day booked text</h3>
			<input name="legend1" value="<?= $settings->legend->legend1->text?>">
		</div>
		<div class="formstate-item required">
			<h3>Half day booked text</h3>
			<input name="legend2" value="<?= $settings->legend->legend2->text?>">
		</div>
		<div class="formstate-item required">
			<h3>Pending full day booking</h3>
			<input name="legend3" value="<?= $settings->legend->legend3->text?>">
		</div>
		<div class="formstate-item required">
			<h3>Pending half day booking</h3>
			<input name="legend4" value="<?= $settings->legend->legend4->text?>">
		</div>
		<div class="formstate-item required special-day-item">
			<h3>Special day</h3>
			<select name="legend-icon-5" class="bk-icon-select" data-icon="<?= $settings->legend->legend5->icon?>">
				<?= $icons?>
			</select>
			<input name="legend5" value="<?= $settings->legend->legend5->text?>">
		</div>
		<hr>
		<h2>Thank You Page:</h2>
		<p>Enter an URL that will load when a booking is made. If empty, current page will reload with a thank you message</p>
		<div class="formstate-item required wide">
			<label><b>Enter URL</b></label>
			<input name="thanks-page" value="<?php echo $settings->thanks; ?>">
		</div>
		<hr>
		<h2>Email settings:</h2>
		<p>Select options for client email notifications</p>
<!-- 		<div class="formstate-item required wide">
			<label><b>Enter Admin Email</b></label>
			<input name="admin-email" value="">
		</div> -->
		<div class="formstate-item required wide">
			<div class="formstate-row">
				<input name="email-placed" id="email-placed" type="checkbox" <?= $settings->placed == '1' ? 'checked':''?>>
				<label class="check-label" for="email-placed"><b>Send mail to client when booking is placed</b></label>
			</div>
			<div class="formstate-row">
				<input name="email-approved" id="email-approved" type="checkbox" <?= $settings->approved == '1' ? 'checked':''?>>
				<label class="check-label spaced-checked" for="email-approved"><b>Send mail to client if booking is approved</b></label>
			</div>
			<div class="formstate-row">
				<input name="email-changed" id="email-changed" type="checkbox" <?= $settings->changed == '1' ? 'checked':''?>>
				<label class="check-label spaced-checked" for="email-changed"><b>Send mail to client if booking is changed</b></label>
			</div>
			<div class="formstate-item" style="width:100%">
				<label><b>Enter SendGrid API key.</b></label>
				<input name="api" value="<?= $settings->api ?>">
			</div>
		</div>
		<p><b>Please enter the custom email text that will be included in the appointment booking details to your client.</b></p>
		<div class="formstate-item required wide">
			<label><b>Pending email title text</b></label>
			<input name="edmin" value="<?= $settings->renderText->edmin ?>">
		</div>
	
		<div class="formstate-item required wide">
			<label><b>Pending email descriptive text</b></label>
			<input name="edmpending" value="<?= $settings->renderText->edmpending ?>">
		</div>

		<div class="formstate-item required wide">
			<label><b>APPROVED EMAIL TITLE TEXT</b></label>
			<input name="edmapprovein" value="<?= $settings->renderText->edmapprovein ?>">
		</div>

		<div class="formstate-item required wide">
			<label><b>APPROVED EMAIL DESCRIPTIVE TEXT</b></label>
			<input name="edmapprovepending" value="<?= $settings->renderText->edmapprovepending ?>">
		</div>

		<div class="formstate-item required wide">
			<label><b>Edited/changed email title text</b></label>
			<input name="edmchanged" value="<?= $settings->renderText->edmchanged ?>">
		</div>

		<div class="formstate-item required wide">
			<label><b>Footer text</b></label>
			<input name="edmout" value="<?= $settings->renderText->edmout ?>">
		</div>
		<br><br>
		<h2>Side panel HTML</h2>
		<p>Create an optional panel beside your calendar to add additional information. (If blank, panel will not show and calendar will be full-width)</p>
		<div class="formstate-item required" style="width:100%">
			<label class="icon-label"><b>Content for side panel.</b></label>
			<textarea class="codemirror-textarea" name="side_panel_content"><?php echo $settings->renderText->side_panel_content; ?></textarea>
		</div>
		<br>
		<input type="submit" value="Save settings">
	</form>
</div>
