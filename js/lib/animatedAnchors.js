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