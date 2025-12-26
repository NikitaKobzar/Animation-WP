<?php get_header(); ?>

<?php
if ( have_posts() ) :
    while ( have_posts() ) : the_post();
        the_content();   // ВАЖНО: именно это выводит твои паттерны/блоки
    endwhile;
else :
    echo '<div class="container"><p>Немає контенту</p></div>';
endif;
?>

<?php get_footer(); ?>
