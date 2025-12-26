(function($){
    'use strict';

    const stepsData = (window.WA_QUIZ_DATA && Array.isArray(WA_QUIZ_DATA.steps))
        ? WA_QUIZ_DATA.steps
        : [];

    function renderSteps($root, steps) {
        $root.empty();

        steps.forEach(function(step, index){
            const $step = $('<div class="wa-quiz-step" data-step-index="'+index+'"></div>');

            if (step.title) {
                $step.append('<h3 class="wa-quiz-step-title">'+ step.title +'</h3>');
            }
            if (step.subtitle) {
                $step.append('<p class="wa-quiz-step-subtitle">'+ step.subtitle +'</p>');
            }

            const type = step.type || 'radio';
            const name = step.name || ('question_' + (index+1));

            const $optsWrap = $('<div class="wa-quiz-step-options"></div>');

            if (type === 'text') {
                const $input = $('<input type="text" class="wa-quiz-input-text">')
                    .attr('name', name);
                $optsWrap.append($input);
            } else {
                (step.options || []).forEach(function(opt, i){
                    const optId = name + '_' + i;
                    const inputType = (type === 'checkbox') ? 'checkbox' : 'radio';

                    const $label = $('<label class="wa-quiz-option" for="'+optId+'"></label>');

                    if (opt.image) {
                        const $img = $('<img class="wa-quiz-option-image">')
                            .attr('src', opt.image)
                            .attr('alt', opt.label || '');
                        $label.append($img);
                    }

                    const $input = $('<input>')
                        .attr('type', inputType)
                        .attr('name', name + (inputType === 'checkbox' ? '[]' : ''))
                        .attr('id', optId)
                        .attr('value', opt.value || opt.label || '');

                    const $text = $('<span class="wa-quiz-option-label"></span>').text(opt.label || '');

                    $label.append($input, $text);
                    $optsWrap.append($label);
                });
            }

            $step.append($optsWrap);
            $root.append($step);
        });
    }

    $(document).ready(function(){
        const $modal = $('[data-wa-quiz-modal]');
        if (!$modal.length) return;

        const $stepsRoot = $modal.find('[data-wa-quiz-steps]');
        const $formWrap  = $modal.find('[data-wa-quiz-form]');
        const $btnNext   = $modal.find('[data-wa-quiz-next]');
        const $btnPrev   = $modal.find('[data-wa-quiz-prev]');
        let currentIndex = 0;

        // Рендерим шаги
        renderSteps($stepsRoot, stepsData);

        // Делаем кликабельной всю карточку варианта
        $stepsRoot.on('click', '.wa-quiz-option', function(e){
            // чтобы не срабатывал двойной клик, когда жмём напрямую по input
            if ($(e.target).is('input')) return;

            const $input = $(this).find('input[type="radio"], input[type="checkbox"]').first();
            if (!$input.length) return;

            if ($input.attr('type') === 'radio') {
                const name = $input.attr('name');
                // снимаем выделение со всех по этому name
                $stepsRoot.find('input[name="'+name+'"]').each(function(){
                    $(this).prop('checked', false)
                           .closest('.wa-quiz-option')
                           .removeClass('is-checked');
                });

                $input.prop('checked', true);
                $(this).addClass('is-checked');
            } else {
                const newState = !$input.prop('checked');
                $input.prop('checked', newState);
                $(this).toggleClass('is-checked', newState);
            }

            e.preventDefault();
        });

        function updateStepVisibility() {
            const $steps = $stepsRoot.children('.wa-quiz-step');
            $steps.removeClass('is-active');
            $steps.eq(currentIndex).addClass('is-active');

            $btnPrev.toggle(currentIndex > 0);
            if (currentIndex === $steps.length - 1) {
                $btnNext.text('До форми');
            } else {
                $btnNext.text('Далі');
            }
        }

        function collectAnswers() {
            const data = {};
            $stepsRoot.find('.wa-quiz-step').each(function(){
                const idx  = $(this).data('step-index');
                const step = stepsData[idx];
                if (!step) return;
                const name = step.name || ('question_' + (idx+1));
                const type = step.type || 'radio';

                if (type === 'text') {
                    data[name] = $(this).find('input[type="text"]').val() || '';
                } else if (type === 'checkbox') {
                    const vals = [];
                    $(this).find('input[type="checkbox"]:checked').each(function(){
                        vals.push($(this).val());
                    });
                    data[name] = vals;
                } else {
                    const $sel = $(this).find('input[type="radio"]:checked');
                    data[name] = $sel.val() || '';
                }
            });
            return data;
        }

        // сабмит CF7 – подмешиваем JSON
        $modal.on('submit', 'form.wpcf7-form', function(){
            const answers = collectAnswers();
            const json    = JSON.stringify(answers);

            let $hidden = $(this).find('input[name="wa_quiz_answers"]');
            if (!$hidden.length) {
                $hidden = $('<input type="hidden" name="wa_quiz_answers">').appendTo(this);
            }
            $hidden.val(json);
        });

        $btnNext.on('click', function(){
            const $steps = $stepsRoot.children('.wa-quiz-step');
            if (currentIndex < $steps.length - 1) {
                currentIndex++;
                updateStepVisibility();
            } else {
                $stepsRoot.hide();
                $modal.find('.wa-quiz-footer').hide();
                $formWrap.show();
            }
        });

        $btnPrev.on('click', function(){
            if (currentIndex > 0) {
                currentIndex--;
                updateStepVisibility();
            }
        });

        $modal.on('click', '[data-wa-quiz-close]', function(){
            $modal.removeClass('is-open');
        });

        $(document).on('click', '.js-open-quiz', function(e){
            e.preventDefault();
            $modal.addClass('is-open');
            $stepsRoot.show();
            $modal.find('.wa-quiz-footer').show();
            $formWrap.hide();
            currentIndex = 0;
            updateStepVisibility();
        });

        updateStepVisibility();
    });

})(jQuery);