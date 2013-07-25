"use strict";

( function( window )
{
    /*
     * 贴图数据原型
     * @author CoolRabbit
     * @date 2013/06/16
    */

    Private : var textureID = 0;
    Private : var Texture = function( value )
    {
        this.set( value );
    };

    Texture.prototype =
    {
        image : null,

        locaX : 0,
        locaY : 0,
        locaWidth : 0,
        locaHeight : 0,

        fillStyle : '#000',
        globalCompositeOperation : 'source-over',

        shadowColor : '#000',
        shadowBlur : 0,
        shadowOffsetX : 0,
        shadowOffsetY : 0,

        strokeStyle : '#000',
        lineCap : 'butt',
        lineJoin : 'miter',
        lineDashOffset : 0,
        lineWidth : 1,
        miterLimit : 10,

        alpha : 1,

        font : '10px MyriadProRegular, "Myriad Pro"',
        textAlign : 'start',
        textBaseline : 'alphabetic',

        set : function( value )
        {
            for( var name in value )
            {
                if( name == 'set' )
                {
                    continue;
                }
                else
                {
                    this[ name ] = value[ name ];
                };
            };
        }
    };

    /*
     * eraEngine 贴图创建管理器
     * @extend eraEngine
     * @author CoolRabbit
     * @date 2013/06/13
    */

    era.model.extend(
    {
        /*
         * 创建贴图数据
         * @author CoolRabbit
         * @date 2013/06/16
         * @param value : object
         * @return Texture : object
         *
         * 贴图数据属性设置标准
         * value.image       : image       贴图图片 : image
         * value.fillStyle   : fillStyle   填充样式 : fillStyle
         * value.strokeStyle : strokeStyle 画笔样式 : strokeStyle
         * value.lineStyle   : object      线段样式 : object
         * value.shadow      : object      阴影样式 : object
        */

        createTexture : function( value )
        {
            var texture = null;

            if( !value )
            {
                if( this.tip ) throw new Error( 'Parameter can not be null.', 'Error' );

                return this;
            }
            else if( era.isClass( value ) !== 'object' )
            {
                if( this.tip ) throw new Error( 'Parameter type error.', 'Error' );

                return this;
            }
            else
            {
                texture = new Texture( value );
            };

            texture.id = textureID ++;

            return texture;
        }
    } );

} )( window );