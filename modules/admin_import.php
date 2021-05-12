<?php 
	$currentCal = new currentCalendar;
	$currentCal->select();
	$id = $currentCal->id;
?>
<div class="wrap bk-import-wrap">
	<?php  
		if(isset($_GET['import_status']) && !empty($_GET['import_status'])){
			if($_GET['import_status'] == 'success'){
		?>
			<div id="message" class="updated notice notice-success is-dismissible">
                <p>Bookings imported successfully</p>
                <button type="button" class="notice-dismiss">
                    <span class="screen-reader-text">Dismiss this notice.</span>
                </button>
            </div>
		<?php
			}
			if($_GET['import_status'] == 'error'){
		?>
			<div id="message" class="notice notice-error is-dismissible">
                <p>Error importing. for Google sheets export, please save file in excel and try again</p>
                <button type="button" class="notice-dismiss">
                    <span class="screen-reader-text">Dismiss this notice.</span>
                </button>
            </div>
		<?php
			}
		}
	?>
	<h1>Import</h1>
	<form  method="post" action="<?= MYPLUGIN_PLUGIN_URL?>/process/import_bookings.php" enctype="multipart/form-data">
		<h2>Import bookings from a XLSX file</h2>
		<p>You can import your bookings from a valid XLSX file. Please download the XLSX file template below and use this as your upload file. If a booking exists with same date and session or if a booking is in the past it will be ignored.</p>
		<ul style="padding-left:20px;">
			<li style="list-style-type:disc">The file has 3 columns, please use a different file for each calendar.</li>
			<li style="list-style-type:disc">The date column must be in this format: <b>DD.MM.YYYY</b></li>
			<li style="list-style-type:disc">The session column values must be: <b>full</b>, <b>first</b> or <b>last</b> correlating to your time slots.</li>
			<li style="list-style-type:disc">The location column is ordered <b>A - F</b>, from the first location field to the last.</li>
		</ul>
		<br>
		<a href="<?= MYPLUGIN_PLUGIN_URL.'/modules/templates/import.xlsx'?>" class="bk-download-btn">Download template</a>
		<br>
		<div class="formstate-item required">
			<label><b>Select calendar to import to.</b></label>
			<select name="calendar" style="height:auto">
				<?php $currentCal->listall($id) ?>
			</select>
		</div>
		<br>
		<div class="formstate-item required">
			<label><b>Select .xlsx file</b></label>
			<div class="bk-file-wrap">
				<input type="file" name="xlsx">
				<p class="bk-file-text">Select XLSX file<br><span>Please use template file</span></p>
			</div>
		</div>
		<br>
		<input type="submit" value="Select file first" class="import-btn" disabled>
	</form>
</div>
