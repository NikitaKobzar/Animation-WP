<?php
register_block_pattern('webalchemy/who-fit', [
 'title'=>'Блок: Кому підходить',
 'categories'=>['webalchemy'],
 'content'=> <<<'HTML'
<!-- wp:wa/section {"animation":"fade-in","extraClass":"who-fit"} -->
<!-- wp:heading {"textAlign":"center","level":2} --><h2 class="has-text-align-center">Для кого підійде цей роутер?</h2><!-- /wp:heading -->
<!-- wp:columns {"align":"wide"} -->
<div class="wp-block-columns alignwide">
  <!-- wp:column -->
  <div class="wp-block-column">
    <!-- wp:image {"sizeSlug":"large"} -->
    <figure class="wp-block-image size-large">
      <img src="https://via.placeholder.com/960x720" alt="Landscape"/>
    </figure>
    <!-- /wp:image -->
  </div>
  <!-- /wp:column -->

  <!-- wp:column -->
  <div class="wp-block-column">
    <!-- wp:paragraph --><p>Правий текстовий стовпчик...</p><!-- /wp:paragraph -->
  </div>
  <!-- /wp:column -->
</div>
<!-- /wp:columns -->
<!-- /wp:wa/section -->
HTML
]);
