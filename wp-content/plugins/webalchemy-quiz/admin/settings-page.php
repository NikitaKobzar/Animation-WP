<?php
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Регистрируем страницу настроек и сами опции.
 */

add_action('admin_menu', 'wa_quiz_register_settings_page');
add_action('admin_init', 'wa_quiz_register_settings');

/**
 * Страница "Налаштування → WebAlchemy Quiz".
 */
function wa_quiz_register_settings_page() {
    add_options_page(
        __('WebAlchemy Quiz', 'webalchemy-quiz'),
        __('WebAlchemy Quiz', 'webalchemy-quiz'),
        'manage_options',
        'wa-quiz-settings',
        'wa_quiz_render_settings_page'
    );
}

/**
 * Регистрация опций.
 */
function wa_quiz_register_settings() {
    // Общие настройки
    register_setting(
        'wa_quiz_settings_group',
        'wa_quiz_settings',
        [
            'type'              => 'array',
            'sanitize_callback' => 'wa_quiz_sanitize_settings',
            'default'           => [],
        ]
    );

    // JSON с шагами
    register_setting(
        'wa_quiz_settings_group',
        'wa_quiz_steps',
        [
            'type'              => 'string',
            'sanitize_callback' => 'wa_quiz_sanitize_steps',
            'default'           => '[]',
        ]
    );
}

/**
 * Санитайзер общих настроек.
 */
function wa_quiz_sanitize_settings($input) {
    $out = [];

    if (!is_array($input)) {
        $input = [];
    }

    $out['title']          = isset($input['title']) ? sanitize_text_field($input['title']) : '';
    $out['subtitle']       = isset($input['subtitle']) ? sanitize_text_field($input['subtitle']) : '';
    $out['cf7_form_id']    = isset($input['cf7_form_id']) ? sanitize_text_field($input['cf7_form_id']) : '';
    $out['cf7_form_title'] = isset($input['cf7_form_title']) ? sanitize_text_field($input['cf7_form_title']) : '';

    return $out;
}

/**
 * Санитайзер JSON шагов.
 */
function wa_quiz_sanitize_steps($value) {
    if (is_array($value)) {
        $decoded = $value;
    } else {
        $value = wp_unslash((string)$value);
        $value = trim($value);
        if ($value === '') {
            return '[]';
        }
        $decoded = json_decode($value, true);
    }

    if (!is_array($decoded)) {
        return '[]';
    }

    $steps = [];
    foreach ($decoded as $step) {
        if (!is_array($step)) {
            continue;
        }
        $type = isset($step['type']) ? $step['type'] : 'radio';
        if (!in_array($type, ['radio', 'checkbox', 'text'], true)) {
            $type = 'radio';
        }

        $steps[] = [
            'title'    => isset($step['title']) ? (string)$step['title'] : '',
            'subtitle' => isset($step['subtitle']) ? (string)$step['subtitle'] : '',
            'name'     => isset($step['name']) ? (string)$step['name'] : '',
            'type'     => $type,
            'options'  => wa_quiz_sanitize_options($step['options'] ?? []),
        ];
    }

    return wp_json_encode($steps);
}

function wa_quiz_sanitize_options($options) {
    if (!is_array($options)) {
        return [];
    }
    $out = [];
    foreach ($options as $opt) {
        if (!is_array($opt)) {
            continue;
        }
        $label = trim((string)($opt['label'] ?? ''));
        if ($label === '') {
            continue;
        }
        $value = trim((string)($opt['value'] ?? $label));
        $image = trim((string)($opt['image'] ?? ''));
        $out[] = [
            'label' => $label,
            'value' => $value,
            'image' => $image,
        ];
    }
    return $out;
}

/**
 * Дефолтные шаги — по твоему примеру (3 шага, структура как у тебя).
 * Тут они пустые по текстам, ты сам заполнишь в админке.
 */
