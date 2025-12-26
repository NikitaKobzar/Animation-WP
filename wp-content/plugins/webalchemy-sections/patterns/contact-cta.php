<?php
register_block_pattern(
    'webalchemy/contact-cta',
    [
        'title'      => 'Контактна форма BozzLife',
        'categories' => ['webalchemy'],
        'content'    => <<<'HTML'
<!-- wp:wa/section {"extraClass":"wa-contact"} -->
<!-- wp:columns {"align":"wide","className":"wa-contact-top"} -->
<div class="wp-block-columns alignwide wa-contact-top">
  <!-- wp:column {"width":"60%"} -->
  <div class="wp-block-column" style="flex-basis:60%">
    <!-- wp:heading {"level":2} -->
    <h2>Не переймайтесь за підключення, ми все налаштуємо за вас</h2>
    <!-- /wp:heading -->
  </div>
  <!-- /wp:column -->

  <!-- wp:column {"width":"40%"} -->
  <div class="wp-block-column" style="flex-basis:40%">
    <!-- wp:paragraph -->
    <p>Наші рішення працюють з коробки, у випадку якщо вагаєтесь – на протязі 30 днів ви можете повернути комплект.</p>
    <!-- /wp:paragraph -->
  </div>
  <!-- /wp:column -->
</div>
<!-- /wp:columns -->

<!-- wp:columns {"align":"wide","className":"wa-contact-bottom"} -->
<div class="wp-block-columns alignwide wa-contact-bottom">
  <!-- wp:column -->
  <div class="wp-block-column">
    <!-- wp:group {"className":"wa-contact-card"} -->
    <div class="wp-block-group wa-contact-card">
      <!-- wp:shortcode -->
      [contact-form-7 id="37746ff" title="BozzLife CTA"]
      <!-- /wp:shortcode -->
    </div>
    <!-- /wp:group -->
  </div>
  <!-- /wp:column -->

  <!-- wp:column {"className":"wa-contact-info"} -->
  <div class="wp-block-column wa-contact-info">
    <!-- wp:paragraph -->
    <p>38 063 22 66 031<br>38 099 10 90 039<br>38 067 400 68 79</p>
    <!-- /wp:paragraph -->

    <!-- wp:image {"sizeSlug":"full","className":"wa-contact-logo"} -->
    <figure class="wp-block-image size-full wa-contact-logo">
      <!-- сюда руками в редакторе подставишь логотип bozzlife -->
    </figure>
    <!-- /wp:image -->

    <!-- wp:paragraph {"className":"wa-contact-note"} -->
    <p>Обмін, повернення та гарантія</p>
    <!-- /wp:paragraph -->

    <!-- wp:paragraph {"className":"wa-contact-small"} -->
    <p>Використання матеріалів BozzLife дозволено лише за попередньою згодою правовласників. Права на зображення, відео та тексти належать авторам.</p>
    <!-- /wp:paragraph -->
  </div>
  <!-- /wp:column -->
</div>
<!-- /wp:columns -->
<!-- /wp:wa/section -->
HTML
    ]
);
