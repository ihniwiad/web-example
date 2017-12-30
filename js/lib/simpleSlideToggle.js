// simple slide toggle

// TODO: what about aria attributes?

( function( $, Utils ) {

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

} )( jQuery, MY_UTILS );