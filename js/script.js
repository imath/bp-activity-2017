/* Activity rich editor script */
( function( $, bp ) {

	if ( 'undefined' === typeof bpActivity2017Editor.ajaxurl ) {
		return;
	}

	$( document ).on( 'tinymce-editor-init', function( event, editor ) {
		var ActivityEditor = editor;

		// Make sure the BP mention autocomplete feature is inited.
		if ( 'undefined' !== typeof window.bp.mentions.tinyMCEinit ) {
			window.bp.mentions.tinyMCEinit();
		}

		ActivityEditor.on( 'focus', function( e ) {
			$( e.target.formElement ).removeClass( 'minimized' );
		} );

		ActivityEditor.on( 'blur', function( e ) {
			if ( !! ActivityEditor.getContent() ) {
				return e;
			}

			$( e.target.formElement ).addClass( 'minimized' );
		} );

		$( '#aw-what-is-new-submit' ).on( 'click', function( e ) {
			e.preventDefault();

			var resetForm = function( button, form ) {
				button.removeClass( 'loading' );
				button.prop( 'disabled', false );
				form.removeClass( 'submitted' );
			};

			var displayFeedback = function( form, message, type ) {
				$( '#' + form.prop( 'id' ) ).prepend(
					$( '<div></div>' ).addClass( type )
									  .html( $( '<p></p>').html( message ) )
									  .prop( 'id', 'message' )
				);

				$( '#' + form.prop( 'id' ) + ' div.' + type ).hide().fadeIn( 200 );
			};

			var content = ActivityEditor.getContent(), button = $( e.currentTarget ),
				form = button.closest( 'form#whats-new-form' ), last_date_recorded = 0,
				post_data, firstrow, timestamp, bpCookies;

			if ( ! content ) {
				form.prepend( $( '<div></div>' ).html( $( '<p></p>' ).html( bpActivity2017Editor.nocontent ) )
												.addClass( 'error' )
												.prop( 'id', 'message' )
				);
				return false;
			}

			// The Nouveau  template pack is not using cookies anymore
			if ( 'undefined' !== typeof window.bp_get_cookies ) {
				bpCookies = bp_get_cookies();
			}

			$.each( form.find( '.error' ), function( i, div ) {
				div.remove();
			} );

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

			var postData = {
				'action': 'post_update',
				'_wpnonce_post_update': $( '#_wpnonce_post_update' ).val(),
				'content': content,
				'since': last_date_recorded,
				'_bp_as_nonce': $('#_bp_as_nonce').val() || ''
			};

			if ( bpCookies ) {
				postData = $.extend( postData, { 'cookie': bpCookies } );
			} else if ( 'undefined' !== typeof BP_Nouveau.activity.params ) {
				postData = $.extend( postData, {
					'_wpnonce_post_update': BP_Nouveau.activity.params.post_nonce,
					'object': 'user'
				} );
			}

			if ( 'undefined' !== typeof bp.ajax ) {
				$.each( form.find( '.published' ), function( i, div ) {
					div.remove();
				} );

				bp.ajax.post( 'post_update', postData ).done( function( response ) {
					// Do not add an activity twice.
					if ( $( '#activity-' + response.id  ).length ) {
						return;
					}

					if ( ! response.is_directory || 'all' !== bp.Nouveau.getStorage( 'bp-activity', 'scope' ) ) {
						displayFeedback( form, response.message, 'published' );

					// Inject the activity into the stream.
					} else {
						// If the container is not there, add it.
						if ( ! $( '#activity-stream ul.activity-list').length ) {
							$( '#activity-stream' ).html(  $( '<ul></ul>' ).addClass( 'activity-list item-list bp-list' ) );
						}

						bp.Nouveau.inject( '#activity-stream ul.activity-list', response.activity, 'prepend' );
					}

					resetForm( button, form );
					form.addClass( 'minimized' );

				} ).fail( function( response ) {
					displayFeedback( form, response.message, 'error' );

					// Restore content.
					ActivityEditor.setContent( content );
					resetForm( button, form );
				} );
			} else {
				$.post( bpActivity2017Editor.ajaxurl, postData, function( response ) {
					resetForm( button, form );

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
						form.addClass( 'minimized' );

						// reset vars to get newest activities
						newest_activities = '';
						activity_last_recorded  = 0;
					}
				} );
			}
		} );
	} );

	// Listen to Media Button click to disable the WP Media Editor Menu.
	$( document ).on( 'click.add-media-button', '.insert-media', function() {
		$( 'body' ).find( '.media-frame' ).addClass( 'hide-menu' );
	} );

} )( jQuery, window.bp || {} );
