/*
 * Originally written by Bruno Alexandre, 26.03.2010, twitter.com/balexandre,
 * balexandre.com,  abruno.in.dk [at] gmail.com
 *
 * Ported to Sencha Touch by Ondrej Jirman <megous@megous.com>, 2011 (for
 * CodeBerry s.r.o.)
 */

Ext.ns('Ext.ux');

/**
 * iCalendar like date picker component.
 *
 * @cfg {Date} value Initially selected date (default is today)
 * @cfg {[String]} days Day names.
 * @cfg {[String]} months Month names.
 * @cfg {Number} weekstart Starting day of the week. (1 for monday, 7 for sunday)
 */
Ext.ux.DatePicker = Ext.extend(Ext.Panel, {

	days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], 
	months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], 
	cls: 'ux-date-picker',

	/**
	 * Create new date picker.
	 */
	constructor: function(config) {

		Ext.apply(this, config || {}, {
			value: new Date(),
			weekstart: 1
		});

		Ext.ux.DatePicker.superclass.constructor.call(this, config);
	},

	/**
	 * Set selected date.
	 * @cfg {Date} v Date to select.
	 */
	setValue: function(v) {
		if (Ext.isDate(v)) {
			this.value = v;
		} else {
			this.value = null;
		}

		this.refresh();
	},

	/**
	 * Get selected date.
	 * @return {Date} Selected date.
	 */
	getValue: function() {
		return this.value;
	},

	onRender: function(ct, position) {
		Ext.ux.DatePicker.superclass.onRender.apply(this, arguments);

		this.refresh();

		// handle events
		this.body.on("click", function(e, t) {
			this.setValue(this.getCellDate(Ext.fly(t)));
		}, this, {delegate: 'td'});

		this.body.on("click", function(e, t) {
			t = Ext.fly(t);

			if (t.hasCls("goto-prevmonth")) {
				this.loadMonthDelta(-1);
			}

			if (t.hasCls("goto-nextmonth")) {
				this.loadMonthDelta(1);
			}
		}, this, {delegate: 'th'});
	},

	refresh: function() {
		var d = this.value || new Date();
		this.body.update(this.generateCalendar(d.getMonth(), d.getFullYear()));
		this.setToday();
		if (this.value) {
			this.setSelected(this.value);
		}
	},

	dayMarkup: function(format,day,month,year,column) {
		var classes = ['day'];
		if ( format === 0 ) {
			classes.push('prevmonth');
		} else if ( format == 9 ) {
			classes.push('nextmonth');
		}

		if ( column===0 || column==6 ) {
			classes.push('weekend');
		}

		var datetime = year+'-'+(month+1)+'-'+day;

		var this_day = '<td class="' + classes.join(' ') + '" datetime="' + datetime + '">';
		this_day += day;
		this_day += '</td>';

		return this_day;
	},

	monthLength: function(month, year) {
		var dd = new Date(year, month, 0);
		return dd.getDate();
	},

	monthMarkup: function(month, year) {
		var c = new Date();
		c.setDate(1);
		c.setMonth(month);
		c.setFullYear(year);

		var x = parseInt(this.weekstart, 10);
		var s = (c.getDay() - x) % 7;
		if (s < 0) {
			s += 7;
		}

		var dm = this.monthLength(month, year);

		var this_month = '<table cellspacing="0"><thead><tr>';

		this_month += '<th class="goto-prevmonth">' + this.days[(0+x)%7]+'</th>';
		this_month += '<th>' + this.days[(1+x)%7]+'</th>';
		this_month += '<th>' + this.days[(2+x)%7]+'</th>';
		this_month += '<th><span>' + this.months[month] + ' ' + year + '</span>' + this.days[(3+x)%7] + '</th>';
		this_month += '<th>' + this.days[(4+x)%7]+'</th>';
		this_month += '<th>' + this.days[(5+x)%7]+'</th>';
		this_month += '<th class="goto-nextmonth">' + this.days[(6+x)%7]+'</th>';
		this_month += '</tr>';
		this_month += '</thead>';

		this_month += '<tbody>';
		this_month += '<tr>';

		for ( var i=s; i>0; i-- ) {
			var this_y = (month-1)<0?year-1:year;
			this_month += this.dayMarkup(0, dm-i+1 , (month+11)%12, this_y, (s-i+x)%7);
		}

		dm = this.monthLength(month+1,year);
		for(i = 1; i <= dm; i++) {
			if ( (s%7) === 0 ) {
				this_month += '</tr>';
				this_month += '<tr>';
				s = 0;
			}
			this_month += this.dayMarkup(1, i , month, year, (s+x)%7);
			s++;
		}

		var j = 1;
		for (i = s; i < 7; i++ ) {
			 this_y = (month+1)>11?year+1:year;
			 this_month += this.dayMarkup(9, j , (month+1)%12, this_y, (i+x)%7);
			 j++;
		 }

		this_month += '</tr>';
		this_month += '</tbody>';
		this_month += '</table>';

		//this_month += '<tfoot><tr><th colspan="7">&nbsp;</th></tr></tfoot>';

		return this_month;
	},

	generateCalendar: function(month, year) {
		return this.monthMarkup(month, year);
	},

	getCellDate: function(dateCell) {
		var date = dateCell.dom.getAttribute('datetime');
		return this.stringToDate(date);
	},

	stringToDate: function(dateString) {
		var a = dateString.split('-');
		return new Date(Number(a[0]), (a[1]-1), Number(a[2]));
	},

	dateToString: function(date) {
		return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
	},

	removeSelectedCell: function() {
		this.body.select('.selected').removeCls('selected');
	},

	setToday: function() {
		var date = new Date();
		this.body.select('td[datetime="' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '"]').addCls('today');
	},

	sameDay: function(date1, date2) {
		return (date1.getDate && date2.getDate) && date1.getDate() == date2.getDate() && date1.getMonth() == date2.getMonth() && date1.getFullYear() == date2.getFullYear();
	},

	setSelected: function(date) {
		this.removeSelectedCell();
		
		this.body.select('td').each(function(td) {
			var clickedDate = this.getCellDate(td);
			if (!td.hasCls("prevmonth") && !td.hasCls("nextmonth") && this.sameDay(date, clickedDate)) {
				td.addCls('selected');
			}
		}, this);

		this.setToday();
	},

	loadMonthDelta: function(delta) {
		var day;

		var selected = this.body.down('.selected');
		if (selected) {
			day = this.stringToDate(selected.dom.getAttribute('datetime')).getDate();
		} else {
			day = new Date().getDate();
		}

		var newDay = new Date(this.value.getFullYear(), this.value.getMonth() + delta, day);

		this.setValue(newDay);
	}
});
