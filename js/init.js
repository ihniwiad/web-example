( function( $, Utils ) {

    // toggle (e.g. main navigation)
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

