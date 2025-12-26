<?php
require_once get_template_directory() . '/inc/class-tgm-plugin-activation.php';

add_action('tgmpa_register', 'register_required_plugins');
function register_required_plugins() {
    $plugins = array(
        array('name' => 'Advanced Custom Fields', 'slug' => 'advanced-custom-fields', 'required' => true),
        array('name' => 'Contact Form 7', 'slug' => 'contact-form-7', 'required' => false),
//        array('name' => 'WooCommerce', 'slug' => 'woocommerce', 'required' => true),
//        array('name' => 'TI WooCommerce Wishlist', 'slug' => 'ti-woocommerce-wishlist', 'required' => false),
//        array('name' => 'TH Product Compare', 'slug' => 'th-product-compare', 'required' => false),
//        array('name' => 'WooCommerce Supplier Manager', 'slug' => 'woocommerce-supplier-manager',
//              'source' => get_template_directory() . '/plugins/woocommerce-supplier-manager.zip',
//              'required' => false),
//        array('name' => 'Supplier Sync', 'slug' => 'supplier-sync',
//              'source' => get_template_directory() . '/plugins/supplier-sync.zip',
//              'required' => false),
//        array('name' => 'Seamless Slider', 'slug' => 'seamless-slider',
//            'source' => get_template_directory() . '/plugins/seamless-slider.zip',
//            'required' => false),
//        array('name' => 'Custom Footer Script Editor', 'slug' => 'custom-footer-script-editor',
//            'source' => get_template_directory() . '/plugins/custom-footer-script-editor.zip',
//            'required' => false),
//        array('name' => 'Conditional Footer Scripts', 'slug' => 'conditional-footer-scripts',
//            'source' => get_template_directory() . '/plugins/conditional-footer-scripts.zip',
//            'required' => false),
    );
    $config = array(
        'id' => 'custom-woo',
        'menu' => 'tgmpa-install-plugins',
        'has_notices' => true,
        'dismissable' => false,
        'is_automatic' => true,
    );
    tgmpa($plugins, $config);
}
?>
