var MY_UTILS = (function( $ ) {

    var Utils = {
        $document:      $( document ),
        $window:        $( window ),
        $body:          $( 'body' ),
        $scrollRoot:    $( 'html, body'),

        $functionElems: null,
        $targetElems: null,

        selectors: {
            functionElement:    '[data-fn]',
            targetElement:      '[data-tg]'
        },

        attributes: {
            target:     'data-fn-target',
            options:     'data-fn-options'
        },

        classes: {
            open:           'show',
            animating:      'animating',
            animatingIn:    'animating-in',
            animatingOut:   'animating-out'
        },
		
		mediaSize: null,
        mediaSizes: [ 
            {
                breakpoint: 0,
                label: 'xs'
            },
            {
                breakpoint: 576,
                label: 'sm'
            },
            {
                breakpoint: 768,
                label: 'md'
            },
            {
                breakpoint: 992,
                label: 'lg'
            },
            {
                breakpoint: 1200,
                label: 'xl'
            }
        ],

        anchorOffsetTop: 0
    };

    // cache all functional elements
    var $functionAndTargetElems = $( Utils.selectors.functionElement + ', ' + Utils.selectors.targetElement );
    Utils.$functionElems = $functionAndTargetElems.filter( Utils.selectors.functionElement );
    Utils.$targetElems = $functionAndTargetElems.filter( Utils.selectors.targetElement );

    // anchors offset top
    var anchorOffsetTopSelector = '[data-fn="anchor-offset-elem"]';
    var anchorOffsetTopDistance = 20;
    var $anchorOffsetTopElem = Utils.$functionElems.filter( anchorOffsetTopSelector );

    $.fn._getAnchorOffset = function() {
        return ( ( $anchorOffsetTopElem.length > 0 ) ? this.outerHeight(): 0 ) + anchorOffsetTopDistance;
    }

    Utils.anchorOffsetTop = $anchorOffsetTopElem._getAnchorOffset();

    Utils.$window.on( 'sizeChange', function() {
        Utils.anchorOffsetTop = $anchorOffsetTopElem._getAnchorOffset();
    } );

    // convert type
    function _convertType( value )
    {
        try {
            value = JSON.parse( value );
            return value;
        } catch( e )
        {
            // 'value' is not a json string.
            return value
        }
    }

    // get transition duration
    $.fn.getTransitionDuration = function() {
        var duration = 0;
        var cssProperty = 'transition-duration';
        var prefixes = [ 'webkit', 'ms', 'moz', 'o' ];
        if ( this.css( cssProperty ) ) {
            duration = this.css( cssProperty );
        }
        else {
            for ( i = 0; i < prefixes.length; i++ ) {
                if ( this.css( '-' + prefixes[ i ] + '-' + cssProperty ) ) {
                    duration = this.css( '-' + prefixes[ i ] + '-' + cssProperty );
                    break;
                }
            }
        }
        return ( duration.indexOf( 'ms' ) > -1 ) ? parseFloat( duration ) : parseFloat( duration ) * 1000;
    };

    // set and remove animation class
    $.fn.setRemoveAnimationClass = function( animatingClass ) {
        var currentAnimatingClass = ( !! animatingClass ) ? animatingClass : Utils.classes.animating;
        var $this = $( this );
        var transitionDuration = $this.getTransitionDuration();
        if ( transitionDuration > 0 ) {
            $this.addClass( animatingClass );
            var timeout = setTimeout( function() {
                $this.removeClass( animatingClass );
            }, transitionDuration );
        }
    };

    // check if element is positiones inside (x, y, width, height) of another element
    $.fn.elemPositionedInside = function( container ) {

        var $this = $( this );
        var $container = $( container );

        var elemOffsetLeft = $this.offset().left;
        var elemOffsetTop = $this.offset().top;
        var elemWidth = $this.width();
        var elemHeight = $this.height();

        var containerOffsetLeft = $container.offset().left;
        var containerOffsetTop = $container.offset().top;
        var containerWidth = $container.outerWidth(); // include border since offset will calulate only to border
        var containerHeight = $container.outerHeight();

        return elemOffsetLeft >= containerOffsetLeft
            && ( elemOffsetLeft + elemWidth ) <= ( containerOffsetLeft + containerWidth )
            && elemOffsetTop >= containerOffsetTop
            && ( elemOffsetTop + elemHeight ) <= ( containerOffsetTop + containerHeight );
    };

    // aria expanded
    $.fn.ariaExpanded = function( value ) {
        return $( this ).aria( 'expanded', value );
    };

    $.fn.aria = function( ariaName, value )
    {
        if ( typeof value !== "undefined" )
        {
            $( this ).attr( 'aria-' + ariaName, value );
            return value;
        }
        else
        {
            return _convertType( $(this).attr('aria-' + ariaName) );
        }
    };
	
	// media size (media change event)
	var mediaSize = '';
    var mediaSizeBodyClassPrefix = 'media-';

	_getmediaSize = function() {
		var currentmediaSize;
		if ( !! window.matchMedia ) {
			// modern browsers
			for ( i = 0; i < Utils.mediaSizes.length - 1; i++ ) {
				if ( window.matchMedia( '(max-width: ' + ( Utils.mediaSizes[ i + 1 ].breakpoint - 1 ) + 'px)' ).matches ) {
					currentmediaSize = Utils.mediaSizes[ i ].label;
					break;
				}
				else {
					currentmediaSize = Utils.mediaSizes[ Utils.mediaSizes.length - 1 ].label;
				}
			}
		}
		else {
			// fallback old browsers
			for ( i = 0; i < Utils.mediaSizes.length - 1; i++ ) {
				if ( Utils.$window.width() < Utils.mediaSizes[ i + 1 ].breakpoint ) {
					currentmediaSize = Utils.mediaSizes[ i ].label;
					break;
				}
				else {
					currentmediaSize = Utils.mediaSizes[ Utils.mediaSizes.length - 1 ].label;
				}
			}
		}
		if ( currentmediaSize != Utils.mediaSize ) {
            // remove / set body class
            Utils.$body.removeClass( mediaSizeBodyClassPrefix + Utils.mediaSize );
            Utils.$body.addClass( mediaSizeBodyClassPrefix + currentmediaSize );

			Utils.mediaSize = currentmediaSize;
			Utils.$window.trigger( 'sizeChange' );
		}
	};
	Utils.$document.ready( function() {
		_getmediaSize();
		Utils.$window.trigger( 'sizeChangeReady' );
	} );
	Utils.$window.on( 'resize', function() {
		_getmediaSize();	
	} );
	// /media size (media change event)

    // get options from attribute
    // syntax: data-fn-options="{ focusOnOpen: '[data-tg=\'header-search-input\']', bla: true, foo: 'some text content' }"
    $.fn.getOptionsFromAttr = function () {
        var $this = $(this);
        var options = $this.attr( Utils.attributes.options );
        if ( typeof options !== 'undefined' ) {
            return ( new Function( 'return ' + options ) )();
        }
        else {
            return false;
        }
    }
    // /get options from attribute

    return Utils;
})( jQuery );
( function() {
	
	// detect ios / android
	var isIos = /iPad|iPhone|iPod/.test( navigator.platform ) && ! window.MSStream;
	var isAndroid = /(android)/i.test( navigator.userAgent );
	if ( isIos ) {
		document.body.className += ' is-ios';
	}
	else if ( isAndroid ) {
		document.body.className += ' is-android';
	}
	
	function detectIE() {
		var ua = window.navigator.userAgent;
		var msie = ua.indexOf( 'MSIE ' );
			if ( msie > 0 ) {
			return parseInt( ua.substring( msie + 5, ua.indexOf( '.', msie ) ), 10 );
		}
		var trident = ua.indexOf( 'Trident/' );
		if ( trident > 0 ) {
			var rv = ua.indexOf( 'rv:' );
			return parseInt( ua.substring( rv + 3, ua.indexOf( '.', rv ) ), 10 );
		}
		var edge = ua.indexOf( 'Edge/' );
		if ( edge > 0 ) {
			return parseInt( ua.substring( edge + 5, ua.indexOf( '.', edge ) ), 10 );
		}
		return false;
	}

	// detect ie gt 9
	var ieMaxVersion = 14;
	var ieVersion = detectIE();
	if ( ieVersion !== false && ieVersion > 9 ) {
		document.body.className += ' ie ie' + ieVersion;
		for ( i = ieVersion; i <= ieMaxVersion; i++ ) {
			document.body.className += ' ielte' + i;
		}
	}

	// fix ios missing body click event (set event to all div elements which are children of body)
	if ( isIos ) {
		var bodyChildren = document.body.children;
		for ( i = 0; i < bodyChildren.length; i++ ) {
			if ( bodyChildren[ i ].tagName == 'DIV' ) {
				bodyChildren[ i ].setAttribute( 'onclick', 'void(0);' );
			}
		}
	}

} )();
( function( $, Utils ) {

    // smooth scrolling to anchors
    $.fn.animatedAnchors = function( options ) {

        var $elems = $( this );

        var defaults = {
            scrollToInitialHash: true,
            scrollDurationMin: 300,
            scrollDurationMax: 800,
            scrollDurationPer1000: 400,
            offset: function() {
                return 0;
            },
            scrollTolerance: 1, // scroll little bit more than to anchor position to make sure to trigger scrollspy
            fixedClass: 'fixed'
        };

        options = $.extend( {}, defaults, options );

        $.fn._animatedScrollTo = function() {

            $this = $( this );

            var scrollTop = Utils.$window.scrollTop();
            var thisOffsetTop = $this.offset().top + options.scrollTolerance;

            var scrollDuration = Math.abs( thisOffsetTop - options.offset() - scrollTop ) * options.scrollDurationPer1000 / 1000;

            // limit scroll duration (min, max)
            if  ( scrollDuration < options.scrollDurationMin ) {
                scrollDuration = options.scrollDurationMin;
            }
            else if ( scrollDuration > options.scrollDurationMax ) {
                scrollDuration = options.scrollDurationMax;
            }

            Utils.$scrollRoot.animate({ scrollTop: ( thisOffsetTop - options.offset() ) }, scrollDuration);

        }

        // scroll to initial url anchor
        if ( options.scrollToInitialHash ) {
            var $currentAnchor = $( window.location.hash );
            if ( window.location.hash && $currentAnchor.length > 0 ) {

                // TODO: use browser native jumping to hash instead of smooth (but late) scrolling?
                // scroll to top while loading
                /*
                Utils.$document.ready( function() {
                    Utils.$scrollRoot.scrollTop( 0 );
                } );
                */
                // scroll to anchor
                $currentAnchor._animatedScrollTo();

                // scroll to anchor again after fonts loaded
                Utils.$window.on( 'load', function() {
                    $currentAnchor._animatedScrollTo();
                } );
            }
        }

        $elems.each( function() {

            var $elem = $( this );

            $elem.on( 'click', function() {

                var targetSelector = $elem.attr( 'href' );
                var $target = $( targetSelector );

                if ( $target.length > 0 ) {
                    $target._animatedScrollTo();
                }

            } );

        } );

    };

} )( jQuery, MY_UTILS );
/*

EXAMPLE 1:

<ul>
    <li>
        <a href="#" aria-label="close" data-fn="dropdown-multilevel-close"></a>
    </li>
    <li>
        <a id="id-1" href="#" data-fn="dropdown-multilevel" aria-haspopup="true" aria-expanded="false">Link</a>
        <ul aria-labelledby="id-1"><!--  -->
            ...
        </ul>
    </li>
    ...
</ul>

<div data-tg="dropdown-multilevel-excluded">I will be ignored</div>


EXAMPLE 2:

- external trigger for level 1 (anywhere)
- trigger and list do not have to share a common list

<a id="id-0" href="#" data-fn="dropdown-multilevel" data-fn-target="[data-tg='navbar']" aria-haspopup="true" aria-expanded="false">Open menu</a>

<div data-tg="navbar">
    <ul aria-labelledby="id-0">
        <li>
            <a href="#" aria-label="close" data-fn="dropdown-multilevel-close"></a>
        </li>
        <li>
            <a id="id-1" href="#" data-fn="dropdown-multilevel" aria-haspopup="true" aria-expanded="false">Link</a>
            <ul aria-labelledby="id-1"><!--  -->
                ...
            </ul>
        </li>
        ...
    </ul>
</div>

*/

