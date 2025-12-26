<?php
register_block_pattern(
    'webalchemy/hero-product',
    [
        'title'      => 'Hero: продукт + слайдер',
        'categories' => ['webalchemy'],
        'content'    => <<<HTML
<!-- wp:wa/section {"extraClass":"wa-hero-fold"} -->
<!-- wp:columns {"align":"wide","className":"wa-hero"} -->
<div class="wp-block-columns alignwide wa-hero">

    <!-- wp:column {"width":"55%","className":"wa-hero-left"} -->
    <div class="wp-block-column wa-hero-left" style="flex-basis:55%">
        <!-- wp:wa/slider /-->
    </div>
    <!-- /wp:column -->

    <!-- wp:column {"width":"45%","className":"wa-hero-right"} -->
    <div class="wp-block-column wa-hero-right" style="flex-basis:45%">
        <!-- wp:heading {"level":2} -->
        <h2>4G/3G-комплект покращений PRO</h2>
        <!-- /wp:heading -->

        <!-- wp:paragraph -->
        <p>Для отримання доступу до швидкого інтернету в умовах відсутності стільникового зв'язку та електроенергії.</p>
        <!-- /wp:paragraph -->

        <!-- wp:heading {"level":3} -->
        <h3>5225 грн</h3>
        <!-- /wp:heading -->

        <!-- wp:paragraph -->
        <p>Товар в наявності</p>
        <!-- /wp:paragraph -->

        <!-- wp:buttons -->
        <div class="wp-block-buttons">
            <!-- wp:button {"backgroundColor":"vivid-cyan-blue"} -->
            <div class="wp-block-button">
                <a class="wp-block-button__link has-vivid-cyan-blue-background-color has-background">
                    Купити
                </a>
            </div>
            <!-- /wp:button -->

            <!-- wp:button {"className":"is-style-outline"} -->
            <div class="wp-block-button is-style-outline">
                <a class="wp-block-button__link">
                    Чи вистачить мені цієї моделі?
                </a>
            </div>
            <!-- /wp:button -->
        </div>
        <!-- /wp:buttons -->
    </div>
    <!-- /wp:column -->

</div>
<!-- /wp:columns -->
<!-- /wp:wa/section -->
HTML
    ]
);
