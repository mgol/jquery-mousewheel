/*!
 * jQuery Mousewheel v@VERSION
 * https://github.com/jquery/jquery-mousewheel
 *
 * Copyright OpenJS Foundation and other contributors
 * Released under the MIT license
 * https://jquery.org/license
 */
( function( factory ) {
	"use strict";

	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery" ], factory );
	} else if ( typeof module === "object" && module.exports ) {

		// Node/CommonJS style
		module.exports = factory( require( "jquery" ) );
	} else {

		// Browser globals
		factory( jQuery );
	}
} )( function( $ ) {
	"use strict";

	var nullLowestDeltaTimeout, lowestDelta,
		deprecatedWarningShown = false,
		slice = Array.prototype.slice;

	if ( $.event.fixHooks ) {
		$.event.fixHooks.wheel = $.event.mouseHooks;
	}

	$.event.special.wheel = getSpecialForEvent( {
		type: "wheel",
		multiplier: 1,
		extraParams: false,
		deprecated: false
	} );

	/**
	 * @deprecated The `mousewheel` event is deprecated; use `wheel`.
	 */
	$.event.special.mousewheel = getSpecialForEvent( {
		type: "mousewheel",
		multiplier: -1,
		extraParams: true,
		deprecated: true
	} );

	function getSpecialForEvent( options ) {
		var special = {
			version: "@VERSION",

			setup: function() {
				this.addEventListener( "wheel", options.eventHandler, false );

				// Store the line height and page height for this particular element
				$.data( this, options.type + "-line-height", special.getLineHeight( this ) );
				$.data( this, options.type + "-page-height", special.getPageHeight( this ) );
			},

			teardown: function() {
				this.removeEventListener( "wheel", options.eventHandler, false );

				// Clean up the data we added to the element
				$.removeData( this, options.type + "-line-height" );
				$.removeData( this, options.type + "-page-height" );
			},

			getLineHeight: function( elem ) {
				var $elem = $( elem ),
					$parent = $elem.offsetParent();
				if ( !$parent.length ) {
					$parent = $( "body" );
				}
				return parseInt( $parent.css( "fontSize" ), 10 ) ||
					parseInt( $elem.css( "fontSize" ), 10 ) || 16;
			},

			getPageHeight: function( elem ) {
				return $( elem ).height();
			}
		};

		options.eventHandler = getHandler( options );

		return special;
	}

	function getHandler( options ) {
		return function( origEvent ) {
			return handler.call( this, origEvent, options );
		};
	}

	function handler( origEvent, options ) {
		var lineHeight, pageHeight,
			type = options.type,
			multiplier = options.multiplier,
			extraParams = options.extraParams,
			deprecated = options.deprecated,
			args = slice.call( arguments, 1 ),
			delta = 0,
			deltaX = 0,
			deltaY = 0,
			absDelta = 0,
			event = $.event.fix( origEvent );

		if ( deprecated && !deprecatedWarningShown ) {
			window.console.warn(
				"jQuery Mousewheel: the mousewheel event is deprecated; use wheel" );
		}

		event.type = type;

		deltaY = origEvent.deltaY * multiplier;
		delta = deltaY;

		deltaX = origEvent.deltaX;
		if ( deltaY === 0 ) {
			delta = deltaX * multiplier;
		}

		// No change actually happened, no reason to go any further
		if ( deltaY === 0 && deltaX === 0 ) {
			return;
		}

		// Need to convert lines and pages to pixels if we aren't already in pixels
		// There are three delta modes:
		//   * deltaMode 0 is by pixels, nothing to do
		//   * deltaMode 1 is by lines
		//   * deltaMode 2 is by pages
		if ( origEvent.deltaMode === 1 ) {
			lineHeight = $.data( this, type + "-line-height" );
			delta *= lineHeight;
			deltaY *= lineHeight;
			deltaX *= lineHeight;
		} else if ( origEvent.deltaMode === 2 ) {
			pageHeight = $.data( this, type + "-page-height" );
			delta *= pageHeight;
			deltaY *= pageHeight;
			deltaX *= pageHeight;
		}

		// Store lowest absolute delta to normalize the delta values
		absDelta = Math.max( Math.abs( deltaY ), Math.abs( deltaX ) );

		if ( !lowestDelta || absDelta < lowestDelta ) {
			lowestDelta = absDelta;
		}

		// Get a whole, normalized value for the deltas
		delta = Math[
			multiplier * Math.abs( delta ) >= 1 ? "floor" : "ceil"
		]( delta / lowestDelta );
		deltaX = Math[
			multiplier * Math.abs( deltaX ) >= 1 ? "floor" : "ceil"
		]( deltaX / lowestDelta );
		deltaY = Math[
			multiplier * Math.abs( deltaY ) >= 1 ? "floor" : "ceil"
		]( deltaY / lowestDelta );

		// Add information to the event object
		event.deltaX = deltaX;
		event.deltaY = deltaY;
		event.deltaFactor = lowestDelta;

		// Go ahead and set deltaMode to 0 since we converted to pixels.
		// Although this is a little odd since we overwrite the deltaX/Y
		// properties with normalized deltas.
		event.deltaMode = 0;

		// Add event to the front of the arguments, optionally followed by params.
		if ( extraParams ) {
			args.unshift( delta, deltaX, deltaY );
		}
		args.unshift( event );

		// Clear out lowestDelta after sometime to better handle multiple
		// device types that give a different lowestDelta.
		// E.g.: trackpad = 3 and mouse wheel = 120
		window.clearTimeout( nullLowestDeltaTimeout );
		nullLowestDeltaTimeout = window.setTimeout( function() {
			lowestDelta = null;
		}, 200 );

		return $.event.dispatch.apply( this, args );
	}

} );
