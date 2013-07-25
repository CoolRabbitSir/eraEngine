"use strict";

( function( window )
{
    /*
     * 建立事件列表
     * @author CoolRabbit
     * @date 2013/07/20
    */

    Private : var Listener = function()
    {
        this.list = {};
    };

    Listener.prototype =
    {
        appendHandler : function( type, handler )
        {
            !this.list[ type ] && ( this.list[ type ] = [] );

            this.list[ type ].push( handler );
        },
        removeHandler : function( type, id )
        {
            if( this.list[ type ] )
            {
                for( var i = 0; i < this.list[ type ].length; i ++ )
                {
                    if( this.list[ type ][ i ].handlerID == id )
                    {
                        this.list[ type ].splice( i, 1 );

                        break;
                    };
                };
            };
        },
        removeType : function( type )
        {
            this.list[ type ] && ( delete this.list[ type ] );
        }
    };

    /*
     * 建立事件对象
     * @author CoolRabbit
     * @date 2013/07/20
    */

    Private : var Data = function( type )
    {
        this.type = type;
        this.time = Date.now();
    };

    Data.prototype =
    {
        x        : null,
        y        : null,
        currentX : null,
        currentY : null,
        keyCode  : null,
        keyName  : null
    };

    /*
     * 建立事件句柄
     * @author CoolRabbit
     * @date 2013/07/20
    */

    Private : var handlerID = 0;
    Private : var Handler = function( callBack )
    {
        this.callBack  = callBack;
        this.handlerID = handlerID ++;
    };

    /*
     * eraEngine 事件管理器
     * @extend eraEngine
     * @author CoolRabbit
     * @date 2013/07/20
    */

    era.model.extend(
    {
        /*
         * 绑定事件
         * @author CoolRabbit
         * @date 2013/07/20
         * @param element  : object
         * @param type     : string
         * @param callBack : function
        */

        bind : function( element, type, callBack )
        {
            var handler = new Handler( callBack );

            !( element.event instanceof Listener ) && ( element.event = new Listener() );

            element.event.appendHandler( type, handler );

            return handler.handlerID;
        },

        /*
         * 解绑事件
         * @author CoolRabbit
         * @date 2013/07/20
         * @param element : object
         * @param type    : string
         * @param id      : number
        */

        unbind : function( element, type, id )
        {
            if( era.isClass( id ) === 'number' )
            {
                element.event instanceof Listener && ( element.event.removeHandler( type, id ) );
            }
            else
            {
                element.event instanceof Listener && ( element.event.removeType( type ) );
            };
        },

        /*
         * 触发事件
         * @author CoolRabbit
         * @date 2013/07/20
         * @param element : object
         * @param type    : string
         * @param data    : object
        */

        trigger : function( element, type, data )
        {
            if( element.event instanceof Listener )
            {
                if( element.event.list[ type ] )
                {
                    var eventData = new Data( type );

                    for( var i = 0; i < element.event.list[ type ].length; i ++ )
                    {
                        element.event.list[ type ][ i ].callBack.call( element, eventData, data );
                    };
                };
            };
        }
    } );

} )( window );