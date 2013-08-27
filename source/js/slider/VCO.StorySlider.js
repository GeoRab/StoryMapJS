/*	StorySlider
	is the central class of the API - it is used to create a StorySlider

	Events
	slideDisplayUpdate
	loaded
	slideAdded
	slideLoaded
	slideRemoved
	
================================================== */

VCO.StorySlider = VCO.Class.extend({
	
	includes: VCO.Events,
	
	/*	Private Methods
	================================================== */
	initialize: function (elem, data, options) { // (HTMLElement or String, Object)
		
		// DOM ELEMENTS
		this._el = {
			container: {},
			slider_container_mask: {},
			slider_container: {},
			slider_item_container: {}
		};
		
		this._nav = {};
		this._nav.previous = {};
		this._nav.next = {};
		
		// Slides Array
		this._slides = [];
		
		// Current Slide
		this.current_slide = 0;
		
		// Data Object
		this.data = {
			uniqueid: 				"",
			slides: 				[
				{
					uniqueid: 				"",
					background: {			// OPTIONAL
						url: 				null, //"http://2.bp.blogspot.com/-dxJbW0CG8Zs/TmkoMA5-cPI/AAAAAAAAAqw/fQpsz9GpFdo/s1600/voyage-dans-la-lune-1902-02-g.jpg",
						color: 				"#cdbfe3",
						opacity: 			50
					},
					date: 					null,
					location: {
						lat: 				-9.143962,
						lon: 				38.731094,
						zoom: 				13,
						icon: 				"http://maps.gstatic.com/intl/en_us/mapfiles/ms/micons/blue-pushpin.png"
					},
					text: {
						headline: 			"Flickr",
						text: 				""
					},
					media: {
						url: 				"http://farm8.staticflickr.com/7076/7074630607_b1c23532e4.jpg",
						credit:				"Zach Wise",
						caption:			"San Francisco"
					}
				},
				{
					uniqueid: 				"",
					background: {			// OPTIONAL
						url: 				null, //"http://2.bp.blogspot.com/-dxJbW0CG8Zs/TmkoMA5-cPI/AAAAAAAAAqw/fQpsz9GpFdo/s1600/voyage-dans-la-lune-1902-02-g.jpg",
						color: 				"#8b4513",
						opacity: 			50
					},
					date: 					null,
					location: {
						lat: 				-9.143962,
						lon: 				38.731094,
						zoom: 				13,
						icon: 				"http://maps.gstatic.com/intl/en_us/mapfiles/ms/micons/blue-pushpin.png"
					},
					text: {
						headline: 			"Flickr",
						text: 				""
					},
					media: {
						url: 				"http://farm8.staticflickr.com/7076/7074630607_b1c23532e4.jpg",
						credit:				"Zach Wise",
						caption:			"San Francisco"
					}
				},
				{
					uniqueid: 				"",
					background: {			// OPTIONAL
						url: 				null, //"http://2.bp.blogspot.com/-dxJbW0CG8Zs/TmkoMA5-cPI/AAAAAAAAAqw/fQpsz9GpFdo/s1600/voyage-dans-la-lune-1902-02-g.jpg",
						color: 				null,
						opacity: 			50
					},
					date: 					null,
					location: {
						lat: 				-9.143962,
						lon: 				38.731094,
						zoom: 				13,
						icon: 				"http://maps.gstatic.com/intl/en_us/mapfiles/ms/micons/blue-pushpin.png"
					},
					text: {
						headline: 			"Flickr",
						text: 				""
					},
					media: {
						url: 				"http://farm8.staticflickr.com/7076/7074630607_b1c23532e4.jpg",
						credit:				"Zach Wise",
						caption:			"San Francisco"
					}
				},
				{
					uniqueid: 				"",
					background: {			// OPTIONAL
						url: 				"http://2.bp.blogspot.com/-dxJbW0CG8Zs/TmkoMA5-cPI/AAAAAAAAAqw/fQpsz9GpFdo/s1600/voyage-dans-la-lune-1902-02-g.jpg",
						color: 				"#cdbfe3",
						opacity: 			50
					},
					date: 					null,
					location: {
						lat: 				-9.143962,
						lon: 				38.731094,
						zoom: 				13,
						icon: 				"http://maps.gstatic.com/intl/en_us/mapfiles/ms/micons/blue-pushpin.png"
					},
					text: {
						headline: 			"La Lune",
						text: 				""
					},
					media: {
						url: 				"http://2.bp.blogspot.com/-dxJbW0CG8Zs/TmkoMA5-cPI/AAAAAAAAAqw/fQpsz9GpFdo/s1600/voyage-dans-la-lune-1902-02-g.jpg",
						credit:				"ETC",
						caption:			"something"
					}
				}
			]
		};
		
		this.options = {
			id: 					"",
			width: 					600,
			height: 				600,
			start_at_slide: 		2,
			// animation
			duration: 				1000,
			ease: 					VCO.Ease.easeInOutQuint,
			// interaction
			dragging: 				true,
			trackResize: 			true
		};
		
		// Main element ID
		if (typeof elem === 'object') {
			this._el.container = elem;
			this.options.id = VCO.Util.unique_ID(6, "vco");
		} else {
			this.options.id = elem;
			this._el.container = VCO.Dom.get(elem);
		}

		if (!this._el.container.id) {
			this._el.container.id = this.options.id;
		}
		
		// Animation Object
		this.animator = null;
		
		// Merge Data and Options
		VCO.Util.mergeData(this.options, options);
		VCO.Util.mergeData(this.data, data);
		
		this._initLayout();
		this._initEvents();
		
	},
	
	/*	Update Display
	================================================== */
	updateDisplay: function(w, h) {
		this._updateDisplay(w, h);
	},
	
	/*	Create Slides
	================================================== */
	createSlides: function(slides) { // array of objects
		for (var i = 0; i < slides.length; i++) {
			var slide = new VCO.Slide(slides[i], this.options);
			slide.addTo(this._el.slider_item_container);
			slide.on('added', this._onSlideAdded, this);
			this._slides.push(slide);
		};
	},
	
	/*	Adding and Removing Slide Methods
	================================================== */
	
	// Add a slide or slides to the slider
	addSlides: function(slides) { // array of objects
		for (var i = 0; i < slides.length; i++) {
			slides[i].addTo(this._el.slider_item_container);
		};
		this.fire("slideAdded", slides);
	},
	
	// Remove a slide or slides to the slider
	removeSlides: function(slides) { // array of objects
		for (var i = 0; i < slides.length; i++) {
			slides[i].removeFrom(this._el.slider_item_container);
		};
		this.fire("slideRemoved", slides);
	},
	
	/*	Navigation
	TODO Update Navigation content
	================================================== */
	
	goTo: function(n, fast) { // number
		if (n < this._slides.length && n >= 0) {
			this.current_slide = n;
			
			// Stop animation
			if (this.animator) {
				this.animator.stop();
			}
			
			if (fast) {
				this._el.slider_container.style.left = -(this.options.width * n) + "px";
				this._onSlideDisplay();
			} else {
				
				this.animator = VCO.Animate(this._el.slider_container, {
					left: 		-(this.options.width * n) + "px",
					duration: 	this.options.duration,
					easing: 	this.options.ease,
					complete: 	this._onSlideDisplay()
				});
				
			}

			// Update Navigation
			if (this._slides[this.current_slide + 1]) {
				this._nav.next.show();
				var nav_data = {
					title: this._slides[this.current_slide + 1].data.text.headline,
					description: this._slides[this.current_slide + 1].data.location.lat
				};
				this._nav.next.update(nav_data);
			} else {
				this._nav.next.hide();
			}
			if (this._slides[this.current_slide - 1]) {
				this._nav.previous.show();
				var nav_data = {
					title: this._slides[this.current_slide - 1].data.text.headline,
					description: this._slides[this.current_slide - 1].data.location.lat
				};
				this._slides[this.current_slide - 1].data
				this._nav.previous.update(nav_data);
			} else {
				this._nav.previous.hide();
			}
			
			
		}
	},
	
	next: function() {
		this.goTo(this.current_slide +1);
	},
	
	previous: function() {
		this.goTo(this.current_slide -1);
	},
	
	/*	Private Methods
	================================================== */

	// Initialize the layout
	_initLayout: function () {
		
		trace("initLayout " + this.options.id)
		this._el.container.className += ' vco-storyslider';
		
		// Create Layout
		this._el.slider_container_mask		= VCO.Dom.create('div', 'vco-slider-container-mask', this._el.container);
		this._el.slider_container			= VCO.Dom.create('div', 'vco-slider-container', this._el.slider_container_mask);
		this._el.slider_item_container		= VCO.Dom.create('div', 'vco-slider-item-container', this._el.slider_container);
		
		// Create Navigation
		
		this._nav.previous = new VCO.SlideNav({title: "Previous", description: "description"}, {direction:"previous"});
		this._nav.next = new VCO.SlideNav({title: "Next",description: "description"}, {direction:"next"});
		
		// add the navigation to the dom
		this._nav.next.addTo(this._el.container);
		this._nav.previous.addTo(this._el.container);
		
		// Create Slides and then add them
		this.createSlides(this.data.slides);
		this.addSlides(this._slides);
		
		this._updateDisplay();
		
		this._el.slider_container.style.left="0px";
		this.goTo(this.options.start_at_slide);
		
	},
	
	// Update Display
	_updateDisplay: function(width, height, animate) {
		var nav_pos;
		
		if (width) {
			this.options.width = width;
		} else {
			this.options.width = this._el.container.offsetWidth;
		}
		
		if (height) {
			this.options.height = height;
		} else {
			this.options.height = this._el.container.offsetHeight;
		}
		
		//this._el.container.style.height = this.options.height;
		
		// position navigation
		nav_pos = (this.options.height/2);
		this._nav.next.setPosition({top:nav_pos});
		this._nav.previous.setPosition({top:nav_pos});
		
		// Position slides
		for (var i = 0; i < this._slides.length; i++) {
			this._slides[i].updateDisplay(this.options.width, this.options.height);
			this._slides[i].setPosition({left:(this.options.width * i), top:0});
			
		};
		
		// Go to the current slide
		this.goTo(this.current_slide, true);
	},
	
	
	_initEvents: function () {
		
		this._nav.next.on('clicked', this._onNavigation, this);
		this._nav.previous.on('clicked', this._onNavigation, this);

	},
	
	/*	Events
	================================================== */
	
	_onNavigation: function(e) {
		if (e.direction == "next") {
			trace("NEXT");
			this.next();
		} else if (e.direction == "previous") {
			trace("PREVIOUS");
			this.previous();
		}
	},
	
	_onSlideAdded: function(e) {
		this.fire("slideAdded", this.data);
	},
	
	_onSlideRemoved: function(e) {
		this.fire("slideAdded", this.data);
	},
	
	_onSlideDisplay: function() {
		this.fire("slideDisplayUpdate", this.current_slide);
	},
	
	_onMouseClick: function(e) {
		
	},
	
	_fireMouseEvent: function (e) {
		if (!this._loaded) {
			return;
		}

		var type = e.type;
		type = (type === 'mouseenter' ? 'mouseover' : (type === 'mouseleave' ? 'mouseout' : type));

		if (!this.hasEventListeners(type)) {
			return;
		}

		if (type === 'contextmenu') {
			VCO.DomEvent.preventDefault(e);
		}
		
		this.fire(type, {
			latlng: "something", //this.mouseEventToLatLng(e),
			layerPoint: "something else" //this.mouseEventToLayerPoint(e)
		});
	},
	
	_onLoaded: function() {
		this.fire("loaded", this.data);
	}
	
	
});

