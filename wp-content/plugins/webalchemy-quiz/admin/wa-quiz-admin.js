(function($){
    'use strict';

    const rootSel     = '#wa-quiz-steps-root';
    const textareaSel = '#wa-quiz-steps-json';

    function getInitialSteps() {
        if (window.WA_QUIZ_ADMIN && Array.isArray(WA_QUIZ_ADMIN.steps)) {
            return WA_QUIZ_ADMIN.steps;
        }
        return [];
    }

    function renderSteps(steps) {
        const $root = $(rootSel);
        $root.empty();

        steps.forEach((step, index) => {
            const $card = buildStepCard(step, index);
            $root.append($card);
        });

        // Кнопка "додати крок"
        const $addBtnWrap = $('<p class="wa-quiz-add-step-wrap"></p>');
        const $addBtn = $('<button type="button" class="button button-primary" id="wa-quiz-add-step">+ Додати крок</button>');
        $addBtnWrap.append($addBtn);
        $root.append($addBtnWrap);

        $addBtn.on('click', function(){
            const current = collectStepsFromDOM();
            current.push({
                title: 'Нове питання',
                subtitle: '',
                name: 'question_' + (current.length + 1),
                type: 'radio',
                options: []
            });
            renderSteps(current);
            syncToTextarea();
        });
    }

    function buildStepCard(step, index) {
        step = step || {};
        const title    = step.title    || '';
        const subtitle = step.subtitle || '';
        const type     = step.type     || 'radio';
        const name     = step.name     || ('question_' + (index+1));
        const options  = Array.isArray(step.options) ? step.options : [];

        const types = [
            { value: 'radio',    label: 'Один варіант (radio)' },
            { value: 'checkbox', label: 'Декілька варіантів (checkbox)' },
            { value: 'text',     label: 'Текстове поле' }
        ];

        const $card   = $('<div class="wa-quiz-step-card"></div>');
        const $header = $('<div class="wa-quiz-step-card__header"></div>');
        $header.append('<span class="wa-quiz-step-card__index">Крок ' + (index+1) + '</span>');
        const $removeBtn = $('<button type="button" class="button-link-delete wa-quiz-step-remove">Видалити</button>');
        $header.append($removeBtn);

        const $body = $('<div class="wa-quiz-step-card__body"></div>');

        const $titleRow = $('<p><label>Запитання<br><input type="text" class="widefat wa-step-title"></label></p>');
        $titleRow.find('input').val(title);

        const $subtitleRow = $('<p><label>Пояснення (необов\'язково)<br><input type="text" class="widefat wa-step-subtitle"></label></p>');
        $subtitleRow.find('input').val(subtitle);

        const $nameRow = $('<p><label>Службова назва поля (латиниця, без пробілів)<br><input type="text" class="widefat wa-step-name"></label></p>');
        $nameRow.find('input').val(name);

        const $typeRow = $('<p><label>Тип відповіді<br></label></p>');
        const $select  = $('<select class="wa-step-type"></select>');
        types.forEach(t => {
            const $opt = $('<option></option>').val(t.value).text(t.label);
            if (t.value === type) $opt.prop('selected', true);
            $select.append($opt);
        });
        $typeRow.append($select);

        const $optionsWrap = $('<div class="wa-step-options-wrap"></div>');
        const $optionsList = $('<div class="wa-step-options-list"></div>');
        const $addOptBtn   = $('<p><button type="button" class="button button-secondary wa-step-add-option">Додати варіант</button></p>');

        options.forEach(opt => {
            $optionsList.append(buildOptionRow(opt));
        });

        $optionsWrap.append('<p><strong>Варіанти відповідей</strong></p>');
        $optionsWrap.append($optionsList);
        $optionsWrap.append($addOptBtn);

        if (type === 'text') {
            $optionsWrap.hide();
        }

        $body.append($titleRow, $subtitleRow, $nameRow, $typeRow, $optionsWrap);
        $card.append($header, $body);

        // events
        $removeBtn.on('click', function(){
            $card.remove();
            renumberStepCards();
            syncToTextarea();
        });

        $select.on('change', function(){
            if ($(this).val() === 'text') {
                $optionsWrap.hide();
            } else {
                $optionsWrap.show();
            }
            syncToTextarea();
        });

        $titleRow.find('input').on('input', syncToTextarea);
        $subtitleRow.find('input').on('input', syncToTextarea);
        $nameRow.find('input').on('input', syncToTextarea);

        $addOptBtn.on('click', function(){
            $optionsList.append(buildOptionRow());
            syncToTextarea();
        });

        return $card;
    }

    function buildOptionRow(opt) {
        opt = opt || {};
        const label = opt.label || '';
        const value = opt.value || '';
        const image = opt.image || '';

        const $row = $('<div class="wa-step-option-row"></div>');

        const $labelInput = $('<input type="text" class="wa-opt-label" placeholder="Текст варіанту">').val(label);
        const $valueInput = $('<input type="text" class="wa-opt-value" placeholder="Значення для листа (необов\'язково)">').val(value);
        const $imageInput = $('<input type="text" class="wa-opt-image" placeholder="URL зображення (необов\'язково)">').val(image);
        const $remove     = $('<button type="button" class="button-link-delete wa-opt-remove">×</button>');

        $row.append($labelInput, $valueInput, $imageInput, $remove);

        $labelInput.on('input', syncToTextarea);
        $valueInput.on('input', syncToTextarea);
        $imageInput.on('input', syncToTextarea);

        $remove.on('click', function(){
            $row.remove();
            syncToTextarea();
        });

        return $row;
    }

    function renumberStepCards() {
        $(rootSel).children('.wa-quiz-step-card').each(function(i){
            $(this).find('.wa-quiz-step-card__index').text('Крок ' + (i+1));
        });
    }

    function collectStepsFromDOM() {
        const steps = [];
        $(rootSel).children('.wa-quiz-step-card').each(function(){
            const $card = $(this);
            const title    = $card.find('.wa-step-title').val() || '';
            const subtitle = $card.find('.wa-step-subtitle').val() || '';
            const name     = $card.find('.wa-step-name').val() || '';
            const type     = $card.find('.wa-step-type').val() || 'radio';

            const options = [];
            $card.find('.wa-step-option-row').each(function(){
                const $row  = $(this);
                const label = $row.find('.wa-opt-label').val() || '';
                const value = $row.find('.wa-opt-value').val() || '';
                const image = $row.find('.wa-opt-image').val() || '';

                if (!label) return;
                options.push({
                    label: label,
                    value: value || label,
                    image: image
                });
            });

            steps.push({
                title: title,
                subtitle: subtitle,
                name: name,
                type: type,
                options: options
            });
        });

        return steps;
    }

    function syncToTextarea() {
        const steps = collectStepsFromDOM();
        $(textareaSel).val(JSON.stringify(steps));
    }

    $(document).ready(function(){
        if (!$(rootSel).length) return;

        let initialSteps = getInitialSteps();
        if (!initialSteps.length) {
            initialSteps = [{
                title: '',
                subtitle: '',
                name: 'question_1',
                type: 'text',
                options: []
            }];
        }

        renderSteps(initialSteps);
        syncToTextarea();

        $('#wa-quiz-settings-form').on('submit', function(){
            syncToTextarea();
        });
    });

})(jQuery);
