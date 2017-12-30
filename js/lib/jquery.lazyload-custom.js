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
            placeholder     : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAQAAAC0NkA6AAAALklEQVR42u3NMQEAAAgDoC2G/YuawcMPCtBM3lUikUgkEolEIpFIJBKJRCKR3CwjqQUVkFI2GQAAAABJRU5ErkJggg=="
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

							// resize on sizeChange event
							$window.on( 'sizeChange.lazyloadUnload.' + eventId, function() {
								if ( ! self.loaded ) {
									$self.resizeUnloadImg();
								}
								else {
									// destroy resize event after loading
									$window.unbind( 'sizeChange.lazyloadUnload.' + eventId + ' resize.lazyloadUnload.' + eventId );
								}
							} );

							// media xs only: resize on window resize event
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
