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
            options:    'data-fn-options'
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

    // aria
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