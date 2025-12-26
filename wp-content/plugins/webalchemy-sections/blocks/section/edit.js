(function (wp) {
    const { InspectorControls, InnerBlocks, useBlockProps } = wp.blockEditor;
    const { PanelBody, SelectControl, TextControl } = wp.components;
    const el = wp.element.createElement;

    const ALLOWED = [
        'core/paragraph','core/heading','core/buttons','core/button',
        'core/columns','core/column','core/group','core/image',
        'core/cover','core/embed','core/separator','core/spacer','core/list'
    ];

    const TEMPLATE = [
        ['core/group', {}, [
            ['core/heading', { level: 2, content: 'Заголовок секції' }],
            ['core/paragraph', { placeholder: 'Опис…' }]
        ]]
    ];

    const ANIMS = [
        { label: '— без анімації —', value: '' },
        { label: 'fade-in', value: 'fade-in' },
        { label: 'fade-up', value: 'fade-up' },
        { label: 'parallax', value: 'parallax' },
        { label: 'sticky-scroll', value: 'sticky-scroll' },
        { label: 'horizontal-snap', value: 'horizontal-snap' }
    ];

    const Edit = (props) => {
        const { attributes, setAttributes } = props;
        const { animation, extraClass } = attributes;

        const blockProps = useBlockProps({
            className: ['wa-section', animation ? ('wa-anim-' + animation) : '', extraClass || '']
                .filter(Boolean).join(' ')
        });

        return el(
            wp.element.Fragment, null,
            el(
                InspectorControls, null,
                el(
                    PanelBody, { title: 'Налаштування секції' }
                )
            ),
            el('div', blockProps,
                el('div', { className: 'wa-section__inner' },
                    el(InnerBlocks, {
                        allowedBlocks: ALLOWED,
                        template: TEMPLATE,
                        templateLock: false,
                        renderAppender: InnerBlocks.DefaultBlockAppender
                    })
                )
            )
        );
    };

    wp.blocks.registerBlockType('wa/section', {
        edit: Edit,
        save: () => wp.element.createElement(wp.blockEditor.InnerBlocks.Content)
    });
})(window.wp);
