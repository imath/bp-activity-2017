<?php
/**
 * BuddyPress - Activity Post Form
 *
 * @package BP Activity 2017
 */

if ( bp_is_active( 'groups' ) ) {
	?>
	<div id="message" class="error">
		<p><?php esc_html_e( 'Pas de support pour les groupes BuddyPress, dsl !', 'bp-activity-2017' ); ?></p>
		<p><?php esc_html_e( 'Changez de thème, ou désactivez le composant des groupes.', 'bp-activity-2017' ); ?></p>
	</div>
	<?php
	return;
}
?>

<form action="<?php bp_activity_post_form_action(); ?>" method="post" id="whats-new-form" name="whats-new-form">

	<div id="whats-new-avatar">
		<a href="<?php echo bp_loggedin_user_domain(); ?>">
			<?php bp_loggedin_user_avatar( 'width=' . bp_core_avatar_thumb_width() . '&height=' . bp_core_avatar_thumb_height() ); ?>
		</a>
	</div>

	<p class="activity-greeting"><?php printf( __( "Quoi de neuf, %s ?", 'bp-activity-2017' ), bp_get_user_firstname( bp_get_loggedin_user_fullname() ) );
	?></p>

	<div id="whats-new-content">
		<div id="whats-new-textarea">
			<label for="whats-new" class="bp-screen-reader-text"><?php
				/* translators: accessibility text */
				_e( 'Publiez de vos nouvelles', 'bp-activity-2017' );
			?></label>

			<?php
			/**
			 * Here comes the Activity Rich Editor!
			 */
			bp_activity_2017_editor() ; ?>

		</div>

		<div id="what-is-new-options">
			<div id="what-is-new-submit">
				<input type="submit" class="button" name="aw-whats-new-submit" id="aw-what-is-new-submit" value="<?php esc_attr_e( 'Publier', 'bp-activity-2017' ); ?>" />
			</div>
		</div><!-- #whats-new-options -->
	</div><!-- #whats-new-content -->

	<?php wp_nonce_field( 'post_update', '_wpnonce_post_update' ); ?>

</form><!-- #whats-new-form -->
