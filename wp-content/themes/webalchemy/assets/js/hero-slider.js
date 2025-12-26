// Простенький слайдер для галереи с классом .wa-hero-slider
document.addEventListener('DOMContentLoaded', function () {
    const galleries = document.querySelectorAll('.wa-hero-slider.wp-block-gallery');

    if (!galleries.length) return;

    galleries.forEach(function (gallery) {
        const figures = Array.from(gallery.querySelectorAll('figure.wp-block-image'));

        if (!figures.length) return;

        // Если одна картинка – просто показываем её без стрелок
        if (figures.length === 1) {
            figures[0].classList.add('wa-hero-slide', 'is-active');
            return;
        }

        figures.forEach(function (fig, index) {
            fig.classList.add('wa-hero-slide');
            if (index === 0) fig.classList.add('is-active');
        });

        let current = 0;
        const total = figures.length;

        function showSlide(i) {
            figures.forEach(function (fig, idx) {
                fig.classList.toggle('is-active', idx === i);
            });
        }

        // Кнопки
        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'wa-hero-slider__nav wa-hero-slider__nav--prev';
        prevBtn.setAttribute('aria-label', 'Попереднє фото');
        prevBtn.innerHTML = `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15.5 4.5L9 12l6.5 7.5" fill="none"
                    stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        `;

        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'wa-hero-slider__nav wa-hero-slider__nav--next';
        nextBtn.setAttribute('aria-label', 'Наступне фото');
        nextBtn.innerHTML = `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.5 4.5L15 12l-6.5 7.5" fill="none"
                    stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        `;

        gallery.appendChild(prevBtn);
        gallery.appendChild(nextBtn);

        prevBtn.addEventListener('click', function () {
            current = (current - 1 + total) % total;
            showSlide(current);
        });

        nextBtn.addEventListener('click', function () {
            current = (current + 1) % total;
            showSlide(current);
        });
    });
});
