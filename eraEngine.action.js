"use strict";

( function( window )
{
    /*
     * 动作数据原型
     * @author CoolRabbit
     * @date 2013/06/16
    */

    Private : var actionID = 0;
    Private : var Action = function( value )
    {
        this.set( value );
    };

    Action.prototype =
    {
        status : 1,
        delay : 0,
        delayed : 0,
        skipDelay : false,
        action : function(){},
        
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

    /*
     * eraEngine 动作创建管理器
     * @extend eraEngine
     * @author CoolRabbit
     * @date 2013/06/13
    */

    era.model.extend(
    {
        /*
         * 创建动作数据
         * @author CoolRabbit
         * @date 2013/06/16
         * @param value : object
         * @return Action : object
         *
         * 动作数据属性设置标准
         * value.status : number   渲染状态 : number : 0 = 移除, 1 = 正常, 2 = 跳过
         * value.delay  : number   渲染延迟 : number
         * value.action : function 渲染动作 : function
        */

        createAction : function( value )
        {
            var action = null;

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
                action = new Action( value );
            };

            action.id = actionID ++;

            return action;
        }
    } );

} )( window );