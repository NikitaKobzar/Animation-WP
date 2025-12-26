<?php
$opt = get_option( 'theme_options' );
?>
</main>

<footer class="site-footer">
    <div class="footer-inner">

        <div class="footer-col footer-col--brand">
            <?php if ( has_custom_logo() ) {
                the_custom_logo();
            } else { ?>
                <div class="footer-site-name"><?php bloginfo( 'name' ); ?></div>
            <?php } ?>

            <p class="footer-copy">
                © <?php echo date( 'Y' ); ?> BozzLife
            </p>
        </div>

        <div class="footer-col footer-col--nav">
            <?php
            wp_nav_menu( [
                'theme_location' => 'primary',
                'container'      => false,
                'menu_class'     => 'footer-menu',
                'fallback_cb'    => '__return_empty_string',
            ] );
            ?>
        </div>

        <div class="footer-col footer-col--contacts">
            <?php if ( ! empty( $opt['phone_1'] ) ) : ?>
                <div class="footer-phone"><?php echo esc_html( $opt['phone_1'] ); ?></div>
            <?php endif; ?>

            <?php if ( ! empty( $opt['phone_2'] ) ) : ?>
                <div class="footer-phone"><?php echo esc_html( $opt['phone_2'] ); ?></div>
            <?php endif; ?>

            <?php if ( ! empty( $opt['work_schedule'] ) ) : ?>
                <div class="footer-schedule">
                    <?php echo nl2br( esc_html( $opt['work_schedule'] ) ); ?>
                </div>
            <?php endif; ?>
        </div>

    </div>

    <div class="footer-bottom">
        <p class="footer-legal">
            Використання матеріалів BozzLife дозволено лише за попередньою згодою правовласника.
            Права на зображення, відео та тексти належать авторові.
        </p>
    </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