( function( $, Utils ) {

    // dropdown multilevel (e.g. main navigation lists)
    $.fn.dropdownMultilevel = function( options ) {

        // config
        var defaults = {
            openedClass: Utils.classes.open,
            hasOpenedSublevelClass: 'has-' + Utils.classes.open,
            animatingClass: Utils.classes.animating,
            closeElemSelector: '[data-fn="dropdown-multilevel-close"]',
            excludedBodyElements: '[data-tg="dropdown-multilevel-excluded"]',
            scrollDuration: 100
        };

        options = $.extend( {}, defaults, options );

        // vars
        var openedElems = []; // remember opened elements
        var $elems = $( this );
        var $excludedElems = Utils.$targetElems.filter( options.excludedBodyElements );

        // functions
        $.fn._getTarget = function() {
            // gets target (li) defined by triggers target attribute or gets parent li as target
            var $this = $( this );
            var $target;
            if ( $this.attr( Utils.attributes.target ) ) {
                // has fn target attr
                var targetSelector = $this.attr( Utils.attributes.target );
                $target = ( Utils.$targetElems.filter( targetSelector ).lenght > 0 ) ? Utils.$targetElems.filter( targetSelector ) : $( targetSelector );
            }
            else {
                // parent
                $target = $this.parent( 'li' );
            }
            return $target;
        };
        $.fn._getList = function() {
            // gets relatet list (ul) using aria labelledby attribute (refers to trigger id)
            var $this = $( this );
            return $this._getTarget().find( '[aria-labelledby="' + $this.attr( 'id' ) + '"]' );
        };
        $.fn._getCloseElem = function() {
            // gets close link (must be placed within first list element)
            var $this = $( this );
            return $this._getList().children().fist().find( '[data-fn="dropdown-multilevel-close"]' );
        };
        $.fn._getParentList = function() {
            // gets parent ul to target (doesn’t have to be parent to trigger)
            var $this = $( this );
            return $this._getTarget().parent( 'ul' );
        };
        $.fn._openDropdown = function() {

            var $this = $( this );
            var $thisTarget = $this._getTarget();
            var $thisParentList = $this._getParentList();
            $thisTarget
                .addClass( options.openedClass )
                .setRemoveAnimationClass( options.animatingClass );
            $this.ariaExpanded( 'true' );
            $thisParentList
                // scroll up to keep opened sublevel in position
                .animate({ scrollTop: 0 }, options.scrollDuration, function() {
                    $( this ).addClass( options.hasOpenedSublevelClass );
                } );

            // remember
            openedElems.push( $this );
        };
        $.fn._closeDropdown = function() {

            var $this = $( this );
            var $thisTarget = $this._getTarget();
            var $thisParentList = $this._getParentList();
            $thisTarget
                .removeClass( options.openedClass )
                .setRemoveAnimationClass( options.animatingClass );
            $this.ariaExpanded( 'false' );
            $thisParentList.removeClass( options.hasOpenedSublevelClass );

            // remember
            openedElems.pop();
        };
        function _closeAllDropdowns() {

            // close from latest to earliest
            for ( var i = openedElems.length - 1; i >= 0; i-- ) {
                $( openedElems[ i ] )._closeDropdown();
            }

        };

        function _listenBodyWhileDropdownOpen( currentOpenedElems ) {

            Utils.$body.one( 'click.body', function( bodyEvent ) {

                var $bodyEventTarget = $( bodyEvent.target );

                // if dropdowns open
                if ( currentOpenedElems.length > 0 ) {

                    if ( $.inArray( $bodyEventTarget[ 0 ], $excludedElems ) == -1 ) {

                        var $currentLatestOpenedList = $( currentOpenedElems[ currentOpenedElems.length - 1 ] )._getList();

                        if ( $currentLatestOpenedList.children().children( options.closeElemSelector ).parent().has( $bodyEventTarget ).length > 0 ) {
                            // click on close button

                            // TODO: allow executing link if bigmenu deepest level shown but still has sublevels

                            bodyEvent.preventDefault();

                            // close current dropdown level
                            $( currentOpenedElems[ currentOpenedElems.length - 1 ] )._closeDropdown();

                            // create new close listener
                            _listenBodyWhileDropdownOpen( openedElems );
                        }
                        else if ( $currentLatestOpenedList.has( $bodyEventTarget ).length > 0 || $currentLatestOpenedList.is( $bodyEventTarget ) ) {
                            // click on opend list (event is inside list || event is list)

                            // create new close listener
                            _listenBodyWhileDropdownOpen( openedElems );
                        }
                        else if ( ! $currentLatestOpenedList.has( $bodyEventTarget ).length > 0 ) {
                            // click outside dropdowns

                            //close all
                            _closeAllDropdowns();
                        }

                    }
                    else {

                        // create new close listener
                        _listenBodyWhileDropdownOpen( openedElems );

                    }

                }

            } );

        }

        $elems.each( function() {

            var $elem = $(this);
            var targetSelector = $elem.attr( Utils.attributes.target ) || '';
            var $target = $elem._getTarget(); // ( targetSelector != '' ) ? $( targetSelector ) : $elem.parent();
            var $list = $elem._getList(); // $target.find( '[aria-labelledby="' + $elem.attr( 'id' ) + '"]' );

            $elem.on( 'click', function( event ) {

                if ( $target.length > 0 && $list.length > 0 ) {

                    // remove event listener if click on dropdown trigger since new event listener will be created after click
                    Utils.$body.off( 'click.body' );

                    // check if clicked on open dropdown trigger
                    var $eventTarget = $( event.target );
                    var $latestOpenedElem = $( openedElems[ openedElems.length - 1 ] );

                    if ( $latestOpenedElem.has( $eventTarget ).length > 0 || $latestOpenedElem.is( $eventTarget ) ) {

                        event.preventDefault();

                        // close current dropdown level
                        $( openedElems[ openedElems.length - 1 ] )._closeDropdown();

                        if ( openedElems.length > 0 ) {

                            // create new close listener
                            _listenBodyWhileDropdownOpen( openedElems );
                        }

                    }
                    else {

                        // check if do something (check visibility and position inside parent since might be visible but out of sight)
                        if ( ! $list.is( ':visible' ) || ! $list.elemPositionedInside( $target.parent() ) ) {

                            // show list, stop link execution
                            event.preventDefault();

                            // close opened dropdowns if not parents
                            if ( openedElems.length > 0 ) {

                                var $latestOpenedList = $( openedElems[ openedElems.length - 1 ] )._getList();

                                // check if clicked dropdown is inside or outside of already opened dropdown
                                if ( ! $latestOpenedList.has( $elem ).length > 0 ) {

                                    // click outside opened dropdown – close all
                                    _closeAllDropdowns();
                                }
                                else {
                                    // keep opened dropdowns
                                }

                            }

                            // open
                            $elem._openDropdown();

                            // check options, do any special taks?
                            var options;
                            if ( ( options = $elem.getOptionsFromAttr() ) ) {
                                if ( options.focusOnOpen ) {
                                    Utils.$targetElems.filter( options.focusOnOpen ).focus();
                                }
                            }

                            event.stopPropagation();

                            // create new close listener
                            _listenBodyWhileDropdownOpen( openedElems );

                        }
                        else {
                            // related list is already shown, do not open or close anything

                            // create new close listener
                            _listenBodyWhileDropdownOpen( openedElems );
                        }
                    }

                }

            } );

        } );

        // close all dropdowns on resize & orientationchange
        Utils.$window.on( 'orientationchange sizeChange', function() {
            _closeAllDropdowns();
        } );

    };

} )( jQuery, MY_UTILS );

