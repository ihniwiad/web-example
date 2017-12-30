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