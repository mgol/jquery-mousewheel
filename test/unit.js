"use strict";

QUnit.module( "mousewheel" );

function makeWheelEvent( options ) {
	var event;

	if ( window.document.documentMode ) {
		event = window.document.createEvent( "Event" );
		event.initEvent( "wheel", true, true );
		event.deltaMode = 0;
		jQuery.extend( event, options );
	} else {
		event = new window.WheelEvent( "wheel",
			jQuery.extend( {}, options, {
				bubbles: true,
				cancelable: true,
				deltaMode: 0
			} )
		);
	}

	return event;
}

QUnit.test( "wheel: .on() and .trigger()", function( assert ) {
	assert.expect( 1 );

	var markup = jQuery( "<div>wheelme</div>" ).appendTo( "body" );

	markup.on( "wheel", function( e ) {
		assert.ok( true, "triggered a wheel event on " + e.target.innerText );
	} );
	markup.trigger( "wheel" );

	markup.remove();
} );

QUnit.test( "mousewheel: .on() and .trigger()", function( assert ) {
	assert.expect( 1 );

	var markup = jQuery( "<div>mousewheelme</div>" ).appendTo( "body" );

	markup.on( "mousewheel", function( e ) {
		assert.ok( true, "triggered a mousewheel event on " + e.target.innerText );
	} );
	markup.trigger( "mousewheel" );

	markup.remove();
} );

QUnit.test( "wheel: natively triggered events", function( assert ) {
	assert.expect( 6 );

	var markup = jQuery( "<p>wheelme</p>" ).appendTo( "body" );

	markup.on( "wheel", function( e ) {
		assert.ok( true, "triggered a mousewheel event on " + e.target.innerText );
		assert.ok( "deltaX" in e, "got a deltaX in the event" );
		assert.ok( e.deltaY, 4, "deltaY is a normalized number" );
	} );

	// First wheel event "calibrates" so we won't measure this one
	var event1 = makeWheelEvent( { deltaX: 0, deltaY: 2.2 } );
	markup[ 0 ].dispatchEvent( event1 );

	var event2 = makeWheelEvent( { deltaX: 0, deltaY: 10.528 } );
	markup[ 0 ].dispatchEvent( event2 );

	markup.remove();
} );

QUnit.test( "mousewheel: natively triggered events", function( assert ) {
	assert.expect( 6 );

	var markup = jQuery( "<p>mousewheelme</p>" ).appendTo( "body" );

	markup.on( "mousewheel", function( e ) {
		assert.ok( true, "triggered a mousewheel event on " + e.target.innerText );
		assert.ok( "deltaX" in e, "got a deltaX in the event" );
		assert.ok( e.deltaY, -4, "deltaY is a normalized number" );
	} );

	// First wheel event "calibrates" so we won't measure this one
	var event1 = makeWheelEvent( { deltaX: 0, deltaY: 2.2 } );
	markup[ 0 ].dispatchEvent( event1 );

	var event2 = makeWheelEvent( { deltaX: 0, deltaY: 10.528 } );
	markup[ 0 ].dispatchEvent( event2 );

	markup.remove();
} );

QUnit.test( "wheel: mouse event properties are passed through", function( assert ) {
	assert.expect( 4 );

	var markup = jQuery( "<p>wheelme</p>" ).appendTo( "body" );

	markup.on( "wheel", function( e ) {
		var org = e.originalEvent;
		assert.equal( org.clientX, 342, "original event has clientX: " + org.clientX );
		assert.equal( org.clientY, 301, "original event has clientY: " + org.clientY );
		assert.ok( e.offsetX < org.clientX, "got plausible offsetX in the event: " + e.offsetX );
		assert.ok( e.offsetY < org.clientY, "got plausible offsetY in the event: " + e.offsetY );
	} );

	// Not sure why this property is manipulating offsetX/Y but the behavior cannot
	// change in a minor version so it will stay since it's set to true right now.
	// For testing we just want to ensure that the properties get through.
	var event1 = makeWheelEvent( {
		deltaX: 0,
		deltaY: 2.2,
		offsetX: 1,
		offsetY: 2,
		clientX: 342,
		clientY: 301
	} );
	markup[ 0 ].dispatchEvent( event1 );

	markup.remove();
} );

QUnit.test( "mousewheel: mouse event properties are passed through", function( assert ) {
	assert.expect( 4 );

	var markup = jQuery( "<p>mousewheelme</p>" ).appendTo( "body" );

	markup.on( "mousewheel", function( e ) {
		var org = e.originalEvent;
		assert.equal( org.clientX, 342, "original event has clientX: " + org.clientX );
		assert.equal( org.clientY, 301, "original event has clientY: " + org.clientY );
		assert.ok( e.offsetX < org.clientX, "got plausible offsetX in the event: " + e.offsetX );
		assert.ok( e.offsetY < org.clientY, "got plausible offsetY in the event: " + e.offsetY );
	} );

	// Not sure why this property is manipulating offsetX/Y but the behavior cannot
	// change in a minor version so it will stay since it's set to true right now.
	// For testing we just want to ensure that the properties get through.
	var event1 = makeWheelEvent( {
		deltaX: 0,
		deltaY: 2.2,
		offsetX: 1,
		offsetY: 2,
		clientX: 342,
		clientY: 301
	} );
	markup[ 0 ].dispatchEvent( event1 );

	markup.remove();
} );
