// Var
(function($) {
	const d = document,
		w = window,
		search = window.location.search,
		history = window.history,
		domReady = function(callback){d.readyState === "interactive" || d.readyState === "complete" ? callback() : d.addEventListener("DOMContentLoaded", callback)},
		res = {};
// Calendar
	let href = w.location.href,
		body = d.querySelector('body'),
		ancestor = d.querySelector('#bk-med-wrapper'),
		parent = d.querySelector('#bk-calendar'),
		bkcals = d.querySelector('.bk-cals'),
		months = d.querySelectorAll('[data-calendar-area="month"]'),
		month = d.querySelectorAll('[data-calendar-area="month"]')[0],
		monthone = d.querySelectorAll('[data-calendar-area="month"]')[1],
		monthtwo = d.querySelectorAll('[data-calendar-area="month"]')[2],
		monththree = d.querySelectorAll('[data-calendar-area="month"]')[3],
		monthfour = d.querySelectorAll('[data-calendar-area="month"]')[4],
		monthfive = d.querySelectorAll('[data-calendar-area="month"]')[5],
		week = d.querySelector('.bk-week-default'),
		weekone = d.querySelector('.bk-week-one'),
		weektwo = d.querySelector('.bk-week-two'),
		weekthree = d.querySelector('.bk-week-three'),
		weekfour = d.querySelector('.bk-week-four'),
		weekfive = d.querySelector('.bk-week-five'),
		next = d.querySelectorAll('[data-calendar-toggle="next"]')[0],
		previous = d.querySelectorAll('[data-calendar-toggle="previous"]')[0],
		label = d.querySelectorAll('[data-calendar-label="month"]')[0],
		labelone = d.querySelectorAll('[data-calendar-label="month"]')[1],
		labeltwo = d.querySelectorAll('[data-calendar-label="month"]')[2],
		labelthree = d.querySelectorAll('[data-calendar-label="month"]')[3],
		labelfour = d.querySelectorAll('[data-calendar-label="month"]')[4],
		labelfive = d.querySelectorAll('[data-calendar-label="month"]')[5],
		dayinput = d.querySelector('input#booking_day'),
		activeDates = null,
		date = new Date(),
		nextone = new Date(),
		nexttwo = new Date(),
		nextthree = new Date(),
		nextfour = new Date(),
		nextfive = new Date(),
		todate = new Date(),
		adbtn = d.querySelector('.bk-admin-cal-arrows .actions button.toggle'),
		dayicons = [],
		isicon = false;
		function init(){
			date.setDate(1)
			nextone.setDate(1)
			nexttwo.setDate(1)
			nextthree.setDate(1)
			nextfour.setDate(1)
			nextfive.setDate(1)
  			nextone.setMonth(nextone.getMonth()+1)
			nexttwo.setMonth(nexttwo.getMonth()+2)
			nextthree.setMonth(nextthree.getMonth()+3)
			nextfour.setMonth(nextfour.getMonth()+4)
			nextfive.setMonth(nextfive.getMonth()+5)
  			handleUrl()
  			pullJSON()
  			.then((json) => {
  				let settings = json.settings,
  				bookings = json.bookings.filter(booking => booking.parent == parent.getAttribute('data-cal'));
  				parent.setAttribute('data-t0',settings.time_start0+' - '+settings.time_end0);
  				parent.setAttribute('data-t1',settings.time_start1+' - '+settings.time_end1);
  				parent.setAttribute('data-t2',settings.time_start2+' - '+settings.time_end2);
  				parent.setAttribute('data-checker',JSON.stringify(bookings))
				isbookIcon(parent.getAttribute('data-cal')).then((icons) => {
					dayicons = icons
					createMonth(bookings)
					createListeners(bookings)
					readyChildren()
				})
  			})
  			.catch((err) =>{
				console.log(err);
			});
			listUpdate()
		}

		function readyChildren(){
			ancestor.classList.add('ready-children')
		}

		function handleUrl(){
			// replace success message state
			if(href.indexOf('med_status') > -1){
				history.replaceState('', document.title, href.replace(search,''));
			}
		}

		function rmBooking(type,el,day,id){
			// update parent json
				let booklist = JSON.parse(parent.getAttribute('data-checker')),
					filterlist = []
					booklist.forEach((el) => {
					  	if(el.id[0] != id){
					  		filterlist.push(el)
					  	}
					})

				parent.setAttribute('data-checker',JSON.stringify(filterlist))
			// end parent json
			day.classList.remove('bk-date--selected')
			if(type == 'half1'){
				day._tippy.destroy()
				if(el){
					el.closest('tr').remove()
				}
				day.classList.remove('bk-date--half','bk-blank--both')
				day.removeAttribute('data-names')
				day.removeAttribute('data-id')
				day.removeAttribute('data-slot')
				day.removeAttribute('data-opentime');
				day.querySelector('.bk-half').remove()

			}else if(type == 'half2'){
				if(el){
					el.closest('tr').remove()
				}
				day.classList.remove('bk-date--booked','bk-booked--half','bk-blank--both')
				day.classList.add('bk-date--half')
				day.insertAdjacentHTML('beforeend',`<div class="bk-half"><div class="bk-rotate"><div class="bk-half-block bk-half-first"></div><div class="bk-half-block bk-half-last"></div></div></div>`)
				var ids = day.getAttribute('data-id').split(','),
					names = JSON.parse(day.getAttribute('data-names'))
					if(ids[0] == id){
						day.setAttribute('data-id',ids[1])
						day.setAttribute('data-names',`["${names[1]}"]`)
						day.setAttribute('data-slot','last')
						day.setAttribute('data-opentime',parent.getAttribute('data-t1'))
						// tippy
						day._tippy.destroy()
						day.setAttribute('data-tippy-content',`<p style="margin:0">Morning just deleted</p>`);
						tippy(day)
					}else {
						day.setAttribute('data-id',ids[0])
						day.setAttribute('data-names',`["${names[0]}"]`)
						day.setAttribute('data-slot','first')
						day.setAttribute('data-opentime',parent.getAttribute('data-t2'))
						// tippy
						day._tippy.destroy()
						day.setAttribute('data-tippy-content',`<p style="margin:0">Afternoon just deleted</p>`);
						tippy(day)
					}
			}else {
				day._tippy.destroy()
				if(el){
					el.closest('tr').remove()
				}
				day.classList.remove('bk-date--booked','bk-blank--both')
				day.removeAttribute('data-names')
				day.removeAttribute('data-id')
				if(day.querySelectorAll('.bk-half').length){
					day.querySelector('.bk-half').remove()
				}
			}
			day.classList.remove('haspop')
		}

		function pullJSON(){
			return new Promise(function(resolve, reject){  
				// set up data
					let data = {
			    		action: 'call',
					    security: Ajax.security,
					    type: 'calendar',
					    id: parent.getAttribute('data-cal'),
					    admin: true
					}
					let postdata = new FormData();
					for(let i in data){
					   postdata.append(i,data[i]);
					}
				// Pull calendar data
					fetch(Ajax.ajaxurl, {
					  	method:'POST',
					  	credentials: 'same-origin',
					  	body:postdata
					})
					.then(response => response.json())
					.then((json) => {
						res.settings = json;
						// then pull booking data
							data.type = 'bookings';
							postdata = new FormData();
							for(let i in data){
							   postdata.append(i,data[i]);
							}
							fetch(Ajax.ajaxurl, {
							  	method:'POST',
							  	credentials: 'same-origin',
							  	body:postdata
							})
							.then(response => response.json())
							.then((json) => {
								res.bookings = json;
								resolve(res);
							}).catch((err) =>{
								reject(err);
							});

					}).catch((err) =>{
						reject(err);
					});
			});
		}

		function createListeners(bookings){
			// Next
			next.addEventListener('click',(event) => {
				clearCalendar()
				let nextMonth = date.getMonth() + 1,
					nextMonthone = nextone.getMonth() + 1,
					nextMonthtwo = nexttwo.getMonth() + 1,
					nextMonththree = nextthree.getMonth() + 1,
					nextMonthfour = nextfour.getMonth() + 1,
					nextMonthfive = nextfive.getMonth() + 1
					date.setMonth(nextMonth)
					nextone.setMonth(nextMonthone)
					nexttwo.setMonth(nextMonthtwo)
					nextthree.setMonth(nextMonththree)
					nextfour.setMonth(nextMonthfour)
					nextfive.setMonth(nextMonthfive)
					createMonth(bookings)
					previous.classList.remove('bk-hidden');

			})
			// Previous
			previous.addEventListener('click',(event) => {
					clearCalendar()
					date.setMonth(date.getMonth() - 1)
					nextone.setMonth(nextone.getMonth() - 1)
					nexttwo.setMonth(nexttwo.getMonth() - 1)
					nextthree.setMonth(nextthree.getMonth() - 1)
					nextfour.setMonth(nextfour.getMonth() - 1)
					nextfive.setMonth(nextfive.getMonth() - 1)
					createMonth(bookings)
					if(date.getMonth() == todate.getMonth() && date.getFullYear() == todate.getFullYear()){
						previous.classList.add('bk-hidden');
					}
			})
			adbtn.addEventListener('click',(event) => {
				if(parent.classList.contains('hiding')){
					parent.classList.remove('hiding');
					adbtn.innerHTML = 'Hide calendar';
				}else {
					parent.classList.add('hiding');
					adbtn.innerHTML = 'Show calendar';
				}
			});
		}

		function createDay(num, day, year, cal){
			date.setHours(0,0,0,0);
			todate.setHours(0,0,0,0);
			let datetype;
			switch(cal){
				case 'one':
					datetype = nextone;
				break;
				case 'two':
					datetype = nexttwo;
				break;
				case 'three':
					datetype = nextthree;
				break;
				case 'four':
					datetype = nextfour;
				break;
				case 'five':
					datetype = nextfive;
				break;
				default:
					datetype = date;
			}
			let newDay = d.createElement('div'),
				newWeek = d.createElement('span'),
				dateEl = d.createElement('span'),
				caldate = ('0' + datetype.getDate()).slice(-2)+'.'+('0' + (datetype.getMonth()+1)).slice(-2)+'.'+datetype.getFullYear();
			dateEl.innerHTML = num
			dateEl.className = 'bk-date-span'
			newDay.className = 'bk-date'
			newDay.setAttribute('data-calendar-date', caldate)
			newDay.setAttribute('data-icon',false)
			// add off icon
				isicon = dayicons.find(function(el){
					if(el == caldate){	
						return true;
					}else {
						return false;
					}
				})
				if(isicon){
					newDay.setAttribute('data-icon',true)
					if(bkcals.getAttribute('data-icon') != 'false'){
						newDay.classList.add('holiday')
						newDay.setAttribute('data-tippy-content',`<p style="margin:0">${bkcals.getAttribute('data-holidaytext')}</p>`);
						tippy(newDay)
						newDay.innerHTML = `<div class="bk-lg-icon"><i class="${bkcals.getAttribute('data-icon')}"></i></div>`
					}
				}
			// end add off icon
			let dayname = 'S';
			switch(day){
				case 1:
					dayname = 'M';
				break;
				case 2:
					dayname = 'T';
				break;
				case 3:
					dayname = 'W';
				break;
				case 4:
					dayname = 'T';
				break;
				case 5:
					dayname = 'F';
				break;
				case 6:
					dayname = 'S';
				break;
			}

			newWeek.innerHTML = dayname;
			// if it's the first day of the month
			if(num === 1){
				if(day === 0){
					cal == 'first' ? newDay.style.marginLeft = 'calc('+(6 * 14.28) + '% - 1px)' : newDay.style.marginLeft = (6 * 14.28) + '%';
				}else {
					newDay.style.marginLeft = ((day - 1) * 14.28) + '%'
					cal == 'first' ? newDay.style.marginLeft = 'calc('+((day - 1) * 14.28) + '% - 1px)' : newDay.style.marginLeft = ((day - 1) * 14.28) + '%';
				}
			}
			// disable days
			if(date.getTime() < todate.getTime()){
				newDay.classList.add('bk-date--disabled')
			}else if(day == 0 || day == 6){
				newDay.classList.add('bk-date--disabled')
			}else {
				newDay.classList.add('bk-date--active')
				newDay.setAttribute('data-calendar-status', 'active')
				if(date.getTime() == todate.getTime()){
					newDay.classList.add('bk-date--today');
				}
			}
				
			newDay.appendChild(dateEl)

			switch(cal){
				case 'default':
					month.appendChild(newDay)
					week.appendChild(newWeek)
				break;
				case 'one':
					monthone.appendChild(newDay)
					weekone.appendChild(newWeek)
				break;
				case 'two':
					monthtwo.appendChild(newDay)
					weektwo.appendChild(newWeek)
				break;
				case 'three':
					monththree.appendChild(newDay)
					weekthree.appendChild(newWeek)
				break;
				case 'four':
					monthfour.appendChild(newDay)
					weekfour.appendChild(newWeek)
				break;
				case 'five':
					monthfive.appendChild(newDay)
					weekfive.appendChild(newWeek)
				break;
			}
		}
		function createMonth(bookings){
			let currentMonth = date.getMonth(),
				currentnextone = nextone.getMonth(),
				currentnexttwo = nexttwo.getMonth(),
				currentnextthree = nextthree.getMonth(),
				currentnextfour = nextfour.getMonth(),
				currentnextfive = nextfive.getMonth();
			while(date.getMonth() === currentMonth){
				createDay(date.getDate(),date.getDay(),date.getFullYear(),'default')
				date.setDate(date.getDate() + 1)
			}
			while(nextone.getMonth() === currentnextone){
				createDay(nextone.getDate(),nextone.getDay(),nextone.getFullYear(),'one')
				nextone.setDate(nextone.getDate() + 1)
			}
			while(nexttwo.getMonth() === currentnexttwo){
				createDay(nexttwo.getDate(),nexttwo.getDay(),nexttwo.getFullYear(),'two')
				nexttwo.setDate(nexttwo.getDate() + 1)
			}
			while(nextthree.getMonth() === currentnextthree){
				createDay(nextthree.getDate(),nextthree.getDay(),nextthree.getFullYear(),'three')
				nextthree.setDate(nextthree.getDate() + 1)
			}
			while(nextfour.getMonth() === currentnextfour){
				createDay(nextfour.getDate(),nextfour.getDay(),nextfour.getFullYear(),'four')
				nextfour.setDate(nextfour.getDate() + 1)
			}
			while(nextfive.getMonth() === currentnextfive){
				createDay(nextfive.getDate(),nextfive.getDay(),nextfive.getFullYear(),'five')
				nextfive.setDate(nextfive.getDate() + 1)
			}
			// while loop trips over and day is at 30/31, bring it back
			date.setDate(1)
			date.setMonth(date.getMonth() - 1)

			nextone.setDate(1)
			nextone.setMonth(nextone.getMonth() - 1)

			nexttwo.setDate(1)
			nexttwo.setMonth(nexttwo.getMonth() - 1)

			nextthree.setDate(1)
			nextthree.setMonth(nextthree.getMonth() - 1)

			nextfour.setDate(1)
			nextfour.setMonth(nextfour.getMonth() - 1)

			nextfive.setDate(1)
			nextfive.setMonth(nextfive.getMonth() - 1)
			
			label.innerHTML = monthsAsString(date.getMonth()).substring(0, 3) + ' <br><span>' + date.getFullYear() + '</span>';
			labelone.innerHTML = monthsAsString(nextone.getMonth()).substring(0, 3) + ' <br><span>' + nextone.getFullYear() + '</span>';
			labeltwo.innerHTML = monthsAsString(nexttwo.getMonth()).substring(0, 3) + ' <br><span>' + nexttwo.getFullYear() + '</span>';
			labelthree.innerHTML = monthsAsString(nextthree.getMonth()).substring(0, 3) + ' <br><span>' + nextthree.getFullYear() + '</span>';
			labelfour.innerHTML = monthsAsString(nextfour.getMonth()).substring(0, 3) + ' <br><span>' + nextfour.getFullYear() + '</span>';
			labelfive.innerHTML = monthsAsString(nextfive.getMonth()).substring(0, 3) + ' <br><span>' + nextfive.getFullYear() + '</span>';
			// set up bookings for visible months
			let datemonth = date.getMonth() < 9 ? '0'+(date.getMonth()+1) : date.getMonth()+1,
				nextonemonth = nextone.getMonth() < 9 ? '0'+(nextone.getMonth()+1) : nextone.getMonth()+1,
				nexttwomonth = nexttwo.getMonth() < 9 ? '0'+(nexttwo.getMonth()+1) : nexttwo.getMonth()+1,
				nextthreemonth = nextthree.getMonth() < 9 ? '0'+(nextthree.getMonth()+1) : nextthree.getMonth()+1,
				nextfourmonth = nextfour.getMonth() < 9 ? '0'+(nextfour.getMonth()+1) : nextfour.getMonth()+1,
				nextfivemonth = nextfive.getMonth() < 9 ? '0'+(nextfive.getMonth()+1) : nextfive.getMonth()+1,
				match = datemonth+'.'+date.getFullYear(),
				matchone = nextonemonth+'.'+nextone.getFullYear(),
				matchtwo = nexttwomonth+'.'+nexttwo.getFullYear(),
				matchthree = nextthreemonth+'.'+nextthree.getFullYear(),
				matchfour = nextfourmonth+'.'+nextfour.getFullYear(),
				matchfive = nextfivemonth+'.'+nextfive.getFullYear();
			// filter bookings for shown months only
			bookings = bookings.filter((booking) => {
				if(booking.date.includes(match) || booking.date.includes(matchone) || booking.date.includes(matchtwo) || booking.date.includes(matchthree) || booking.date.includes(matchfour) || booking.date.includes(matchfive)){
					return booking
				}
			});
			function compare(a,b){
			  	if(a.date > b.date){
			    	return -1;
			  	}
			  	if(a.date < b.date){
			    	return 1;
			  	}
			  	return 0;
			}
			bookings.sort(compare);
			// make two half days one day booked
			bookings = bookings.filter((obj, pos, arr) => {
				arr[pos].tippy = arr[pos].status;
		       	if(arr.map(unique => unique['date']).indexOf(obj['date']) === pos){
		       		if(arr[pos].type == 'full'){
		       			arr[pos].full = true;	
		       		}
		       		return obj;
		       	}else {
		       		arr[pos-1].tippy = arr[pos-1].status+','+arr[pos].status;
		       		if(arr[pos].status == 'pending' || arr[pos-1].status == 'pending'){
		       			arr[pos-1].status = 'pending';
		       		}
		       		if(arr[pos].client == true || arr[pos-1].client == true){
		       			arr[pos-1].client = true;
		       		}
		       		if(arr[pos].clientloc != '' || arr[pos-1].clientloc == ''){
		       			arr[pos-1].clientloc = arr[pos].clientloc;
		       		}
		       		arr[pos-1].full = true;
		      
		       		if(arr[pos].type == 'last'){
		       			arr[pos-1].details.push(arr[pos].details[0])
		       			arr[pos-1].id.push(arr[pos].id[0])
		       		}else {
		       			arr[pos-1].details.unshift(arr[pos].details[0])
		       			arr[pos-1].id.unshift(arr[pos].id[0])
		       		}
		       	}
		    });
			createBookings(bookings)
			dateClick()
		}
		function createBookings(bookings){
			let exists = Object.keys(bookings).some((i) => {
				let date = bookings[i].date,
					type = bookings[i].type,
					status = bookings[i].status,
					statusTip = bookings[i].tippy,
					full = bookings[i].full,
					id = bookings[i].id,
					details = bookings[i].details,
					blank = bookings[i].blank,
					client = bookings[i].client,
					clientloc = bookings[i].clientloc,
					detarray = [],
					newDay = d.querySelector(`.bk-date[data-calendar-date="${date}"]`)
					details.forEach((el) => {
					  	detarray.push('"'+el+'"');
					})
					// console.log(date)
					// console.log(d.querySelector(`.bk-date[data-calendar-date="${date}"]`))

					newDay.setAttribute('data-names','['+detarray+']')
					newDay.setAttribute('data-id',id)
					if(client){
						newDay.setAttribute('data-client',true)
					}
					if(clientloc){
						newDay.setAttribute('data-clientloc',clientloc)
					}
		    	if(type == 'first' || type == 'last'){
		    		if(!full){
		    			newDay.classList.add('bk-date--half')
			    		newDay.setAttribute('data-slot',type);
			    		if(type == 'first'){
			    			newDay.setAttribute('data-opentime',parent.getAttribute('data-t2'));
			    			if(status == 'pending'){
				    			newDay.setAttribute('data-tippy-content','<p style="margin:0">Morning pending</p>');
				    		}else {
				    			newDay.setAttribute('data-tippy-content','<p style="margin:0">Morning booked</p>');
				    		}
			    		}else {
			    			newDay.setAttribute('data-opentime',parent.getAttribute('data-t1'));
			    			if(status == 'pending'){
				    			newDay.setAttribute('data-tippy-content','<p style="margin:0">Afternoon pending</p>');
				    		}else {
				    			newDay.setAttribute('data-tippy-content','<p style="margin:0">Afternoon booked</p>');
				    		}
			    		}
			  			newDay.insertAdjacentHTML('beforeend',`<div class="bk-half"><div class="bk-rotate"><div class="bk-half-block bk-half-first"></div><div class="bk-half-block bk-half-last"></div></div></div>`)
		    		}else {
		    			newDay.classList.add('bk-date--booked')
		    			newDay.classList.add('bk-booked--half') 
		    			if(blank == 'true'){
		    				newDay.classList.add('bk-blank--both') 
		    			}
		    			newDay.insertAdjacentHTML('beforeend',`<div class="bk-date-indicator">2</div>`)
		    			statusTip = statusTip.split(',')
						if(statusTip[0] == 'pending' && statusTip[1] == 'pending'){
							newDay.setAttribute('data-tippy-content','<p style="margin:0">Morning pending<br>Afternoon pending</p>');
						}else if(statusTip[0] == 'pending' && statusTip[1] == 'publish'){
							newDay.setAttribute('data-tippy-content','<p style="margin:0">Morning pending<br>Afternoon booked</p>');
						}else if(statusTip[0] == 'publish' && statusTip[1] == 'pending'){
							newDay.setAttribute('data-tippy-content','<p style="margin:0">Morning booked<br>Afternoon pending</p>');
						}else {
							newDay.setAttribute('data-tippy-content','<p style="margin:0">Morning booked<br>Afternoon booked</p>');
						}
		    		}
		    	}else {
		    		newDay.classList.add('bk-date--booked')
		    		// newDay.insertAdjacentHTML('beforeend',`<div class="bk-date-indicator">1</div>`)
		    		if(status == 'pending'){
		    			newDay.setAttribute('data-tippy-content','<p style="margin:0">Full day pending</p>');
		    		}else {
		    			newDay.setAttribute('data-tippy-content','<p style="margin:0">Full day booked</p>');
		    		}
		    	}
		    	if(status == 'pending'){
		    		newDay.classList.add('bk-date-pending')
		    	}
		    	tippy(newDay)
			});
			ancestor.classList.remove('bk-loading')
		}

		function dateClick(){
			activeDates = d.querySelectorAll('[data-calendar-status="active"]')
			for (let i = 0; i < activeDates.length; i++){
				activeDates[i].addEventListener('click',function(event){
				
					let dotdate = activeDates[i].dataset.calendarDate;

					removeActiveClass();
					if(activeDates[i].classList.contains('haspop')){
						if(!activeDates[i].classList.contains('bk-date--booked')){
							activeDates[i].classList.remove('haspop');
						}	
					}else {
						activeDates[i].classList.add('bk-date--selected');
						parent.classList.add('popup-open');

						popOver(activeDates[i],dotdate);
					}	
						
				})
			}
		}

		function popOver(el,date){
			let dotless = date.replace(/\./g,',');
			// rm all
			months.forEach((el) => {
				let haspop = el.querySelectorAll('.bk-date.haspop'),
					days = el.querySelectorAll('.bk-date');
			  	haspop.forEach((el) => {
				  	el.removeChild(el.querySelector('.bk-popup'));
				});
				days.forEach(el => el.classList.remove('haspop'));
			});
			

			el.classList.add('haspop');
			let popuptype = el.classList.contains('bk-date--booked') ? 'bk-popfull': ''
	
			if(el.classList.contains('bk-date--half')){
				// booked half
					let names = JSON.parse(el.getAttribute('data-names')),
						ids = el.getAttribute('data-id').split(','),
						onlyrealbook,checkicon,halfbookslot
						if(names[0].indexOf('Booked off edited') > -1){
							onlyrealbook = `<a href="?page=med-bookings&action=delete&medpost=${ids[0]}&_wpnonce=${d.querySelector('.bk-booking-list').getAttribute('data-random')}" class="listpopup-delete-btn" data-id="${ids[0]}"><label>Delete</label></a><a href=""><label class="listpopup-view-btn" data-id="${ids[0]}" data-parent="${parent.getAttribute('data-cal')}">View</label></a>`
						}else if(names[0].indexOf('Booked off') > -1){
							onlyrealbook = `<a href="?page=med-bookings&action=delete&medpost=${ids[0]}&_wpnonce=${d.querySelector('.bk-booking-list').getAttribute('data-random')}" class="listpopup-delete-btn" data-id="${ids[0]}"><label>Delete</label></a><a href=""><label class="listpopup-view-btn" data-id="${ids[0]}" data-parent="${parent.getAttribute('data-cal')}">Edit</label></a>`
						}else {
							onlyrealbook = `<a href="?page=med-bookings&action=delete&medpost=${ids[0]}&_wpnonce=${d.querySelector('.bk-booking-list').getAttribute('data-random')}" class="listpopup-delete-btn" data-id="${ids[0]}"><label>Delete</label></a><a href=""><label class="listpopup-view-btn" data-id="${ids[0]}" data-parent="${parent.getAttribute('data-cal')}">View</label></a>`
						}
					
					if(el.getAttribute('data-slot') == 'first'){
						halfbookslot = 'last'
					}else if(el.getAttribute('data-slot') == 'last'){
						halfbookslot = 'first'
					}

					// set icon
					if(el.getAttribute('data-icon') == 'true'){
						checkicon = 'checked'
					}else {
						checkicon = ''
					}
					// add half days to popup
					sweetalert.fire({
						title: '<strong>Date is half booked</strong>',
						type: false,
						animation:false,
						customClass:'animated bk-animated zoomIn bk-dark',
						width:'410px',
						html:`Select a booking below to view or modify it<br><br>
							<li class="admin-popup-listing">
								<span class="bookedoffname">${names[0]}</span>
								${onlyrealbook}
							</li>
							<li class="admin-popup-listing lb-listing">
								<input type="radio" name="booking-time" id="bk-time-${halfbookslot}" value="${halfbookslot}">
								<div class="time-checkbox"></div>
								<label for="bk-time-${halfbookslot}"><strong>Half day:</strong> ${el.getAttribute('data-opentime')}</label>
							</li>
						<button type="button" class="swal2-styled med-book-btn med-bookoff">Book this</button>
						<div class="bk-dayhasicon">
							<label class="switch">
							  <input type="checkbox" ${checkicon}>
							  <span class="slider round"></span>
							</label>
							<h6>Enable icon on this day</h6>
						</div>`,
						showCloseButton: true,
						showCancelButton: false,
						showConfirmButton: false
					}).then((response) => {
						if(response.dismiss){
							el.classList.remove('haspop')
							el.classList.remove('bk-date--selected')
						}
					})
					// enable book btns
					let listItem = d.querySelectorAll('.admin-popup-listing'),
						listBookoff = d.querySelector('.med-bookoff')
					listItem.forEach((el) => {
					  	el.addEventListener('click',(e) => {
					  		d.querySelectorAll('.admin-popup-listing').forEach(el => el.classList.remove('lb-checked'))
					  		el.classList.add('lb-checked')
							if(el.classList.contains('lb-listing')){
								listBookoff.classList.add('bookaction-enabled')	
							}
					  	})
					})
					// custom btn events
				
					listBookoff.addEventListener('click',(e) => {
						if(listBookoff.classList.contains('bookaction-enabled')){
							listBookoff.innerHTML = 'processing..'
							let url = d.querySelector('.bk-booking-list').getAttribute('data-url')+'/process/book_off.php',
								bookofftime,bookoffsession

							if(d.querySelector('.lb-checked input').value == 'first'){
								bookofftime = parent.getAttribute('data-t1').split(' ')
								bookofftime = bookofftime[0]
								bookoffsession = 'Morning Booking'
							}else if(d.querySelector('.lb-checked input').value == 'last'){
								bookofftime = parent.getAttribute('data-t2').split(' ')
								bookofftime = bookofftime[0]
								bookoffsession = 'Afternoon Booking'
							}else {
								bookofftime = parent.getAttribute('data-t0').split(' ')
								bookofftime = bookofftime[0]
								bookoffsession = 'Full-day Booking'
							}	
							bookOff(url,bookofftime,bookoffsession,listBookoff)
						}
					})
					// Now load booking popup
					bookingPopupClick(el,sweetalert,parent.getAttribute('data-t1'),parent.getAttribute('data-t2'))
					dayIcon()

			}else if(el.classList.contains('bk-date--booked')){
				// booked both
				if(el.classList.contains('bk-booked--half')){
					// set icon
						let checkicon
						if(el.getAttribute('data-icon') == 'true'){
							checkicon = 'checked'
						}else {
							checkicon = ''
						}
					// mk arr from names
					let names = JSON.parse(el.getAttribute('data-names')),
						ids = el.getAttribute('data-id').split(','),
						onlyrealbook,onlyrealbook2
						// isbook1
						if(names[0].indexOf('Booked off edited') > -1){
							onlyrealbook = `<a href="?page=med-bookings&action=delete&medpost=${ids[0]}&_wpnonce=${d.querySelector('.bk-booking-list').getAttribute('data-random')}" class="listpopup-delete-btn" data-id="${ids[0]}"><label>Delete</label></a><a href=""><label class="listpopup-view-btn" data-id="${ids[0]}" data-parent="${parent.getAttribute('data-cal')}">View</label></a>`
						}else if(names[0].indexOf('Booked off') > -1){
							onlyrealbook = `<a href="?page=med-bookings&action=delete&medpost=${ids[0]}&_wpnonce=${d.querySelector('.bk-booking-list').getAttribute('data-random')}" class="listpopup-delete-btn" data-id="${ids[0]}"><label>Delete</label></a><a href=""><label class="listpopup-view-btn" data-id="${ids[0]}" data-parent="${parent.getAttribute('data-cal')}">Edit</label></a>`
						}else {
							onlyrealbook = `<a href="?page=med-bookings&action=delete&medpost=${ids[0]}&_wpnonce=${d.querySelector('.bk-booking-list').getAttribute('data-random')}" class="listpopup-delete-btn" data-id="${ids[0]}"><label>Delete</label></a><a href=""><label class="listpopup-view-btn" data-id="${ids[0]}" data-parent="${parent.getAttribute('data-cal')}">View</label></a>`
						}
						// isbook2
						if(names[1].indexOf('Booked off edited') > -1){
							onlyrealbook2 = `<a href="?page=med-bookings&action=delete&medpost=${ids[1]}&_wpnonce=${d.querySelector('.bk-booking-list').getAttribute('data-random')}" class="listpopup-delete-btn" data-id="${ids[1]}"><label>Delete</label></a><a href=""><label class="listpopup-view-btn" data-id="${ids[1]}" data-parent="${parent.getAttribute('data-cal')}">View</label></a>`
						}else if(names[1].indexOf('Booked off') > -1){
							onlyrealbook2 = `<a href="?page=med-bookings&action=delete&medpost=${ids[1]}&_wpnonce=${d.querySelector('.bk-booking-list').getAttribute('data-random')}" class="listpopup-delete-btn" data-id="${ids[1]}"><label>Delete</label></a><a href=""><label class="listpopup-view-btn" data-id="${ids[1]}" data-parent="${parent.getAttribute('data-cal')}">Edit</label></a>`
						}else {
							onlyrealbook2 = `<a href="?page=med-bookings&action=delete&medpost=${ids[1]}&_wpnonce=${d.querySelector('.bk-booking-list').getAttribute('data-random')}" class="listpopup-delete-btn" data-id="${ids[1]}"><label>Delete</label></a><a href=""><label class="listpopup-view-btn" data-id="${ids[1]}" data-parent="${parent.getAttribute('data-cal')}">View</label></a>`
						}
					// add half days to popup
					sweetalert.fire({
						title: '<strong>Date is fully booked</strong>',
						type: false,
						animation:false,
						customClass:'animated bk-animated zoomIn bk-dark',
						width:'410px',
						html:`Select a booking below to view or modify it<br><br>
							<li class="admin-popup-listing"><span class="bookedoffname">${names[0]}</span><a href="">
								${onlyrealbook}
							</a></li>
							<li class="admin-popup-listing"><span class="bookedoffname">${names[1]}</span><a href="">
								${onlyrealbook2}
							</a></li>
							<div class="bk-dayhasicon">
							<label class="switch">
								  <input type="checkbox" ${checkicon}>
								  <span class="slider round"></span>
								</label>
								<h6>Enable icon on this day</h6>
							</div>`,
						showCloseButton: true,
						showCancelButton: false,
						showConfirmButton: false
					}).then((response) => {
						if(response.dismiss){
							el.classList.remove('haspop');
							el.classList.remove('bk-date--selected');
						}
					})
					// Now load booking popup
					bookingPopupClick(el,sweetalert,parent.getAttribute('data-t1'),parent.getAttribute('data-t2'));
					dayIcon()
				}else {
					// set icon
						let checkicon
						if(el.getAttribute('data-icon') == 'true'){
							checkicon = 'checked'
						}else {
							checkicon = ''
						}
					// add full day to popup
					let onlyrealbook,getname = JSON.parse(el.getAttribute('data-names'))

					if(el.getAttribute('data-names').indexOf('Booked off edited') > -1){
						onlyrealbook = `<a href="?page=med-bookings&action=delete&medpost=${el.getAttribute('data-id')}&_wpnonce=${d.querySelector('.bk-booking-list').getAttribute('data-random')}" class="listpopup-delete-btn" data-id="${el.getAttribute('data-id')}"><label>Delete</label></a><a href=""><label class="listpopup-view-btn" data-id="${el.getAttribute('data-id')}" data-parent="${parent.getAttribute('data-cal')}">View</label></a>`
					}else if(el.getAttribute('data-names').indexOf('Booked off') > -1){
						onlyrealbook = `<a href="?page=med-bookings&action=delete&medpost=${el.getAttribute('data-id')}&_wpnonce=${d.querySelector('.bk-booking-list').getAttribute('data-random')}" class="listpopup-delete-btn" data-id="${el.getAttribute('data-id')}"><label>Delete</label></a><a href=""><label class="listpopup-view-btn" data-id="${el.getAttribute('data-id')}" data-parent="${parent.getAttribute('data-cal')}">Edit</label></a>`
					}else {
						onlyrealbook = `<a href="?page=med-bookings&action=delete&medpost=${el.getAttribute('data-id')}&_wpnonce=${d.querySelector('.bk-booking-list').getAttribute('data-random')}" class="listpopup-delete-btn" data-id="${el.getAttribute('data-id')}"><label>Delete</label></a><a href=""><label class="listpopup-view-btn" data-id="${el.getAttribute('data-id')}"  data-parent="${parent.getAttribute('data-cal')}">View</label></a>`
					}
					sweetalert.fire({
						title: '<strong>Date is fully booked</strong>',
						type: false,
						animation:false,
						customClass:'animated bk-animated zoomIn bk-dark',
						width:'410px',
						html:`Select a booking below to view or modify it<br><br>
								<li class="admin-popup-listing"><span class="bookedoffname">${getname[0]}</span><a href="">
								${onlyrealbook}
							</a></li>
							<div class="bk-dayhasicon">
							<label class="switch">
								  <input type="checkbox" ${checkicon}>
								  <span class="slider round"></span>
								</label>
								<h6>Enable icon on this day</h6>
							</div>`,
						showCloseButton: true,
						showCancelButton: false,
						showConfirmButton: false
					}).then((response) => {
						if(response.dismiss){
							el.classList.remove('haspop');
							el.classList.remove('bk-date--selected');
						}
					})
					// Now load booking popup
					bookingPopupClick(el,sweetalert,parent.getAttribute('data-t1'),parent.getAttribute('data-t2'));
					dayIcon()
				}
			}else {
				// set icon
					let checkicon
					if(el.getAttribute('data-icon') == 'true'){
						checkicon = 'checked'
					}else {
						checkicon = ''
					}
				// fresh day
				sweetalert.fire({
					title: '<strong>Booking actions:</strong>',
					type: false,
					animation:false,
					customClass:'animated bk-animated zoomIn bk-dark',
					width:'410px',
					html:`Create a booking for this day<br><br>
						<li class="admin-popup-listing lb-listing">
							<input type="radio" name="booking-time" id="bk-time-full" value="full">
							<div class="time-checkbox"></div>
							<label for="bk-time-full"><strong>Full day:</strong> ${parent.getAttribute('data-t0')}</label>
						</li>
						<li class="admin-popup-listing lb-listing">
							<input type="radio" name="booking-time" id="bk-time-first" value="first">
							<div class="time-checkbox"></div>
							<label for="bk-time-first"><strong>Half day:</strong> ${parent.getAttribute('data-t1')}</label>
						</li>
						<li class="admin-popup-listing lb-listing">
							<input type="radio" name="booking-time" id="bk-time-last" value="last">
							<div class="time-checkbox"></div>
							<label for="bk-time-last"><strong>Half day:</strong> ${parent.getAttribute('data-t2')}</label>
						</li>
						<button type="button" class="swal2-styled med-book-btn med-bookoff">Book this</button>
						<div class="bk-dayhasicon">
							<label class="switch">
							  <input type="checkbox" ${checkicon}>
							  <span class="slider round"></span>
							</label>
							<h6>Enable icon on this day</h6>
						</div>`,
					showCloseButton: true,
					showCancelButton: false,
					showConfirmButton: false
				}).then((response) => {
					if(response.dismiss){
						el.classList.remove('haspop')
						el.classList.remove('bk-date--selected')
					}
				})
				// enable book btns
				let listItem = d.querySelectorAll('.admin-popup-listing'),
					listBookoff = d.querySelector('.med-bookoff')
				listItem.forEach((el) => {
				  	el.addEventListener('click',(e) => {
				  		d.querySelectorAll('.admin-popup-listing').forEach(el => el.classList.remove('lb-checked'))
				  		el.classList.add('lb-checked')
				  		if(el.classList.contains('lb-listing')){
							listBookoff.classList.add('bookaction-enabled')	
						}
				  	})
				})
				// custom btn events
				listBookoff.addEventListener('click',(e) => {
					if(listBookoff.classList.contains('bookaction-enabled')){
						listBookoff.innerHTML = 'processing..'
						let url = d.querySelector('.bk-booking-list').getAttribute('data-url')+'/process/book_off.php',
							bookofftime,bookoffsession

						if(d.querySelector('.lb-checked input').value == 'first'){
							bookofftime = parent.getAttribute('data-t1').split(' ')
							bookofftime = bookofftime[0]
							bookoffsession = 'Morning Booking'
						}else if(d.querySelector('.lb-checked input').value == 'last'){
							bookofftime = parent.getAttribute('data-t2').split(' ')
							bookofftime = bookofftime[0]
							bookoffsession = 'Afternoon Booking'
						}else {
							bookofftime = parent.getAttribute('data-t0').split(' ')
							bookofftime = bookofftime[0]
							bookoffsession = 'Full-day Booking'
						}	
						bookOff(url,bookofftime,bookoffsession,listBookoff)
					}
				})
				dayIcon()
			}
		}

		function bookOff(url,bookofftime,bookoffsession,listBookoff){
			let monthNames = ["January", "February", "March", "April", "May", "June",
				  "July", "August", "September", "October", "November", "December"
				],
				fd = d.querySelector('.bk-date--selected.haspop').getAttribute('data-calendar-date').split('.')
			fd = new Date(`${fd[2]}-${fd[1]}-${fd[0]} 00:00:00`)
			fd = `${monthNames[fd.getMonth()]} ${fd.getDate()}, ${fd.getFullYear()}`

			fetch(url, {
			  	method:'POST',
			  	headers:{"Content-Type": "application/json"},
			  	body: JSON.stringify({calendar:parent.getAttribute('data-cal'),
			  		title:`${fd} &hyphen; ${bookoffsession}`,
			  		day:d.querySelector('.bk-date--selected.haspop').getAttribute('data-calendar-date'), slot:d.querySelector('.lb-checked input').value})
			})
			.then(response => response.json())
			.then((data) => {
				setTimeout(()=>{ 
					listBookoff.innerHTML = 'Book this'
				  	if(data.message == 'exists'){
				  		sweetalert.fire({
				    		title: 'Booking exists!',
				    		text: 'A booking was made before this one',
				    		type: 'warning',
				    		showConfirmButton:false,
				    		timer: 2400
				    	}).then((result) => {
				    		window.location.reload()
				    	})
				  	}else if(data.message == 'error'){
				  		sweetalert.fire({
				    		title: 'Oops!',
				    		text: 'There was an error, please contact support',
				    		type: 'error',
				    		showConfirmButton:false,
				    		timer: 2400
				    	}).then((result) => {
				    		window.location.reload()
				    	})
				  	}else if(data.message == 'success'){
				  		sweetalert.fire({
				    		title: 'Booking success!',
				    		text: 'This session has been reserved.',
				    		type: 'success',
				    		showConfirmButton:false,
				    		timer: 2000
				    	}).then((result) => {
				    		// add to json parent
				    		let jsonsessiontext = ''
				    		if(data.slot == 'full'){
				    			jsonsessiontext = ["Full session - Booked off"]
				    		}else if(data.slot == 'first'){
				    			jsonsessiontext = ["First session - Booked off"]
				    		}else {
				    			jsonsessiontext = ["Last session - Booked off"]
				    		}
				    		let booklist = JSON.parse(parent.getAttribute('data-checker'))
				    			booklist.push({
				    				"date":data.date,
				    				"type":data.slot,
				    				"parent":parent.getAttribute('data-cal'),
				    				"id":[data.post],
				    				"status":"publish",
				    				"details":jsonsessiontext,
				    				"location":null
				    			})
				    			function replacer(key, value) {
								  	return value.replace(/[^\w\s]/gi, '');
								}
				    			parent.setAttribute('data-checker',JSON.stringify(booklist))


							// update for front
							let theday = d.querySelector('.bk-date--selected.haspop')

								if(theday.classList.contains('bk-date--half')){
									// date has a half booking
									theday.classList.remove('bk-date--half')
									theday.classList.add('bk-date--booked','bk-booked--half')
									theday.querySelector('.bk-half').remove()
									
								  	if(theday.getAttribute('data-names').indexOf('Booked off') > -1){
								  		if(theday.getAttribute('data-names').indexOf('Booked off edited') < 0){
											theday.classList.add('bk-blank--both')			
								  		}
								  	}
								
									if(bookoffsession == 'Morning Booking'){

										theday.setAttribute('data-names',theday.getAttribute('data-names').replace('[','["First session - Booked off",'))
										theday.setAttribute('data-id',data.post+','+theday.getAttribute('data-id'))
										// tippy
										theday._tippy.destroy()
										theday.setAttribute('data-tippy-content',`<p style="margin:0">Morning just booked</p>`);
										tippy(theday)
									}else if(bookoffsession == 'Afternoon Booking'){

										theday.setAttribute('data-names',theday.getAttribute('data-names').replace(']',',"Last session - Booked off"]'))
										theday.setAttribute('data-id',theday.getAttribute('data-id')+','+data.post)
										// tippy
										theday._tippy.destroy()
										theday.setAttribute('data-tippy-content',`<p style="margin:0">Afternoon just booked</p>`);
										tippy(theday)
									}
									theday.insertAdjacentHTML('beforeend',`<div class="bk-date-indicator">2</div>`)

								}else {
									if(bookoffsession == 'Morning Booking'){

										theday.classList.add('bk-date--half')
										theday.insertAdjacentHTML('beforeend',`<div class="bk-half"><div class="bk-rotate"><div class="bk-half-block bk-half-first"></div><div class="bk-half-block bk-half-last"></div></div></div>`)
										theday.setAttribute('data-names','["First session - Booked off"]')
										theday.setAttribute('data-id',data.post)
										theday.setAttribute('data-slot','first')
										theday.setAttribute('data-opentime',parent.getAttribute('data-t2'))
										// tippy
										theday.setAttribute('data-tippy-content',`<p style="margin:0">Morning just booked</p>`);
										tippy(theday)

									}else if(bookoffsession == 'Afternoon Booking'){

										theday.classList.add('bk-date--half')
										theday.insertAdjacentHTML('beforeend',`<div class="bk-half"><div class="bk-rotate"><div class="bk-half-block bk-half-first"></div><div class="bk-half-block bk-half-last"></div></div></div>`)
										theday.setAttribute('data-names','["Last session - Booked off"]')
										theday.setAttribute('data-id',data.post)
										theday.setAttribute('data-slot','last')
										theday.setAttribute('data-opentime',parent.getAttribute('data-t1'))
										// tippy
										theday.setAttribute('data-tippy-content',`<p style="margin:0">Afternoon just booked</p>`);
										tippy(theday)

									}else {

										theday.classList.add('bk-date--booked')
										theday.setAttribute('data-names','["Full session - Booked off"]')
										theday.setAttribute('data-id',data.post)

										// theday.insertAdjacentHTML('beforeend',`<div class="bk-date-indicator">1</div>`)

										// tippy
										theday.setAttribute('data-tippy-content',`<p style="margin:0">Full session just booked</p>`);
										tippy(theday)

									}
								}

								theday.classList.remove('bk-date--selected')
								theday.classList.remove('haspop')
				    	})
				  	}else {
				  		sweetalert.fire({
				    		title: 'Oops!',
				    		text: 'There was an error, please contact support',
				    		type: 'error',
				    		showConfirmButton:false,
				    		timer: 2400
				    	}).then((result) => {
				    		window.location.reload()
				    	})
				  	}
			  	},500)
			})
		}

		function monthsAsString(monthIndex){
			return [
				'January',
				'Febuary',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November',
				'December'
				][monthIndex];
		}

		function clearCalendar(){
			month.innerHTML = '';
			monthone.innerHTML = '';
			monthtwo.innerHTML = '';
			monththree.innerHTML = '';
			monthfour.innerHTML = '';
			monthfive.innerHTML = '';
			week.innerHTML = '';
			weekone.innerHTML = '';
			weektwo.innerHTML = '';
			weekthree.innerHTML = '';
			weekfour.innerHTML = '';
			weekfive.innerHTML = '';
		}

		function removeActiveClass(){
			for (let i = 0; i < activeDates.length; i++){
				activeDates[i].classList.remove('bk-date--selected');
				parent.classList.remove('popup-open');
			}
		}
		function bookingPopupClick(el,sa,f,l){
			let popbtn = sa.getContent().querySelectorAll('.listpopup-view-btn');
				popbtn.forEach((popbtn) => {
					popbtn.addEventListener('click',(event) => {
				  		event.preventDefault();
				  		event.stopPropagation();
				  		let data = {
				    		action: 'call',
						    security: Ajax.security,
						    type: 'listpopup',
						    id:popbtn.getAttribute('data-id'),
						    parent:popbtn.getAttribute('data-parent'),
						    first:f,
						    last:l
						}
						let postdata = new FormData();
						for(let i in data){
						   postdata.append(i,data[i]);
						}
						fetch(Ajax.ajaxurl, {
						  	method:'POST',
						  	credentials: 'same-origin',
						  	body:postdata
						})
						.then(response => response.json())
						.then((json) => {
							openEditableLayer(json,sa,el,'haspop')
						}).catch((err) => {
							console.log(err);
						})
				  	});	
				});
			let delbtn = sa.getContent().querySelectorAll('.listpopup-delete-btn');
				delbtn.forEach((btn) => {
					btn.addEventListener('click',(event) => {
				  		event.preventDefault();
				  		event.stopPropagation();
						sweetalert.fire({
							title: 'Are you sure you want <br>to delete/reject this item?',
							text: "This session will be deleted permanantly and cannot be brought back.",
							type: 'warning',
							showCancelButton: true,
							confirmButtonColor: '#3085d6',
							cancelButtonColor: '#d33',
							confirmButtonText: 'Yes, delete it!'
						}).then((result) => {
						    if(result.dismiss != 'cancel' && result.dismiss != 'backdrop'){
						    	sweetalert.fire({
						    		title: 'Deleted!',
						    		text: 'This session has been deleted..',
						    		type: 'success',
						    		showConfirmButton:false,
						    		timer: 1800
						    	}).then((result) => {
					    			$.ajax({
						    			type:'post',
						    			url:btn.getAttribute('href'),
						    			success:function(data){
						    				let theday = d.querySelector('.bk-date.haspop')
											if(theday.classList.contains('bk-date--booked') && theday.classList.contains('bk-booked--half')){
												// date has two half bookings
												rmBooking('half2',d.querySelector(`.bk-srcdelete[data-day="${theday.getAttribute('data-calendar-date')}"]`),theday,btn.getAttribute('data-id'));
											}else if(theday.classList.contains('bk-date--half')){
												// date has one half booking
												rmBooking('half1',d.querySelector(`.bk-srcdelete[data-day="${theday.getAttribute('data-calendar-date')}"]`),theday,btn.getAttribute('data-id'));
											}else if(theday.classList.contains('bk-date--booked')){
												// date has one full booking
												rmBooking('full',d.querySelector(`.bk-srcdelete[data-day="${theday.getAttribute('data-calendar-date')}"]`),theday,btn.getAttribute('data-id'));
											}
						    			},
						    			error:function(err){
						    				console.log(err)
						    			}
						    		});
						    	})
						  	}else {
						  		// this is delete from popup list side btn
						  		d.querySelector('.bk-date.haspop').classList.remove('haspop')
						  	}
						})
				  	});	
				});
		}

		function dayIcon(){
			let checkbox = d.querySelector('.bk-dayhasicon input')
			checkbox.addEventListener('click',(e) => {
				if(checkbox.classList.contains('bk-busy')){
					e.preventDefault();
			        return false;
		        }
			})
			// checkbox.checked = true
			checkbox.addEventListener('change',(e) => {
				let isChecked = d.querySelector('.bk-dayhasicon input').checked,
					day = d.querySelector('.bk-date--selected.haspop').getAttribute('data-calendar-date'),
					calendar = parent.getAttribute('data-cal')
					checkbox.classList.add('bk-busy')
				if(isChecked){ 
					setIcon(true,day,calendar)
				}else{ 
					setIcon(false,day,calendar)
				}
			})
		}
		function isbookIcon(thecal){
			return new Promise(function(resolve, reject){ 
				fetch(d.querySelector('.bk-booking-list').getAttribute('data-url')+'/process/get_icon.php', {
				  	method:'POST',
				  	headers:{"Content-Type": "application/json"},
				  	body: JSON.stringify({cal:thecal})
				})
				.then(response => response.json())
		      	.then(data => {
		      		resolve(data)	      		
		      	})
		      	.catch((err) =>{
					reject(err)
				});
		    })
		}
		function setIcon(thestate,theday,thecal){

			fetch(d.querySelector('.bk-booking-list').getAttribute('data-url')+'/process/add_icon.php', {
			  	method:'POST',
			  	headers:{"Content-Type": "application/json"},
			  	body: JSON.stringify({state:thestate,day:theday,cal:thecal})
			})
			.then(response => response.json())
	      	.then(data => {
	      		if(data == 'exists'){
	      			alert('already marked off')
	      		}else{
	      			let iconday = d.querySelector('.bk-date.haspop')
	      			iconday.setAttribute('data-tippy-content',`<p style="margin:0">${bkcals.getAttribute('data-holidaytext')}</p>`);
	      			tippy(iconday)
	      			if(data == 'rm'){
	      				d.querySelector('.bk-dayhasicon input').classList.remove('bk-busy')
	      				iconday.setAttribute('data-icon',false)
	      				iconday.classList.remove('holiday')
	      				iconday.querySelector('.bk-lg-icon').remove()
	      				iconday._tippy.disable()
	      				iconday.removeAttribute('data-tippy-content')
	      			}else {
	      				d.querySelector('.bk-dayhasicon input').classList.remove('bk-busy')
		      			iconday.setAttribute('data-icon',true)
		      			iconday.classList.add('holiday')
		      			iconday.insertAdjacentHTML('afterbegin',`<div class="bk-lg-icon"><i class="${bkcals.getAttribute('data-icon')}"></i></div>`)
	      			}
	      		}	      		
	      	})

		}

		// edit popup from list
		function listUpdate(){
			let bkedit = d.querySelectorAll('.bk-edit')
			if(bkedit.length){
				bkedit.forEach((edit) => {
				  	edit.addEventListener('click',(e) => {
				  		let day = edit.getAttribute('data-day'),
							id = edit.getAttribute('data-id')
						
						let data = {
				    		action: 'call',
						    security: Ajax.security,
						    type: 'listpopup',
						    id:id,
						    parent:parent.getAttribute('data-cal'),
						    first:parent.getAttribute('data-t1'),
						    last:parent.getAttribute('data-t2')
						}
						let postdata = new FormData();
						for(let i in data){
						   postdata.append(i,data[i]);
						}
						fetch(Ajax.ajaxurl, {
						  	method:'POST',
						  	credentials: 'same-origin',
						  	body:postdata
						})
						.then(response => response.json())
						.then((json) => {
							openEditableLayer(json,sweetalert);
						}).catch((err) => {
							console.log(err);
						})

				  	})
				})
			}
		}

		// editable layer open
		function openEditableLayer(json,sa,el,type){
			let listing = json,
				listed = listing.listed,
				templates = listing.templates,
				loc_template = listing.loc_template,
				specific = listing.specific,
				list = '',
				timewrite,
				booked = false,edited = false,
				popType = ''

				// New merged fields
					listed.forEach((el) => {
						let timewrite = el.value
						if(el.key != 'booked' && el.key != 'edited'){
							if(el.key == 'Booking session'){
								if(el.value == 'first'){	
									timewrite = 'Morning session'
								}else if(el.value == 'last'){
									timewrite = 'Afternoon session'
								}else {
									timewrite = 'Full session'
								}
							}
						}
						if(el.key == 'booked' && el.value == 'true'){
							booked = true;
						}
						if(el.key == 'edited' && el.value == 'true'){
							edited = true;
						}
					})
					// set booking type for filters
					if(booked && edited){
						popType = 'edited';
					}else if(booked){
						popType = 'booked';
					}else {
						popType = 'client';
					}
					// setup for loc if 2 half day

					let limboth = '',
					loclock = ''
					if(d.querySelector('.bk-date.haspop').classList.contains('bk-booked--half')){
						limboth = 'disabled'
						if(!d.querySelector('.bk-date.haspop').classList.contains('bk-blank--both')){
							loclock = 'disabled'
						}else {
							loclock = 'both';
						}
					}
					let filtertemplates = templates.filter((template) => {
						if(!template.type.includes('title')){
							return template
						}
					})
					let filterlisted = listed.filter((listing) => {
						if(!listing.key.includes('booked') && !listing.key.includes('edited') && !listing.key.includes('booking_day') && !listing.key.includes('Booking session')){
							if(listing.key != 'location'){
								return listing
							}
						}
					})
					// loads first 3 fields
					listed.forEach((input) => {
						if(input.key != 'booked' && input.key != 'edited'){
							if(input.key == 'booking_day'){
								list += `<div class="admin-popup-item bk-template">
									<label>Booking Day:</label><br>
									<input id="editclientdate" class="salsa-calendar-input" autocomplete="off" data-predate="${input.value}" name="${input.key}" type="text" value="${input.value}">
								</div>`;
							}else if(input.key == 'Booking session'){
								let types
								if(input.value == 'first'){	
									timewrite = 'first'
									types = `
										<option value="first" selected data-bkactive="first">Morning session</option>
										<option value="last" ${limboth}>Afternoon session</option>
										<option value="full" disabled>Full session</option>
									`
								}else if(input.value == 'last'){
									timewrite = 'last'
									types = `
										<option value="first" ${limboth}>Morning session</option>
										<option value="last" selected data-bkactive="last">Afternoon session</option>
										<option value="full" disabled>Full session</option>
									`
								}else {
									timewrite = 'full'
									types = `
										<option value="first">Morning session</option>
										<option value="last">Afternoon session</option>
										<option value="full" selected data-bkactive="full">Full session</option>
									`
								}
								list += `<div class="admin-popup-item bk-template">
											<label>Booking Session:</label>
											<select name="${input.key}">
												${types}
											</select>
										</div>`;
							}else if(input.key == 'location'){
								let locs = '',lochalf
									if(popType == 'edited'){
										// edited bookoff
										lochalf = input.value
									}else if(popType == 'booked'){
										// blank bookoff
										if(el.getAttribute('data-names').indexOf('Booked off edited') > -1 || 
										   el.getAttribute('data-client') == 'true'){
											lochalf = el.getAttribute('data-clientloc')
										}else {
											locs = '<option disabled selected>Select location</option>'
										}
									}else {
										// client
										lochalf = input.value
									}
								loc_template.forEach((location) => {
									if(loclock == 'both'){
										locs += `<option name="${location.name}">${location.value}</option>`
									}else {
										if(location.value == lochalf){
											locs += `<option name="${location.name}" selected data-bklocset>${location.value}</option>`
										}else {
											locs += `<option name="${location.name}" ${loclock}>${location.value}</option>`
										}
									}
								})
								list += `<div class="admin-popup-item bk-template">
											<label>Location:</label>
											<select name="${input.key}">
												${locs}
											</select>
										</div>`;
							}
						}
					})
					if(filterlisted.length){
						// this filter matches template arr for client booking
						templates.forEach((el,i) => {
							let key = el.key,
								value = el.value,
								type = el.type,
								required = el.required,
								filtervalue
							if(type == 'text'){
								filterlisted.forEach((formval) => {
								  	if(formval.key == key){
								  		filtervalue = formval.value
								  	}
								})
								list += `
								<div class="admin-popup-item bk-template">
									<label>${value}${required ? '*':''}</label><br>
									<input name="${key}" type="text" value="${filtervalue}">
								</div>`;
							}else if(type == 'email'){
								filterlisted.forEach((formval) => {
								  	if(formval.key == key){
								  		filtervalue = formval.value
								  	}
								})
								list += `
								<div class="admin-popup-item bk-template">
									<label>${value}${required ? '*':''}</label><br>
									<input name="${key}" type="email"  value="${filtervalue}">
								</div>`;
							}else if(type == 'number'){
								filterlisted.forEach((formval) => {
								  	if(formval.key == key){
								  		filtervalue = formval.value
								  	}
								})
								list += `
								<div class="admin-popup-item bk-template">
									<label>${value}${required ? '*':''}</label><br>
									<input name="${key}" type="tel" pattern="[0-9.]*" value="${filtervalue}">
								</div>`;
							}else if(type == 'textarea'){
								filterlisted.forEach((formval) => {
								  	if(formval.key == key){
								  		filtervalue = formval.value
								  	}
								})
								list += `
								<div class="admin-popup-item bk-template">
									<label>${value}${required ? '*':''}</label><br>
									<textarea name="${key}">${filtervalue}</textarea>
								</div>`;
							}else if(type == 'title'){
								list += `
								<div class="admin-popup-item bk-template bk-template-title">
									<label>${value}</label>
								</div>`;
							}else {
								filterlisted.forEach((formval) => {
								  	if(formval.key == 'sf_form_file_upload'){
								  		filtervalue = formval.value
								  		list += `
										<div class="admin-popup-item bk-template">
											<label>Type in the URL for the file${required ? '*':''}</label><br>
											<input name="${key}" type="text" value="${filtervalue}">
										</div>`;
								  	}
								})
										
							}
						})
						// filterlisted.forEach((input,i) => {
						// 	if(input.type == 'text'){
						// 		list += `
						// 		<div class="admin-popup-item bk-template">
						// 			<label>${filtertemplates[i].value}${input.required ? '*':''}</label><br>
						// 			<input name="${filtertemplates[i].key}" type="text" value="${input.value}">
						// 		</div>`;
						// 	}else if(input.type == 'email'){
						// 		list += `
						// 		<div class="admin-popup-item bk-template">
						// 			<label>${filtertemplates[i].value}${input.required ? '*':''}</label><br>
						// 			<input name="${filtertemplates[i].key}" type="email"  value="${input.value}">
						// 		</div>`;
						// 	}else if(input.type == 'number'){
						// 		list += `
						// 		<div class="admin-popup-item bk-template">
						// 			<label>${filtertemplates[i].value}${input.required ? '*':''}</label><br>
						// 			<input name="${filtertemplates[i].key}" type="tel" pattern="[0-9.]*" value="${input.value}">
						// 		</div>`;
						// 	}else if(input.type == 'textarea'){
						// 		list += `
						// 		<div class="admin-popup-item bk-template">
						// 			<label>${filtertemplates[i].value}${input.required ? '*':''}</label><br>
						// 			<textarea name="${filtertemplates[i].key}" value="${input.value}"></textarea>
						// 		</div>`;
						// 	}else if(input.type == 'title'){
						// 		list += `
						// 		<div class="admin-popup-item bk-template bk-template-title">
						// 			<label>${input.value}</label><br>
						// 		</div>`;
						// 	}else{
						// 		list += `
						// 		<div class="admin-popup-item bk-template">
						// 			<label>Type in the URL for the file${input.required ? '*':''}</label><br>
						// 			<input name="${filtertemplates[i].key}" type="text" value="${input.value}">
						// 		</div>`;
						// 	}
						// })
					}else {
						// this populates fields for bookoff
						templates.forEach((el) => {
							let key = el.key,
								value = el.value,
								type = el.type,
								required = el.required
							if(type == 'text'){
								list += `
								<div class="admin-popup-item bk-template">
									<label>${value}${required ? '*':''}</label><br>
									<input name="${key}" type="text" ${required ? 'required':''}>
								</div>`;
							}else if(type == 'email'){
								list += `
								<div class="admin-popup-item bk-template">
									<label>${value}${required ? '*':''}</label><br>
									<input name="${key}" type="email" ${required ? 'required':''}>
								</div>`;
							}else if(type == 'number'){
								list += `
								<div class="admin-popup-item bk-template">
									<label>${value}${required ? '*':''}</label><br>
									<input name="${key}" type="tel" pattern="[0-9.]*" ${required ? 'required':''}>
								</div>`;
							}else if(type == 'textarea'){
								list += `
								<div class="admin-popup-item bk-template">
									<label>${value}${required ? '*':''}</label><br>
									<textarea name="${key}" ${required ? 'required':''}></textarea>
								</div>`;
							}else if(type == 'title'){
								list += `
								<div class="admin-popup-item bk-template bk-template-title">
									<label>${value}</label><br>
								</div>`;
							}else {
								list += `
								<div class="admin-popup-item bk-template">
									<label>Type in the URL for the file${required ? '*':''}</label><br>
									<input name="${key}" type="text" ${required ? 'required':''}>
								</div>`;
							}
						})
					}

				// End New merged fields

			sa.fire({
				title: `<strong>Booking info: ${specific.name}</strong>`,
				type: false,
				animation:false,
				customClass:'animated bk-animated zoomIn bk-dark',
				width:'64rem',
				customContainerClass:"sweetalert-shiftdown",
				html:`
					<form id="updateBooking"><div class="admin-popup-details">${list}</div></form>
				`,
				showCloseButton: true,
				showCancelButton: true,
				showConfirmButton: true,
				confirmButtonText:'Update booking',
				cancelButtonText:'Delete booking',
				cancelButtonColor:'#c03',
				preConfirm: () => {
			    	const values = [];
			      	let fields = d.querySelectorAll('.bk-template input,.bk-template textarea')
			      	fields.forEach((input) => {
			      		let thefield = {name:input.name,value:input.value,type:input.type,required:input.required}
			      	  	values.push(thefield)
			      	})
			      	let booking_slot = {name:'booking_type',value:d.querySelector('.bk-template select[name="Booking session"]').value,type:'select',required:true},
			      		location = {name:'location',value:d.querySelector('.bk-template select[name="location"]').value,type:'select',required:true}
			      	values.push(location)
			      	values.push(booking_slot)
			    	let uperr = '',
			    		reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
					for(let i = 0;i<values.length;i++){
						// only required
						if(values[i].name != 'sf-form-file'){
							if(values[i].required == true){
								if(values[i].value == ''){
									// uperr = 'empty'
									// break
							  	}else {
							  		if(values[i].name == 'booking_type'){
							  			if(values[i].value == 'Select session'){
							  				uperr = 'session'
							  				break
							  			}
								  	}

							  		if(values[i].name == 'location'){
							  			if(values[i].value == 'Select location'){
							  				uperr = 'location'
							  				break
							  			}
								  	}

							  		if(values[i].type == 'email'){
							  			if(!reg.test(values[i].value)){
							  				// uperr = 'email'
							  				// break
							  			}
							  		}

						  			if(values[i].type == 'tel'){
						  				if(!isNaN(parseFloat(values[i].value)) && isFinite(values[i].value) && values[i].value.length > 5){}else {
						  					// uperr = 'number'
						  					// break
						  				}
						  			}
							  	}
							}
						}	
					}

					if(uperr == 'empty'){
						alert('Please check the fields\nA required field is empty.')
						return false
					}
					if(uperr == 'session'){
						alert('Please select a session')
						return false
					}
					if(uperr == 'location'){
						alert('Please select a location')
						return false
					}
					if(uperr == 'email'){
						alert('Please make sure all email adresses are valid')
						return false
					}
					if(uperr == 'number'){
						alert('Please make sure all phone numbers are valid')
						return false
					}
					if(uperr == ''){
						return Promise.resolve(values)
					}	
			    }
		  	})
			.then((result) => {
				// add required and type validation 
				if(result.dismiss === 'cancel'){
					sa.fire({
						title: 'Are you sure you want <br>to delete/reject this item?',
						text: "This session will be deleted permanantly and cannot be brought back.",
						type: 'warning',
						showCancelButton: true,
						confirmButtonColor: '#3085d6',
						cancelButtonColor: '#d33',
						confirmButtonText: 'Yes, delete it!'
					}).then((result) => {
						if(result.dismiss != 'cancel' && result.dismiss != 'backdrop'){
							fetch(d.querySelector('.bk-booking-list').getAttribute('data-url')+'/process/delete_frompop.php', {
							  	method:'POST',
							  	headers:{"Content-Type": "application/json"},
							  	body: JSON.stringify({id:specific.id})
							})
							.then(response => response.json())
					      	.then(data => {
								if(data == 'success'){
							    	sa.fire({
							    		title: 'Deleted!',
							    		text: 'This session has been deleted..',
							    		type: 'success',
							    		showConfirmButton:false,
							    		timer: 1800
							    	}).then((result) => {
							    		let theday = d.querySelector('.bk-date.haspop')
											if(theday.classList.contains('bk-date--booked') && theday.classList.contains('bk-booked--half')){
												// date has two half bookings
												rmBooking('half2',d.querySelector(`.bk-srcdelete[data-day="${theday.getAttribute('data-calendar-date')}"]`),theday,specific.id);
											}else if(theday.classList.contains('bk-date--half')){
												// date has one half booking
												rmBooking('half1',d.querySelector(`.bk-srcdelete[data-day="${theday.getAttribute('data-calendar-date')}"]`),theday,specific.id);
											}else if(theday.classList.contains('bk-date--booked')){
												// date has one full booking
												rmBooking('full',d.querySelector(`.bk-srcdelete[data-day="${theday.getAttribute('data-calendar-date')}"]`),theday,specific.id);
											}
							    	})
							  	}else {
							  		sa.fire({
							    		title: 'Error Deleting!',
							    		text: 'This session could not be deleted..',
							    		type: 'error',
							    		showConfirmButton:false,
							    		timer: 1800
							    	}).then((result) => {
							    		window.location.reload()
							    	})
							  	}	
					      	})
						}else {
							// this is the delete from edit page
							if(type == 'haspop'){
								el.classList.remove('haspop')
								el.classList.remove('bk-date--selected')
							}
						}
					})
				}else if(result.dismiss != 'close' && result.dismiss != 'backdrop'){
					fetch(d.querySelector('.bk-booking-list').getAttribute('data-url')+'/process/update_frompop.php', {
					  	method:'POST',
					  	headers:{"Content-Type": "application/json"},
					  	body: JSON.stringify({id:specific.id,fields:result.value,type:popType,parent:d.querySelector('#bk-calendar').getAttribute('data-cal')})
					})
					.then(response => response.json())
					.then(data => {
						
						if(data == 'success'){
							sa.fire({
					    		title: 'Updated!',
					    		text: 'This session has been updated..',
					    		type: 'success',
					    		showConfirmButton:false,
					    		timer: 1800
					    	}).then((result) => {
					    		window.location.reload()
					    	})
						}else {
							sa.fire({
					    		title: 'Error Updating!',
					    		text: 'This session could not be edited..',
					    		type: 'error',
					    		showConfirmButton:false,
					    		timer: 1800
					    	}).then((result) => {
					    		window.location.reload()
					    	})
						}

					}).catch((err) => {
						sa.fire({
				    		title: 'Error Updating!',
				    		text: 'This session could not be edited..',
				    		type: 'error',
				    		showConfirmButton:false,
				    		timer: 1800
				    	}).then((result) => {
				    		window.location.reload()
				    	})
					})
					if(type == 'haspop'){
						el.classList.remove('haspop')
						el.classList.remove('bk-date--selected')
					}
				}else {
					if(type == 'haspop'){
						el.classList.remove('haspop')
						el.classList.remove('bk-date--selected')
					}
				}
			})
			let clientdate = document.querySelector('input#editclientdate')
			clientdate.DatePickerX.init({
				mondayFirst:false,
				format: 'dd.mm.yyyy',
				minDate: new Date(),
				todayButton: true,
				todayButtonLabel: 'Today',
				clearButton: false
			})
		}

// Ready
domReady(function(){

	init();
		
});

})( jQuery );