/*
 * Lazy Load - jQuery plugin for lazy loading images
 *
 * Copyright (c) 2007-2013 Mika Tuupola
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   http://www.appelsiini.net/projects/lazyload
 *
 * Version:  1.9.3
 * 
 */

(function($, window, document, undefined) {
    var $window = $(window);
    var $document = $(document);

    $.fn.lazyload = function(options) {
        var elements = this;
        var $container;
        var settings = {
            threshold       : 0,
            failure_limit   : 0,
            event           : "scroll",
            effect          : "show",
            container       : window,
            data_attribute  : "original",
            skip_invisible  : true,
            appear          : null,
            load            : null,
            placeholder     : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAQAAAAnOwc2AAAAEUlEQVR42mN8958BAzAOZUEAmNwTTeAV+t4AAAAASUVORK5CYII="
        };

        function update() {
			
            var counter = 0;

            elements.each(function() {
                var $this = $(this);
                if (settings.skip_invisible && !$this.is(":visible")) {
                    return;
                }
                if ($.abovethetop(this, settings) ||
                    $.leftofbegin(this, settings)) {
                        /* Nothing. */
                } else if (!$.belowthefold(this, settings) &&
                    !$.rightoffold(this, settings)) {
                        $this.trigger("appear");
                        /* if we found an image we'll load, reset the counter */
                        counter = 0;
                } else {
                    if (++counter > settings.failure_limit) {
                        return false;
                    }
                }
            });

        }

        if(options) {
            /* Maintain BC for a couple of versions. */
            if (undefined !== options.failurelimit) {
                options.failure_limit = options.failurelimit;
                delete options.failurelimit;
            }
            if (undefined !== options.effectspeed) {
                options.effect_speed = options.effectspeed;
                delete options.effectspeed;
            }

            $.extend(settings, options);
        }

        /* Cache container as jQuery as object. */
        $container = (settings.container === undefined ||
                      settings.container === window) ? $window : $(settings.container);

        /* Fire one scroll event per scroll. Not one scroll event per image. */
        if (0 === settings.event.indexOf("scroll")) {
            $container.bind(settings.event, function() {
                return update();
            });
        }

        this.each(function() {
            var self = this;
            var $self = $(self);

            self.loaded = false;
			
			// resize function
			$.fn.resizeUnloadImg = function() {
				var $img = $( this );
				var origImgWidth = $img.attr( 'width' );
				var origImgHeight = $img.attr( 'height' );
				if ( !! origImgWidth && !! origImgHeight ) {
					// reset
					$img.css( { width: '', height: '' } );
					var cssImgWidth = parseInt( $img.css( 'width' ) );
					var calcImgWidth = origImgWidth;
					var calcImgHeight = origImgHeight;
					if ( cssImgWidth != origImgWidth ) {
						calcImgWidth = cssImgWidth;
						calcImgHeight = origImgHeight / origImgWidth * cssImgWidth;
					}
					// set
					$img.css( { width: calcImgWidth + 'px', height: calcImgHeight + 'px' } );
				}
			}

            /* If no src attribute given use data:uri. */
            if ( $self.is( 'img' ) && ! $self.attr( 'src' ) ) {
			
				/* custom adaption: set sizes to unload images after placeholder is set */
				
				$self				
					.one( 'load', function() {
				
						var origImgWidth = $self.attr( 'width' );
						var origImgHeight = $self.attr( 'height' );

						if ( !! origImgWidth && !! origImgHeight ) {

							// generate event id
							var eventId = $self.attr( 'data-' + settings.data_attribute ).replace(/[/.]/g, '_');

							// initial resize
							$self.resizeUnloadImg();

							// events for later resize

							// media sm, md, lg: resize on sizeChange
							$window.on( 'sizeChange.lazyloadUnload.' + eventId, function() {
								if ( ! self.loaded ) {
									$self.resizeUnloadImg();
								}
								else {
									// destroy resize event after loading
									$window.unbind( 'sizeChange.lazyloadUnload.' + eventId + ' resize.lazyloadUnload.' + eventId );
								}
							} );

							// media xs: resize on window resize
							$window.on( 'resize.lazyloadUnload.' + eventId, function() {
								if ( !! window.mediaSize && window.mediaSize == 'xs' ) {
									if ( ! self.loaded ) {
										$self.resizeUnloadImg();
									}
									else {
										// destroy resize event after loading
										$window.unbind( 'sizeChange.lazyloadUnload.' + eventId + ' resize.lazyloadUnload.' + eventId );
									}
								}
							} );

						}
						 
					} )
					.attr( 'src', settings.placeholder );
				
            }
			
			// if width and height given, do initial resize, handle resize events

            /* When appear is triggered load original image. */
            $self.one("appear", function() {
                if (!this.loaded) {
                    if (settings.appear) {
                        var elements_left = elements.length;
                        settings.appear.call(self, elements_left, settings);
                    }
                    $("<img>")
                        .bind("load", function() {

                            var original = $self.attr("data-" + settings.data_attribute);
                            if ($self.is("img")) {
                                $self.hide();
                                $self.attr("src", original);
                                $self.css( { width: '', height: '' } ); // custom adaption
                                $self[settings.effect](settings.effect_speed);
                            } else {
								var backgroundImage = $self.css("background-image");
                                $self.css( { backgroundImage: "url('" + original + "'), " + backgroundImage } ); // custom adaption: load new image and put it before old one without removing old one
                            }

                            self.loaded = true;
									 
                            /* Remove image from array so it is not looped next time. */
                            var temp = $.grep(elements, function(element) {
                                return !element.loaded;
                            });
                            elements = $(temp);

                            if (settings.load) {
                                var elements_left = elements.length;
                                settings.load.call(self, elements_left, settings);
                            }
						
                        })
                        .attr("src", $self.attr("data-" + settings.data_attribute));
					$self.trigger("loaded");
					
                }
            });

            /* When wanted event is triggered load original image */
            /* by triggering appear.                              */
            if (0 !== settings.event.indexOf("scroll")) {
                $self.bind(settings.event, function() {
                    if (!self.loaded) {
                        $self.trigger("appear");
                    }
                });
            }
        });

        /* Force initial check if images should appear. */
        $document.ready(function() {
            update();
        });
		//  custom adaption: update after fonts loaded
        $window.on( 'load resize', function() {
            update();
        } );

        return this;
    };

    /* Convenience methods in jQuery namespace.           */
    /* Use as  $.belowthefold(element, {threshold : 100, container : window}) */

    $.belowthefold = function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = (window.innerHeight ? window.innerHeight : $window.height()) + $window.scrollTop();
        } else {
            fold = $(settings.container).offset().top + $(settings.container).height();
        }

        return fold <= $(element).offset().top - settings.threshold;
    };

    $.rightoffold = function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = $window.width() + $window.scrollLeft();
        } else {
            fold = $(settings.container).offset().left + $(settings.container).width();
        }

        return fold <= $(element).offset().left - settings.threshold;
    };

    $.abovethetop = function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = $window.scrollTop();
        } else {
            fold = $(settings.container).offset().top;
        }

        return fold >= $(element).offset().top + settings.threshold  + $(element).height();
    };

    $.leftofbegin = function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = $window.scrollLeft();
        } else {
            fold = $(settings.container).offset().left;
        }

        return fold >= $(element).offset().left + settings.threshold + $(element).width();
    };

    $.inviewport = function(element, settings) {
         return !$.rightoffold(element, settings) && !$.leftofbegin(element, settings) &&
                !$.belowthefold(element, settings) && !$.abovethetop(element, settings);
    };

    /* Custom selectors for your convenience.   */
    /* Use as $("img:below-the-fold").something() or */
    /* $("img").filter(":below-the-fold").something() which is faster */

    $.extend($.expr[":"], {
        "below-the-fold" : function(a) { return $.belowthefold(a, {threshold : 0}); },
        "above-the-top"  : function(a) { return !$.belowthefold(a, {threshold : 0}); },
        "right-of-screen": function(a) { return $.rightoffold(a, {threshold : 0}); },
        "left-of-screen" : function(a) { return !$.rightoffold(a, {threshold : 0}); },
        "in-viewport"    : function(a) { return $.inviewport(a, {threshold : 0}); },
        /* Maintain BC for couple of versions. */
        "above-the-fold" : function(a) { return !$.belowthefold(a, {threshold : 0}); },
        "right-of-fold"  : function(a) { return $.rightoffold(a, {threshold : 0}); },
        "left-of-fold"   : function(a) { return !$.rightoffold(a, {threshold : 0}); }
    });

})(jQuery, window, document);

