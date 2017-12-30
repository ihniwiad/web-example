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