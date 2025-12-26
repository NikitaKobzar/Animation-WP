(function(wp){
    const { InspectorControls, InnerBlocks } = wp.blockEditor;
    const { PanelBody, TextControl } = wp.components;
    const el = wp.element.createElement;

    const ROW_L = ['core/columns',{"className":"zigzag-row"},[
        ['core/column',{},[['core/image',{}]]],
        ['core/column',{},[['core/heading',{level:3,content:'Заголовок'}],['core/paragraph',{content:'Текст…'}]]]
    ]];
    const ROW_R = ['core/columns',{"className":"zigzag-row reverse"},[
        ['core/column',{},[['core/heading',{level:3,content:'Заголовок'}],['core/paragraph',{content:'Текст…'}]]],
        ['core/column',{},[['core/image',{}]]]
    ]];

    const Edit = (props)=>{
        const { attributes, setAttributes } = props;
        const { animation, extraClass } = attributes;

        return el(wp.element.Fragment,null,
            el(InspectorControls,null),
            el('div',{className:'wa-block wa-block--zigzag'},
                el(InnerBlocks,{
                    allowedBlocks:['core/columns','core/column','core/image','core/heading','core/paragraph'],
                    template:[ROW_L, ROW_R, ROW_L],
                    templateLock:false,
                    renderAppender: InnerBlocks.DefaultBlockAppender
                })
            )
        );
    };

    wp.blocks.registerBlockType('wa/zigzag',{
        edit: Edit,
        save: ()=> wp.element.createElement(wp.blockEditor.InnerBlocks.Content)
    });
})(window.wp);
