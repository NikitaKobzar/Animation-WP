<?php

add_action( 'after_setup_theme', function() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('woocommerce');
    add_theme_support('custom-logo', [
        'height'      => 80,
        'width'       => 200,
        'flex-height' => true,
        'flex-width'  => true,
    ]);
    // Регистрируем три локации для меню
    register_nav_menus([
        'header_menu'        => 'Header Menu (шапка)',
        'footer_menu_left'   => 'Footer Menu Left (футер слева)',
        'footer_menu_right'  => 'Footer Menu Right (футер справа)',
    ]);
});

// 1. Разрешаем загрузку .ico
add_filter( 'upload_mimes', function( $mimes ) {
    $mimes['ico'] = 'image/x-icon';
    return $mimes;
} );

// 2. Чиним строгую проверку типа файла (WP 5.8+)
add_filter( 'wp_check_filetype_and_ext', function( $data, $file, $filename, $mimes ) {

    $ext = strtolower( pathinfo( $filename, PATHINFO_EXTENSION ) );

    if ( $ext === 'ico' ) {
        $data['ext']  = 'ico';
        $data['type'] = 'image/x-icon';
    }

    return $data;
}, 10, 4 );
