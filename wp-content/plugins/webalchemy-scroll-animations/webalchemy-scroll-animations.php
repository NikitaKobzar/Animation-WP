<?php
/**
 * Plugin Name: WebAlchemy Scroll Animations
 * Description: Набор JS анимаций скролла и появления блоков для темы webalchemy.
 * Version: 1.0.0
 * Author: Kobzar Nikita
 * Text Domain: webalchemy-scroll-animations
 */

if (!defined('ABSPATH')) {
    exit;
}

class WebAlchemy_Scroll_Animations {
    const OPTION_KEY = 'wa_scroll_animations_settings';

    public function __construct() {
        add_action('admin_menu', [$this, 'register_settings_page']);
        add_action('admin_init', [$this, 'register_settings']);

        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);

        // На всякий: можно дать глобальный хелпер для PHP-рендера блоков
        add_filter('wa_scroll_animations_map', [$this, 'default_animations_map']);
    }

    public function register_settings_page() {
        add_options_page(
            __('WebAlchemy Animations', 'webalchemy-scroll-animations'),
            __('WebAlchemy Animations', 'webalchemy-scroll-animations'),
            'manage_options',
            'wa-scroll-animations',
            [$this, 'render_settings_page']
        );
    }

    public function register_settings() {
        register_setting(
            'wa_scroll_animations_group',
            self::OPTION_KEY,
            [
                'type' => 'array',
                'sanitize_callback' => [$this, 'sanitize_settings'],
                'default' => []
            ]
        );

        add_settings_section(
            'wa_scroll_animations_main',
            __('Global animations', 'webalchemy-scroll-animations'),
            '__return_false',
            'wa_scroll_animations_group'
        );

        $fields = $this->get_animations_list();

        foreach ($fields as $key => $label) {
            add_settings_field(
                $key,
                esc_html($label),
                [$this, 'render_checkbox_field'],
                'wa_scroll_animations_group',
                'wa_scroll_animations_main',
                [
                    'key' => $key,
                ]
            );
        }
    }

    public function sanitize_settings($input) {
        $out = [];
        $fields = $this->get_animations_list();
        foreach ($fields as $key => $_label) {
            $out[$key] = !empty($input[$key]) ? 1 : 0;
        }
        return $out;
    }

    protected function get_animations_list(): array {
        return [
            'enable_reveal_children'   => 'Плавное появление дочерних блоков при скролле',
            'enable_section_snap'      => 'Снэп-скролл по секциям (fullpage-подобный)',
            'enable_horizontal_cards'  => 'Вертикальный→горизонтальный скролл для карточек',
            'enable_misc_effects'      => 'Дополнительные скролл-анимации (параллакс и т.п.)',
        ];
    }

    public function render_checkbox_field($args) {
        $key = $args['key'];
        $options = get_option(self::OPTION_KEY, []);
        $val = !empty($options[$key]) ? 1 : 0;
        ?>
        <label>
            <input type="checkbox" name="<?php echo esc_attr(self::OPTION_KEY . '[' . $key . ']'); ?>"
                   value="1" <?php checked(1, $val); ?>>
        </label>
        <?php
    }

    public function render_settings_page() {
        ?>
        <div class="wrap">
            <h1>WebAlchemy Scroll Animations</h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('wa_scroll_animations_group');
                do_settings_sections('wa_scroll_animations_group');
                submit_button();
                ?>
            </form>
        </div>
        <?php
    }

    public function enqueue_assets() {
        if (is_admin()) {
            return;
        }

        $plugin_url = plugin_dir_url(__FILE__);
        $plugin_path = plugin_dir_path(__FILE__);

        $js_path = $plugin_path . 'assets/js/wa-scroll-animations.js';

        $js_ver = file_exists($js_path) ? filemtime($js_path) : '1.0.0';

        wp_enqueue_script(
            'wa-scroll-animations',
            $plugin_url . 'assets/js/wa-scroll-animations.js',
            [],
            $js_ver,
            true
        );

        $settings = get_option(self::OPTION_KEY, []);

        wp_add_inline_script(
            'wa-scroll-animations',
            'window.WA_SCROLL_ANIMATIONS_SETTINGS = ' . wp_json_encode($settings) . ';',
            'before'
        );
    }

    /**
     * Карта ID анимаций -> описание.
     * Можно использовать в PHP при рендере блоков (для селекта и т.п.).
     */
    public function default_animations_map($map) {
        $defaults = [
            'reveal-children'      => 'Появление дочерних элементов при скролле',
            'section-snap'         => 'Снэп-скролл по секциям',
            'horizontal-cards'     => 'Горизонтальный скролл карточек',
            'horizontal-stack'     => 'horizontal-stack',
            'parallax-soft'        => 'Лёгкий параллакс по скроллу',
        ];

        return array_merge($defaults, is_array($map) ? $map : []);
    }
}

new WebAlchemy_Scroll_Animations();