/*

<div data-fn="remote-event" data-fn-target="#id-1" data-fn-options="{ triggerEvent: 'click',  remoteEvent: 'click' }"></div>

*/

( function( $, Utils ) {

    $.fn.remoteEvent = function() {

        var $elems = $( this );

        $elems.each( function() {

            var $elem = $( this );
            var targetSelector = $elem.attr( Utils.attributes.target ) || '';
            var $target = ( Utils.$targetElems.filter( targetSelector ).lenght > 0 ) ? Utils.$targetElems.filter( targetSelector ) : $( targetSelector );
            var attrOptions = $elem.getOptionsFromAttr();
            var triggerEvent = attrOptions.triggerEvent || 'click';
            var remoteEvent = attrOptions.remoteEvent || 'click';

            $elem.on( triggerEvent, function() {
                if ( $target.length > 0 ) {
                    $target.trigger( remoteEvent );
                }
            } );

        } );

    };

} )( jQuery, MY_UTILS );
// simple slide toggle

// TODO: what about aria attributes?

(function( $, Utils ) {

    $.fn.simpleSlideToggle = function( options ) {

        var defaults = {
            effectIn: 'slideDown',
            effectOut: 'slideUp',
            effectDuration: 400,
            openedClass: Utils.classes.open,
            animatingClass: Utils.classes.animating,
            animatingInClass: Utils.classes.animatingIn,
            animatingOutClass: Utils.classes.animatingOut
        };

        options = $.extend( {}, defaults, options );

        var $elems = $( this );

        $elems.each( function() {

            var $elem = $( this );
            var $elemTrigger = $elem.find( options.triggerSelector );
            var $elemBody = $elem.find( options.bodySelector );

            // initial set closed
            if ( ! $elem.is( '.' + options.openedClass ) ) {
                $elemBody.css( { display: 'none' } );
            }

            // bind click event
            $elemTrigger.on( 'click', function() {

                if ( ! $elem.is( '.' + options.openedClass ) ) {
                    $elem
                        .addClass( options.animatingClass )
                        .addClass( options.animatingInClass );
                    $elemBody.stop()[ options.effectIn ]( options.effectDuration, function() {
                        $elem
                            .addClass( options.openedClass )
                            .removeClass( options.animatingClass )
                            .removeClass( options.animatingInClass );
                    } );
                }
                else {
                    $elem
                        .addClass( options.animatingClass )
                        .addClass( options.animatingOutClass )
                        .removeClass( options.openedClass );
                    $elemBody.stop()[ options.effectOut ]( options.effectDuration, function() {
                        $elem
                            .removeClass( options.animatingClass )
                            .removeClass( options.animatingOutClass );
                    } );
                }

            } );

        } );

    };

})( jQuery, MY_UTILS );
( function( $, Utils ) {

    // sticky container

    $.fn.stickyContainer = function( options ) {

        // TODO: check if below / above is static / fixed (static below causes collission sticky and above)

        var $elems = $( this );

        var defaults = {
            keepBelowSelector: '',
            keepAboveSelector: '',
            topDistance: 0,
            bottomDistance: 0,
            fixedClass: 'fixed',
            activeHashScrollToDistance: 30
        };

        options = $.extend( {}, defaults, options );

        var $above = ( Utils.$targetElems.filter( options.keepBelowSelector ).lenght > 0 ) ? Utils.$targetElems.filter( options.keepBelowSelector ) : $( options.keepBelowSelector );
        var $below = ( Utils.$targetElems.filter( options.keepAboveSelector ).lenght > 0 ) ? Utils.$targetElems.filter( options.keepAboveSelector ) : $( options.keepAboveSelector );

        var belowElementOffsetBottom;
        var aboveElementOffsetTop;
        var windowHeight;

        var refreshValuesWhileScrolling = false;

        // functions
        function _getValues() {
            windowHeight = Utils.$window.height();
            belowElementOffsetBottom = $above.offset().top + $above.outerHeight() + parseInt( $above.css( 'margin-bottom' ) ) || 0;
            aboveElementOffsetTop = $below.offset().top - parseInt( $below.css( 'margin-top' ) ) || windowHeight;
            if ( $above.css( 'position' ) == 'fixed' || $below.css( 'position' ) == 'fixed' ) {
                refreshValuesWhileScrolling = true;
            }
            else {
                refreshValuesWhileScrolling = false;
            }
        }
        $.fn._copyWidthFromParent = function() {
            $this = $( this );
            $thisParent = $this.parent();
            if ( $this.is( ':visible' ) ) {
                var paddingLeft = parseInt( $thisParent.css( 'padding-left' ) );
                var width = $thisParent.innerWidth() - paddingLeft - parseInt( $thisParent.css( 'padding-right' ) );
                var left = $thisParent.offset().left + paddingLeft;
                // to make safari happy set left too
                $this.css( { 
                    width: width + 'px',
                    left: left + 'px'
                } );
            }

        }

        if ( $elems.length > 0 ) {

            _getValues();

            $elems.each( function() {

                var $elem = $( this );
                var $elemInner = $elem.children().first();

                // set width
                $elem._copyWidthFromParent();

                // prepare positioning
                function _positionStickyContainer() {

                    // resize only if visible
                    if ( $elem.is( ':visible' ) ) {

                        // if $below or $above is fixes values will change while scrolling
                        if ( refreshValuesWhileScrolling ) {
                            _getValues();
                        }

                        var elemWrapperOffsetTop = $elem.parent().offset().top; // watch parent since fixed elem will never overlap $below
                        var elemInnerHeight = $elemInner.outerHeight();
                        var scrollTop = Utils.$document.scrollTop();

                        if (
                                elemWrapperOffsetTop > scrollTop // below window top
                                && elemWrapperOffsetTop > belowElementOffsetBottom // below $below
                                && elemWrapperOffsetTop + elemInnerHeight < windowHeight // above window bottom
                                && elemWrapperOffsetTop + elemInnerHeight < aboveElementOffsetTop // above $above
                            ) {

                            // static
                            $elem
                                .removeClass( options.fixedClass )
                                .css( { top: 'auto', bottom: 'auto' } );


                        }
                        else {

                            // fixed
                            var top = ( belowElementOffsetBottom - scrollTop + options.topDistance > 0 ) ? belowElementOffsetBottom - scrollTop + options.topDistance : 0;
                            var bottom = ( ( aboveElementOffsetTop - scrollTop ) + options.bottomDistance > windowHeight ) ? 0 : windowHeight - ( aboveElementOffsetTop - scrollTop ) + options.bottomDistance;

                            $elem
                                .addClass( options.fixedClass )
                                .css( { top: top, bottom: bottom } );

                        }

                        // reset after fonts load, resize
                        Utils.$window.on( 'load resize', function() {

                            _positionStickyContainer();

                        } );

                    }
                    
                }

                // do positioning
                _positionStickyContainer();

                // bind to scroll
                Utils.$window.on( 'scroll', function() {

                    _positionStickyContainer();

                } );

                // update values on resize, orientationchange
                Utils.$window.on( 'resize orientationchange', function() {
                    _getValues();
                    $elem._copyWidthFromParent();

                    _positionStickyContainer();
                } );

                // check for special options

                var attrOptions;

                // scroll active hash visible
                if ( ( attrOptions = $elem.getOptionsFromAttr() ) ) {
                    var hash = window.location.hash;
                    var $currentHashElem = $elemInner.find( 'a[href="' + hash + '"]' );

                    if ( !! hash && hash != '#' && $currentHashElem.length > 0 ) {
                        // check if $currentHashElem is in visible area of sticky container

                        var currentHashElemOffsetTop = $currentHashElem.offset().top;
                        var currentHashElemHeight = parseInt( $currentHashElem.outerHeight() );
                        var elemOffsetTop = $elem.offset().top;
                        var elemHeight = $elem.height();

                        if ( currentHashElemOffsetTop > elemOffsetTop + elemHeight ) {
                            // $currentHashElem not visible

                            var elemScrollTop = currentHashElemOffsetTop - elemOffsetTop - elemHeight + currentHashElemHeight + options.activeHashScrollToDistance;
                            $elem.scrollTop( elemScrollTop );

                        }

                    }
                }

            } );

        }

    }

    // /sticky container

} )( jQuery, MY_UTILS );
(function( $ ) {
    $.fn.submitOnChange = function() {

        var $elems = $( this );

        $elems.each( function() {

            var $elem = $( this );
            var $form = $elem.closest( 'form' );

            $elem.on( 'change', function() {
                $form.submit();
            } );

        } );
    }
})( jQuery );
( function( $, Utils ) {

    // to top
    $.fn.toggleToTopButton = function( options ) {

        $elem = $( this );

        var defaults = {
            threshold: 100,
            visibleClass: Utils.classes.open
        };

        options = $.extend( {}, defaults, options );
    
        function _positionToTopButton() {
            if ( Utils.$document.scrollTop() > 100 ) {
                if ( ! $elem.is( '.' + options.visibleClass ) ) {
                    $elem.addClass( options.visibleClass );
                }
            }
            else {
                if ( $elem.is( '.' + options.visibleClass ) ) {
                    $elem.removeClass( options.visibleClass );
                }
            }
        }

        // position
        _positionToTopButton()
        
        Utils.$window.on( 'scroll resize', function() {
            _positionToTopButton();
        });
    
    }
    // to top

} )( jQuery, MY_UTILS );
( function( $, Utils ) {

    $.fn.toggle = function() {

        var $elems = $( this );

        $elems.each( function() {

            var $elem = $( this );
            var targetSelector = $elem.attr( Utils.attributes.target ) || '';
            var $target = ( Utils.$targetElems.filter( targetSelector ).lenght > 0 ) ? Utils.$targetElems.filter( targetSelector ) : $( targetSelector );
            var openedClass = Utils.classes.open;
            var animatingClass = Utils.classes.animating;
            var transitionDuration = $target.getTransitionDuration();

            $elem.on( 'click', function() {
                if ( $target.length > 0 ) {

                    // toggle 'openedClass' & aria-expanded (use 'openedClass' to check visibility since element might be ':visible' but out of viewport)
                    if ( ! $target.is( '.' + openedClass ) ) {
                        $target.addClass( openedClass );
                        $elem.ariaExpanded( 'true' );
                    }
                    else {
                        $target.removeClass( openedClass );
                        $elem.ariaExpanded( 'false' );
                    }

                    // set & remove 'animatingClass'
                    $target.setRemoveAnimationClass( animatingClass );
                }
            } );

        } );

    };

} )( jQuery, MY_UTILS );
( function( $, Utils ) {

    // toggle
    Utils.$functionElems.filter( '[data-fn="toggle"]' ).toggle();

    // dropdown multilevel (e.g. main navigation lists)
    Utils.$functionElems.filter( '[data-fn="dropdown-multilevel"]' ).dropdownMultilevel();

    // remote event (e.g. main navigation backdrop)
    Utils.$functionElems.filter( '[data-fn="remote-event"]' ).remoteEvent();

    // submit
    Utils.$functionElems.filter( '[data-fn="submit-on-change"]' ).submitOnChange();

    // simple slide toggle (e.g. accordions)
    $( '[data-fn="accordion"]' ).simpleSlideToggle( {
        triggerSelector: '[data-fn="accordion-trigger"]',
        bodySelector: '[data-fn="accordion-content"]'
    } );

    // sticky container (e.g. scrollspy nav)
    Utils.$functionElems.filter( '[data-fn="sticky-container"]' ).stickyContainer( {
        keepBelowSelector: '[data-tg="sticky-container-below"]',
        keepAboveSelector: '[data-tg="sticky-container-above"]',
        topDistance: 1,
        bottomDistance: 16
    } );

    // init lazyload
    $.fn.initLazyload = function( options ) {

        var defaults = {
            effect: 'fadeIn',
            event: ( typeof Modernizr !== "undefined" && Modernizr.touchevents ) ? 'scroll touchmove' : 'scroll',
            data_attribute: 'src'
        };

        options = $.extend( {}, defaults, options );

        var $elems = $( this );

        $elems.each( function( i, image ) {

            var $image = $( image );

            if ( !! $image.attr( 'data-fn-effect' ) ) {
                options.effect = $image.attr( 'data-fn-effect' );
            }

            $image.lazyload( options );
            
        } );

    }

    // init
    Utils.$functionElems.filter( '[data-fn="lazyload"]' ).initLazyload();

    // /init lazyload

    // animated anchors
    $('a[href^="#"]:not([href="#"])').animatedAnchors( {
        offset: function() {
            return Utils.anchorOffsetTop;
        }
    } );

    // to top button wrapper
    Utils.$functionElems.filter( '[data-fn="to-top-wrapper"]' ).toggleToTopButton();

} )( jQuery, MY_UTILS );


//# sourceMappingURL=scripts.js.map
