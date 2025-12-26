<?php get_header(); ?>

<section class="error-page">
    <div class="container">
        <div class="error-wrapper">
            <div class="error-code">404</div>
            <h1 class="error-title">Сторінку не знайдено</h1>
            <p class="error-message">На жаль, ми не змогли знайти сторінку, яку ви шукали.</p>
            <a href="<?php echo home_url(); ?>" class="error-btn">На головну</a>
        </div>
    </div>
</section>

<?php get_footer(); ?>
