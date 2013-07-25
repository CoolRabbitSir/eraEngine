"use strict";

( function( window )
{
    /*
     * 模型数据原型
     * @author CoolRabbit
     * @date 2013/06/16
    */

    Private : var modelID = 0;
    Private : var model =
    {
        status  : 1,
        depth   : 0,
        mode    : 'stroke',
        x       : 0,
        y       : 0,
        texture : null,
        action : null,

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
        },
        remove : function()
        {
            this.status = 0;
        },
        hide : function()
        {
            this.status = 2;
        },
        show : function()
        {
            this.status = 1;
        }
    };

    // 矩形模型数据 //
    Private : var Rectangle = function( value )
    {
        this.width  = 16;
        this.height = 16;

        this.set( value );
        this.modelClass = 'rectangle';
    };

    Rectangle.prototype = model;

    // 圆型模型数据 //
    Private : var Circle = function( value )
    {
        this.radius = 16;

        this.set( value );
        this.modelClass = 'circle';
    };

    Circle.prototype = model;

    // 等边模型数据 //
    Private : var Equilateral = function( value )
    {
        this.sideNumber = 3;
        this.sideWidth = 16;

        this.set( value );
        this.modelClass = 'equilateral';
    };

    Equilateral.prototype = model;

    // 多边形模型数据 //
    Private : var Polygon = function( value )
    {
        this.points = [];

        this.set( value );
        this.modelClass = 'polygon';
    };

    Polygon.prototype = model;

    // 线段模型数据 //
    Private : var Line = function( value )
    {
        this.points = [];

        this.set( value );
        this.modelClass = 'line';
    };

    Line.prototype = model;

    /*
     * eraEngine 模型创建管理器
     * @extend eraEngine
     * @author CoolRabbit
     * @date 2013/06/13
    */

    era.model.extend(
    {
        /*
         * 创建模型数据
         * @author CoolRabbit
         * @date 2013/06/16
         * @param value : object
         * @return Model : object
         *
         * 模型数据属性设置标准
         * log( eraEngine.createModel( 'rectangle',   { status : number, mode : string, x : number, y : number, depth : number, width      : number, height    : number, texture : object } ) );
         * log( eraEngine.createModel( 'circle',      { status : number, mode : string, x : number, y : number, depth : number, radius     : number, texture   : object } ) );
         * log( eraEngine.createModel( 'equilateral', { status : number, mode : string, x : number, y : number, depth : number, sideNumber : number, sideWidth : number texture  : object } ) );
         * log( eraEngine.createModel( 'polygon',     { status : number, mode : string, x : number, y : number, depth : number, points     : array,  texture   : object } ) );
         * log( eraEngine.createModel( 'line',        { status : number, mode : string, x : number, y : number, depth : number, points     : array,  texture   : object } ) );
         *
         * 模型渲染模式提要
         * mode : 'path'       = 仅路径
         * mode : 'image'      = 仅图片
         * mode : 'fill'       = 仅填充
         * mode : 'stroke'     = 仅描边
         * mode : 'fillStroke' = 填充和描边，包含路径
        */

        createModel : function( modelClass, value )
        {
            var model = null;

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
                switch( modelClass )
                {
                    case 'rectangle' :
                        model = new Rectangle( value );
                    break;
                    case 'circle' :
                        model = new Circle( value );
                    break;
                    case 'equilateral' :
                        model = new Equilateral( value );
                    break;
                    case 'polygon' :
                        model = new Polygon( value );
                    break;
                    case 'line' :
                        model = new Line( value );
                    break;
                    default:
                        if( this.tip ) throw new Error( 'Mode type not found.', 'Error' );

                        return null;
                    break;
                };

                model.id = modelID ++;

                return model;
            };
        }
    } );

} )( window );