(function () {
    function initSlider() {
        if (typeof Swiper === 'undefined') return;

        var sections = document.querySelectorAll('.wa-slider .swiper');
        sections.forEach(function (swiperEl) {
            if (swiperEl._waSwiper) return; // чтобы не дублировать

            var section = swiperEl.closest('.wa-slider');
            if (!section) return;

            var raw = section.getAttribute('data-wa-slider') || '{}';
            var opts = {};
            try { opts = JSON.parse(raw); } catch (e) { opts = {}; }

            var conf = {
                slidesPerView: 1,
                loop: !!opts.loop,
                speed: opts.speed || 600,
                pagination: {
                    el: section.querySelector('.swiper-pagination'),
                    clickable: true
                },
                navigation: {
                    nextEl: section.querySelector('.swiper-button-next'),
                    prevEl: section.querySelector('.swiper-button-prev')
                }
            };

            if (opts.autoplay && opts.autoplay > 0) {
                conf.autoplay = { delay: opts.autoplay };
            }

            swiperEl._waSwiper = new Swiper(swiperEl, conf);
        });
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initSlider();
    } else {
        document.addEventListener('DOMContentLoaded', initSlider);
    }
})();
