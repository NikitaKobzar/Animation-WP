(function (wp) {
    const { __ } = wp.i18n;
    const { addFilter } = wp.hooks;
    const { createHigherOrderComponent } = wp.compose;
    const { InspectorControls } = wp.blockEditor || wp.editor;
    const { PanelBody, SelectControl, TextControl } = wp.components;
    const el = wp.element.createElement;

    // список доступных анимаций
    const ANIMATION_OPTIONS = [
        { label: __('Без анімації', 'webalchemy'), value: '' },
        { label: 'fade-up',          value: 'fade-up' },
        { label: 'fade-down',        value: 'fade-down' },
        { label: 'fade-left',        value: 'fade-left' },
        { label: 'fade-right',       value: 'fade-right' },
        { label: 'reveal-children',  value: 'reveal-children' },
        { label: 'horizontal-cards', value: 'horizontal-cards' },
        { label: 'horizontal-stack', value: 'horizontal-stack' },
        { label: 'parallax-soft',    value: 'parallax-soft' },
        { label: 'horizontal-fade',  value: 'horizontal-fade' }
    ];

    const withWAAnimControls = createHigherOrderComponent(function (BlockEdit) {
        return function (props) {
            const { name, attributes, setAttributes, isSelected } = props;

            // работаем только с нашими блоками wa/*
            if (!name || name.indexOf('wa/') !== 0) {
                return el(BlockEdit, props);
            }

            const anim       = attributes.animation   || '';
            const extraClass = attributes.extraClass  || '';
            const animTarget = attributes.animTarget || '';

            return el(
                wp.element.Fragment,
                null,
                el(BlockEdit, props),
                isSelected && el(
                    InspectorControls,
                    null,
                    el(
                        PanelBody,
                        { title: __('Анімація/класи', 'webalchemy'), initialOpen: false },

                        // 🔹 выбор типа анимации (вернулось)
                        el(SelectControl, {
                            label: __('Анімація', 'webalchemy'),
                            value: anim,
                            options: ANIMATION_OPTIONS,
                            onChange: function (value) {
                                setAttributes({ animation: value || '' });
                            }
                        }),

                        // 🔹 класс секции
                        el(TextControl, {
                            label: __('Унікальний клас секції', 'webalchemy'),
                            value: extraClass,
                            onChange: function (value) {
                                setAttributes({ extraClass: (value || '').trim() });
                            }
                        }),

                        // 🔹 класс-таргет для внутрішніх елементів (карточек)
                        el(TextControl, {
                            label: __('Клас елементів для анімації (таргет)', 'webalchemy'),
                            value: animTarget,
                            onChange: function (value) {
                                setAttributes({ animTarget: (value || '').trim() });
                            },
                            help: __('Наприклад: zigzag-row або wa-card (без крапки).', 'webalchemy')
                        })
                    )
                )
            );
        };
    }, 'withWAAnimControls');

    addFilter(
        'editor.BlockEdit',
        'webalchemy/withWAAnimControls',
        withWAAnimControls
    );
})(window.wp);
