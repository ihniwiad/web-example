( function( $ ) {
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
} )( jQuery );