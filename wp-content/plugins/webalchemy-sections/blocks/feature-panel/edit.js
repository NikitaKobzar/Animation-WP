(function(wp){
    const { InspectorControls, InnerBlocks } = wp.blockEditor;
    const { PanelBody, TextControl, Button } = wp.components;
    const el = wp.element.createElement;

    function OptionEditor(props){
        const { rowIndex, options, onChange } = props;
        return el('div', { className:'wa-opt-grid'},
            options.map(function(opt,i){
                return el('div',{key:i, className:'wa-opt-item'},
                    el(TextControl,{
                        value: opt,
                        onChange: function(v){
                            const next = options.slice(); next[i] = v;
                            onChange(next);
                        }
                    }),
                    el(Button,{isDestructive:true, onClick:function(){
                            const next = options.slice(); next.splice(i,1); onChange(next);
                        }}, '–')
                );
            }),
            el(Button,{variant:'secondary', onClick:function(){
                    onChange([].concat(options,['Опція']));
                }}, '+ Додати опцію')
        );
    }

    const Edit = function(props){
        const { attributes, setAttributes } = props;
        const { rightTitle, rightSubtitle, rows, animation, extraClass } = attributes;

        function updateRow(idx, patch){
            const next = rows.slice();
            next[idx] = Object.assign({}, next[idx], patch);
            setAttributes({rows: next});
        }

        return el(wp.element.Fragment,null,
            el(InspectorControls,null,
                el(PanelBody,{title:'Правий стовпчик'},
                    el(TextControl,{label:'Великий заголовок', value:rightTitle||'', onChange:function(v){ setAttributes({rightTitle:v}); }}),
                    el(TextControl,{label:'Підзаголовок', value:rightSubtitle||'', onChange:function(v){ setAttributes({rightSubtitle:v}); }})
                )
            ),
            el('div',{className:'wa-block wa-block--feature-panel'},
                // Левая зона — свободный контент
                el('div',{className:'wa-fp-left'},
                    el(InnerBlocks,{
                        allowedBlocks:['core/heading','core/paragraph','core/list','core/image','core/buttons','core/button','core/separator'],
                        renderAppender: InnerBlocks.DefaultBlockAppender
                    })
                ),
                // Правая панель — конструктор
                el('aside',{className:'wa-fp-right'},
                    el('div',{className:'wa-fp-header'},
                        el('div',{className:'wa-fp-title'}, rightTitle||''),
                        el('div',{className:'wa-fp-subtitle'}, rightSubtitle||'')
                    ),
                    rows.map(function(row,idx){
                        return el('div',{key:idx, className:'wa-fp-row'},
                            el(TextControl,{
                                label:'Заголовок ряду',
                                value: row.title || '',
                                onChange:function(v){ updateRow(idx,{title:v}); }
                            }),
                            el(OptionEditor,{
                                rowIndex: idx,
                                options: row.options || [],
                                onChange:function(opts){ updateRow(idx,{options:opts}); }
                            }),
                            el(Button,{isDestructive:true, onClick:function(){
                                    const next = rows.slice(); next.splice(idx,1); setAttributes({rows:next});
                                }}, 'Видалити ряд')
                        );
                    }),
                    el(Button,{variant:'primary', onClick:function(){
                            setAttributes({rows: rows.concat([{title:'Новий ряд', options:['Опція 1','Опція 2'] }])});
                        }}, '+ Додати ряд')
                )
            )
        );
    };

    wp.blocks.registerBlockType('wa/feature-panel',{
        edit: Edit,
        save: function(){ return wp.element.createElement(wp.blockEditor.InnerBlocks.Content); }
    });
})(window.wp);
