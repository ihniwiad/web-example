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