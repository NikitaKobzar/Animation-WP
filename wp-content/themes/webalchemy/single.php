<?php get_header(); ?>

<section class="blog-single">
    <div class="container">
        <article class="blog-post-content">
            <h1 class="blog-post-title"><?php the_title(); ?></h1>
            <div class="blog-post-meta">
                <span>Опубліковано: <?php the_time('j F Y'); ?></span>
            </div>
            <?php if (has_post_thumbnail()): ?>
                <div class="blog-post-image"><?php the_post_thumbnail('large'); ?></div>
            <?php endif; ?>
            <div class="blog-post-body">
                <?php the_content(); ?>
            </div>
        </article>
    </div>
</section>

<?php get_footer(); ?>
