<?php
register_block_pattern('webalchemy/testimonials', [
    'title'=>'Відгуки (YouTube + Facebook скріни)',
    'categories'=>['webalchemy'],
    'content'=> <<<'HTML'
<!-- wp:wa/section {"animation":"fade-in","extraClass":"reviews"} -->
<!-- wp:heading {"level":2} --><h2>Відгуки від наших клієнтів</h2><!-- /wp:heading -->

<!-- wp:columns {"align":"wide"} -->
<div class="wp-block-columns alignwide">
  <!-- wp:column -->
  <div class="wp-block-column">

    <!-- wp:embed {"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ","type":"video","providerNameSlug":"youtube"} -->
    <figure class="wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube">
      <div class="wp-block-embed__wrapper">
      https://www.youtube.com/watch?v=dQw4w9WgXcQ
      </div>
    </figure>
    <!-- /wp:embed -->

    <!-- wp:embed {"url":"https://www.youtube.com/watch?v=ysz5S6PUM-U","type":"video","providerNameSlug":"youtube"} -->
    <figure class="wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube">
      <div class="wp-block-embed__wrapper">
      https://www.youtube.com/watch?v=ysz5S6PUM-U
      </div>
    </figure>
    <!-- /wp:embed -->

    <!-- wp:embed {"url":"https://www.youtube.com/watch?v=jNQXAC9IVRw","type":"video","providerNameSlug":"youtube"} -->
    <figure class="wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube">
      <div class="wp-block-embed__wrapper">
      https://www.youtube.com/watch?v=jNQXAC9IVRw
      </div>
    </figure>
    <!-- /wp:embed -->

  </div>
  <!-- /wp:column -->

  <!-- wp:column -->
  <div class="wp-block-column">
    <!-- wp:image -->
    <figure class="wp-block-image">
      <img src="https://via.placeholder.com/1280x720" alt="FB screenshot"/>
    </figure>
    <!-- /wp:image -->
    <!-- wp:image -->
    <figure class="wp-block-image">
      <img src="https://via.placeholder.com/1280x720" alt="FB screenshot"/>
    </figure>
    <!-- /wp:image -->
    <!-- wp:image -->
    <figure class="wp-block-image">
      <img src="https://via.placeholder.com/1280x720" alt="FB screenshot"/>
    </figure>
    <!-- /wp:image -->
  </div>
  <!-- /wp:column -->
</div>
<!-- /wp:columns -->
<!-- /wp:wa/section -->
HTML
]);
