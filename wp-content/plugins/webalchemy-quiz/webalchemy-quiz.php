<?php
/**
 * Plugin Name: WebAlchemy Quiz
 * Description: Кроковий модальний опитувальник з інтеграцією в Contact Form 7.
 * Version: 1.0.0
 * Author: Kobzar Nikita
 * Text Domain: webalchemy-quiz
 */

if ( ! defined('ABSPATH')) {
    exit;
}

// Подключаем админскую страницу настроек
require_once __DIR__ . '/admin/settings-page.php';

class WebAlchemy_Quiz {

    const OPTION_STEPS    = 'wa_quiz_steps';      // JSON-строка с массивом шагов
    const OPTION_SETTINGS = 'wa_quiz_settings';   // массив общих настроек (title, subtitle, cf7 и т.д.)

    public function __construct() {
        // Админские скрипты
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);

        // Фронтовые скрипты/стили
        add_action('wp_enqueue_scripts', [$this, 'enqueue_public_assets']);

        // Шорткод модалки
        add_shortcode('wa_quiz', [$this, 'render_quiz_shortcode']);
    }

    /* =========================== HELPERS =========================== */

    /**
     * Получить массив шагов (для админки/фронта).
     */
    public function get_steps_array(): array {
        $raw = get_option(self::OPTION_STEPS, '');
        if (!is_string($raw) || $raw === '') {
            return wa_quiz_get_default_steps();
        }
        $decoded = json_decode($raw, true);
        if (!is_array($decoded)) {
            return wa_quiz_get_default_steps();
        }
        return $decoded;
    }

    /**
     * Получить массив общих настроек (title, subtitle, cf7_form_id, cf7_form_title).
     */
    public function get_settings(): array {
        $settings = get_option(self::OPTION_SETTINGS, []);
        return is_array($settings) ? $settings : [];
    }

    /* ========================= ADMIN ASSETS ======================== */

    public function enqueue_admin_assets($hook) {
        // страница настроек, заданная в settings-page.php
        if ($hook !== 'settings_page_wa-quiz-settings') {
            return;
        }

        $base_url  = plugin_dir_url(__FILE__);
        $base_path = plugin_dir_path(__FILE__);


        // JS
        wp_enqueue_script(
            'wa-quiz-admin',
            $base_url . 'admin/wa-quiz-admin.js',
            ['jquery'],
            file_exists($base_path . 'admin/wa-quiz-admin.js') ? filemtime($base_path . 'admin/wa-quiz-admin.js') : '1.0.0',
            true
        );

        // Прокидываем шаги в JS в виде массива
        $steps = $this->get_steps_array();

        wp_localize_script(
            'wa-quiz-admin',
            'WA_QUIZ_ADMIN',
            [
                'steps' => $steps,
            ]
        );
    }

    /* ======================== PUBLIC ASSETS ======================== */

    public function enqueue_public_assets() {
        $base_url  = plugin_dir_url(__FILE__);
        $base_path = plugin_dir_path(__FILE__);

        // JS
        wp_enqueue_script(
            'wa-quiz',
            $base_url . 'public/wa-quiz.js',
            ['jquery'],
            file_exists($base_path . 'public/wa-quiz.js') ? filemtime($base_path . 'public/wa-quiz.js') : '1.0.0',
            true
        );

        $steps    = $this->get_steps_array();
        $settings = $this->get_settings();

        wp_localize_script(
            'wa-quiz',
            'WA_QUIZ_DATA',
            [
                'steps'    => $steps,
                'settings' => $settings,
            ]
        );
    }

    /* =========================== SHORTCODE ========================= */

    /**
     * [wa_quiz] — вывод модального окна.
     * Клик по .js-open-quiz откроет модалку.
     */
    public function render_quiz_shortcode($atts) {
        $settings = $this->get_settings();

        $title    = isset($settings['title']) ? $settings['title'] : 'Підібрати комплект під ваші задачі';
        $subtitle = isset($settings['subtitle']) ? $settings['subtitle'] : 'Відповідайте на кілька запитань, а ми зберемо рішення під вас.';
        $cf7_id   = isset($settings['cf7_form_id']) ? $settings['cf7_form_id'] : '';
        $cf7_ttl  = isset($settings['cf7_form_title']) ? $settings['cf7_form_title'] : '';

        ob_start();
        ?>
        <div class="wa-quiz-modal" data-wa-quiz-modal>
            <div class="wa-quiz-backdrop" data-wa-quiz-close></div>

            <div class="wa-quiz-dialog">
                <button type="button" class="wa-quiz-close" data-wa-quiz-close>&times;</button>

                <div class="wa-quiz-header">
                    <h2 class="wa-quiz-title"><?php echo esc_html($title); ?></h2>
                    <?php if (!empty($subtitle)) : ?>
                        <p class="wa-quiz-subtitle"><?php echo esc_html($subtitle); ?></p>
                    <?php endif; ?>
                </div>

                <div class="wa-quiz-body">
                    <div class="wa-quiz-steps" data-wa-quiz-steps></div>

                    <div class="wa-quiz-footer">
                        <button type="button" class="wa-quiz-prev" data-wa-quiz-prev>Назад</button>
                        <button type="button" class="wa-quiz-next" data-wa-quiz-next>Далі</button>
                    </div>
                </div>

                <div class="wa-quiz-form-wrapper" data-wa-quiz-form>
                    <?php if ($cf7_id) : ?>
                        <?php
                        // Вставляем CF7-форму
                        echo do_shortcode(
                            sprintf(
                                '[contact-form-7 id="%s" title="%s"]',
                                esc_attr($cf7_id),
                                esc_attr($cf7_ttl)
                            )
                        );
                        ?>
                    <?php else: ?>
                        <p>Будь ласка, вкажіть ID форми CF7 у налаштуваннях WebAlchemy Quiz.</p>
                    <?php endif; ?>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
}

new WebAlchemy_Quiz();
