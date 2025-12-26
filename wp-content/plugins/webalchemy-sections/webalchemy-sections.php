<?php
/**
 * Plugin Name: WebAlchemy Sections
 * Description: Конструктор секцій: обгортка з анімаціями + набір валідних патернів.
 * Author: Kobzar Nikita
 * Version: 0.1.3
 * Text Domain: webalchemy
 */
defined('ABSPATH') || exit;

add_action('init', function () {
    // editor script
    wp_register_script(
        'wa-sections-editor',
        plugins_url('blocks/section/edit.js', __FILE__),
        ['wp-blocks','wp-element','wp-components','wp-block-editor','wp-i18n'],
        filemtime(__DIR__ . '/blocks/section/edit.js'),
        true
    );

    foreach (['slider','product-cards','zigzag'] as $b) {
        wp_register_script(
            "wa-{$b}-editor",
            plugins_url("blocks/{$b}/edit.js", __FILE__),
            ['wp-blocks','wp-element','wp-components','wp-block-editor','wp-i18n'],
            filemtime(__DIR__."/blocks/{$b}/edit.js"),
            true
        );
    }

    // Swiper для слайдера
    wp_register_style(
        'wa-swiper',
        'https://unpkg.com/swiper/swiper-bundle.min.css',
        [],
        null
    );
    wp_register_script(
        'wa-swiper',
        'https://unpkg.com/swiper/swiper-bundle.min.js',
        [],
        null,
        true
    );

    /** SLIDER **/
    register_block_type(__DIR__.'/blocks/slider', [
        'editor_script'   => 'wa-slider-editor',
        'style'           => 'wa-elements',
        'render_callback' => function($attrs){
            $ids = isset($attrs['ids']) && is_array($attrs['ids']) ? array_map('intval',$attrs['ids']) : [];
            if (!$ids) return '';
            $anim       = empty($attrs['animation'])  ? '' : ' wa-anim-'.sanitize_title($attrs['animation']);
            $extra      = empty($attrs['extraClass']) ? '' : ' '.sanitize_html_class($attrs['extraClass']);
            $animTarget = empty($attrs['animTarget']) ? '' : sanitize_html_class($attrs['animTarget']);

            $data = '';
            if (!empty($attrs['animation'])) {
                $data .= ' data-wa-anim="'.esc_attr($attrs['animation']).'"';
            }
            if ($animTarget !== '') {
                $data .= ' data-wa-anim-target="'.esc_attr($animTarget).'"';
            }

            wp_enqueue_style('wa-swiper');
            wp_enqueue_script('wa-swiper');
            wp_enqueue_style('wa-elements');
            wp_enqueue_script(
                'wa-slider-frontend',
                plugins_url('assets/js/slider-frontend.js', __FILE__),
                ['wa-swiper'],
                filemtime(__DIR__.'/assets/js/slider-frontend.js'),
                true
            );

            $slides = '';
            foreach ($ids as $id) {
                $src = wp_get_attachment_image_url($id, 'large');
                if (!$src) continue;
                $alt = get_post_meta($id, '_wp_attachment_image_alt', true);
                $slides .= '<div class="swiper-slide"><img src="'.esc_url($src).'" alt="'.esc_attr($alt).'"></div>';
            }

            $opts = [
                'loop'     => !empty($attrs['loop']),
                'autoplay' => max(0, intval($attrs['autoplay'] ?? 0)),
                'speed'    => max(100, intval($attrs['speed'] ?? 600)),
            ];
            $json = esc_attr(json_encode($opts));

            return '<div class="wa-slider'.$anim.$extra.'"'.$data.' data-wa-slider="'.$json.'">'.
                '<div class="wa-section__inner">'.
                '<div class="swiper"><div class="swiper-wrapper">'.$slides.'</div>'.
                '<div class="swiper-button-prev"></div><div class="swiper-button-next"></div>'.
                '<div class="swiper-pagination"></div>'.
                '</div>'.
                '</div>'.
                '</div>';
        },
    ]);

    /** PRODUCT CARDS **/
    register_block_type(__DIR__.'/blocks/product-cards', [
        'editor_script'   => 'wa-product-cards-editor',
        'style'           => 'wa-elements',
        'render_callback' => function($attrs,$content){
            $anim       = empty($attrs['animation'])  ? '' : ' wa-anim-'.sanitize_title($attrs['animation']);
            $extra      = empty($attrs['extraClass']) ? '' : ' '.sanitize_html_class($attrs['extraClass']);
            $animTarget = empty($attrs['animTarget']) ? '' : sanitize_html_class($attrs['animTarget']);

            $data = '';
            if (!empty($attrs['animation'])) {
                $data .= ' data-wa-anim="'.esc_attr($attrs['animation']).'"';
            }
            if ($animTarget !== '') {
                $data .= ' data-wa-anim-target="'.esc_attr($animTarget).'"';
            }

            wp_enqueue_style('wa-elements');
            return '<section class="wa-section wa-product-cards'.$anim.$extra.'"'.$data.'><div class="wa-section__inner">'.$content.'</div></section>';
        },
    ]);

    /** ZIGZAG **/
    register_block_type(__DIR__.'/blocks/zigzag', [
        'editor_script'   => 'wa-zigzag-editor',
        'style'           => 'wa-elements',
        'render_callback' => function($attrs,$content){
            $anim       = empty($attrs['animation'])  ? '' : ' wa-anim-'.sanitize_title($attrs['animation']);
            $extra      = empty($attrs['extraClass']) ? '' : ' '.sanitize_html_class($attrs['extraClass']);
            $animTarget = empty($attrs['animTarget']) ? '' : sanitize_html_class($attrs['animTarget']);

            $data = '';
            if (!empty($attrs['animation'])) {
                $data .= ' data-wa-anim="'.esc_attr($attrs['animation']).'"';
            }
            if ($animTarget !== '') {
                $data .= ' data-wa-anim-target="'.esc_attr($animTarget).'"';
            }

            wp_enqueue_style('wa-elements');

            return '<section class="wa-section wa-zigzag'.$anim.$extra.'"'.$data.'>'.
                '<div class="wa-section__inner">'.$content.'</div></section>';
        },
    ]);

    wp_register_script(
        'wa-feature-panel-editor',
        plugins_url('blocks/feature-panel/edit.js', __FILE__),
        ['wp-blocks','wp-element','wp-components','wp-block-editor'],
        filemtime(__DIR__.'/blocks/feature-panel/edit.js'),
        true
    );

    add_action('enqueue_block_editor_assets', function () {
        wp_enqueue_script(
            'wa-anim-controls',
            plugins_url('blocks/anim-controls.js', __FILE__),
            ['wp-blocks','wp-element','wp-components','wp-block-editor','wp-compose','wp-hooks','wp-i18n'],
            filemtime(__DIR__ . '/blocks/anim-controls.js'),
            true
        );
    });

    register_block_type(__DIR__.'/blocks/feature-panel', [
        'editor_script'   => 'wa-feature-panel-editor',
        'style'           => 'wa-elements', // твой общий css плагина
        'render_callback' => function($attrs, $content){
            $title   = trim($attrs['rightTitle'] ?? '');
            $sub     = trim($attrs['rightSubtitle'] ?? '');
            $rows    = is_array($attrs['rows'] ?? null) ? $attrs['rows'] : [];
            $anim       = empty($attrs['animation'])  ? '' : ' wa-anim-'.sanitize_title($attrs['animation']);
            $extra      = empty($attrs['extraClass']) ? '' : ' '.sanitize_html_class($attrs['extraClass']);
            $animTarget = empty($attrs['animTarget']) ? '' : sanitize_html_class($attrs['animTarget']);

            $data = '';
            if (!empty($attrs['animation'])) {
                $data .= ' data-wa-anim="'.esc_attr($attrs['animation']).'"';
            }
            if ($animTarget !== '') {
                $data .= ' data-wa-anim-target="'.esc_attr($animTarget).'"';
            }

            // правая панель
            $right  = '<aside class="wa-fp-right">';
            if ($title || $sub){
                $right .= '<div class="wa-fp-header">'.
                    ($title ? '<div class="wa-fp-title">'.esc_html($title).'</div>' : '').
                    ($sub   ? '<div class="wa-fp-subtitle">'.esc_html($sub).'</div>' : '').
                    '</div>';
            }
            foreach ($rows as $r){
                $rowTitle = isset($r['title']) ? wp_kses_post($r['title']) : '';
                $opts     = isset($r['options']) && is_array($r['options']) ? $r['options'] : [];
                $right   .= '<div class="wa-fp-row">';
                if ($rowTitle){ $right .= '<div class="wa-fp-row-title">'.esc_html($rowTitle).'</div>'; }
                if ($opts){
                    $right .= '<div class="wa-fp-options">';
                    foreach ($opts as $o){
                        $txt = trim(wp_strip_all_tags((string)$o));
                        if ($txt==='') continue;
                        $right .= '<button type="button" class="wa-opt" aria-pressed="false">'.esc_html($txt).'</button>';
                    }
                    $right .= '</div>';
                }
                $right .= '</div>';
            }
            $right .= '</aside>';

            // левая колонка — контент редактора
            $left = '<div class="wa-fp-left">'.$content.'</div>';

            return '<section class="wa-section wa-feature-panel'.$anim.$extra.'"'.$data.'>'.
                '<div class="wa-section__inner wa-fp">'.
                $left.$right.
                '</div>'.
                '</section>';
        },
    ]);

    // регистрируем БЕЗ "render" в block.json — только тут, колбэком
    register_block_type(__DIR__ . '/blocks/section', [
        'editor_script'   => 'wa-sections-editor',
        'render_callback' => function ($attrs, $content) {
            $anim       = empty($attrs['animation'])  ? '' : ' wa-anim-'.sanitize_title($attrs['animation']);
            $extra      = empty($attrs['extraClass']) ? '' : ' '.sanitize_html_class($attrs['extraClass']);
            $animTarget = empty($attrs['animTarget']) ? '' : sanitize_html_class($attrs['animTarget']);

            $data = '';
            if (!empty($attrs['animation'])) {
                $data .= ' data-wa-anim="'.esc_attr($attrs['animation']).'"';
            }
            if ($animTarget !== '') {
                $data .= ' data-wa-anim-target="'.esc_attr($animTarget).'"';
            }

            // $content уже содержит сериализованные дочерние блоки
            return '<section class="wa-section'.$anim.$extra.'"'.$data.'>'
                .   '<div class="wa-section__inner">'.$content.'</div>'
                . '</section>';
        },
        // важно для корректной работы inner blocks
        'uses_context'    => [],
        'provides_context'=> [],
        'supports'        => ['html' => false],
    ]);

    // категория + паттерны
    register_block_pattern_category('webalchemy', ['label' => 'WebAlchemy']);
    foreach (glob(__DIR__ . '/patterns/*.php') as $f) require $f;
});