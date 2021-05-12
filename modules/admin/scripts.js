const sweetalert = require('sweetalert2')
window.sweetalert = sweetalert;

(function($, undefined){
	// Var


	// get url param
	var getUrlParameter = function getUrlParameter(sParam) {
	    var sPageURL = window.location.search.substring(1),
	        sURLVariables = sPageURL.split('&'),
	        sParameterName,
	        i;

	    for (i = 0; i < sURLVariables.length; i++) {
	        sParameterName = sURLVariables[i].split('=');

	        if (sParameterName[0] === sParam) {
	            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
	        }
	    }
	}

	function checkUpdate(el){
		$(el).find('input[type="submit"]').click(function(e){
			e.preventDefault()
			e.stopPropagation()
			$(el).find('#publishing-action').append(`
				<div class="bk-checking-wait">Checking availability</div>
			`);
			setTimeout(()=>{
				$(el).find('#publishing-action .bk-checking-wait').remove()
				$(el).submit();
			},2000)
		});
	}

	if(getUrlParameter('medpost') && getUrlParameter('medpost') != '' && getUrlParameter('action') == 'delete'){
		window.location.href = `admin.php?page=${getUrlParameter('page')}&delete=success`;		
	}

	// rm bookings on front
	function rmBooking(type,el,day,id){
		// update parent json
			let booklist = JSON.parse($('#bk-calendar').attr('data-checker')),
				filterlist = []
				booklist.forEach((el) => {
				  	if(el.id[0] != id){
				  		filterlist.push(el)
				  	}
				})
			$('#bk-calendar').attr('data-checker',JSON.stringify(filterlist))
		if(type == 'half1'){

			el.closest('tr').remove()
			day.removeClass('bk-date--half bk-blank--both').removeAttr('data-names').removeAttr('data-id').removeAttr('data-slot').removeAttr('data-opentime');
			day.find('.bk-half').remove()

		}else if(type == 'half2'){

			el.closest('tr').remove()
			day.removeClass('bk-date--booked bk-booked--half bk-blank--both').addClass('bk-date--half').append('<div class="bk-half"><div class="bk-rotate"><div class="bk-half-block bk-half-first"></div><div class="bk-half-block bk-half-last"></div></div></div>')
			var ids = day.attr('data-id').split(','),
				names = JSON.parse(day.attr('data-names'))
				if(ids[0] == el.attr('data-id')){
					day.attr('data-id',ids[1])
					day.attr('data-names',`["${names[1]}"]`)
					day.attr('data-slot','last')
					day.attr('data-opentime',$('#bk-calendar').attr('data-t1'))
				}else {
					day.attr('data-id',ids[0])
					day.attr('data-names',`["${names[0]}"]`)
					day.attr('data-slot','first')
					day.attr('data-opentime',$('#bk-calendar').attr('data-t2'))
				}
		}else {
				
			el.closest('tr').remove()
			day.removeClass('bk-date--booked bk-blank--both').removeAttr('data-names').removeAttr('data-id');
			day.find('.bk-half').remove()

		}
	}


	var dprompt = $('a.delete-prompt');
	// Rename move to trash with prompt
	if($('body').hasClass('toplevel_page_med-bookings') || $('body').hasClass('med-calendar_page_med-calendars')){
		dprompt = $('a.submitdelete');
		$('.submitdelete').html('Delete Booking').addClass('med-show');
		// checkUpdate('.post-type-med-booking form#post')
	}else if($('body').hasClass('post-type-med-calendar') || $('body').hasClass('med-calendar_page_med-calendars')){
		dprompt = $('a.submitdelete');
		$('.submitdelete').html('Delete Calendar').addClass('med-show');
	}	
	$(document).ready(function(){
		// File csv select/import
		if($('body').hasClass('med-calendar_page_med-import')){
			let fileselect = document.querySelector('.bk-file-wrap input')
			fileselect.addEventListener('change',(e) => {
				if(fileselect.value == ''){
					$('.import-btn').prop('disabled',true).attr('value','Select file first');
					document.querySelector('.bk-file-text').innerHTML = `No document selected<br><span>Only .PDF and .DOCX supported</span>`
				}else {
					if(fileselect.value.indexOf('.xlsx') < 0){
						fileselect.value = ''
						$('.import-btn').prop('disabled',true).attr('value','Select file first');
						document.querySelector('.bk-file-text').innerHTML = `Wrong format<br><span>Please use template file</span>`
					}else {
						$('.import-btn').prop('disabled',false).attr('value','Import bookings');
						document.querySelector('.bk-file-text').innerHTML = `Document selected<br><span>${fileselect.value.replace(/C:\\fakepath\\/i, '')}</span>`
					}
				}
			})
		}
		// Delete prompt
		if(dprompt.length){
			dprompt.each(function(){
				$(this).click(function(e){
					e.preventDefault();
					e.stopPropagation();
					var btn = $(this);
					if($('body').hasClass('toplevel_page_med-calendars') || $('body').hasClass('med-calendar_page_med-calendars')){
						sweetalert.fire({
							title: 'Are you sure you want <br>to delete/reject this item?',
							text: "The item will be deleted permanantly and cannot be brought back.",
							type: 'warning',
							showCancelButton: true,
							confirmButtonColor: '#3085d6',
							cancelButtonColor: '#d33',
							confirmButtonText: 'Yes, delete it!'
						}).then((result) => {
						  	if(result.value) {
						    	sweetalert.fire({
						    		title: 'Deleted!',
						    		text: 'This item has been deleted..',
						    		type: 'success',
						    		showConfirmButton:false,
						    		timer: 1800
						    	}).then((result) => {
						    		$.ajax({
						    			type:'post',
						    			url:btn.attr('href'),
						    			success:function(data){
						    				window.location.reload()
						    			},
						    			error:function(err){
						    				console.log(err)
						    			}
						    		});
						    	})
						  	}
						})
					}else if($('body').hasClass('med-calendar_page_med-bookings')){
						sweetalert.fire({
							title: 'Are you sure you want <br>to delete/reject this item?',
							text: "The item will be deleted permanantly and cannot be brought back.",
							type: 'warning',
							showCancelButton: true,
							confirmButtonColor: '#3085d6',
							cancelButtonColor: '#d33',
							confirmButtonText: 'Yes, delete it!'
						}).then((result) => {
						  	if(result.value) {
						    	sweetalert.fire({
						    		title: 'Deleted!',
						    		text: 'This item has been deleted..',
						    		type: 'success',
						    		showConfirmButton:false,
						    		timer: 1800
						    	}).then((result) => {
						    		$.ajax({
						    			type:'post',
						    			url:btn.attr('href'),
						    			success:function(data){
						    				var theday = $(`.bk-cals .bk-date[data-calendar-date="${btn.attr('data-day')}"]`),
						    					theid = btn.attr('data-id');
											if(theday.hasClass('bk-date--booked') && theday.hasClass('bk-booked--half')){
												// date has two half bookings
												rmBooking('half2',btn,theday,theid);
											}else if(theday.hasClass('bk-date--half')){
												// date has one half booking
												rmBooking('half1',btn,theday,theid);
											}else if(theday.hasClass('bk-date--booked')){
												// date has one full booking
												rmBooking('full',btn,theday,theid);
											}
						    			},
						    			error:function(err){
						    				console.log(err)
						    			}
						    		});
						    	})
						  	}
						})
					}	
				});
			});	  
		}
		if($('.bk-deny').length){
			$('.bk-deny').each(function(){
				$(this).click(function(){
					$(this).closest('tr').find('.row-actions .delete a').click();
				});
			});  
		}
		if($('.bk-approve').length){

			$('.bk-approve').each(function(){
				$(this).click(function(){
					var fulltime = $('#bk-calendar').attr('data-t1').split(' '),
						firsttime = $('#bk-calendar').attr('data-t1').split(' '),
						lasttime = $('#bk-calendar').attr('data-t2').split(' ');

						fulltime = $('#bk-calendar').attr('data-t0');
						firsttime = $('#bk-calendar').attr('data-t1');
						lasttime = $('#bk-calendar').attr('data-t2');

						$(this).html('Processing..');

					$.ajax({
						type:'post',
						url:$(this).attr('data-url')+'/process/approve_booking.php',
						data:{id:$(this).attr('data-id'),full:fulltime,first:firsttime,last:lasttime},
						success:function(data){
							if(data == 'success'){
								window.location.href = window.location.href.split("#")[0] + '&pub_status=success';  
							}else {
								window.location.href = window.location.href.split("#")[0] + '&pub_status=error';
							}
							$(this).html('Approved');
						},
						error:function(data){
							$(this).html('Approve');
						}
					});
				});
			}); 
		}
		if($('.bk-cancel').length){
			$('.bk-cancel').each(function(){
				$(this).click(function(){
					$(this).parent().parent().parent().find('.delete-prompt').click()
				});
			});
		}
		// Change calendar on bookings page
		$('form#calendar-parent select').on('change',function(){
			$('form#calendar-parent').submit();
		});
		// replace message states
		let lh = window.location.href,
			dt = $(document).find("title").text();
		if(lh.indexOf('calendar-select') > -1){
			var getit = window.location.search.split('calendar-select=');
			window.history.replaceState('', dt, lh.replace('&calendar-select='+getit[1],''));
		}
		if(lh.indexOf('delete=success') > -1){
			window.history.replaceState('', dt, lh.replace('&delete=success',''));
		}
		if(lh.indexOf('pub_status=success') > -1){
			window.history.replaceState('', dt, lh.replace('&pub_status=success',''));
		}
		if(lh.indexOf('pub_status=error') > -1){
			window.history.replaceState('', dt, lh.replace('&pub_status=error',''));
		}
		if(lh.indexOf('move_status=success') > -1){
			window.history.replaceState('', dt, lh.replace('&move_status=success',''));
		}
		if(lh.indexOf('move_status=errorfull') > -1){
			window.history.replaceState('', dt, lh.replace('&move_status=errorfull',''));
		}
		if(lh.indexOf('move_status=error') > -1){
			window.history.replaceState('', dt, lh.replace('&move_status=error',''));
		}
		// Custom plugin url
		if($('body').hasClass('plugins-php')){
			$('.wp-list-table a').each(function(){
				console.log(1)
				if($(this).attr('href') == 'http://mediator-web.com/documentation'){
					$(this).html('View instructions')
				}
			});
			  
		}
		// autofill book this
			function parse_query_string(query) {
				var vars = query.split("&");
				var query_string = {};
				for (var i = 0; i < vars.length; i++) {
				var pair = vars[i].split("=");
				var key = decodeURIComponent(pair[0]);
				var value = decodeURIComponent(pair[1]);
				// If first entry with this name
				if (typeof query_string[key] === "undefined") {
				query_string[key] = decodeURIComponent(value);
				// If second entry with this name
				} else if (typeof query_string[key] === "string") {
				var arr = [query_string[key], decodeURIComponent(value)];
				query_string[key] = arr;
				// If third or later entry with this name
				} else {
				query_string[key].push(decodeURIComponent(value));
				}
				}
				return query_string;
			}
			var getparam = parse_query_string(window.location.search);
		if(lh.indexOf('post-new.php?post_type=med-booking') > -1 && lh.indexOf('auto_med_date') > -1 && lh.indexOf('auto_med_slot') > -1){
			let slot = document.querySelector('div[data-name="booking_type"] select'),
				date = document.querySelector('div[data-name="booking_day"] input.hasDatepicker')
				date.value = getparam.auto_med_date
				slot.value = getparam.auto_med_slot
		}
		
		// Move booking
		$('.move-select').each(function(){
			$(this).click(function(){
				let btn = $(this);
				let options = document.querySelectorAll('select[name="calendar-select"] option'),
					calendars = '';
				options.forEach((el) => {
					if(!el.selected){
					  	calendars += `
					  	<li class="admin-move-listing">
		  					<span>${el.innerHTML}</span>
		  					<a href="">
								<label class="move-booking-btn" data-url="${btn.attr('data-url')}" data-postid="${btn.attr('data-postid')}" data-id="${el.value}">Move here</label>
							</a>
						</li>`;
					}
				});
				// only move if empty sport
				sweetalert.fire({
					title: '<strong>Move this booking</strong>',
					type: false,
					animation:false,
					customClass:'animated bk-animated zoomIn',
					width:'380px',
					html:`Move this booking to a calendar below.<br><br>
						${calendars}
						`,
					showCloseButton: true,
					showCancelButton: false,
					showConfirmButton: false
				})	
				$('.move-booking-btn').click(function(e){
					e.preventDefault();
					e.stopPropagation();
					$.ajax({
						type:'post',
						url:$(this).attr('data-url')+'/process/move_booking.php',
						data:{calendar:$(this).attr('data-id'),post:$(this).attr('data-postid')},
						success:function(data){
							if(data == 'success'){
								window.location.href = window.location.href.split("#")[0] + '&move_status=success';  
							}else if(data == 'full'){
								window.location.href = window.location.href.split("#")[0] + '&move_status=errorfull';
							}else {
								window.location.href = window.location.href.split("#")[0] + '&move_status=error';
							}
						},
						error:function(data){
							
						}
					});
				});
				  
			});
			  
		});
		  
		// custom time picker for add cal

		if($('.timepicker').length){
			$('.timepicker').each(function(i){
				$(this).clockpicker({
					placement: 'bottom',
				    align: 'left',
				    donetext: 'Set time',
				    twelvehour: true,
				    beforeDone: function() {
				    	if(i == 1 || i == 3 || i == 5){
				    		return $('.timepicker').eq(i-1).find('input').val()
				    	}else {
				    		return false;
				    	}
                    }
				});
				$(this).find('input').attr('autocomplete', 'off');
				$(this).find('input').on('keypress',function(e){
					e.preventDefault()
					e.stopPropagation()
					return false
				})
			});
			var reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			$('#post-body').append('<button class="bk-save-cal-button">Save calendar</button>');
			$('.bk-save-cal-button').click(function(e){
				if($('input#title').val() == ''){
					e.preventDefault()
					e.stopPropagation()
					alert('Please add title')
				}else if(!reg.test($('input#acf-field_5c1f9c31b36ct').val())){
					e.preventDefault()
					e.stopPropagation()
					alert('Please add admin email')
				}else if($('input#acf-field_5c1f9c31b36cs').val() == ''){
					e.preventDefault()
					e.stopPropagation()
					alert('Please enter Mediator name')
				}else {
					$(window).off( 'beforeunload.edit-post' );
				}
				// $('.bk-save-cal-button').html('Saving..');
			});
			
			$('#calendar-shortcode input').focus(function(){
				$(this).select()	
			});
		}

		// Add dynamic form fields

		if($(".create-fields").length){
			let count = $('.create-fields .field:not(.field-title)').length;
			let tcount = $('.create-fields .field.field-title').length;
			$('[addfield]').click(function(e){
				e.preventDefault()
				e.stopPropagation()
				count++;
				if($('.create-fields .field.field-title').length){
					$('.create-fields .fields').append(`<div class="field"><div class="field-wrap"><p sublabel>Form field</p><br><input type="text" name="sf-form-${count}[]" placeholder="Enter field name/title"><div class="sf-typeselect"><select name="sf-form-${count}[]"><option disabled selected value="none">Type</option><option value="text">Text</option><option value="email">Email</option><option value="number">Number</option><option value="file">File</option><option value="textarea">Textarea</option></select></div><div class="removefield">&times;</div><div class="bk-cal-loader la-ball-beat"><div></div><div></div><div></div></div></div><div class="sf-form-required"><input type="checkbox" id="sf-required-${count}" name="sf-required-${count}" checked><label for="sf-required-${count}">Required?</label></div><div class="sf-form-break"><input type="checkbox" id="sf-break-${count}" name="sf-break-${count}"><label for="sf-break-${count}">Break line</label></div><div class="sf-form-border"><input type="checkbox" id="sf-border-${count}" name="sf-border-${count}"><label for="sf-border-${count}">Bottom border</label></div><div class="sf-form-col"><input type="checkbox" id="sf-endcol-${count}" name="sf-endcol-${count}"><label for="sf-endcol-${count}">Close column</label></div></div>`);
				}else {
					$('.create-fields .fields').append(`<div class="field"><div class="field-wrap"><p sublabel>Form field</p><br><input type="text" name="sf-form-${count}[]" placeholder="Enter field name/title"><div class="sf-typeselect"><select name="sf-form-${count}[]"><option disabled selected value="none">Type</option><option value="text">Text</option><option value="email">Email</option><option value="number">Number</option><option value="file">File</option><option value="textarea">Textarea</option></select></div><div class="removefield">&times;</div><div class="bk-cal-loader la-ball-beat"><div></div><div></div><div></div></div></div><div class="sf-form-required"><input type="checkbox" id="sf-required-${count}" name="sf-required-${count}" checked><label for="sf-required-${count}">Required?</label></div><div class="sf-form-break"><input type="checkbox" id="sf-break-${count}" name="sf-break-${count}"><label for="sf-break-${count}">Break line</label></div><div class="sf-form-border"><input type="checkbox" id="sf-border-${count}" name="sf-border-${count}"><label for="sf-border-${count}">Bottom border</label></div></div>`);
				}
				
			});
			$('[addtitle]').click(function(e){
				e.preventDefault()
				e.stopPropagation()
				tcount++;
				if($('.create-fields').find('.field-title').length){
					if(!$('.create-fields .fields .field:last-child').hasClass('.field-tiele')){
						$('.create-fields .fields .field:last-child').find('.sf-form-col input').prop('checked',true);
					}
				}
				$('.create-fields .fields').append(`<br class="titlebreak"/><div class="field field-title"><div class="field-wrap"><p sublabel>Column title</p><input type="text" name="sf-title-${tcount}[]" formtitle placeholder="Enter column title"><div class="removefield">&times;</div><input type="text" name="sf-title-${tcount}[]" value="title" hidden readonly></div></div>`);
			});
			
			$(document,'.removefield').on('click',function(e){
				if($(e.target).hasClass('removefield')){
					var parent = $(e.target).parent().parent();
						// parent.prevUntil('.field-title','.sf-form-col').remove();

						let revertitle = true;
						parent.prevAll().each(function(){
							if($(this).hasClass('field-title')){
								revertitle = false;
							}
						});
						if(revertitle){
							parent.nextUntil('.field-title').find('.sf-form-col').remove()
						}
						  
						if(parent.prev().hasClass('titlebreak')){
							parent.prev().remove()
						}
						parent.remove()
				}
			});

			$(document,'.sf-form-border input').on('change',function(e){
				if($(e.target).parent().hasClass('sf-form-border')){
					if($(e.target).is(':checked')){
						if(!$(e.target).parent().parent().find('.sf-form-break input').hasClass('itcheck')){
							$(e.target).parent().parent().after('<br class="linebreaker"/>');
						}
						$(e.target).parent().parent().find('.sf-form-break input').prop('checked',true);
					}else {
						var br = $(e.target).parent().parent().find('.sf-form-break input');
						if(!br.hasClass('itcheck')){
							if(!$(e.target).parent().parent().find('.sf-form-break input').hasClass('itcheck')){
								$(e.target).parent().parent().next().remove()
							}
							br.prop('checked',false);
						}
					}
				}
			});
			$(document,'.sf-form-break input').on('change',function(e){
				if($(e.target).parent().hasClass('sf-form-break')){
					if($(e.target).is(':checked')){
						$(e.target).addClass('itcheck');
						$(e.target).parent().parent().after('<br class="linebreaker"/>');
					}else {
						$(e.target).removeClass('itcheck');
						if($(e.target).parent().parent().next().hasClass('linebreaker')){
							$(e.target).parent().parent().next().remove()
						}
						if($(e.target).parent().parent().find('.sf-form-border input').is(':checked')){
							$(e.target).parent().parent().find('.sf-form-border input').prop('checked',false);
						}
					}
				}
			});
			// $(document,'.sf-form-col input').on('change',function(e){
			// 	if($(e.target).parent().hasClass('sf-form-col')){

			// 		if($(e.target).is(':checked')){
			// 			let revertitle = true, parent = $(e.target).parent().parent();
			// 			parent.nextAll().each(function(){
			// 				if($(this).hasClass('field-title')){
			// 					revertitle = false;
			// 				}
			// 			});
			// 			if(revertitle){
			// 				parent.nextUntil('.field-title').find('.sf-form-col').remove()
			// 			}
			// 		}else {

			// 		}
			// 	}
			// });
			$(document,'.sf-typeselect').on('change',function(e){
				if($(e.target).parent().hasClass('sf-typeselect')){
					if($(e.target).val() == 'email'){
						$(e.target).parent().parent().parent().append(`<div class="sf-form-primary"><input type="checkbox" id="sf-primary-${count}" name="sf-primary-${count}"><label for="sf-primary-${count}">Send mail</label></div>`);
					}else {
						$(e.target).parent().parent().parent().find('.sf-form-primary').remove()
					}
				}
			});
			let precol = false;
			$('.field').each(function(){
				if(!precol){
					$(this).find('.sf-form-col').remove()
				}
				if($(this).hasClass('field-title')){
					precol = true;
				}
			});
			  


			$('form.settings-form').submit(function(e){
				
				var hasfile = 0,hastype = 0;
				$('.create-fields .field .field-wrap').each(function(){
					if($(this).find('input').val() != ''){
						if($(this).find('.sf-typeselect option:selected').attr('value') == 'file'){
							hasfile++;
						}
					}
					if($(this).find('select option:selected').val() == 'none'){
						hastype++;
					}
				});
				  
				if(hasfile > 1){
					e.preventDefault();
					e.stopPropagation();
					alert('Please only add one File field')
				}
				if(hastype > 0){
					e.preventDefault();
					e.stopPropagation();
					alert('Please add a type for all fields')
				}
			});

			
		}

		// Settings code editor
		if($(".codemirror-textarea").length){
			$(".codemirror-textarea").each(function(){
				var code = $(this)[0];
			    var editor = CodeMirror.fromTextArea(code, {
			      	lineNumbers: true,
			      	lineWrapping: true,
			      	theme:'monokai',
			      	mode:'text/html'
			    });

			    editor.on("change", function(cm, change) {
			    	if(change.text == '"'){
			    		editor.doc.setValue(editor.doc.getValue().replace('"',"'"));
			    		editor.setCursor({line: change.to.line,ch: change.to.ch + 1})
			    	}
			    })
			});
		}
		if($('.bk-icon-select').length){
			$('.bk-icon-select').each(function(){
				$(this).bkfontIconPicker({
		        	theme:'fip-inverted',
		        	hasSearch: false,
		        	iconsPerPage:50
		        })
			})
		}
		// expand button
		if($('.med-booking-expand').length){
			$('.med-booking-expand').each(function(){
				$(this).click(function(){
					var btn = $(this);
					if(!$('.med-booking-expand.busy').length){
						if(!btn.hasClass('open')){
							$('.med-booking-panel').hide();
							$('.med-booking-actions p').hide();
							$('.med-booking-expand').removeClass('open');
							btn.addClass('open');
							$('.med-booking-expand p').html('Expand');
							$('.med-booking-expand').closest('tr').removeClass('bk-blue');
							btn.closest('tr').addClass('bk-blue');
							$('.med-booking-expand').addClass('busy');
							btn.parent().parent().find('.med-booking-panel').slideDown(300);
							btn.parent().find('.med-booking-actions p').slideDown(300);
							setTimeout(function(){
								$('.med-booking-expand').removeClass('busy');
							},500);
							$(this).find('p').html('Close');
						}else {
							$('.med-booking-expand p').html('Expand');
							$('.med-booking-expand').addClass('busy');
							$('.med-booking-panel').slideUp(300);
							btn.parent().find('.med-booking-actions p').slideUp(300);
							setTimeout(function(){
								$('.med-booking-expand').closest('tr').removeClass('bk-blue');
							},300);
							setTimeout(function(){
								$('.med-booking-expand').removeClass('busy');
							},500);
							$('.med-booking-expand').removeClass('open');
						}
					}
				});  
			});
			$('.med-calendars .row-title').each(function(){
				$(this).click(function(e){
					e.preventDefault()
					e.stopPropagation()
					var title = $(this);
					title.closest('tr').find('.med-booking-expand').click();
				});  
			});
			  
		}
		

	});
})(jQuery);