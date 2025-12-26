document.addEventListener('DOMContentLoaded', () => {

    // ===== Открытие / закрытие модалки =====
    function bindQuizModals() {
        document.querySelectorAll('.wa-open-quiz').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.getAttribute('data-target') || '#wa-quiz-modal';
                const modal = document.querySelector(target);
                if (!modal) return;
                modal.classList.add('is-open');
                document.documentElement.classList.add('wa-quiz-lock');
            });
        });

        document.addEventListener('click', (e) => {
            if (e.target.closest('.js-wa-quiz-close')) {
                const modal = e.target.closest('.wa-quiz-modal');
                if (!modal) return;
                modal.classList.remove('is-open');
                document.documentElement.classList.remove('wa-quiz-lock');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.wa-quiz-modal.is-open').forEach(m => m.classList.remove('is-open'));
                document.documentElement.classList.remove('wa-quiz-lock');
            }
        });
    }

    // ===== Шаги =====
    function initQuizSteps() {
        document.querySelectorAll('[data-wa-quiz]').forEach(quiz => {

            const steps   = Array.from(quiz.querySelectorAll('.wa-quiz-step'));
            if (!steps.length) return;

            let current = steps.findIndex(s => s.classList.contains('is-active'));
            if (current < 0) current = 0;
            steps.forEach((s, i) => s.dataset.quizIndex = i);

            const prevBtn    = quiz.querySelector('.js-wa-quiz-prev');
            const nextBtn    = quiz.querySelector('.js-wa-quiz-next');
            const submitBtn  = quiz.querySelector('.wa-quiz-submit');
            const progressEl = quiz
                .closest('.wa-quiz-modal__dialog')
                ?.querySelector('.wa-quiz-modal__progress-bar');

            function updateUI() {
                steps.forEach((s, i) => {
                    s.classList.toggle('is-active', i === current);
                });

                if (prevBtn) {
                    prevBtn.disabled = current === 0;
                }

                const lastIndex = steps.length - 1;
                const isFinal   = steps[current].hasAttribute('data-quiz-final') || current === lastIndex;

                if (nextBtn) {
                    nextBtn.style.display = isFinal ? 'none' : '';
                }
                if (submitBtn) {
                    submitBtn.closest('p,div,span,button').style.display = isFinal ? '' : 'none';
                }

                if (progressEl) {
                    const progress = ((current + 1) / steps.length) * 100;
                    progressEl.style.width = progress + '%';
                }
            }

            function goTo(delta) {
                const next = current + delta;
                if (next < 0 || next >= steps.length) return;
                current = next;
                updateUI();
            }

            if (prevBtn) prevBtn.addEventListener('click', () => goTo(-1));
            if (nextBtn) nextBtn.addEventListener('click', () => goTo(+1));

            // Первый рендер
            updateUI();
        });
    }

    bindQuizModals();
    initQuizSteps();
});
