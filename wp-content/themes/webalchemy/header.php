<!doctype html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<header class="site-header">
    <div class="header-inner">

        <div class="header-left">
            <?php if ( has_custom_logo() ) {
                the_custom_logo();
            } else { ?>
                <a class="site-title" href="<?php echo home_url('/'); ?>">
                    <?php bloginfo('name'); ?>
                </a>
            <?php } ?>
        </div>

        <nav class="header-menu">
            <?php
            wp_nav_menu([
                'theme_location' => 'primary',
                'container'      => false,
                'menu_class'     => 'main-nav',
                'fallback_cb'    => false,
            ]);
            ?>
        </nav>

        <div class="header-right">
            <a class="btn btn-primary" href="#callback">Зворотній дзвінок</a>
        </div>

    </div>
</header>

<main id="main" class="site-main">