<?php
register_block_pattern('webalchemy/why-pro', [
 'title'=>'Блок: Чому PRO підходить',
 'categories'=>['webalchemy'],
 'content'=> <<<'HTML'
<!-- wp:wa/section {"animation":"sticky-scroll","extraClass":"why-pro"} -->
<!-- wp:heading {"level":3} --><h3>Чому комплект покращений PRO підходить навіть де не ловить зв'язок?</h3><!-- /wp:heading -->
<!-- wp:columns {"align":"wide"} -->
<div class="wp-block-columns alignwide">
  <!-- wp:column -->
  <div class="wp-block-column">
    <!-- wp:image {"sizeSlug":"large"} -->
    <figure class="wp-block-image size-large">
      <img src="https://via.placeholder.com/1200x900" alt="Antenna"/>
    </figure>
    <!-- /wp:image -->
  </div>
  <!-- /wp:column -->

  <!-- wp:column -->
  <div class="wp-block-column">
    <!-- wp:group {"className":"specs-grid"} -->
    <div class="wp-block-group specs-grid">
      <!-- wp:heading {"level":4} --><h4>300Мб/с</h4><!-- /wp:heading -->
      <!-- wp:paragraph --><p>Одночасних користувачів: 32</p><!-- /wp:paragraph -->
    </div>
    <!-- /wp:group -->
  </div>
  <!-- /wp:column -->
</div>
<!-- /wp:columns -->
<!-- /wp:wa/section -->
HTML
]);
