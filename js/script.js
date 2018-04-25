/* Activity rich editor script */
( function( $ ) {

	if ( 'undefined' === typeof bpActivity2017Editor.ajaxurl ) {
		return;
	}

	$( document ).on( 'tinymce-editor-init', function( event, editor ) {
		var ActivityEditor = editor;

		// Make sure the BP mention autocomplete feature is inited.
		if ( 'undefined' !== typeof window.bp.mentions.tinyMCEinit ) {
			window.bp.mentions.tinyMCEinit();
		}

		$( '#aw-what-is-new-submit' ).on( 'click', function( e ) {
			e.preventDefault();

			var content = ActivityEditor.getContent(), button = $( e.currentTarget ),
				form = button.closest( 'form#whats-new-form' ), last_date_recorded = 0,
				post_data, firstrow, timestamp;

			if ( ! content ) {
				form.prepend( $( '<div></div>' ).html( $( '<p></p>' ).html( bpActivity2017Editor.nocontent ) )
												.addClass( 'error' )
												.prop( 'id', 'message' )
				);
				return false;
			}

			$( 'div.error' ).remove();
			button.addClass( 'loading' );
			button.prop( 'disabled', true );
			form.addClass( 'submitted' );

			firstrow = $( '#buddypress ul.activity-list li' ).first();
			activity_row = firstrow;
			timestamp = null;

			// Checks if at least one activity exists
			if ( firstrow.length ) {

				if ( activity_row.hasClass( 'load-newest' ) ) {
					activity_row = firstrow.next();
				}

				timestamp = activity_row.prop( 'class' ).match( /date-recorded-([0-9]+)/ );
			}

			if ( timestamp ) {
				last_date_recorded = timestamp[1];
			}

			ActivityEditor.setContent( '' );

			$.post( bpActivity2017Editor.ajaxurl, {
				'action': 'post_update',
				'cookie': bp_get_cookies(),
				'_wpnonce_post_update': $( '#_wpnonce_post_update' ).val(),
				'content': content,
				'since': last_date_recorded,
				'_bp_as_nonce': $('#_bp_as_nonce').val() || ''
			}, function( response ) {
				button.removeClass( 'loading' );
				button.prop( 'disabled', false );
				form.removeClass( 'submitted' );

				// Failed.
				if ( response[0] + response[1] === '-1' ) {
					form.prepend( response.substr( 2, response.length ) );
					$( '#' + form.prop( 'id' ) + ' div.error' ).hide().fadeIn( 200 );

					// Restore content.
					ActivityEditor.setContent( content );

				// Success.
				} else {
					if ( 0 === $( 'ul.activity-list' ).length ) {
						$( 'div.error' ).slideUp( 100 ).remove();
						$( '#message' ).slideUp( 100 ).remove();
						$( 'div.activity' ).append( '<ul id="activity-stream" class="activity-list item-list">' );
					}

					if ( firstrow.hasClass( 'load-newest' ) ) {
						firstrow.remove();
					}

					$( '#activity-stream' ).prepend( response );

					if ( ! last_date_recorded ) {
						$('#activity-stream li:first').addClass( 'new-update just-posted' );
					}

					if ( 0 !== $( '#latest-update' ).length ) {
						var l = $( '#activity-stream li.new-update .activity-content .activity-inner p' ).html(),
							v = $( '#activity-stream li.new-update .activity-content .activity-header p a.view' ).attr( 'href' ),
							ltext = $( '#activity-stream li.new-update .activity-content .activity-inner p' ).text(),
							u = '';

						if ( ltext !== '' ) {
							u = l + ' ';
						}

						u += '<a href="' + v + '" rel="nofollow">' + bpActivity2017Editor.view + '</a>';

						$( '#latest-update' ).slideUp( 300, function() {
							$( '#latest-update' ).html( u );
							$( '#latest-update' ).slideDown( 300 );
						} );
					}

					$( 'li.new-update').hide().slideDown( 300 );
					$( 'li.new-update').removeClass( 'new-update' );
					form.get( 0 ).reset();

					// reset vars to get newest activities
					newest_activities = '';
					activity_last_recorded  = 0;
				}
			} );
		} );
	} );

} )( jQuery );
