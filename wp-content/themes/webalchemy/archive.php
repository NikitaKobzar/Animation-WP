<?php get_header(); ?>

<section class="blog-page">
  <div class="container">

    <nav class="breadcrumbs">
      <a href="<?php echo home_url(); ?>">Головна</a> / Блог
    </nav>

    <h1 class="blog-title">Блог</h1>

    <div class="blog-grid">
      <?php if (have_posts()) : while (have_posts()) : the_post(); ?>
        <div class="blog-card">
          <a href="<?php the_permalink(); ?>">
            <div class="blog-card-image">
              <?php if (has_post_thumbnail()) : ?>
                <?php the_post_thumbnail('medium_large'); ?>
              <?php else : ?>
                <img src="<?php echo get_template_directory_uri(); ?>/assets/img/placeholder.png" alt="<?php the_title(); ?>">
              <?php endif; ?>
            </div>
            <div class="blog-card-title">
              <?php the_title(); ?>
            </div>
          </a>
        </div>
      <?php endwhile; endif; ?>
    </div>

    <div class="pagination">
      <?php
        echo paginate_links([
          'prev_text' => '&laquo;',
          'next_text' => '&raquo;',
        ]);
      ?>
    </div>

  </div>
</section>

<?php get_footer(); ?>
