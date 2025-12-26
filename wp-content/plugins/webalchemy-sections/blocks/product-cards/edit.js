(function(wp){
    const { InspectorControls, InnerBlocks } = wp.blockEditor;
    const { PanelBody, TextControl } = wp.components;
    const el = wp.element.createElement;

    const ROW = ['core/columns',{},[
        ['core/column',{},[['core/image',{}]]],
        ['core/column',{},[
            ['core/heading',{level:3,content:'Назва'}],
            ['core/paragraph',{content:'Опис або параметри…'}],
            ['core/buttons',{},[['core/button',{text:'Купити'}]]]
        ]]
    ]];

    const Edit = (props)=>{
        const { attributes, setAttributes } = props;
        const { animation, extraClass } = attributes;

        return el(wp.element.Fragment,null,
            el(InspectorControls,null),
            el('div',{className:'wa-block wa-block--product-cards'},
                el(InnerBlocks,{
                    allowedBlocks:['core/columns','core/column','core/image','core/heading','core/paragraph','core/list','core/buttons','core/button'],
                    template:[ROW,ROW],
                    templateLock:false,
                    renderAppender: InnerBlocks.DefaultBlockAppender
                })
            )
        );
    };

    wp.blocks.registerBlockType('wa/product-cards',{
        edit: Edit,
        save: ()=> wp.element.createElement(wp.blockEditor.InnerBlocks.Content)
    });
})(window.wp);