function wa_quiz_get_default_steps(): array {
    return [
        [
            'title'    => '',
            'subtitle' => '',
            'name'     => 'question_1',
            'type'     => 'text',
            'options'  => [
                ['label' => '', 'value' => '', 'image' => ''],
                ['label' => '', 'value' => '', 'image' => ''],
            ],
        ],
        [
            'title'    => '',
            'subtitle' => '',
            'name'     => 'question_2',
            'type'     => 'radio',
            'options'  => [
                ['label' => '', 'value' => '', 'image' => ''],
                ['label' => '', 'value' => '', 'image' => ''],
                ['label' => '', 'value' => '', 'image' => ''],
                ['label' => '', 'value' => '', 'image' => ''],
                ['label' => '', 'value' => '', 'image' => ''],
                ['label' => '', 'value' => '', 'image' => ''],
            ],
        ],
        [
            'title'    => '',
            'subtitle' => '',
            'name'     => 'question_3',
            'type'     => 'text',
            'options'  => [],
        ],
    ];
}

/**
 * Рендер страницы настроек.
 */
function wa_quiz_render_settings_page() {
    if (!current_user_can('manage_options')) {
        return;
    }

    $settings = get_option('wa_quiz_settings', []);
    if (!is_array($settings)) {
        $settings = [];
    }

    $stored_steps = get_option('wa_quiz_steps', '');
    if (!is_string($stored_steps) || $stored_steps === '') {
        $stored_steps = wp_json_encode(wa_quiz_get_default_steps());
    }

    $title    = isset($settings['title']) ? $settings['title'] : '';
    $subtitle = isset($settings['subtitle']) ? $settings['subtitle'] : '';
    $cf7_id   = isset($settings['cf7_form_id']) ? $settings['cf7_form_id'] : '';
    $cf7_ttl  = isset($settings['cf7_form_title']) ? $settings['cf7_form_title'] : '';
    ?>
    <div class="wrap">
        <h1><?php esc_html_e('WebAlchemy Quiz – Налаштування опитувальника', 'webalchemy-quiz'); ?></h1>

        <form method="post" action="options.php" id="wa-quiz-settings-form">
            <?php
            settings_fields('wa_quiz_settings_group');
            ?>

            <h2 class="title">Заголовок модалки</h2>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="wa_quiz_title">Заголовок</label></th>
                    <td>
                        <input type="text"
                               id="wa_quiz_title"
                               name="wa_quiz_settings[title]"
                               class="regular-text"
                               value="<?php echo esc_attr($title); ?>">
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="wa_quiz_subtitle">Підзаголовок</label></th>
                    <td>
                        <input type="text"
                               id="wa_quiz_subtitle"
                               name="wa_quiz_settings[subtitle]"
                               class="regular-text"
                               value="<?php echo esc_attr($subtitle); ?>">
                    </td>
                </tr>
            </table>

            <h2 class="title">Contact Form 7</h2>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="wa_quiz_cf7_id">ID форми CF7</label></th>
                    <td>
                        <input type="text"
                               id="wa_quiz_cf7_id"
                               name="wa_quiz_settings[cf7_form_id]"
                               class="regular-text"
                               value="<?php echo esc_attr($cf7_id); ?>">
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="wa_quiz_cf7_title">Назва форми CF7</label></th>
                    <td>
                        <input type="text"
                               id="wa_quiz_cf7_title"
                               name="wa_quiz_settings[cf7_form_title]"
                               class="regular-text"
                               value="<?php echo esc_attr($cf7_ttl); ?>">
                    </td>
                </tr>
            </table>

            <h2 class="title">Кроки опитувальника</h2>
            <p class="description">
                Додайте кроки, оберіть тип відповіді, варіанти та (за потреби) зображення для кожного варіанту.
            </p>

            <div id="wa-quiz-steps-root" class="wa-quiz-steps-root"></div>

            <!-- сюда JS пишет актуальный JSON -->
            <textarea id="wa-quiz-steps-json"
                      name="wa_quiz_steps"
                      style="display:none;"><?php echo esc_textarea($stored_steps); ?></textarea>

            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}
