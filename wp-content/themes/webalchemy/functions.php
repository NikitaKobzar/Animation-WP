<?php
require get_template_directory() . '/inc/setup.php';
require get_template_directory() . '/inc/plugin-activation.php';
require get_template_directory() . '/inc/helpers.php';


add_action('init', function () {
    add_action('wp_enqueue_scripts', function () {
        $style_custom_file = get_template_directory() . '/assets/css/main.css';
        $css_built = get_template_directory() . '/assets/dist/css/theme-style.min.css';
        $js_built  = get_template_directory() . '/assets/dist/js/main.min.js';

        if ( file_exists($css_built) ) {
            wp_enqueue_style(
                'webalchemy-theme',
                get_template_directory_uri() . '/assets/dist/css/theme-style.min.css',
                [],
                filemtime($css_built)
            );
        }

        wp_enqueue_style('main-style', get_template_directory_uri() . '/assets/css/main.css', [], filemtime($style_custom_file));

        wp_enqueue_script('jquery');

        wp_enqueue_style('swiper', 'https://unpkg.com/swiper/swiper-bundle.min.css', [], null);
        wp_enqueue_script('swiper', 'https://unpkg.com/swiper/swiper-bundle.min.js', [], null, true);

        if ( file_exists($js_built) ) {
            wp_enqueue_script(
                'bz-main-js',
                get_template_directory_uri() . '/assets/dist/js/main.min.js',
                ['jquery','swiper'],
                filemtime($js_built),
                true
            );
        }
    }, 20);
});

// Временная подсветка появления секций: добавляет .is-inview при прокрутке
add_action('wp_footer', function(){ ?>
    <script>
        (function(){
            const els = document.querySelectorAll('.wa-section[data-wa-anim]');
            if (!('IntersectionObserver' in window) || !els.length) return;
            const io = new IntersectionObserver((entries)=>{
                entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('is-inview'); }});
            }, { threshold: 0.18 });
            els.forEach(el=> io.observe(el));
        })();
    </script>
<?php }, 22);

add_action('after_setup_theme', function () {
    load_theme_textdomain('webalchemy', get_template_directory() . '/languages');
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('editor-styles');
    add_theme_support('align-wide');
    add_theme_support('wp-block-styles');
    register_nav_menus(['primary' => 'Головне меню']);
});

// категория паттернов для темы
add_action('init', function () {
    register_block_pattern_category('webalchemy', ['label' => 'WebAlchemy']);
});

if (function_exists('acf_add_options_page')) {
    acf_add_options_page([
        'page_title' => 'Параметри теми',
        'menu_title' => 'Параметри теми',
        'menu_slug' => 'acf-options',
        'capability' => 'edit_theme_options',
        'redirect' => false
    ]);
}

// Панель настроек темы
add_action('admin_menu', function () {
    add_theme_page('Настройки темы', 'Настройки темы', 'edit_theme_options', 'theme-settings', 'theme_settings_page');
});

function theme_settings_page()
{
    ?>
    <div class="wrap">
        <h1>Настройки темы</h1>
        <form method="post" action="options.php">
            <?php
            settings_fields('theme_settings');
            do_settings_sections('theme-settings');
            submit_button();
            ?>
        </form>
    </div>
    <?php
}


