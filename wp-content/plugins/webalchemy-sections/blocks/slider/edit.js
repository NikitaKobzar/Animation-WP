(function () {
    const { registerBlockType } = wp.blocks;
    const { MediaUpload, InspectorControls } =
    wp.blockEditor || wp.editor;
    const { Button, PanelBody, ToggleControl, RangeControl, TextControl } =
        wp.components;
    const { Fragment, createElement: el } = wp.element;

    const ANIMS = [
        { label: 'Без анімації', value: '' },
        { label: 'Fade in', value: 'fade-in' },
        { label: 'Fade up', value: 'fade-up' }
    ];

    registerBlockType('wa/slider', {
        title: 'WA Слайдер картинок',
        icon: 'images-alt2',
        category: 'webalchemy',

        edit(props) {
            const { attributes, setAttributes } = props;
            const { ids = [], loop, autoplay, speed, animation, extraClass } = attributes;

            const onSelect = (media) => {
                const nextIds = (media || []).map((m) => m.id);
                setAttributes({ ids: nextIds });
            };

            const removeImage = (id) => {
                setAttributes({ ids: ids.filter((x) => x !== id) });
            };

            const renderThumbs = () => {
                if (!ids.length) {
                    return el(
                        'p',
                        { className: 'wa-slider-editor__placeholder' },
                        'Виберіть зображення з медіа-бібліотеки.'
                    );
                }

                return el(
                    'div',
                    { className: 'wa-slider-editor__thumbs' },
                    ids.map(function (id) {
                        return el(
                            'div',
                            { key: id, className: 'wa-slider-editor__thumb' },
                            el('div', { className: 'wa-slider-editor__thumb-id' }, '#' + id),
                            el(
                                Button,
                                {
                                    isSmall: true,
                                    isDestructive: true,
                                    onClick: function () { removeImage(id); }
                                },
                                '×'
                            )
                        );
                    })
                );
            };

            return el(
                Fragment,
                null,
                el(
                    InspectorControls,
                    null,
                    el(
                        PanelBody,
                        { title: 'Налаштування слайдера', initialOpen: true },
                        el(ToggleControl, {
                            label: 'Зациклити',
                            checked: !!loop,
                            onChange: (v) => setAttributes({ loop: !!v })
                        }),
                        el(RangeControl, {
                            label: 'Autoplay, мс (0 — викл.)',
                            value: autoplay || 0,
                            onChange: (v) => setAttributes({ autoplay: Number(v) || 0 }),
                            min: 0,
                            max: 10000,
                            step: 500
                        }),
                        el(RangeControl, {
                            label: 'Швидкість анімації, мс',
                            value: speed || 600,
                            onChange: (v) => setAttributes({ speed: Number(v) || 600 }),
                            min: 100,
                            max: 3000,
                            step: 100
                        })
                    )
                ),
                el(
                    'div',
                    { className: 'wa-slider-editor' },
                    el(
                        MediaUpload,
                        {
                            onSelect,
                            multiple: true,
                            gallery: true,
                            value: ids,
                            render: function ({ open }) {
                                return el(
                                    Button,
                                    {
                                        onClick: open,
                                        isPrimary: true
                                    },
                                    ids.length ? 'Змінити зображення' : 'Обрати зображення'
                                );
                            }
                        }
                    ),
                    renderThumbs()
                )
            );
        },

        save() {
            // на фронті рендерим PHP-колбеком
            return null;
        }
    });
})();
