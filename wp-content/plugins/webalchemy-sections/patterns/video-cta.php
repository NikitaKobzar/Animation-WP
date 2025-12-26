<?php
register_block_pattern('webalchemy/video-cta', [
    'title'=>'Відео + CTA',
    'categories'=>['webalchemy'],
    'content'=> <<<'HTML'
<!-- wp:wa/section {"animation":"fade-in","extraClass":"video-cta"} -->
<!-- wp:heading {"textAlign":"center","level":2} --><h2 class="has-text-align-center">Чому більше 18000 клієнтів обрали саме нас?</h2><!-- /wp:heading -->

<!-- wp:embed {"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ","type":"video","providerNameSlug":"youtube","align":"wide"} -->
<figure class="wp-block-embed alignwide is-type-video is-provider-youtube wp-block-embed-youtube">
  <div class="wp-block-embed__wrapper">
  https://www.youtube.com/watch?v=dQw4w9WgXcQ
  </div>
</figure>
<!-- /wp:embed -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-buttons">
  <!-- wp:button --><div class="wp-block-button"><a class="wp-block-button__link">Чи зможемо ми надати тобі якісний інтернет?</a></div><!-- /wp:button -->
</div>
<!-- /wp:buttons -->
<!-- /wp:wa/section -->
HTML
]);
