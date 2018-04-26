<?php
/**
 * BuddyPress custom functions.
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

 /**
 * Register and enqueue custom styles & fonts.
 */
function bp_activity_2017_enqueue_styles() {
	if ( ! function_exists( 'bp_get_theme_compat_id' ) ) {
		return;
	}

	$template_pack = bp_get_theme_compat_id();

	// Register the TwentySeventeen stylesheet to use it as a dependency.
	wp_register_style( 'parent-style', get_template_directory_uri() . '/style.css' );

	// Enqueue the Child theme's stylesheet.
	wp_enqueue_style(
		'child-style',
		get_stylesheet_directory_uri() . '/css/activity.css',
		array( 'parent-style' ),
		''
	);

	$deps = array();
	if ( 'legacy' === $template_pack ) {
		$deps = array( 'bp-legacy-js' );
	} else {
		$deps = array( 'bp-nouveau-activity-post-form' );
	}

	wp_register_script(
		'bp-activity-2017-editor',
		get_stylesheet_directory_uri() . '/js/script.js',
		$deps,
		'1.0.0',
		true
	);

	wp_localize_script( 'bp-activity-2017-editor', 'bpActivity2017Editor', array(
		'ajaxurl'   => bp_core_ajax_url(),
		'view'      => __( 'Afficher', 'bp-activity-2017' ),
		'nocontent' => __( 'Merci de bien vouloir publier quelque chose !', 'bp-activity-2017' ),
	) );
}
add_action( 'wp_enqueue_scripts', 'bp_activity_2017_enqueue_styles' );

/**
 * Customize the available buttons for the Activity rich editor.
 *
 * @param  array  $buttons The editor's buttons list.
 * @return array           The editor's buttons list.
 */
function bp_activity_2017_editor_buttons( $buttons = array() ) {
	// Remove some buttons
	$buttons = array_diff( $buttons, array(
		'wp_more',
		'spellchecker',
		'wp_adv',
		'fullscreen',
		'alignleft',
		'alignright',
		'aligncenter',
		'formatselect',
		'blockquote',
	) );

	// Add the image one.
	array_push( $buttons, 'image' );

	return $buttons;
}

/**
 * Include paragraphs to allowed tags.
 *
 * @param  array  $allowed_tags The Activity allowed tags.
 * @return array                The Activity allowed tags.
 */
function bp_activity_2017_allowed_tags( $allowed_tags = array() ) {
	$allowed_tags['p'] = true;

	return $allowed_tags;
}
add_filter( 'bp_activity_allowed_tags', 'bp_activity_2017_allowed_tags', 10, 1 );

/**
 * Only allow image attachments to be queried.
 *
 * @param  array  $args The Ajax query attachments arguments.
 * @return array        The Ajax query attachments arguments.
 */
function bp_activity_2017_query_attachments_args( $args = array() ) {
	if ( bp_is_activity_component() ) {
		$args['post_mime_type'] = 'image';
	}

	return $args;
}
add_filter( 'ajax_query_attachments_args', 'bp_activity_2017_query_attachments_args', 10, 1 );

/**
 * Restrict queriable types to images.
 *
 * @param  array  $mimes The available types for query.
 * @return array         The available types for query.
 */
function bp_activity_2017_mime_types( $types = array() ) {
	return array_diff_key( $types, array( 'video' => false, 'audio' => false ) );
}

/**
 * Restrict Upload mime types to images.
 *
 * @param  array  $mimes The available mime types for upload.
 * @return array         The available mime types for upload.
 */
function bp_activity_2017_upload_mimes( $mimes = array() ) {
	return array_intersect_key( $mimes, array(
		'jpg|jpeg|jpe' => true,
		'gif'          => true,
		'png'          => true,
	) );
}

/**
 * The Activity rich editor !
 */
function bp_activity_2017_editor() {
	$args = array(
		'textarea_name' => 'whats-new',
		'wpautop'       => true,
		'media_buttons' => true,
		'editor_class'  => 'bp-suggestions',
		'textarea_rows' => 10,
		'teeny'         => false,
		'dfw'           => false,
		'tinymce'       => true,
		'quicktags'     => false
	);

	$content = '';
	if ( isset( $_GET['r'] ) ) {
		$content = '@' . esc_textarea( $_GET['r'] );
	}

	// Enqueue our custom Editor script
	wp_enqueue_script( 'bp-activity-2017-editor' );

	// Temporarly filters to restrict the Activity editor
	add_filter( 'mce_buttons', 'bp_activity_2017_editor_buttons', 10, 1 );
	add_filter( 'post_mime_types', 'bp_activity_2017_mime_types', 10, 1 );
	add_filter( 'upload_mimes', 'bp_activity_2017_upload_mimes', 10, 1 );

	wp_editor( $content, 'what-is-new', $args );

	// Stop filtering the editor.
	remove_filter( 'mce_buttons', 'bp_activity_2017_editor_buttons', 10, 1 );
	remove_filter( 'post_mime_types', 'bp_activity_2017_mime_types', 10, 1 );
	remove_filter( 'upload_mimes', 'bp_activity_2017_upload_mimes', 10, 1 );
}

/**
 * Load translations...
 */
function bp_activity_2017_load_textdomain() {
	load_theme_textdomain( 'bp-activity-2017', get_stylesheet_directory() . '/languages' );
}
add_action( 'after_setup_theme', 'bp_activity_2017_load_textdomain' );
