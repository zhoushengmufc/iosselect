(function() {
	var IScroll = (function (window, document, Math) {
		var rAF = window.requestAnimationFrame  ||
		    window.webkitRequestAnimationFrame  ||
		    window.mozRequestAnimationFrame     ||
		    window.oRequestAnimationFrame       ||
		    window.msRequestAnimationFrame      ||
		    function (callback) { window.setTimeout(callback, 1000 / 60); };

		var utils = (function () {
		    var me = {};

		    var _elementStyle = document.createElement('div').style;
		    var _vendor = (function () {
		        var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
		            transform,
		            i = 0,
		            l = vendors.length;

		        for ( ; i < l; i++ ) {
		            transform = vendors[i] + 'ransform';
		            if ( transform in _elementStyle ) return vendors[i].substr(0, vendors[i].length-1);
		        }

		        return false;
		    })();

		    function _prefixStyle (style) {
		        if ( _vendor === false ) return false;
		        if ( _vendor === '' ) return style;
		        return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
		    }

		    me.getTime = Date.now || function getTime () { return new Date().getTime(); };

		    me.extend = function (target, obj) {
		        for ( var i in obj ) {
		            target[i] = obj[i];
		        }
		    };

		    me.addEvent = function (el, type, fn, capture) {
		        el.addEventListener(type, fn, !!capture);
		    };

		    me.removeEvent = function (el, type, fn, capture) {
		        el.removeEventListener(type, fn, !!capture);
		    };

		    me.prefixPointerEvent = function (pointerEvent) {
		        return window.MSPointerEvent ?
		            'MSPointer' + pointerEvent.charAt(7).toUpperCase() + pointerEvent.substr(8):
		            pointerEvent;
		    };

		    me.momentum = function (current, start, time, lowerMargin, wrapperSize, deceleration) {
		        var distance = current - start,
		            speed = Math.abs(distance) / time,
		            destination,
		            duration;

		        deceleration = deceleration === undefined ? 0.0006 : deceleration;

		        destination = current + ( speed * speed ) / ( 2 * deceleration ) * ( distance < 0 ? -1 : 1 );
		        duration = speed / deceleration;

		        if ( destination < lowerMargin ) {
		            destination = wrapperSize ? lowerMargin - ( wrapperSize / 2.5 * ( speed / 8 ) ) : lowerMargin;
		            distance = Math.abs(destination - current);
		            duration = distance / speed;
		        } else if ( destination > 0 ) {
		            destination = wrapperSize ? wrapperSize / 2.5 * ( speed / 8 ) : 0;
		            distance = Math.abs(current) + destination;
		            duration = distance / speed;
		        }

		        return {
		            destination: Math.round(destination),
		            duration: duration
		        };
		    };

		    var _transform = _prefixStyle('transform');

		    me.extend(me, {
		        hasTransform: _transform !== false,
		        hasPerspective: _prefixStyle('perspective') in _elementStyle,
		        hasTouch: 'ontouchstart' in window,
		        hasPointer: !!(window.PointerEvent || window.MSPointerEvent), // IE10 is prefixed
		        hasTransition: _prefixStyle('transition') in _elementStyle
		    });

		    /*
		    This should find all Android browsers lower than build 535.19 (both stock browser and webview)
		    - galaxy S2 is ok
		    - 2.3.6 : `AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1`
		    - 4.0.4 : `AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30`
		   - galaxy S3 is badAndroid (stock brower, webview)
		     `AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30`
		   - galaxy S4 is badAndroid (stock brower, webview)
		     `AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30`
		   - galaxy S5 is OK
		     `AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36 (Chrome/)`
		   - galaxy S6 is OK
		     `AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36 (Chrome/)`
		  */
		    me.isBadAndroid = (function() {
		        var appVersion = window.navigator.appVersion;
		        // Android browser is not a chrome browser.
		        if (/Android/.test(appVersion) && !(/Chrome\/\d/.test(appVersion))) {
		            var safariVersion = appVersion.match(/Safari\/(\d+.\d)/);
		            if(safariVersion && typeof safariVersion === "object" && safariVersion.length >= 2) {
		                return parseFloat(safariVersion[1]) < 535.19;
		            } else {
		                return true;
		            }
		        } else {
		            return false;
		        }
		    })();

		    me.extend(me.style = {}, {
		        transform: _transform,
		        transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
		        transitionDuration: _prefixStyle('transitionDuration'),
		        transitionDelay: _prefixStyle('transitionDelay'),
		        transformOrigin: _prefixStyle('transformOrigin')
		    });

		    me.hasClass = function (e, c) {
		        var re = new RegExp("(^|\\s)" + c + "(\\s|$)");
		        return re.test(e.className);
		    };

		    me.addClass = function (e, c) {
		        if ( me.hasClass(e, c) ) {
		            return;
		        }

		        var newclass = e.className.split(' ');
		        newclass.push(c);
		        e.className = newclass.join(' ');
		    };

		    me.removeClass = function (e, c) {
		        if ( !me.hasClass(e, c) ) {
		            return;
		        }

		        var re = new RegExp("(^|\\s)" + c + "(\\s|$)", 'g');
		        e.className = e.className.replace(re, ' ');
		    };

		    me.offset = function (el) {
		        var left = -el.offsetLeft,
		            top = -el.offsetTop;

		        // jshint -W084
		        while (el = el.offsetParent) {
		            left -= el.offsetLeft;
		            top -= el.offsetTop;
		        }
		        // jshint +W084

		        return {
		            left: left,
		            top: top
		        };
		    };

		    me.preventDefaultException = function (el, exceptions) {
		        for ( var i in exceptions ) {
		            if ( exceptions[i].test(el[i]) ) {
		                return true;
		            }
		        }

		        return false;
		    };

		    me.extend(me.eventType = {}, {
		        touchstart: 1,
		        touchmove: 1,
		        touchend: 1,

		        mousedown: 2,
		        mousemove: 2,
		        mouseup: 2,

		        pointerdown: 3,
		        pointermove: 3,
		        pointerup: 3,

		        MSPointerDown: 3,
		        MSPointerMove: 3,
		        MSPointerUp: 3
		    });

		    me.extend(me.ease = {}, {
		        quadratic: {
		            style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
		            fn: function (k) {
		                return k * ( 2 - k );
		            }
		        },
		        circular: {
		            style: 'cubic-bezier(0.1, 0.57, 0.1, 1)',   // Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
		            fn: function (k) {
		                return Math.sqrt( 1 - ( --k * k ) );
		            }
		        },
		        back: {
		            style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
		            fn: function (k) {
		                var b = 4;
		                return ( k = k - 1 ) * k * ( ( b + 1 ) * k + b ) + 1;
		            }
		        },
		        bounce: {
		            style: '',
		            fn: function (k) {
		                if ( ( k /= 1 ) < ( 1 / 2.75 ) ) {
		                    return 7.5625 * k * k;
		                } else if ( k < ( 2 / 2.75 ) ) {
		                    return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
		                } else if ( k < ( 2.5 / 2.75 ) ) {
		                    return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
		                } else {
		                    return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
		                }
		            }
		        },
		        elastic: {
		            style: '',
		            fn: function (k) {
		                var f = 0.22,
		                    e = 0.4;

		                if ( k === 0 ) { return 0; }
		                if ( k == 1 ) { return 1; }

		                return ( e * Math.pow( 2, - 10 * k ) * Math.sin( ( k - f / 4 ) * ( 2 * Math.PI ) / f ) + 1 );
		            }
		        }
		    });

		    me.tap = function (e, eventName) {
		        var ev = document.createEvent('Event');
		        ev.initEvent(eventName, true, true);
		        ev.pageX = e.pageX;
		        ev.pageY = e.pageY;
		        e.target.dispatchEvent(ev);
		    };

		    me.click = function (e) {
		        var target = e.target,
		            ev;

		        if ( !(/(SELECT|INPUT|TEXTAREA)/i).test(target.tagName) ) {
		            // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/initMouseEvent
		            // initMouseEvent is deprecated.
		            ev = document.createEvent(window.MouseEvent ? 'MouseEvents' : 'Event');
		            ev.initEvent('click', true, true);
		            ev.view = e.view || window;
		            ev.detail = 1;
		            ev.screenX = target.screenX || 0;
		            ev.screenY = target.screenY || 0;
		            ev.clientX = target.clientX || 0;
		            ev.clientY = target.clientY || 0;
		            ev.ctrlKey = !!e.ctrlKey;
		            ev.altKey = !!e.altKey;
		            ev.shiftKey = !!e.shiftKey;
		            ev.metaKey = !!e.metaKey;
		            ev.button = 0;
		            ev.relatedTarget = null;
		            ev._constructed = true;
		            target.dispatchEvent(ev);
		        }
		    };

		    return me;
		})();
		function IScroll (el, options) {
		    this.wrapper = typeof el == 'string' ? document.querySelector(el) : el;
		    this.scroller = this.wrapper.children[0];
		    this.scrollerStyle = this.scroller.style;       // cache style for better performance

		    this.options = {

		// INSERT POINT: OPTIONS
		        disablePointer : !utils.hasPointer,
		        disableTouch : utils.hasPointer || !utils.hasTouch,
		        disableMouse : utils.hasPointer || utils.hasTouch,
		        startX: 0,
		        startY: 0,
		        scrollY: true,
		        directionLockThreshold: 5,
		        momentum: true,

		        bounce: true,
		        bounceTime: 600,
		        bounceEasing: '',

		        preventDefault: true,
		        preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/ },

		        HWCompositing: true,
		        useTransition: true,
		        useTransform: true,
		        bindToWrapper: typeof window.onmousedown === "undefined"
		    };

		    for ( var i in options ) {
		        this.options[i] = options[i];
		    }

		    // Normalize options
		    this.translateZ = this.options.HWCompositing && utils.hasPerspective ? ' translateZ(0)' : '';

		    this.options.useTransition = utils.hasTransition && this.options.useTransition;
		    this.options.useTransform = utils.hasTransform && this.options.useTransform;

		    this.options.eventPassthrough = this.options.eventPassthrough === true ? 'vertical' : this.options.eventPassthrough;
		    this.options.preventDefault = !this.options.eventPassthrough && this.options.preventDefault;

		    // If you want eventPassthrough I have to lock one of the axes
		    this.options.scrollY = this.options.eventPassthrough == 'vertical' ? false : this.options.scrollY;
		    this.options.scrollX = this.options.eventPassthrough == 'horizontal' ? false : this.options.scrollX;

		    // With eventPassthrough we also need lockDirection mechanism
		    this.options.freeScroll = this.options.freeScroll && !this.options.eventPassthrough;
		    this.options.directionLockThreshold = this.options.eventPassthrough ? 0 : this.options.directionLockThreshold;

		    this.options.bounceEasing = typeof this.options.bounceEasing == 'string' ? utils.ease[this.options.bounceEasing] || utils.ease.circular : this.options.bounceEasing;

		    this.options.resizePolling = this.options.resizePolling === undefined ? 60 : this.options.resizePolling;

		    if ( this.options.tap === true ) {
		        this.options.tap = 'tap';
		    }

		    // https://github.com/cubiq/iscroll/issues/1029
		    if (!this.options.useTransition && !this.options.useTransform) {
		        if(!(/relative|absolute/i).test(this.scrollerStyle.position)) {
		            this.scrollerStyle.position = "relative";
		        }
		    }

		// INSERT POINT: NORMALIZATION

		    // Some defaults
		    this.x = 0;
		    this.y = 0;
		    this.directionX = 0;
		    this.directionY = 0;
		    this._events = {};

		// INSERT POINT: DEFAULTS

		    this._init();
		    this.refresh();

		    this.scrollTo(this.options.startX, this.options.startY);
		    this.enable();
		}

		IScroll.prototype = {
		    version: '5.2.0',

		    _init: function () {
		        this._initEvents();

		// INSERT POINT: _init

		    },

		    destroy: function () {
		        this._initEvents(true);
		        clearTimeout(this.resizeTimeout);
		        this.resizeTimeout = null;
		        this._execEvent('destroy');
		    },

		    _transitionEnd: function (e) {
		        if ( e.target != this.scroller || !this.isInTransition ) {
		            return;
		        }

		        this._transitionTime();
		        if ( !this.resetPosition(this.options.bounceTime) ) {
		            this.isInTransition = false;
		            this._execEvent('scrollEnd');
		        }
		    },

		    _start: function (e) {
		        // React to left mouse button only
		        if ( utils.eventType[e.type] != 1 ) {
		          // for button property
		          // http://unixpapa.com/js/mouse.html
		          var button;
		        if (!e.which) {
		          /* IE case */
		          button = (e.button < 2) ? 0 :
		                   ((e.button == 4) ? 1 : 2);
		        } else {
		          /* All others */
		          button = e.button;
		        }
		            if ( button !== 0 ) {
		                return;
		            }
		        }

		        if ( !this.enabled || (this.initiated && utils.eventType[e.type] !== this.initiated) ) {
		            return;
		        }

		        if ( this.options.preventDefault && !utils.isBadAndroid && !utils.preventDefaultException(e.target, this.options.preventDefaultException) ) {
		            e.preventDefault();
		        }

		        var point = e.touches ? e.touches[0] : e,
		            pos;

		        this.initiated  = utils.eventType[e.type];
		        this.moved      = false;
		        this.distX      = 0;
		        this.distY      = 0;
		        this.directionX = 0;
		        this.directionY = 0;
		        this.directionLocked = 0;

		        this.startTime = utils.getTime();

		        if ( this.options.useTransition && this.isInTransition ) {
		            this._transitionTime();
		            this.isInTransition = false;
		            pos = this.getComputedPosition();
		            this._translate(Math.round(pos.x), Math.round(pos.y));
		            this._execEvent('scrollEnd');
		        } else if ( !this.options.useTransition && this.isAnimating ) {
		            this.isAnimating = false;
		            this._execEvent('scrollEnd');
		        }

		        this.startX    = this.x;
		        this.startY    = this.y;
		        this.absStartX = this.x;
		        this.absStartY = this.y;
		        this.pointX    = point.pageX;
		        this.pointY    = point.pageY;

		        this._execEvent('beforeScrollStart');
		    },

		    _move: function (e) {
		        if ( !this.enabled || utils.eventType[e.type] !== this.initiated ) {
		            return;
		        }

		        if ( this.options.preventDefault ) {    // increases performance on Android? TODO: check!
		            e.preventDefault();
		        }

		        var point       = e.touches ? e.touches[0] : e,
		            deltaX      = point.pageX - this.pointX,
		            deltaY      = point.pageY - this.pointY,
		            timestamp   = utils.getTime(),
		            newX, newY,
		            absDistX, absDistY;

		        this.pointX     = point.pageX;
		        this.pointY     = point.pageY;

		        this.distX      += deltaX;
		        this.distY      += deltaY;
		        absDistX        = Math.abs(this.distX);
		        absDistY        = Math.abs(this.distY);

		        // We need to move at least 10 pixels for the scrolling to initiate
		        if ( timestamp - this.endTime > 300 && (absDistX < 10 && absDistY < 10) ) {
		            return;
		        }

		        // If you are scrolling in one direction lock the other
		        if ( !this.directionLocked && !this.options.freeScroll ) {
		            if ( absDistX > absDistY + this.options.directionLockThreshold ) {
		                this.directionLocked = 'h';     // lock horizontally
		            } else if ( absDistY >= absDistX + this.options.directionLockThreshold ) {
		                this.directionLocked = 'v';     // lock vertically
		            } else {
		                this.directionLocked = 'n';     // no lock
		            }
		        }

		        if ( this.directionLocked == 'h' ) {
		            if ( this.options.eventPassthrough == 'vertical' ) {
		                e.preventDefault();
		            } else if ( this.options.eventPassthrough == 'horizontal' ) {
		                this.initiated = false;
		                return;
		            }

		            deltaY = 0;
		        } else if ( this.directionLocked == 'v' ) {
		            if ( this.options.eventPassthrough == 'horizontal' ) {
		                e.preventDefault();
		            } else if ( this.options.eventPassthrough == 'vertical' ) {
		                this.initiated = false;
		                return;
		            }

		            deltaX = 0;
		        }

		        deltaX = this.hasHorizontalScroll ? deltaX : 0;
		        deltaY = this.hasVerticalScroll ? deltaY : 0;

		        newX = this.x + deltaX;
		        newY = this.y + deltaY;

		        // Slow down if outside of the boundaries
		        if ( newX > 0 || newX < this.maxScrollX ) {
		            newX = this.options.bounce ? this.x + deltaX / 3 : newX > 0 ? 0 : this.maxScrollX;
		        }
		        if ( newY > 0 || newY < this.maxScrollY ) {
		            newY = this.options.bounce ? this.y + deltaY / 3 : newY > 0 ? 0 : this.maxScrollY;
		        }

		        this.directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
		        this.directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

		        if ( !this.moved ) {
		            this._execEvent('scrollStart');
		        }

		        this.moved = true;

		        this._translate(newX, newY);

		/* REPLACE START: _move */

		        if ( timestamp - this.startTime > 300 ) {
		            this.startTime = timestamp;
		            this.startX = this.x;
		            this.startY = this.y;
		        }

		/* REPLACE END: _move */

		    },

		    _end: function (e) {
		        if ( !this.enabled || utils.eventType[e.type] !== this.initiated ) {
		            return;
		        }

		        if ( this.options.preventDefault && !utils.preventDefaultException(e.target, this.options.preventDefaultException) ) {
		            e.preventDefault();
		        }

		        var point = e.changedTouches ? e.changedTouches[0] : e,
		            momentumX,
		            momentumY,
		            duration = utils.getTime() - this.startTime,
		            newX = Math.round(this.x),
		            newY = Math.round(this.y),
		            distanceX = Math.abs(newX - this.startX),
		            distanceY = Math.abs(newY - this.startY),
		            time = 0,
		            easing = '';

		        this.isInTransition = 0;
		        this.initiated = 0;
		        this.endTime = utils.getTime();

		        // reset if we are outside of the boundaries
		        if ( this.resetPosition(this.options.bounceTime) ) {
		            return;
		        }

		        this.scrollTo(newX, newY);  // ensures that the last position is rounded

		        // we scrolled less than 10 pixels
		        if ( !this.moved ) {
		            if ( this.options.tap ) {
		                utils.tap(e, this.options.tap);
		            }

		            if ( this.options.click ) {
		                utils.click(e);
		            }

		            this._execEvent('scrollCancel');
		            return;
		        }

		        if ( this._events.flick && duration < 200 && distanceX < 100 && distanceY < 100 ) {
		            this._execEvent('flick');
		            return;
		        }

		        // start momentum animation if needed
		        if ( this.options.momentum && duration < 300 ) {
		            momentumX = this.hasHorizontalScroll ? utils.momentum(this.x, this.startX, duration, this.maxScrollX, this.options.bounce ? this.wrapperWidth : 0, this.options.deceleration) : { destination: newX, duration: 0 };
		            momentumY = this.hasVerticalScroll ? utils.momentum(this.y, this.startY, duration, this.maxScrollY, this.options.bounce ? this.wrapperHeight : 0, this.options.deceleration) : { destination: newY, duration: 0 };
		            newX = momentumX.destination;
		            newY = momentumY.destination;
		            time = Math.max(momentumX.duration, momentumY.duration);
		            this.isInTransition = 1;
		        }

		// INSERT POINT: _end

		        if ( newX != this.x || newY != this.y ) {
		            // change easing function when scroller goes out of the boundaries
		            if ( newX > 0 || newX < this.maxScrollX || newY > 0 || newY < this.maxScrollY ) {
		                easing = utils.ease.quadratic;
		            }

		            this.scrollTo(newX, newY, time, easing);
		            return;
		        }

		        this._execEvent('scrollEnd');
		    },

		    _resize: function () {
		        var that = this;

		        clearTimeout(this.resizeTimeout);

		        this.resizeTimeout = setTimeout(function () {
		            that.refresh();
		        }, this.options.resizePolling);
		    },

		    resetPosition: function (time) {
		        var x = this.x,
		            y = this.y;

		        time = time || 0;

		        if ( !this.hasHorizontalScroll || this.x > 0 ) {
		            x = 0;
		        } else if ( this.x < this.maxScrollX ) {
		            x = this.maxScrollX;
		        }

		        if ( !this.hasVerticalScroll || this.y > 0 ) {
		            y = 0;
		        } else if ( this.y < this.maxScrollY ) {
		            y = this.maxScrollY;
		        }

		        if ( x == this.x && y == this.y ) {
		            return false;
		        }

		        this.scrollTo(x, y, time, this.options.bounceEasing);

		        return true;
		    },

		    disable: function () {
		        this.enabled = false;
		    },

		    enable: function () {
		        this.enabled = true;
		    },

		    refresh: function () {
		        var rf = this.wrapper.offsetHeight;     // Force reflow

		        this.wrapperWidth   = this.wrapper.clientWidth;
		        this.wrapperHeight  = this.wrapper.clientHeight;

		/* REPLACE START: refresh */

		        this.scrollerWidth  = this.scroller.offsetWidth;
		        this.scrollerHeight = this.scroller.offsetHeight;

		        this.maxScrollX     = this.wrapperWidth - this.scrollerWidth;
		        this.maxScrollY     = this.wrapperHeight - this.scrollerHeight;

		/* REPLACE END: refresh */

		        this.hasHorizontalScroll    = this.options.scrollX && this.maxScrollX < 0;
		        this.hasVerticalScroll      = this.options.scrollY && this.maxScrollY < 0;

		        if ( !this.hasHorizontalScroll ) {
		            this.maxScrollX = 0;
		            this.scrollerWidth = this.wrapperWidth;
		        }

		        if ( !this.hasVerticalScroll ) {
		            this.maxScrollY = 0;
		            this.scrollerHeight = this.wrapperHeight;
		        }

		        this.endTime = 0;
		        this.directionX = 0;
		        this.directionY = 0;

		        this.wrapperOffset = utils.offset(this.wrapper);

		        this._execEvent('refresh');

		        this.resetPosition();

		// INSERT POINT: _refresh

		    },

		    on: function (type, fn) {
		        if ( !this._events[type] ) {
		            this._events[type] = [];
		        }

		        this._events[type].push(fn);
		    },

		    off: function (type, fn) {
		        if ( !this._events[type] ) {
		            return;
		        }

		        var index = this._events[type].indexOf(fn);

		        if ( index > -1 ) {
		            this._events[type].splice(index, 1);
		        }
		    },

		    _execEvent: function (type) {
		        if ( !this._events[type] ) {
		            return;
		        }

		        var i = 0,
		            l = this._events[type].length;

		        if ( !l ) {
		            return;
		        }

		        for ( ; i < l; i++ ) {
		            this._events[type][i].apply(this, [].slice.call(arguments, 1));
		        }
		    },

		    scrollBy: function (x, y, time, easing) {
		        x = this.x + x;
		        y = this.y + y;
		        time = time || 0;

		        this.scrollTo(x, y, time, easing);
		    },

		    scrollTo: function (x, y, time, easing) {
		        easing = easing || utils.ease.circular;

		        this.isInTransition = this.options.useTransition && time > 0;
		        var transitionType = this.options.useTransition && easing.style;
		        if ( !time || transitionType ) {
		                if(transitionType) {
		                    this._transitionTimingFunction(easing.style);
		                    this._transitionTime(time);
		                }
		            this._translate(x, y);
		        } else {
		            this._animate(x, y, time, easing.fn);
		        }
		    },

		    scrollToElement: function (el, time, offsetX, offsetY, easing) {
		        el = el.nodeType ? el : this.scroller.querySelector(el);

		        if ( !el ) {
		            return;
		        }

		        var pos = utils.offset(el);

		        pos.left -= this.wrapperOffset.left;
		        pos.top  -= this.wrapperOffset.top;

		        // if offsetX/Y are true we center the element to the screen
		        if ( offsetX === true ) {
		            offsetX = Math.round(el.offsetWidth / 2 - this.wrapper.offsetWidth / 2);
		        }
		        if ( offsetY === true ) {
		            offsetY = Math.round(el.offsetHeight / 2 - this.wrapper.offsetHeight / 2);
		        }

		        pos.left -= offsetX || 0;
		        pos.top  -= offsetY || 0;

		        pos.left = pos.left > 0 ? 0 : pos.left < this.maxScrollX ? this.maxScrollX : pos.left;
		        pos.top  = pos.top  > 0 ? 0 : pos.top  < this.maxScrollY ? this.maxScrollY : pos.top;

		        time = time === undefined || time === null || time === 'auto' ? Math.max(Math.abs(this.x-pos.left), Math.abs(this.y-pos.top)) : time;

		        this.scrollTo(pos.left, pos.top, time, easing);
		    },

		    _transitionTime: function (time) {
		        if (!this.options.useTransition) {
		            return;
		        }
		        time = time || 0;
		        var durationProp = utils.style.transitionDuration;
		        if(!durationProp) {
		            return;
		        }

		        this.scrollerStyle[durationProp] = time + 'ms';

		        if ( !time && utils.isBadAndroid ) {
		            this.scrollerStyle[durationProp] = '0.0001ms';
		            // remove 0.0001ms
		            var self = this;
		            rAF(function() {
		                if(self.scrollerStyle[durationProp] === '0.0001ms') {
		                    self.scrollerStyle[durationProp] = '0s';
		                }
		            });
		        }

		// INSERT POINT: _transitionTime

		    },

		    _transitionTimingFunction: function (easing) {
		        this.scrollerStyle[utils.style.transitionTimingFunction] = easing;

		// INSERT POINT: _transitionTimingFunction

		    },

		    _translate: function (x, y) {
		        if ( this.options.useTransform ) {

		/* REPLACE START: _translate */

		            this.scrollerStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.translateZ;

		/* REPLACE END: _translate */

		        } else {
		            x = Math.round(x);
		            y = Math.round(y);
		            this.scrollerStyle.left = x + 'px';
		            this.scrollerStyle.top = y + 'px';
		        }

		        this.x = x;
		        this.y = y;

		// INSERT POINT: _translate

		    },

		    _initEvents: function (remove) {
		        var eventType = remove ? utils.removeEvent : utils.addEvent,
		            target = this.options.bindToWrapper ? this.wrapper : window;

		        eventType(window, 'orientationchange', this);
		        eventType(window, 'resize', this);

		        if ( this.options.click ) {
		            eventType(this.wrapper, 'click', this, true);
		        }

		        if ( !this.options.disableMouse ) {
		            eventType(this.wrapper, 'mousedown', this);
		            eventType(target, 'mousemove', this);
		            eventType(target, 'mousecancel', this);
		            eventType(target, 'mouseup', this);
		        }

		        if ( utils.hasPointer && !this.options.disablePointer ) {
		            eventType(this.wrapper, utils.prefixPointerEvent('pointerdown'), this);
		            eventType(target, utils.prefixPointerEvent('pointermove'), this);
		            eventType(target, utils.prefixPointerEvent('pointercancel'), this);
		            eventType(target, utils.prefixPointerEvent('pointerup'), this);
		        }

		        if ( utils.hasTouch && !this.options.disableTouch ) {
		            eventType(this.wrapper, 'touchstart', this);
		            eventType(target, 'touchmove', this);
		            eventType(target, 'touchcancel', this);
		            eventType(target, 'touchend', this);
		        }

		        eventType(this.scroller, 'transitionend', this);
		        eventType(this.scroller, 'webkitTransitionEnd', this);
		        eventType(this.scroller, 'oTransitionEnd', this);
		        eventType(this.scroller, 'MSTransitionEnd', this);
		    },

		    getComputedPosition: function () {
		        var matrix = window.getComputedStyle(this.scroller, null),
		            x, y;

		        if ( this.options.useTransform ) {
		            matrix = matrix[utils.style.transform].split(')')[0].split(', ');
		            x = +(matrix[12] || matrix[4]);
		            y = +(matrix[13] || matrix[5]);
		        } else {
		            x = +matrix.left.replace(/[^-\d.]/g, '');
		            y = +matrix.top.replace(/[^-\d.]/g, '');
		        }

		        return { x: x, y: y };
		    },
		    _animate: function (destX, destY, duration, easingFn) {
		        var that = this,
		            startX = this.x,
		            startY = this.y,
		            startTime = utils.getTime(),
		            destTime = startTime + duration;

		        function step () {
		            var now = utils.getTime(),
		                newX, newY,
		                easing;

		            if ( now >= destTime ) {
		                that.isAnimating = false;
		                that._translate(destX, destY);

		                if ( !that.resetPosition(that.options.bounceTime) ) {
		                    that._execEvent('scrollEnd');
		                }

		                return;
		            }

		            now = ( now - startTime ) / duration;
		            easing = easingFn(now);
		            newX = ( destX - startX ) * easing + startX;
		            newY = ( destY - startY ) * easing + startY;
		            that._translate(newX, newY);

		            if ( that.isAnimating ) {
		                rAF(step);
		            }
		        }

		        this.isAnimating = true;
		        step();
		    },
		    handleEvent: function (e) {
		        switch ( e.type ) {
		            case 'touchstart':
		            case 'pointerdown':
		            case 'MSPointerDown':
		            case 'mousedown':
		                this._start(e);
		                break;
		            case 'touchmove':
		            case 'pointermove':
		            case 'MSPointerMove':
		            case 'mousemove':
		                this._move(e);
		                break;
		            case 'touchend':
		            case 'pointerup':
		            case 'MSPointerUp':
		            case 'mouseup':
		            case 'touchcancel':
		            case 'pointercancel':
		            case 'MSPointerCancel':
		            case 'mousecancel':
		                this._end(e);
		                break;
		            case 'orientationchange':
		            case 'resize':
		                this._resize();
		                break;
		            case 'transitionend':
		            case 'webkitTransitionEnd':
		            case 'oTransitionEnd':
		            case 'MSTransitionEnd':
		                this._transitionEnd(e);
		                break;
		            case 'wheel':
		            case 'DOMMouseScroll':
		            case 'mousewheel':
		                this._wheel(e);
		                break;
		            case 'keydown':
		                this._key(e);
		                break;
		            case 'click':
		                if ( this.enabled && !e._constructed ) {
		                    e.preventDefault();
		                    e.stopPropagation();
		                }
		                break;
		        }
		    }
		};
		IScroll.utils = utils;
		return IScroll;
	})(window, document, Math);
	iosSelectUtil = {
		isArray: function(arg1) {
			return Object.prototype.toString.call(arg1) === '[object Array]';
		},
		isFunction: function(arg1) {
			return typeof arg1 === 'function';
		},
		attrToData: function(dom, index) {
			var obj = {};
			for (var p in dom.dataset) {
				obj[p] = dom.dataset[p];
			}
			obj['dom'] = dom;
			obj['atindex'] = index;
			return obj;
		},
		attrToHtml: function(obj) {
			var html = '';
			for (var p in obj) {
				html += 'data-' + p + '="' + obj[p] + '"';
			}
			return html;
		}
	};
	// Layer
	function Layer(html, opts) {
		if (!(this instanceof Layer)) {
			return new Layer(html, opts);
		}
		this.html = html;
		this.opts = opts;
		var el = document.createElement('div');
		el.className = 'olay';
		// var layer_el = $('<div class="layer"></div>');
		var layer_el = document.createElement('div');
		layer_el.className = 'layer';
		this.el = el;
		this.layer_el = layer_el;
		this.init();
	}
	Layer.prototype = {
		init: function() {
			this.layer_el.innerHTML = this.html;
			if (this.opts.container && document.querySelector(this.opts.container)) {
				document.querySelector(this.opts.container).appendChild(this.el);
			}
			else {
				document.body.appendChild(this.el);
			}
			this.el.appendChild(this.layer_el);
			this.el.style.height = Math.max(document.documentElement.getBoundingClientRect().height, window.innerHeight);
			if (this.opts.className) {
				this.el.className += ' ' + this.opts.className;
			}
			this.bindEvent();
		},
		bindEvent: function() {
			var sureDom = this.el.querySelectorAll('.sure');
			var closeDom = this.el.querySelectorAll('.close');
			var self = this;
			for (var i = 0, len = sureDom.length; i < len; i++) {
				sureDom[i].addEventListener('click', function(e) {
					self.close();
				});
			}
			for (var i = 0, len = closeDom.length; i < len; i++) {
				closeDom[i].addEventListener('click', function(e) {
					self.close();
				});
			}
		},
		close: function() {
			if (this.el) {
				this.el.parentNode.removeChild(this.el);
				this.el = null;
			}
		}
	}
	function IosSelect(level, data, options) {
		if (!iosSelectUtil.isArray(data) || data.length === 0) {
			return;
		}
		this.data = data;
		this.level = level || 1;
		this.options = options;
		this.typeBox = 'one-level-box';
		if (this.level === 1) {
			this.typeBox = 'one-level-box';
		}
		else if (this.level === 2) {
			this.typeBox = 'two-level-box';
		}
		else if (this.level === 3) {
			this.typeBox = 'three-level-box';
		}
		else if (this.level === 4) {
			this.typeBox = 'four-level-box';
		}
		else if (this.level === 5) {
			this.typeBox = 'five-level-box';
		}
		this.callback = options.callback;
		this.title = options.title || '';
		this.options.itemHeight = options.itemHeight || 35;
		this.options.itemShowCount = [3, 5, 7, 9].indexOf(options.itemShowCount) !== -1? options.itemShowCount: 7; 
		this.options.coverArea1Top = Math.floor(this.options.itemShowCount / 2);
		this.options.coverArea2Top = Math.ceil(this.options.itemShowCount / 2); 
		this.options.headerHeight = options.headerHeight || 44;
		this.options.relation = iosSelectUtil.isArray(this.options.relation)? this.options.relation: [];
		this.options.oneTwoRelation = this.options.relation[0];
		this.options.twoThreeRelation = this.options.relation[1];
		this.options.threeFourRelation = this.options.relation[2];
		this.options.fourFiveRelation = this.options.relation[3];
		if (this.options.cssUnit !== 'px' && this.options.cssUnit !== 'rem') {
			this.options.cssUnit = 'px';
		}
		this.setBase();
		this.init();
	};

	IosSelect.prototype = {
		init: function() {
			this.initLayer();
			// 选中元素的信息
			this.selectOneObj = {};
			this.selectTwoObj = {};
			this.selectThreeObj = {};
			this.selectFourObj = {};
			this.selectFiveObj = {};
			this.setOneLevel(this.options.oneLevelId, this.options.twoLevelId, this.options.threeLevelId, this.options.fourLevelId, this.options.fiveLevelId);
		},
		initLayer: function() {
			var self = this;
			var all_html = [
				'<header style="height: ' + this.options.headerHeight + this.options.cssUnit + '; line-height: ' + this.options.headerHeight + this.options.cssUnit + '" class="iosselect-header">',
					'<h2 id="iosSelectTitle"></h2>',
					'<a style="height: ' + this.options.headerHeight + this.options.cssUnit + '; line-height: ' + this.options.headerHeight + this.options.cssUnit + '" href="javascript:void(0)" class="close">取消</a>',
					'<a style="height: ' + this.options.headerHeight + this.options.cssUnit + '; line-height: ' + this.options.headerHeight + this.options.cssUnit + '" href="javascript:void(0)" class="sure">确定</a>',
				'</header>',
				'<hr class="cover-area1"/>',
				'<hr class="cover-area2"/>',
				'<section class="iosselect-box">',
					'<div class="one-level-contain" id="oneLevelContain">',
						'<ul class="select-one-level">',
						'</ul>',
						'<div class="effects"></div>',
					'</div>',
					'<div class="two-level-contain" id="twoLevelContain">',
						'<ul class="select-two-level">',
						'</ul>',
						'<div class="effects"></div>',
					'</div>',
					'<div class="three-level-contain" id="threeLevelContain">',
						'<ul class="select-three-level">',
						'</ul>',
						'<div class="effects"></div>',
					'</div>',
					'<div class="four-level-contain" id="fourLevelContain">',
						'<ul class="select-four-level">',
						'</ul>',
						'<div class="effects"></div>',
					'</div>',
					'<div class="five-level-contain" id="fiveLevelContain">',
						'<ul class="select-five-level">',
						'</ul>',
						'<div class="effects"></div>',
					'</div>',
				'</section>',
				'<div class="ios-select-loading-box" id="iosSelectLoadingBox">',
				    '<div class="ios-select-loading"></div>',
				'</div>'
			].join('\r\n');
			this.iosSelectLayer = new Layer(all_html, {
				className: 'ios-select-widget-box ' + this.typeBox + (this.options.addClassName? ' ' + this.options.addClassName: ''),
				container: this.options.container || ''
			});

			this.iosSelectTitleDom = this.iosSelectLayer.el.querySelector('#iosSelectTitle');
			this.iosSelectLoadingBoxDom = this.iosSelectLayer.el.querySelector('#iosSelectLoadingBox');
			if (this.options.title) {
				this.iosSelectTitleDom.innerHTML = this.options.title;
			}

			if (this.options.headerHeight && this.options.itemHeight) {
				this.coverArea1Dom = this.iosSelectLayer.el.querySelector('.cover-area1');
				this.coverArea1Dom.style.top = this.options.headerHeight + this.options.itemHeight * this.options.coverArea1Top + this.options.cssUnit;

				this.coverArea2Dom = this.iosSelectLayer.el.querySelector('.cover-area2');
				this.coverArea2Dom.style.top = this.options.headerHeight + this.options.itemHeight * this.options.coverArea2Top + this.options.cssUnit;
			}

			this.oneLevelContainDom = this.iosSelectLayer.el.querySelector('#oneLevelContain');
			this.twoLevelContainDom = this.iosSelectLayer.el.querySelector('#twoLevelContain');
			this.threeLevelContainDom = this.iosSelectLayer.el.querySelector('#threeLevelContain');
			this.fourLevelContainDom = this.iosSelectLayer.el.querySelector('#fourLevelContain');
			this.fiveLevelContainDom = this.iosSelectLayer.el.querySelector('#fiveLevelContain');

			this.oneLevelUlContainDom = this.iosSelectLayer.el.querySelector('.select-one-level');
			this.twoLevelUlContainDom = this.iosSelectLayer.el.querySelector('.select-two-level');
			this.threeLevelUlContainDom = this.iosSelectLayer.el.querySelector('.select-three-level');
			this.fourLevelUlContainDom = this.iosSelectLayer.el.querySelector('.select-four-level');
			this.fiveLevelUlContainDom = this.iosSelectLayer.el.querySelector('.select-five-level');

			this.iosSelectLayer.el.querySelector('.layer').style.height = this.options.itemHeight * this.options.itemShowCount + this.options.headerHeight + this.options.cssUnit;

			this.oneLevelContainDom.style.height = this.options.itemHeight * this.options.itemShowCount + this.options.cssUnit;

			this.setEffects(this.oneLevelContainDom);

			this.offsetTop = document.body.scrollTop;
			document.body.classList.add('ios-select-body-class');
			window.scrollTo(0, 0);

			this.scrollOne = new IScroll('#oneLevelContain', {
				bounce: false
			});
			this.scrollOne.on('scrollStart', function() {
				var atDom = self.oneLevelContainDom.querySelector('li.at');
				atDom && atDom.classList.remove('at');
			});
			this.scrollOne.on('scrollEnd', function() {
				var pa = Math.abs(this.y / self.baseSize) / self.options.itemHeight;
				var plast = 1;
				var to = 0;
				if (Math.ceil(pa) === Math.round(pa)) {
					to = Math.ceil(pa) * self.options.itemHeight * self.baseSize;
					plast = Math.ceil(pa) + 1;
				} else {
					to = Math.floor(pa) * self.options.itemHeight * self.baseSize;
					plast = Math.floor(pa) + 1;
				}
				self.scrollOne.scrollTo(0, -to, 0);

				var pdom = self.changeClassName(self.oneLevelContainDom, plast);

				self.selectOneObj = iosSelectUtil.attrToData(pdom, plast);

				if (self.level > 1 && self.options.oneTwoRelation === 1) {
					self.setTwoLevel(self.selectOneObj.id, self.selectTwoObj.id, self.selectThreeObj.id, self.selectFourObj.id, self.selectFiveObj.id);
				}
			});
			this.scrollOne.on('scrollCancel', function() {
				var pa = Math.abs(this.y / self.baseSize) / self.options.itemHeight;
				var plast = 1;
				var to = 0;
				if (Math.ceil(pa) === Math.round(pa)) {
					to = Math.ceil(pa) * self.options.itemHeight * self.baseSize;
					plast = Math.ceil(pa) + 1;
				} else {
					to = Math.floor(pa) * self.options.itemHeight * self.baseSize;
					plast = Math.floor(pa) + 1;
				}
				self.scrollOne.scrollTo(0, -to, 0);

				var pdom = self.changeClassName(self.oneLevelContainDom, plast);

				self.selectOneObj = iosSelectUtil.attrToData(pdom, plast);

				if (self.level > 1 && self.options.oneTwoRelation === 1) {
					self.setTwoLevel(self.selectOneObj.id, self.selectTwoObj.id, self.selectThreeObj.id, self.selectFourObj.id, self.selectFiveObj.id);
				}
			});
			if (this.level >= 2) {
				this.twoLevelContainDom.style.height = this.options.itemHeight * this.options.itemShowCount + this.options.cssUnit;
				this.setEffects(this.twoLevelContainDom);
				this.scrollTwo = new IScroll('#twoLevelContain', {
					bounce: false
				});
				this.scrollTwo.on('scrollStart', function() {
					var atDom = self.twoLevelContainDom.querySelector('li.at');
				    atDom && atDom.classList.remove('at');
				});
				this.scrollTwo.on('scrollEnd', function() {
					var pa = Math.abs(this.y / self.baseSize) / self.options.itemHeight;
					var plast = 1;
					var to = 0;
					if (Math.ceil(pa) === Math.round(pa)) {
						to = Math.ceil(pa) * self.options.itemHeight * self.baseSize;
						plast = Math.ceil(pa) + 1;
					} else {
						to = Math.floor(pa) * self.options.itemHeight * self.baseSize;
						plast = Math.floor(pa) + 1;
					}
					self.scrollTwo.scrollTo(0, -to, 0);

					var pdom = self.changeClassName(self.twoLevelContainDom, plast);

					self.selectTwoObj = iosSelectUtil.attrToData(pdom, plast);

					if (self.level > 2 && self.options.twoThreeRelation === 1) {
						self.setThreeLevel(self.selectOneObj.id, self.selectTwoObj.id, self.selectThreeObj.id, self.selectFourObj.id, self.selectFiveObj.id);
					}
				});
				this.scrollTwo.on('scrollCancel', function() {
					var pa = Math.abs(this.y / self.baseSize) / self.options.itemHeight;
					var plast = 1;
					var to = 0;
					if (Math.ceil(pa) === Math.round(pa)) {
						to = Math.ceil(pa) * self.options.itemHeight * self.baseSize;
						plast = Math.ceil(pa) + 1;
					} else {
						to = Math.floor(pa) * self.options.itemHeight * self.baseSize;
						plast = Math.floor(pa) + 1;
					}
					self.scrollTwo.scrollTo(0, -to, 0);

					var pdom = self.changeClassName(self.twoLevelContainDom, plast);

					self.selectTwoObj = iosSelectUtil.attrToData(pdom, plast);

					if (self.level > 2 && self.options.twoThreeRelation === 1) {
						self.setThreeLevel(self.selectOneObj.id, self.selectTwoObj.id, self.selectThreeObj.id, self.selectFourObj.id, self.selectFiveObj.id);
					}
				});
			}
			if (this.level >= 3) {
				this.threeLevelContainDom.style.height = this.options.itemHeight * this.options.itemShowCount + this.options.cssUnit;
				this.setEffects(this.threeLevelContainDom);
				this.scrollThree = new IScroll('#threeLevelContain', {
					bounce: false
				});
				this.scrollThree.on('scrollStart', function() {
					var atDom = self.threeLevelContainDom.querySelector('li.at');
				    atDom && atDom.classList.remove('at');
				});
				this.scrollThree.on('scrollEnd', function() {
					var pa = Math.abs(this.y / self.baseSize) / self.options.itemHeight;
					var plast = 1;
					var to = 0;
					if (Math.ceil(pa) === Math.round(pa)) {
						to = Math.ceil(pa) * self.options.itemHeight * self.baseSize;
						plast = Math.ceil(pa) + 1;
					} else {
						to = Math.floor(pa) * self.options.itemHeight * self.baseSize;
						plast = Math.floor(pa) + 1;
					}
					self.scrollThree.scrollTo(0, -to, 0);

					var pdom = self.changeClassName(self.threeLevelContainDom, plast);

					self.selectThreeObj = iosSelectUtil.attrToData(pdom, plast);
					if (self.level >= 4 && self.options.threeFourRelation === 1) {
						self.setFourLevel(self.selectOneObj.id, self.selectTwoObj.id, self.selectThreeObj.id, self.selectFourObj.id, self.selectFiveObj.id);
					}
				});
				this.scrollThree.on('scrollCancel', function() {
					var pa = Math.abs(this.y / self.baseSize) / self.options.itemHeight;
					var plast = 1;
					var to = 0;
					if (Math.ceil(pa) === Math.round(pa)) {
						to = Math.ceil(pa) * self.options.itemHeight * self.baseSize;
						plast = Math.ceil(pa) + 1;
					} else {
						to = Math.floor(pa) * self.options.itemHeight * self.baseSize;
						plast = Math.floor(pa) + 1;
					}
					self.scrollThree.scrollTo(0, -to, 0);

					var pdom = self.changeClassName(self.threeLevelContainDom, plast);

					self.selectThreeObj = iosSelectUtil.attrToData(pdom, plast);
					if (self.level >= 4 && self.options.threeFourRelation === 1) {
						self.setFourLevel(self.selectOneObj.id, self.selectTwoObj.id, self.selectThreeObj.id, self.selectFourObj.id, self.selectFiveObj.id);
					}
				});
			}
			if (this.level >= 4) {
				this.fourLevelContainDom.style.height = this.options.itemHeight * this.options.itemShowCount + this.options.cssUnit;
				this.setEffects(this.fourLevelContainDom);
				this.scrollFour = new IScroll('#fourLevelContain', {
					bounce: false
				});
				this.scrollFour.on('scrollStart', function() {
					var atDom = self.fourLevelContainDom.querySelector('li.at');
				    atDom && atDom.classList.remove('at');
				});
				this.scrollFour.on('scrollEnd', function() {
					var pa = Math.abs(this.y / self.baseSize) / self.options.itemHeight;
					var plast = 1;
					var to = 0;
					if (Math.ceil(pa) === Math.round(pa)) {
						to = Math.ceil(pa) * self.options.itemHeight * self.baseSize;
						plast = Math.ceil(pa) + 1;
					} else {
						to = Math.floor(pa) * self.options.itemHeight * self.baseSize;
						plast = Math.floor(pa) + 1;
					}
					self.scrollFour.scrollTo(0, -to, 0);

					var pdom = self.changeClassName(self.fourLevelContainDom, plast);

					self.selectFourObj = iosSelectUtil.attrToData(pdom, plast);

					if (self.level >= 5 && self.options.fourFiveRelation === 1) {
						self.setFiveLevel(self.selectOneObj.id, self.selectTwoObj.id, self.selectThreeObj.id, self.selectFourObj.id, self.selectFiveObj.id);
					}
				});
				this.scrollFour.on('scrollCancel', function() {
					var pa = Math.abs(this.y / self.baseSize) / self.options.itemHeight;
					var plast = 1;
					var to = 0;
					if (Math.ceil(pa) === Math.round(pa)) {
						to = Math.ceil(pa) * self.options.itemHeight * self.baseSize;
						plast = Math.ceil(pa) + 1;
					} else {
						to = Math.floor(pa) * self.options.itemHeight * self.baseSize;
						plast = Math.floor(pa) + 1;
					}
					self.scrollFour.scrollTo(0, -to, 0);

					var pdom = self.changeClassName(self.fourLevelContainDom, plast);

					self.selectFourObj = iosSelectUtil.attrToData(pdom, plast);

					if (self.level >= 5 && self.options.fourFiveRelation === 1) {
						self.setFiveLevel(self.selectOneObj.id, self.selectTwoObj.id, self.selectThreeObj.id, self.selectFourObj.id, self.selectFiveObj.id);
					}
				});
			}
			if (this.level >= 5) {
				this.fiveLevelContainDom.style.height = this.options.itemHeight * this.options.itemShowCount + this.options.cssUnit;
				this.setEffects(this.fiveLevelContainDom);
				this.scrollFive = new IScroll('#fiveLevelContain', {
					bounce: false
				});
				this.scrollFive.on('scrollStart', function() {
					var atDom = self.fiveLevelContainDom.querySelector('li.at');
				    atDom && atDom.classList.remove('at');
				});
				this.scrollFive.on('scrollEnd', function() {
					var pa = Math.abs(this.y / self.baseSize) / self.options.itemHeight;
					var plast = 1;
					var to = 0;
					if (Math.ceil(pa) === Math.round(pa)) {
						to = Math.ceil(pa) * self.options.itemHeight * self.baseSize;
						plast = Math.ceil(pa) + 1;
					} else {
						to = Math.floor(pa) * self.options.itemHeight * self.baseSize;
						plast = Math.floor(pa) + 1;
					}
					self.scrollFive.scrollTo(0, -to, 0);

					var pdom = self.changeClassName(self.fiveLevelContainDom, plast);

					self.selectFiveObj = iosSelectUtil.attrToData(pdom, plast);
				});
				this.scrollFive.on('scrollCancel', function() {
					var pa = Math.abs(this.y / self.baseSize) / self.options.itemHeight;
					var plast = 1;
					var to = 0;
					if (Math.ceil(pa) === Math.round(pa)) {
						to = Math.ceil(pa) * self.options.itemHeight * self.baseSize;
						plast = Math.ceil(pa) + 1;
					} else {
						to = Math.floor(pa) * self.options.itemHeight * self.baseSize;
						plast = Math.floor(pa) + 1;
					}
					self.scrollFive.scrollTo(0, -to, 0);

					var pdom = self.changeClassName(self.fiveLevelContainDom, plast);

					self.selectFiveObj = iosSelectUtil.attrToData(pdom, plast);
				});
			}

			// 取消 确认 事件
			this.closeBtnDom = this.iosSelectLayer.el.querySelector('.close');
			this.closeBtnDom.addEventListener('click', function(e) {
				if (document.body.classList.contains('ios-select-body-class')) {
					document.body.classList.remove('ios-select-body-class');
				}
				window.scrollTo(0, self.offsetTop);
			});

			this.selectBtnDom = this.iosSelectLayer.el.querySelector('.sure');
			this.selectBtnDom.addEventListener('click', function(e) {
				if (document.body.classList.contains('ios-select-body-class')) {
					document.body.classList.remove('ios-select-body-class');
				}
				window.scrollTo(0, self.offsetTop);
				self.callback && self.callback(self.selectOneObj, self.selectTwoObj, self.selectThreeObj, self.selectFourObj, self.selectFiveObj);
			});
		},
		loadingShow: function() {
			this.options.showLoading && (this.iosSelectLoadingBoxDom.style.display = 'block');
		},
		loadingHide: function() {
			this.iosSelectLoadingBoxDom.style.display = 'none';
		},
		getOneLevel: function() {
			return this.data[0];
		},
		setOneLevel: function(oneLevelId, twoLevelId, threeLevelId, fourLevelId, fiveLevelId) {
			if (iosSelectUtil.isArray(this.data[0])){
				var oneLevelData = this.getOneLevel();
				this.renderOneLevel(oneLevelId, twoLevelId, threeLevelId, fourLevelId, fiveLevelId, oneLevelData);
			}
			else if (iosSelectUtil.isFunction(this.data[0])) {
				this.loadingShow();
				this.data[0](function(oneLevelData) {
					this.loadingHide();
					this.renderOneLevel(oneLevelId, twoLevelId, threeLevelId, fourLevelId, fiveLevelId, oneLevelData);
				}.bind(this));
			}
			else {
				throw new Error('data format error');
			}
		},
		renderOneLevel: function(oneLevelId, twoLevelId, threeLevelId, fourLevelId, fiveLevelId, oneLevelData) {
			var hasAtId = oneLevelData.some(function(v, i, o) {
				return v.id == oneLevelId;
			});
			if (!hasAtId) {
				oneLevelId = oneLevelData[0]['id'];
			}
			var oneHtml = '';
			var self = this;
			var plast = 0;
			oneHtml += this.getWhiteItem();
			oneLevelData.forEach(function(v, i, o) {
				if (v.id == oneLevelId) {
					oneHtml += '<li style="height: ' + this.options.itemHeight + this.options.cssUnit + '; line-height: ' + this.options.itemHeight + this.options.cssUnit +';" ' + iosSelectUtil.attrToHtml(v) + ' class="at">' + v.value + '</li>';
					plast = i + 1;
				} else {
					oneHtml += '<li style="height: ' + this.options.itemHeight + this.options.cssUnit + '; line-height: ' + this.options.itemHeight + this.options.cssUnit +';"' + iosSelectUtil.attrToHtml(v) + '>' + v.value + '</li>';
				}
			}.bind(this));
			oneHtml += this.getWhiteItem();
			this.oneLevelUlContainDom.innerHTML = oneHtml;

			this.scrollOne.refresh();
			this.scrollOne.scrollToElement('li:nth-child(' + plast + ')', 0);
			if (this.level >= 2) {
				this.setTwoLevel(oneLevelId, twoLevelId, threeLevelId, fourLevelId, fiveLevelId);
			}

			var pdom = this.changeClassName(this.oneLevelContainDom, plast);
			this.selectOneObj = iosSelectUtil.attrToData(pdom, this.getAtIndexByPlast(plast));
		},
		getTwoLevel: function(oneLevelId) {
			var twoLevelData = [];
			if (this.options.oneTwoRelation === 1) {
				this.data[1].forEach(function(v, i, o) {
					if (v['parentId'] === oneLevelId) {
						twoLevelData.push(v);
					}
				});
			} else {
				twoLevelData = this.data[1];
			}
			return twoLevelData;
		},
		setTwoLevel: function(oneLevelId, twoLevelId, threeLevelId, fourLevelId, fiveLevelId) {
			if (iosSelectUtil.isArray(this.data[1])) {
				var twoLevelData = this.getTwoLevel(oneLevelId);
				this.renderTwoLevel(oneLevelId, twoLevelId, threeLevelId, fourLevelId, fiveLevelId, twoLevelData);
			}
			else if (iosSelectUtil.isFunction(this.data[1])) {
				this.loadingShow();
				this.data[1](oneLevelId, function(twoLevelData) {
					this.loadingHide();
					this.renderTwoLevel(oneLevelId, twoLevelId, threeLevelId, fourLevelId, fiveLevelId, twoLevelData);
				}.bind(this));
			}
			else {
				throw new Error('data format error');
			}
		},
		renderTwoLevel: function(oneLevelId, twoLevelId, threeLevelId, fourLevelId, fiveLevelId, twoLevelData) {
			var plast = 0;
			var hasAtId = twoLevelData.some(function(v, i, o) {
				return v.id == twoLevelId;
			});
			if (!hasAtId) {
				twoLevelId = twoLevelData[0]['id'];
			}
			var twoHtml = '';
			var self = this;
			twoHtml += this.getWhiteItem();
			twoLevelData.forEach(function(v, i, o) {
				if (v.id == twoLevelId) {
					twoHtml += '<li style="height: ' + this.options.itemHeight + this.options.cssUnit + '; line-height: ' + this.options.itemHeight + this.options.cssUnit +';"' + iosSelectUtil.attrToHtml(v) + ' class="at">' + v.value + '</li>';
					plast = i + 1;
				} else {
					twoHtml += '<li style="height: ' + this.options.itemHeight + this.options.cssUnit + '; line-height: ' + this.options.itemHeight + this.options.cssUnit +';"' + iosSelectUtil.attrToHtml(v) + '>' + v.value + '</li>';
				}
			}.bind(this));
			twoHtml += this.getWhiteItem();
			this.twoLevelUlContainDom.innerHTML = twoHtml;
			this.scrollTwo.refresh();
			this.scrollTwo.scrollToElement(':nth-child(' + plast + ')', 0);
			if (this.level >= 3) {
				this.setThreeLevel(oneLevelId, twoLevelId, threeLevelId, fourLevelId, fiveLevelId);
			}

			var pdom = this.changeClassName(this.twoLevelContainDom, plast);
			this.selectTwoObj = iosSelectUtil.attrToData(pdom, this.getAtIndexByPlast(plast));
		},
		getThreeLevel: function(oneLevelId, twoLevelId) {
			var threeLevelData = [];
			if (this.options.twoThreeRelation === 1) {
				this.data[2].forEach(function(v, i, o) {
					if (v['parentId'] === twoLevelId) {
						threeLevelData.push(v);
					}
				});
			} else {
				threeLevelData = this.data[2];
			}
			return threeLevelData;
		},
		setThreeLevel: function(oneLevelId, twoLevelId, threeLevelId, fourLevelId, fiveLevelId) {
			if (iosSelectUtil.isArray(this.data[2])) {
				var threeLevelData = this.getThreeLevel(oneLevelId, twoLevelId);
				this.renderThreeLevel(oneLevelId, twoLevelId, threeLevelId, fourLevelId, fiveLevelId, threeLevelData);
			}
			else if (iosSelectUtil.isFunction(this.data[2])) {
				this.loadingShow();
				this.data[2](oneLevelId, twoLevelId, function(threeLevelData) {
					this.loadingHide();
					this.renderThreeLevel(oneLevelId, twoLevelId, threeLevelId, fourLevelId, fiveLevelId, threeLevelData);
				}.bind(this));
			}
			else {
				throw new Error('data format error');
			}
		},
	    renderThreeLevel: function(oneLevelId, twoLevelId, threeLevelId, fourLevelId, fiveLevelId, threeLevelData) {
	    	var plast = 0;
			var hasAtId = threeLevelData.some(function(v, i, o) {
				return v.id == threeLevelId;
			});
			if (!hasAtId) {
				threeLevelId = threeLevelData[0]['id'];
			}
			var threeHtml = '';
			var self = this;
			threeHtml += this.getWhiteItem();
			threeLevelData.forEach(function(v, i, o) {
				if (v.id == threeLevelId) {
					threeHtml += '<li style="height: ' + this.options.itemHeight + this.options.cssUnit + '; line-height: ' + this.options.itemHeight + this.options.cssUnit +';"' + iosSelectUtil.attrToHtml(v) + ' class="at">' + v.value + '</li>';
					plast = i + 1;
				} else {
					threeHtml += '<li style="height: ' + this.options.itemHeight + this.options.cssUnit + '; line-height: ' + this.options.itemHeight + this.options.cssUnit +';"' + iosSelectUtil.attrToHtml(v) + '>' + v.value + '</li>';
				}
			}.bind(this));
			threeHtml += this.getWhiteItem();
			this.threeLevelUlContainDom.innerHTML = threeHtml;
			this.scrollThree.refresh();
			this.scrollThree.scrollToElement(':nth-child(' + plast + ')', 0);

			if (this.level >= 4) {
				this.setFourLevel(oneLevelId, twoLevelId, threeLevelId, fourLevelId, fiveLevelId);
			}

			var pdom = this.changeClassName(this.threeLevelContainDom, plast);
			this.selectThreeObj = iosSelectUtil.attrToData(pdom, this.getAtIndexByPlast(plast));
	    },
	    getFourLevel: function(oneLevelId, twoLevelId, threeLevelId) {
			var fourLevelData = [];
			if (this.options.threeFourRelation === 1) {
				this.data[3].forEach(function(v, i, o) {
					if (v['parentId'] === threeLevelId) {
						fourLevelData.push(v);
					}
				});
			} else {
				fourLevelData = this.data[3];
			}
			return fourLevelData;
		},
		setFourLevel: function(oneLevelId, twoLevelId, threeLevelId, fourLevelId, fiveLevelId) {
			if (iosSelectUtil.isArray(this.data[3])) {
				var fourLevelData = this.getFourLevel(oneLevelId, twoLevelId, threeLevelId);
				this.renderFourLevel(oneLevelId, twoLevelId, threeLevelId, fourLevelId, fiveLevelId, fourLevelData);
			}
			else if (iosSelectUtil.isFunction(this.data[3])) {
				this.loadingShow();
				this.data[3](oneLevelId, twoLevelId, threeLevelId, function(fourLevelData) {
					this.loadingHide();
					this.renderFourLevel(oneLevelId, twoLevelId, threeLevelId, fourLevelId, fiveLevelId, fourLevelData);
				}.bind(this));
			}
			else {
				throw new Error('data format error');
			}
		},
	    renderFourLevel: function(oneLevelId, twoLevelId, threeLevelId, fourLevelId, fiveLevelId, fourLevelData) {
	    	var plast = 0;
			var hasAtId = fourLevelData.some(function(v, i, o) {
				return v.id == fourLevelId;
			});
			if (!hasAtId) {
				fourLevelId = fourLevelData[0]['id'];
			}
			var fourHtml = '';
			var self = this;
			fourHtml += this.getWhiteItem();
			fourLevelData.forEach(function(v, i, o) {
				if (v.id == fourLevelId) {
					fourHtml += '<li style="height: ' + this.options.itemHeight + this.options.cssUnit + '; line-height: ' + this.options.itemHeight + this.options.cssUnit +';"' + iosSelectUtil.attrToHtml(v) + ' class="at">' + v.value + '</li>';
					plast = i + 1;
				} else {
					fourHtml += '<li style="height: ' + this.options.itemHeight + this.options.cssUnit + '; line-height: ' + this.options.itemHeight + this.options.cssUnit +';"' + iosSelectUtil.attrToHtml(v) + '>' + v.value + '</li>';
				}
			}.bind(this));
			fourHtml += this.getWhiteItem();
			this.fourLevelUlContainDom.innerHTML = fourHtml;
			this.scrollFour.refresh();
			this.scrollFour.scrollToElement(':nth-child(' + plast + ')', 0);

			if (this.level >= 5) {
				this.setFiveLevel(oneLevelId, twoLevelId, threeLevelId, fourLevelId, fiveLevelId);
			}

			var pdom = this.changeClassName(this.fourLevelContainDom, plast);
			this.selectFourObj = iosSelectUtil.attrToData(pdom, this.getAtIndexByPlast(plast));
	    },
	    getFiveLevel: function(oneLevelId, twoLevelId, threeLevelId, fourLevelId) {
			var fiveLevelData = [];
			if (this.options.fourFiveRelation === 1) {
				this.data[4].forEach(function(v, i, o) {
					if (v['parentId'] === fourLevelId) {
						fiveLevelData.push(v);
					}
				});
			} else {
				fiveLevelData = this.data[4];
			}
			return fiveLevelData;
		},
		setFiveLevel: function(oneLevelId, twoLevelId, threeLevelId, fourLevelId, fiveLevelId) {
			if (iosSelectUtil.isArray(this.data[4])) {
				var fiveLevelData = this.getFiveLevel(oneLevelId, twoLevelId, threeLevelId, fourLevelId);
				this.renderFiveLevel(oneLevelId, twoLevelId, threeLevelId, fourLevelId, fiveLevelId, fiveLevelData);
			}
			else if (iosSelectUtil.isFunction(this.data[4])) {
				this.loadingShow();
				this.data[4](oneLevelId, twoLevelId, threeLevelId, fourLevelId, function(fiveLevelData) {
					this.loadingHide();
					this.renderFiveLevel(oneLevelId, twoLevelId, threeLevelId, fourLevelId, fiveLevelId, fiveLevelData);
				}.bind(this));
			}
			else {
				throw new Error('data format error');
			}
		},
	    renderFiveLevel: function(oneLevelId, twoLevelId, threeLevelId, fourLevelId, fiveLevelId, fiveLevelData) {
	    	var plast = 0;
			var hasAtId = fiveLevelData.some(function(v, i, o) {
				return v.id == fiveLevelId;
			});
			if (!hasAtId) {
				fiveLevelId = fiveLevelData[0]['id'];
			}
			var fiveHtml = '';
			var self = this;
			fiveHtml += this.getWhiteItem();
			fiveLevelData.forEach(function(v, i, o) {
				if (v.id == fiveLevelId) {
					fiveHtml += '<li style="height: ' + this.options.itemHeight + this.options.cssUnit + '; line-height: ' + this.options.itemHeight + this.options.cssUnit +';"' + iosSelectUtil.attrToHtml(v) + ' class="at">' + v.value + '</li>';
					plast = i + 1;
				} else {
					fiveHtml += '<li style="height: ' + this.options.itemHeight + this.options.cssUnit + '; line-height: ' + this.options.itemHeight + this.options.cssUnit +';"' + iosSelectUtil.attrToHtml(v) + '>' + v.value + '</li>';
				}
			}.bind(this));
			fiveHtml += this.getWhiteItem();
			this.fiveLevelUlContainDom.innerHTML = fiveHtml;
			this.scrollFive.refresh();
			this.scrollFive.scrollToElement(':nth-child(' + plast + ')', 0);

			var pdom = this.changeClassName(this.fiveLevelContainDom, plast);
			this.selectFiveObj = iosSelectUtil.attrToData(pdom, this.getAtIndexByPlast(plast));
	    },
	    getWhiteItem: function() {
	    	var whiteItemHtml = '';
	    	whiteItemHtml += '<li style="height: ' + this.options.itemHeight +this.options.cssUnit +  '; line-height: ' + this.options.itemHeight +this.options.cssUnit + '"></li>';
	    	if (this.options.itemShowCount > 3) {
	    		whiteItemHtml += '<li style="height: ' + this.options.itemHeight +this.options.cssUnit +  '; line-height: ' + this.options.itemHeight +this.options.cssUnit + '"></li>';
	    	}
	    	if (this.options.itemShowCount > 5) {
	    		whiteItemHtml += '<li style="height: ' + this.options.itemHeight +this.options.cssUnit +  '; line-height: ' + this.options.itemHeight +this.options.cssUnit + '"></li>';
	    	}
	    	if (this.options.itemShowCount > 7) {
	    		whiteItemHtml += '<li style="height: ' + this.options.itemHeight +this.options.cssUnit +  '; line-height: ' + this.options.itemHeight +this.options.cssUnit + '"></li>';
	    	}
	    	return whiteItemHtml;
	    }, 
	    changeClassName: function(levelContainDom, plast) {
	    	var pdom;
	    	if (this.options.itemShowCount === 3) {
	    		pdom = levelContainDom.querySelector('li:nth-child(' + (plast + 1) + ')');
				pdom.classList.add('at');
	    	}
	    	else if (this.options.itemShowCount === 5) {
	    		pdom = levelContainDom.querySelector('li:nth-child(' + (plast + 2) + ')');
				pdom.classList.add('at');
	    	}
	    	else if (this.options.itemShowCount === 7) {
	    		pdom = levelContainDom.querySelector('li:nth-child(' + (plast + 3) + ')');
				pdom.classList.add('at');
	    	}
	    	else if (this.options.itemShowCount === 9) {
	    		pdom = levelContainDom.querySelector('li:nth-child(' + (plast + 4) + ')');
				pdom.classList.add('at');
	    	}
	    	return pdom;
	    },
	    getAtIndexByPlast: function(plast) {
	    	return plast + Math.ceil(this.itemShowCount / 2);
	    },
	    setBase: function () {
			if (this.options.cssUnit === 'rem') {
				var dltDom = document.documentElement;
				var dltStyle = window.getComputedStyle(dltDom, null);
				var dltFontSize = dltStyle.fontSize;
				try {
					this.baseSize = /\d+(?:\.\d+)?/.exec(dltFontSize)[0];
				}
				catch(e) {
					this.baseSize = 1;
				}
			}
			else {
				this.baseSize = 1;
			}
		},
		setEffects: function (containDom) {
			var effDom = containDom.querySelector('.effects');
			if (effDom) {
				effDom.style.height = this.options.itemHeight * this.options.itemShowCount + this.options.cssUnit;
				effDom.style.backgroundSize = '100% ' + this.options.itemHeight * Math.round((this.options.itemShowCount - 1) / 2) + this.options.cssUnit;
			}
		} 
	}
	if (typeof module != 'undefined' && module.exports) {
		module.exports = IosSelect;
	} else if (typeof define == 'function' && define.amd) {
		define(function() {
			return IosSelect;
		});
	} else {
		window.IosSelect = IosSelect;
	}
})();