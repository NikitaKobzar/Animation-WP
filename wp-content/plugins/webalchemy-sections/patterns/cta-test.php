<?php
register_block_pattern(
    'webalchemy/cta-test-banner',
    [
        'title'      => 'CTA: пройти тест',
        'categories' => ['webalchemy'],
        'content'    => <<<'HTML'
<!-- wp:wa/section {"extraClass":"cta-test alignwide","animation":"fade-up"} -->
<!-- wp:cover {"dimRatio":0,"isDark":true,"className":"cta-test__cover"} -->
<div class="wp-block-cover is-light cta-test__cover">
    <span aria-hidden="true" class="wp-block-cover__background"></span>
    <div class="wp-block-cover__inner-container">
        <!-- wp:buttons {"className":"cta-test__buttons"} -->
        <div class="wp-block-buttons cta-test__buttons">
            <!-- wp:button {"className":"cta-test__btn"} -->
            <div class="wp-block-button cta-test__btn">
                <a class="wp-block-button__link wp-element-button wa-open-quiz" data-target="#wa-quiz-modal" href="#bozz-test-modal">
                    Пройти тест
                </a>
            </div>
            <!-- /wp:button -->
        </div>
        <!-- /wp:buttons -->
    </div>
</div>
<!-- /wp:cover -->
<!-- /wp:wa/section -->
HTML
    ]
);
