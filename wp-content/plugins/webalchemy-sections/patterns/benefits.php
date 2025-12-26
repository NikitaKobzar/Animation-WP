<?php
register_block_pattern(
    'webalchemy/benefits-grid-v2',
    [
        'title'      => 'Переваги (нова версія 3×2 + правий стовпчик)',
        'categories' => ['webalchemy'],
        'content'    => <<<'HTML'
<!-- wp:group {"className":"wa-section wa-section--benefits"} -->
<div class="wp-block-group wa-section wa-section--benefits">

    <!-- wp:group {"className":"wa-benefits-grid"} -->
    <div class="wp-block-group wa-benefits-grid">

        <!-- Карточка 1 -->
        <!-- wp:group {"className":"wa-benefit"} -->
        <div class="wp-block-group wa-benefit">
            <!-- ИКОНКА -->
            <!-- wp:group {"className":"wa-benefit__icon"} -->
            <div class="wp-block-group wa-benefit__icon">
                <!-- wp:image /-->
            </div>
            <!-- /wp:group -->

            <!-- ЗАГОЛОВОК -->
            <!-- wp:heading {"level":3,"className":"wa-benefit__title"} -->
            <h3 class="wa-benefit__title">Доставка кур’єрською службою</h3>
            <!-- /wp:heading -->

            <!-- ТЕКСТ -->
            <!-- wp:paragraph {"className":"wa-benefit__text"} -->
            <p class="wa-benefit__text">
                Наші товари ми відправляємо "Новою поштою". При отриманні товару
                ви можете перевірити його працездатність.
            </p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->

        <!-- Карточка 2 -->
        <!-- wp:group {"className":"wa-benefit"} -->
        <div class="wp-block-group wa-benefit">
            <!-- wp:group {"className":"wa-benefit__icon"} -->
            <div class="wp-block-group wa-benefit__icon">
                <!-- wp:image /-->
            </div>
            <!-- /wp:group -->

            <!-- wp:heading {"level":3,"className":"wa-benefit__title"} -->
            <h3 class="wa-benefit__title">Все працює з коробки</h3>
            <!-- /wp:heading -->

            <!-- wp:paragraph {"className":"wa-benefit__text"} -->
            <p class="wa-benefit__text">
                Ви отримуєте повністю налаштований пристрій, який потрібно
                лише вставити в розетку.
            </p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->

        <!-- БОЛЬШАЯ ПРАВАЯ КАРТОЧКА -->
        <!-- wp:group {"className":"wa-benefit wa-benefit--highlight"} -->
        <div class="wp-block-group wa-benefit wa-benefit--highlight">

            <!-- Левая часть: иконка + текст -->
            <!-- wp:group {"className":"wa-benefit__body"} -->
            <div class="wp-block-group wa-benefit__body">

                <!-- ИКОНКА -->
                <!-- wp:group {"className":"wa-benefit__icon"} -->
                <div class="wp-block-group wa-benefit__icon">
                    <!-- wp:image /-->
                </div>
                <!-- /wp:group -->

                <!-- ЗАГОЛОВОК -->
                <!-- wp:heading {"level":3,"className":"wa-benefit__title"} -->
                <h3 class="wa-benefit__title">Готовий комплект під ваші задачі</h3>
                <!-- /wp:heading -->

                <!-- ТЕКСТ -->
                <!-- wp:paragraph {"className":"wa-benefit__text"} -->
                <p class="wa-benefit__text">
                    Ми підберемо комплект обладнання під конкретну ситуацію:
                    приватний будинок, бізнес, військові, дача або польові умови.
                </p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->

            <!-- Правая картинка (обладнання) -->
            <!-- wp:group {"className":"wa-benefit__image"} -->
            <div class="wp-block-group wa-benefit__image">
                <!-- wp:image /-->
            </div>
            <!-- /wp:group -->

        </div>
        <!-- /wp:group -->

        <!-- Карточка 3 -->
        <!-- wp:group {"className":"wa-benefit"} -->
        <div class="wp-block-group wa-benefit">
            <!-- wp:group {"className":"wa-benefit__icon"} -->
            <div class="wp-block-group wa-benefit__icon">
                <!-- wp:image /-->
            </div>
            <!-- /wp:group -->

            <!-- wp:heading {"level":3,"className":"wa-benefit__title"} -->
            <h3 class="wa-benefit__title">Безкоштовне підключення сервісів</h3>
            <!-- /wp:heading -->

            <!-- wp:paragraph {"className":"wa-benefit__text"} -->
            <p class="wa-benefit__text">
                Ми легко підключимо додаткові сервіси для пристроїв без додаткової плати.
            </p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->

        <!-- Карточка 4 -->
        <!-- wp:group {"className":"wa-benefit"} -->
        <div class="wp-block-group wa-benefit">
            <!-- wp:group {"className":"wa-benefit__icon"} -->
            <div class="wp-block-group wa-benefit__icon">
                <!-- wp:image /-->
            </div>
            <!-- /wp:group -->

            <!-- wp:heading {"level":3,"className":"wa-benefit__title"} -->
            <h3 class="wa-benefit__title">Людська техпідтримка</h3>
            <!-- /wp:heading -->

            <!-- wp:paragraph {"className":"wa-benefit__text"} -->
            <p class="wa-benefit__text">
                Ми завжди готові вирішити будь-яке ваше питання або навчити
                взаємодії з пристроєм.
            </p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->

    </div>
    <!-- /wp:group -->

    <!-- Кнопка -->
    <!-- wp:buttons {"className":"wa-benefits-cta"} -->
    <div class="wp-block-buttons wa-benefits-cta">
        <!-- wp:button {"className":"js-wa-benefits-open"} -->
        <div class="wp-block-button js-wa-benefits-open">
            <a class="wp-block-button__link" href="#">Дізнатись детальніше</a>
        </div>
        <!-- /wp:button -->
    </div>
    <!-- /wp:buttons -->

</div>
<!-- /wp:group -->
HTML
    ]
);
