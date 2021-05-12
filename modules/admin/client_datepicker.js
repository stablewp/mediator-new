/**
 * DatePickerX
 *
 * Cool light visual date picker on pure JavaScript
 * Browsers support: Chrome 45+, FireFox 40+, Safari 8+, IE10+, iOS Safari 8+, Android Browser 4.4+
 *
 * @author    Alexander Krupko <alex@avrora.team>
 * @copyright 2016 Avrora Team www.avrora.team
 * @license   MIT
 * @tutorial  http://datepickerx.avrora.team
 * @version   1.0.4
 */

!function()
{
    'use strict';

    var optionsDefault = {
        mondayFirst      : true,
        format           : 'yyyy/mm/dd',
        minDate          : new Date(0, 0),
        maxDate          : new Date(9999, 11, 31),
        weekDayLabels    : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'St', 'Su'],
        shortMonthLabels : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        singleMonthLabels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        todayButton      : true,
        todayButtonLabel : 'Today',
        clearButton      : true,
        clearButtonLabel : 'Clear'
    },
        openedDPX = null;

    /**
     * Creates and returns new DOM element
     *
     * @param {String}        tag       Tag name
     * @param {Array|String}  [classes] Array with CSS classes or single class
     * @param {Element}       [parent]  New element will be appended in this element if it passed
     * @param {String|Number} [html]    New element's InnerHTML
     * @param {String|Number} [title]   Title attribute
     * @returns {Element}
     */
    function createElement(tag, classes, parent, html, title)
    {
        classes = classes || [];
        !Array.isArray(classes) && (classes = [classes]);

        var el = document.createElement(tag);
        for (var i = classes.length; i--; el.classList.add(classes[i]));

        title && (el.title = title);
        el.innerHTML = html || '';

        parent instanceof Element && parent.appendChild(el);

        return el;
    }

    /**
     * Returns date with time 00:00:00.0000
     *
     * @param   {Date} [dt] Date object
     * @returns {Date}
     */
    function clearDate(dt)
    {
        dt = dt || new Date;
        return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
    }

    function DPX(input)
    {
        var options  = {},
            elements = {},
            inited   = false,
            value    = null,
            mode     = 2; // 2 - days, 1 - months, 0 - years

        /**
         * Returns min date of date picker
         * If min date relates to another date picker will be returned its value or its min date if value doesn't choose
         *
         * @returns {Date}
         */
        function getMinDate()
        {
            var value = options.minDate;

            if (value instanceof HTMLInputElement) {
                value = value.DatePickerX.getValue(true);
                value = value === null ? options.minDate.DatePickerX.getMinDate() : new Date(value);
                value.setDate(value.getDate() + 1);
            }

            return clearDate(value);
        }

        /**
         * Returns max date of date picker
         * If max date relates to another date picker will be returned his value or his max date if value doesn't choose
         *
         * @returns {Date}
         */
        function getMaxDate()
        {
            var value = options.maxDate;

            if (value instanceof HTMLInputElement) {
                value = value.DatePickerX.getValue(true);
                value = value === null ? options.maxDate.DatePickerX.getMaxDate() : new Date(value);
                value.setDate(value.getDate() - 1);
            }

            return clearDate(value);
        }

        /**
         * Creates date picker's base elements
         */
        function createElements()
        {
            elements.container = createElement('div', 'date-picker-x');

            var titleBox = createElement('div', 'dpx-title-box', elements.container);
            elements.prevTitle = createElement('span', 'dpx-prev', titleBox, '&#x276e;');
            elements.title = createElement('span', 'dpx-title', titleBox);
            elements.nextTitle = createElement('span', 'dpx-next', titleBox, '&#x276f;');

            elements.content = createElement('div', 'dpx-content-box', elements.container);

            input.nextElementSibling
                ? input.parentNode.insertBefore(elements.container, input.nextElementSibling)
                : input.parentNode.appendChild(elements.container);

            if (options.todayButton || options.clearButton) {
                var btns = createElement('div', 'dpx-btns', elements.container);
                options.todayButton && (elements.today = createElement('span', ['dpx-item', 'dpx-today'], btns, options.todayButtonLabel, options.todayButtonLabel));
                options.clearButton && (elements.clear = createElement('span', ['dpx-item', 'dpx-clear'], btns, options.clearButtonLabel, options.clearButtonLabel));
            }
        }

        /**
         * Returns date according to passed format
         *
         * @param {Date}   dt     Date object
         * @param {String} format Format string
         *      d    - day of month
         *      dd   - 2-digits day of month
         *      D    - day of week
         *      m    - month number
         *      mm   - 2-digits month number
         *      M    - short month name
         *      MM   - full month name
         *      yy   - 2-digits year number
         *      yyyy - 4-digits year number
         */
        function getFormatedDate(dt, format)
        {
            var items = {
                d   : dt.getDate(),
                dd  : dt.getDate(),
                D   : dt.getDay(),
                m   : dt.getMonth() + 1,
                mm  : dt.getMonth() + 1,
                M   : dt.getMonth(),
                MM  : dt.getMonth(),
                yy  : dt.getFullYear().toString().substr(-2),
                yyyy: dt.getFullYear()
            };

            items.dd < 10 && (items.dd = '0' + items.dd);
            items.mm < 10 && (items.mm = '0' + items.mm);
            items.D = options.weekDayLabels[items.D ? items.D - 1 : 6];
            items.M = options.shortMonthLabels[items.M];
            items.MM = options.singleMonthLabels[items.MM];

            return format.replace(/(?:[dmM]{1,2}|D|yyyy|yy)/g, function(m)
            {
                return typeof items[m] !== 'undefined' ? items[m] : m;
            });
        }

        /**
         * Returns true if date picker is visible now
         *
         * @returns {Boolean}
         */
        function isActive()
        {
            return elements.container.classList.contains('active');
        }

        /**
         * Attaches event listeners
         *
         * @param dpx
         */
        function addEvents(dpx)
        {
            input.addEventListener('click', function(e)
            {
                if (!isActive()) {
                    e.stopPropagation();
                    mode = 2;
                    draw();
                    elements.container.classList.add('active');
                    elements.container.classList.remove('to-top');

                    var bcr = elements.container.getBoundingClientRect();
                    if (bcr.bottom > window.innerHeight && bcr.top + input.offsetHeight > elements.container.offsetHeight) {
                        elements.container.classList.add('to-top');
                        elements.container.getBoundingClientRect().top < 0 && elements.container.classList.remove('to-top');
                    }

                    openedDPX && openedDPX !== elements.container && openedDPX.classList.remove('active');
                    openedDPX = elements.container;
                }
            });
            window.addEventListener('click', function()
            {
                openedDPX && openedDPX.classList.remove('active');
            });
            elements.container.addEventListener('click', function(e)
            {
                e.stopPropagation();
                e.preventDefault();
            });
            elements.content.addEventListener('click', function(e)
            {
                if (mode === 2) {
                    dpx.setValue(e.target.dpxValue) && elements.container.classList.remove('active');
                } else {
                    var min = getMinDate(),
                        max = getMaxDate();

                    min.setDate(1);
                    max.setDate(1);

                    if (!mode) {
                        min.setMonth(0);
                        max.setMonth(0);
                    }

                    e.target.dpxValue >= min.getTime() && e.target.dpxValue <= max.getTime() && ++mode && draw(e.target.dpxValue);
                }
            });
            elements.prevTitle.addEventListener('click', function()
            {
                draw(this.dpxValue);
            });
            elements.nextTitle.addEventListener('click', function()
            {
                draw(this.dpxValue);
            });
            elements.title.addEventListener('click', function()
            {
                mode && mode-- && draw(this.dpxValue);
            });
            elements.today && elements.today.addEventListener('click', function()
            {
                !this.classList.contains('dpx-disabled') && dpx.setValue(clearDate()) && elements.container.classList.remove('active');
            });
            elements.clear && elements.clear.addEventListener('click', function()
            {
                dpx.setValue(null) && elements.container.classList.remove('active');
            });
        }

        /**
         * Draws calendar according to current mode
         *
         * @param [dt] Date object
         */
        function draw(dt)
        {
            elements.content.innerHTML = '<div class="bk-clientdate-checker"><p>Checking for availability..</p></div>';

            // init min date and max date
            var dtMin   = getMinDate(),
                dtMax   = getMaxDate(),
                current = clearDate();

            // today button
            options.todayButton && elements.today.classList[current >= dtMin && current <= dtMax ? 'remove' : 'add']('dpx-disabled');

            // set min and max dates according to current mode
            if (mode < 2) {
                dtMin.setDate(1);
                dtMax.setDate(1);

                if (!mode) {
                    dtMin.setMonth(0);
                    dtMax.setMonth(0);
                }
            }
            dtMin = dtMin.getTime();
            dtMax = dtMax.getTime();

            // init date
            dt = clearDate(new Date(dt || value || Date.now()));
            if (dt.getTime() < dtMin) {
                dt = new Date(dtMin);
            } else if (dt.getTime() > dtMax) {
                dt = new Date(dtMax);
            }

            var setMonth = dt.getMonth(),
                setYear  = dt.getFullYear(),
                zeroYear = Math.floor(setYear / 10) * 10;
            dt = new Date(mode ? setYear : zeroYear, mode < 2 ? 0 : setMonth);

            // set title
            elements.title.innerHTML = mode
                ? (mode === 2 ? options.singleMonthLabels[setMonth] + ' ' : '') + setYear
                : (zeroYear + ' - ' + (zeroYear + 9));
            elements.title.dpxValue = dt.getTime();
            elements.title.title = mode === 2 ? setYear : (zeroYear + ' - ' + (zeroYear + 9));

            // prev and next arrows
            elements.prevTitle.classList[dt.getTime() <= dtMin ? 'add' : 'remove']('dpx-disabled');
            mode === 2 ? dt.setMonth(setMonth - 1) : dt.setFullYear(mode ? setYear - 1 : zeroYear - 10);
            elements.prevTitle.title = mode
                ? (mode === 2 ? options.singleMonthLabels[dt.getMonth()] + ' ' : '') + dt.getFullYear()
                : ((zeroYear - 10) + ' - ' + (zeroYear - 1));
            elements.prevTitle.dpxValue = dt.getTime();

            mode === 2 ? dt.setMonth(dt.getMonth() + 2) : dt.setFullYear(mode ? setYear + 1 : zeroYear + 20);
            elements.nextTitle.classList[dt.getTime() > dtMax ? 'add' : 'remove']('dpx-disabled');
            elements.nextTitle.title = mode
                ? (mode === 2 ? options.singleMonthLabels[dt.getMonth()] + ' ' : '') + dt.getFullYear()
                : ((zeroYear + 10) + ' - ' + (zeroYear + 19));
            elements.nextTitle.dpxValue = dt.getTime();

            mode === 2 ? dt.setMonth(dt.getMonth() - 1) : dt.setFullYear(mode ? setYear : zeroYear);

            // day of week titles
            if (mode === 2) {
                var maxDay = options.weekDayLabels.length;
                !options.mondayFirst && --maxDay && createElement('span', ['dpx-item', 'dpx-weekday', 'dpx-weekend'], elements.content, options.weekDayLabels[6]);
                for (var day = 0; day < maxDay; ++day) {
                    var classes = ['dpx-item', 'dpx-weekday',];
                    day > 4 && classes.push('dpx-weekend');
                    createElement('span', classes, elements.content, options.weekDayLabels[day])
                }
            }

            // set starting date
            if (mode === 2) {
                var dayWeek = dt.getDay();
                dt.setDate(options.mondayFirst ? -(dayWeek ? dayWeek - 2 : 5) : -dayWeek + 1);
            } else {
                mode ? dt.setMonth(dt.getMonth() - 2) : dt.setFullYear(zeroYear - 3);
            }

            // current and selected dates
            var //current  = clearDate(),
                selected = value;
            if (mode < 2) {
                if (selected !== null) {
                    selected = new Date(selected);
                    selected.setDate(1);
                    !mode && selected.setMonth(0);
                    selected = selected.getTime();
                }

                current.setDate(1);
                !mode && current.setMonth(0);
            }
            current = current.getTime();

            // draw calendar
            elements.container.setAttribute('data-dpx-type', ['year', 'month', 'day'][mode]);
            var getter = ['getFullYear', 'getMonth', 'getDate'][mode],
                setter = ['setFullYear', 'setMonth', 'setDate'][mode],
                i      = mode === 2 ? 42 : 16;
            for (; i--; dt[setter](dt[getter]() + 1)) {
                var classes = ['dpx-item'],
                    title   = mode ? options.singleMonthLabels[dt.getMonth()] + ' ' : '';
                mode === 2 && (title += dt.getDate() + ', ');
                title += dt.getFullYear();

                (mode ? (mode === 2 ? dt.getMonth() !== setMonth : dt.getFullYear() !== setYear) : (dt.getFullYear() < zeroYear || dt.getFullYear() > zeroYear + 9)) && classes.push('dpx-out');
                mode === 2 && (dt.getDay() === 6 || dt.getDay() === 0) && classes.push('dpx-weekend','dpx-disabled');
                dt.getTime() === current && classes.push('dpx-current');
                dt.getTime() === value && classes.push('dpx-selected');
                (dt.getTime() < dtMin || dt.getTime() > dtMax) && classes.push('dpx-disabled');

                var content = mode ? (mode === 2 ? dt.getDate() : options.shortMonthLabels[dt.getMonth()]) : dt.getFullYear(),
                    el = createElement('span', classes, elements.content, content, title);
                el.dpxValue = dt.getTime();
            }
        }

        /**
         * Sets option
         *
         * @param   {String}  option Option name
         * @param   {*}       value  Option value
         */
        function setOption(option, value)
        {
            if (typeof options[option] === 'undefined') {
                return console.error('DatePickerX, setOption: Option doesn\'t exist.') && false;
            }

            if (option === 'minDate' || option === 'maxDate') {
                if (!(value instanceof HTMLInputElement)) {
                    !(value instanceof Date) && (value = new Date(value));

                    if (isNaN(value)) {
                        return console.error('DatePickerX, setOption: Invalid date value.') && false;
                    }
                }
            } else if (typeof options[option] !== typeof value) {
                return console.error('DatePickerX, setOption: Option has invalid type.') && false;
            } else if (Array.isArray(options[option])) {
                if (value.length < options[option].length) {
                    return console.warn('DatePickerX, setOption: Invalid option length.') && false;
                }

                value = value.slice(0, options[option].length);
            }

            options[option] = value;
        }

        return {
            /**
             * Inits date picker
             *
             * @param   {Object}  initOptions
             * @returns {Boolean}
             */
            init: function(initOptions)
            {
                initOptions = initOptions || {};

                if (inited) {
                    return console.error('DatePickerX, init: Date picker have already inited.') && false;
                }
                inited = true;

                // set options
                options = {};
                for (var i in optionsDefault) {
                    options[i] = optionsDefault[i];
                }

                if (typeof initOptions !== 'object') {
                    console.error('DatePickerX, init: Initial options must be an object.');
                } else {
                    for (var i in initOptions) {
                        setOption(i, initOptions[i]);
                    }
                }

                // DPX init
                input.parentNode.classList.add('date-picker-x-container');
                input.classList.add('date-picker-x-input');
                input.readOnly = true;
                createElements();
                addEvents(this);

                return true;
            },

            /**
             * Removes date picker
             *
             * @returns {Boolean}
             */
            remove: function()
            {
                if (!inited) {
                    return console.error('DatePickerX, remove: Date picker doesn\'t init yet.') && false;
                }

                input.parentNode.removeChild(elements.container);
                input.classList.remove('date-picker-x-input');
                input.readOnly = inited = false;

                return true;
            },

            /**
             * Sets date picker value.
             * If passed not Date object, method will try to convert it to date.
             * If passed null, method will clear date.
             *
             * @param   {*}       dt                   Date object
             * @param   {Boolean} [ignoreLimits=false] If passed true min and max limits will be ignored
             * @returns {Boolean}
             */
            setValue: function(dt, ignoreLimits)
            {
                if (!inited) {
                    return console.error('DatePickerX, remove: Date picker doesn\'t init yet.') && false;
                }
                // only if not processing
                if(!document.querySelector('.bk-clientdate-checker').classList.contains('busy')){
                	document.querySelector('.bk-clientdate-checker p').innerHTML = 'Checking for availability..'
                // only change date if not exists full
	                // get selection date and format
		                var choosedate = new Date(dt)
						var dd = choosedate.getDate();
						var mm = choosedate.getMonth() + 1;
						var yyyy = choosedate.getFullYear();
						if(dd < 10){
						  	dd = '0' + dd;
						} 
						if(mm < 10){
						 	mm = '0' + mm;
						} 
						choosedate = dd+'.'+mm+'.'+yyyy;
					// show msg
					if(choosedate != document.querySelector('#editclientdate').getAttribute('data-predate')){
						document.querySelector('.bk-clientdate-checker').classList.add('busy')
						document.querySelector('.bk-clientdate-checker').style.display = 'block'
					}
					// do check
						var not_avail = false,
							counthalf = 0,
							theslot = '',
							bookings = JSON.parse(document.querySelector('#bk-calendar').getAttribute('data-checker'))
						if(choosedate != document.querySelector('#editclientdate').getAttribute('data-predate')){
							bookings.forEach((booking) => {
								// but not same date
							  	if(booking.type == 'full'){
							  		if(booking.date == choosedate){
							  			not_avail = 'full'
							  		}
							  	}else {
							  		if(booking.date == choosedate){
							  			counthalf++
							  			theslot = booking.type
							  		}
							  	}
							})
						}
						if(counthalf == 1){
							not_avail = 'ishalf'
						}else if(counthalf == 2){
							not_avail = 'half'
						}
					if(choosedate != document.querySelector('#editclientdate').getAttribute('data-predate')){	
					// return check results
		                if(!not_avail){
		                	document.querySelector('.bk-clientdate-checker').classList.remove('busy')
							document.querySelector('.bk-clientdate-checker').style.display = 'none'
		                	if(dt === null){
			                    value = null;
			                    input.value = '';
			                }else {
			                	var gitdate = new Date(dt)
			                    !(dt instanceof Date) && (dt = new Date(dt));

			                    if (isNaN(dt)) {
			                        return console.error('DatePickerX, setValue: Can\'t convert argument to date.') && false;
			                    }

			                    if (!ignoreLimits && (dt.getTime() < getMinDate().getTime() || dt.getTime() > getMaxDate().getTime())) {
			                        return console.error('DatePickerX, setValue: Date out of acceptable range.') && false;
			                    }

			                    if(gitdate.getDay() == 0 || gitdate.getDay() == 6){
			                    	alert('Cannot Book Weekend')
			                    	return console.error('Cannot book weekend') && false;
			                    }

			                    value = dt.getTime();
			                    input.value = getFormatedDate(dt, options.format);
			                }

			                // reset slot for availability
			                	var slots = document.querySelector('.admin-popup-item select[name="Booking session"]'),dontadd = false,dontloc = false
			                	slots.querySelectorAll('option').forEach(function(option) {
			                	  	if(option.innerHTML == 'Select session'){
			                	  		dontadd = true
			                	  		option.setAttribute('selected',true)
			                	  	}else {
			                	  		option.removeAttribute('selected')
			                	  		option.removeAttribute('disabled')
			                	  	}
			                	})
			                	if(!dontadd){
			                		slots.insertAdjacentHTML('afterbegin',`<option selected disabled>Select session</option>`)
			                	}
			                	var locs = document.querySelector('.admin-popup-item select[name="location"]')
				                	locs.querySelectorAll('option').forEach(function(option) {
				                		if(option.innerHTML == 'Select location'){
				                	  		dontloc = true
				                	  	}else {
					                	  	option.removeAttribute('selected')
				                			option.removeAttribute('disabled')
				                	  	}
				                	}) 
				                if(!dontloc){
			                		locs.insertAdjacentHTML('afterbegin',`<option selected disabled>Select location</option>`)
			                	} 
			                // run ev

			                var e = document.createEvent('Event');
				                e.initEvent('change', true, true);
				                input.dispatchEvent(e);
				                isActive() && draw();	
				                return true;
		                }else if(not_avail == 'full'){
		                	document.querySelector('.bk-clientdate-checker p').innerHTML = 'Full day is already booked.'
		                	setTimeout(function(){
		                		document.querySelector('.bk-clientdate-checker').classList.remove('busy')
								document.querySelector('.bk-clientdate-checker').style.display = 'none'
		                	},1200)
		                }else if(not_avail == 'half'){
		                	document.querySelector('.bk-clientdate-checker p').innerHTML = 'Both sessions are already booked'
		                	setTimeout(function(){
		                		document.querySelector('.bk-clientdate-checker').classList.remove('busy')
								document.querySelector('.bk-clientdate-checker').style.display = 'none'
		                	},1200)
		                }else if(not_avail == 'ishalf'){

							if(dt === null){
			                    value = null;
			                    input.value = '';
			                }else {
			                	var gitdate = new Date(dt)
			                    !(dt instanceof Date) && (dt = new Date(dt));

			                    if (isNaN(dt)) {
			                        return console.error('DatePickerX, setValue: Can\'t convert argument to date.') && false;
			                    }

			                    if (!ignoreLimits && (dt.getTime() < getMinDate().getTime() || dt.getTime() > getMaxDate().getTime())) {
			                        return console.error('DatePickerX, setValue: Date out of acceptable range.') && false;
			                    }

								if(gitdate.getDay() == 0 || gitdate.getDay() == 6){
									alert('Cannot Book Weekend')
			                    	return console.error('Cannot book weekend') && false;
			                    }

			                    value = dt.getTime();
			                    input.value = getFormatedDate(dt, options.format);
			                }

			    				// reset slot for availability
			                	var slots = document.querySelector('.admin-popup-item select[name="Booking session"]')
			                	slots.querySelectorAll('option').forEach(function(option) {
			                		
			                	  	if(option.value == theslot || option.value == 'full'){
			                	  		option.setAttribute('disabled',true)
			                	  		option.removeAttribute('selected')
			                	  	}else {
			                	  		option.removeAttribute('disabled')
			                	  		option.setAttribute('selected',true)
			                	  	}
			                	  	if(option.innerHTML == 'Select session'){
			                			option.remove()
			                		}

			                	}) 
			                	var thenewloc = '';
			                	// get new date's location
				                bookings.forEach((booking) => {
									// but not same date
								  	if(booking.date == choosedate){
								  		if(!booking.location){
								  			thenewloc = false
								  		}else {
								  			thenewloc = booking.location;
								  		}
								  	}
								})
								var locs = document.querySelector('.admin-popup-item select[name="location"]')
			                	locs.querySelectorAll('option').forEach(function(option) {
			                		if(!thenewloc){
			                			if(option.innerHTML == 'Select location'){
				                	  		dontloc = true
				                	  		option.setAttribute('selected',true)
				                	  	}else {
				                	  		option.removeAttribute('selected')
				                	  		option.removeAttribute('disabled')
				                	  	}
			                		}else {
			                			dontloc = true
			                			if(option.innerHTML == 'Select location'){
			                				option.remove()
			                			}
			                			if(option.innerHTML == thenewloc){
				                			option.setAttribute('selected',true)
				                			option.removeAttribute('disabled')
				                		}else {
				                			option.removeAttribute('selected')
				                			option.setAttribute('disabled',true)
				                		}
			                		}
			                	})  
			                	if(!dontloc){
			                		locs.insertAdjacentHTML('afterbegin',`<option selected disabled>Select location</option>`)
			                	}
			                // run ev

			                var e = document.createEvent('Event');
				                e.initEvent('change', true, true);
				                input.dispatchEvent(e);
				                isActive() && draw();	
				                return true;
		                	
		                }
					}else {
						if(dt === null){
		                    value = null;
		                    input.value = '';
		                }else {
		                	var gitdate = new Date(dt)
							
		                    !(dt instanceof Date) && (dt = new Date(dt));

		                    if (isNaN(dt)) {
		                        return console.error('DatePickerX, setValue: Can\'t convert argument to date.') && false;
		                    }

		                    if (!ignoreLimits && (dt.getTime() < getMinDate().getTime() || dt.getTime() > getMaxDate().getTime())) {
		                        return console.error('DatePickerX, setValue: Date out of acceptable range.') && false;
		                    }

		                    if(gitdate.getDay() == 0 || gitdate.getDay() == 6){
		                    	alert('Cannot Book Weekend')
		                    	return console.error('Cannot book weekend') && false;
		                    }

		                    value = dt.getTime();
		                    input.value = getFormatedDate(dt, options.format);
		                }
		                // reset slot for availability
		                	var slots = document.querySelector('.admin-popup-item select[name="Booking session"]'),
			                	locs = document.querySelector('.admin-popup-item select[name="location"]'),
		                		haspop = document.querySelector('.bk-date.haspop')
		                	if(haspop.classList.contains('bk-booked--half')){
		                		slots.querySelectorAll('option').forEach(function(option) {
			                		if(option.hasAttribute('data-bkactive')){
			                			option.setAttribute('selected',true)
			                			option.removeAttribute('disabled')
			                		}else {
			                			option.removeAttribute('selected')
			                			option.setAttribute('disabled',true)
			                		}
			                		if(option.innerHTML == 'Select session'){
			                			option.remove()
			                		}
			                	})
			                	locs.querySelectorAll('option').forEach(function(option) {
			                		if(option.hasAttribute('data-bklocset')){
			                			option.setAttribute('selected',true)
			                			option.removeAttribute('disabled')
			                		}else {
			                			option.removeAttribute('selected')
			                			option.setAttribute('disabled',true)
			                		}
			                	})
		                	}else if(haspop.classList.contains('bk-date--half')){
		                		slots.querySelectorAll('option').forEach(function(option) {
			                		option.removeAttribute('disabled')
			                		if(option.hasAttribute('data-bkactive')){
			                			option.setAttribute('selected',true)
			                		}else {
			                			option.removeAttribute('selected')
			                		}
			                		if(option.innerHTML == 'Full session'){
			                			option.setAttribute('disabled',true)
			                		}
			                		if(option.innerHTML == 'Select session'){
			                			option.remove()
			                		}
			                	})
			                	locs.querySelectorAll('option').forEach(function(option) {
			                		if(option.innerHTML == 'Select location'){
			                	  		dontloc = true
			                	  		option.setAttribute('selected',true)
			                	  	}else {
			                	  		option.removeAttribute('selected')
			                			option.removeAttribute('disabled')
			                	  	}
			                	})
			                	if(!dontloc){
			                		locs.insertAdjacentHTML('afterbegin',`<option selected disabled>Select location</option>`)
			                	} 
		                	}else if(haspop.classList.contains('bk-date--booked')){

		                		let backedited
			                	bookings.forEach((booking) => {
									// but not same date
								  	if(booking.date == choosedate){
									  	if(booking.edited == 'true'){
									  		backedited = true
									  	}else {
									  		backedited = false
									  	}
								  	}
								})

		                		slots.querySelectorAll('option').forEach(function(option) {
			                		option.removeAttribute('disabled')
			                		if(option.hasAttribute('data-bkactive')){
			                			option.setAttribute('selected',true)
			                		}else {
			                			option.removeAttribute('selected')
			                		}
			                		if(option.innerHTML == 'Select session'){
			                			option.remove()
			                		}
			                	})
			                	locs.querySelectorAll('option').forEach(function(option) {
			                		if(!backedited){
				                		if(option.innerHTML == 'Select location'){
				                			dontloc = true
				                		}else {
				                			option.removeAttribute('selected')
				                			option.removeAttribute('disabled')
				                		}
			                		}else {
			                			dontloc = true
			                			if(option.innerHTML == 'Select location'){
				                			option.remove()
				                		}
			                			if(option.hasAttribute('data-bklocset')){
				                			option.setAttribute('selected',true)
				                			option.removeAttribute('disabled')
				                		}else {
				                			option.removeAttribute('selected')
				                			option.removeAttribute('disabled')
				                		}
			                		}	
			                	})
			                	if(!dontloc){
			                		locs.insertAdjacentHTML('afterbegin',`<option selected disabled>Select location</option>`)
			                	}
		                	}
		                // run ev
		                var e = document.createEvent('Event');
			                e.initEvent('change', true, true);
			                input.dispatchEvent(e);
			                isActive() && draw();	
			                return true;

					}
		        }
            },

            /**
             * Returns formatted date picker value or timestamp if passed true in first parameter.
             * If value doesn't choosed yet returns empty string or null if passed true in first parameter.
             *
             * @param   {Boolean}       [timestamp]
             * @returns {Number|String}
             */
            getValue: function(timestamp)
            {
                !inited && console.error('DatePickerX, getValue: Date picker doesn\'t init yet.');

                return timestamp ? value : (value === null ? '' : getFormatedDate(new Date(value), options.format));
            },

            /**
             * Returns min date of date picker.
             * If min date relates to another date picker the date will be returned from it date picker.
             *
             * @returns {Date}
             */
            getMinDate: function()
            {
                var value = options.minDate;
                value instanceof HTMLInputElement && (value = value.DatePickerX.getMinDate());

                return clearDate(value);
            },

            /**
             * Returns max date of date picker.
             * If max date relates to another date picker the date will be returned from it date picker.
             *
             * @returns {Date}
             */
            getMaxDate: function()
            {
                var value = options.maxDate;
                value instanceof HTMLInputElement && (value = value.DatePickerX.getMaxDate());

                return clearDate(value);
            }
        };
    }

    var dpxElements = [], dpxObjects = [];
    Object.defineProperty(HTMLInputElement.prototype, 'DatePickerX', {
        get: function()
        {
            var index = dpxElements.indexOf(this);
            if (index === -1) {
                index = dpxElements.push(this) - 1;
                dpxObjects.push(new DPX(this));
            }

            return dpxObjects[index];
        },
        set: function() {} 
    });

    window.DatePickerX = {
        /**
         * Sets default options for all date pickers
         *
         * @param   {Object}  options Options array
         * @returns {Boolean}
         */
        setDefaults: function(options)
        {
            if (typeof options !== 'object') {
                return console.error('DatePickerX, setDefaults: Invalid option type.') && false;
            }

            for (var i in options) {
                if (typeof options[i] === typeof optionsDefault[i]) {
                    if (!Array.isArray(optionsDefault[i])) {
                        optionsDefault[i] = options[i];
                    } else if (options[i].length >= optionsDefault[i].length) {
                        optionsDefault[i] = options[i].slice(0, optionsDefault[i].length);
                    }
                }
            }

            return true;
        }
    };
}();