add_action('admin_init', function () {
    register_setting('theme_settings', 'theme_options');

    add_settings_section('general_styles', 'Общие стили', null, 'theme-settings');

    $opt = get_option('theme_options');
    $google_fonts = [
        'Inter', 'Roboto', 'Lato', 'Open Sans', 'Oswald', 'Poppins', 'Raleway', 'Montserrat', 'Playfair Display', 'Merriweather'
    ];

    // Вспомогательная функция рендера селектора
    $render_font_select = function ($id, $label) use ($opt, $google_fonts) {
        echo '<select name="theme_options[' . esc_attr($id) . ']" style="width:300px">';
        echo '<option value="">-- Выберите шрифт --</option>';
        foreach ($google_fonts as $font) {
            $selected = ($opt[$id] ?? '') === $font ? 'selected' : '';
            echo '<option value="' . esc_attr($font) . '" ' . $selected . '>' . esc_html($font) . '</option>';
        }
        echo '</select>';
    };

    add_settings_field('font_heading', 'Шрифт заголовков (h1–h6)', fn() => $render_font_select('font_heading', 'Заголовки'), 'theme-settings', 'general_styles');
    add_settings_field('font_body', 'Шрифт основного текста', fn() => $render_font_select('font_body', 'Текст'), 'theme-settings', 'general_styles');
    add_settings_field('font_button', 'Шрифт кнопок', fn() => $render_font_select('font_button', 'Кнопки'), 'theme-settings', 'general_styles');

    add_settings_field('font_size', 'Размер шрифта (px)', function () {
        $opt = get_option('theme_options');
        echo '<input type="number" name="theme_options[font_size]" value="' . esc_attr($opt['font_size'] ?? 16) . '">';
    }, 'theme-settings', 'general_styles');

    add_settings_field('main_color', 'Цвет текста', function () {
        $opt = get_option('theme_options');
        echo '<input type="color" name="theme_options[main_color]" value="' . esc_attr($opt['main_color'] ?? '#000000') . '">';
    }, 'theme-settings', 'general_styles');

    add_settings_field('background_section', 'Фон секций', function () {
        $opt = get_option('theme_options');
        echo '<input type="color" name="theme_options[background_section]" value="' . esc_attr($opt['background_section'] ?? '#ffffff') . '">';
    }, 'theme-settings', 'general_styles');

    add_settings_field('button_color', 'Фон кнопок', function () {
        $opt = get_option('theme_options');
        echo '<input type="color" name="theme_options[button_color]" value="' . esc_attr($opt['button_color'] ?? '#0073aa') . '">';
    }, 'theme-settings', 'general_styles');

    add_settings_field('button_hover', 'Фон кнопок при наведении', function () {
        $opt = get_option('theme_options');
        echo '<input type="color" name="theme_options[button_hover]" value="' . esc_attr($opt['button_hover'] ?? '#005177') . '">';
    }, 'theme-settings', 'general_styles');

    // Секция «Контакты»
    add_settings_section(
        'contacts_section',
        'Контакты и график работы',
        function () {
            echo '<p>Телефоны и расписание</p>';
        },
        'theme-settings'
    );
    add_settings_field(
        'phone_1',
        'Телефон 1',
        function () {
            $opt = get_option('theme_options');
            printf(
                '<input type="text" name="theme_options[phone_1]" value="%s" />',
                esc_attr($opt['phone_1'] ?? '')
            );
        },
        'theme-settings',
        'contacts_section'
    );
    add_settings_field(
        'phone_2',
        'Телефон 2',
        function () {
            $opt = get_option('theme_options');
            printf(
                '<input type="text" name="theme_options[phone_2]" value="%s" />',
                esc_attr($opt['phone_2'] ?? '')
            );
        },
        'theme-settings',
        'contacts_section'
    );
    add_settings_field(
        'work_schedule',
        'Графік роботи',
        function () {
            $opt = get_option('theme_options');
            printf(
                '<textarea name="theme_options[work_schedule]" rows="4" cols="40">%s</textarea>',
                esc_textarea($opt['work_schedule'] ?? '')
            );
        },
        'theme-settings',
        'contacts_section'
    );
});

// Подключение Google Fonts по выбранным опциям
add_action('wp_head', function () {
    $opt = get_option('theme_options');
    $fonts = array_filter([
        $opt['font_heading'] ?? '',
        $opt['font_body'] ?? '',
        $opt['font_button'] ?? '',
    ]);
    $fonts = array_unique($fonts);
    foreach ($fonts as $font) {
        $encoded = str_replace(' ', '+', $font);
        echo '<link href="https://fonts.googleapis.com/css2?family=' . esc_attr($encoded) . '&display=swap" rel="stylesheet">';
    }
});

// Генерация CSS на лету
add_action('wp_head', function () {
    $opt = get_option('theme_options');
    ?>
    <style>
        body {
            font-family: <?= esc_attr($opt['font_body'] ?? 'inherit') ?>;
            font-size: <?= esc_attr($opt['font_size'] ?? 16) ?>px;
            color: <?= esc_attr($opt['main_color'] ?? '#000') ?>;
        }

        h1, h2, h3, h4, h5, h6 {
            font-family: <?= esc_attr($opt['font_heading'] ?? 'inherit') ?>;
        }

        button, .btn {
            font-family: <?= esc_attr($opt['font_button'] ?? 'inherit') ?>;
            background: <?= esc_attr($opt['button_color'] ?? '#0073aa') ?>;
        }

        button:hover, .btn:hover {
            background: <?= esc_attr($opt['button_hover'] ?? '#005177') ?>;
        }

        section {
            background: <?= esc_attr($opt['background_section'] ?? '#fff') ?>;
        }
    </style>
    <?php
}, 99);
