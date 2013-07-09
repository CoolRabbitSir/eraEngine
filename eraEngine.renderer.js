"use strict";

( function( window )
{
    /*
     * 初始化渲染时钟
     * @author CoolRabbit
     * @date 2013/06/16
    */

    window.requestAnimationFrame = ( function()
    {
        return window.webkitRequestAnimationFrame ||
               window.mozRequestAnimationFrame    ||
               window.oRequestAnimationFrame      ||
               window.msRequestAnimationFrame     ||
               function( callback ) { window.setTimeout( callback, 1000 / 60 ) };
    } )();
    window.cancelAnimationFrame = ( function()
    {
        return window.webkitCancelAnimationFrame ||
               window.mozCancelAnimationFrame    ||
               window.oCancelAnimationFrame      ||
               window.msCancelAnimationFrame     ||
               function( id ) { window.clearTimeout( id ) };
    } )();

    /*
     * 渲染动作
     * @author CoolRabbit
     * @date 2013/06/16
    */

    var rendererAction = function( rendererObject, these )
    {
        if( !rendererObject ) return false;

        // 检查动作延迟属性 //
        if( rendererObject.delay > 0 )
        {
            if( rendererObject.delayed == undefined || rendererObject.delayed <= 0 )
            {
                rendererObject.delayed = Date.now();
            };

            if( rendererObject.delay <= ( Date.now() - rendererObject.delayed ) )
            {
                // 检查 these 不为空时，即动作对象挂载在模型对象时将动作的 this 指针指向模型对象，并且将动作对象作为回调参数返回 //
                if( these )
                {
                    rendererObject.action.call( these, rendererObject );
                }
                else
                {
                    rendererObject.action();
                };

                rendererObject.delayed = 0;
            };
        }
        // 动作延迟属性为 0 时直接执行 //
        else if( rendererObject.delay == 0 )
        {
            if( these )
            {
                rendererObject.action.call( these, rendererObject );
            }
            else
            {
                rendererObject.action();
            };
        };
    };

    /*
     * 渲染模型
     * @author CoolRabbit
     * @date 2013/06/16
    */

    var rendererModle = function( stage, rendererObject )
    {
        // 建立矩形路径 //
        var pathRectangle = function( x, y, w, h )
        {
            stage.rect( x - w / 2, y - h / 2, w, h );
        };

        // 建立圆形路径 //
        var pathCircle = function( x, y, r )
        {
            stage.arc( x, y, r, 0, 2 * Math.PI, true );
        };

        // 建立等边多边形路径 //
        var pathEquilateral = function( x, y, sideNumber, sideWidth )
        {
            var angle = 180 - 360 / sideNumber;

            stage.save();

            stage.translate( x, y );
            stage.moveTo( 0, 0 );

            stage.translate( -sideWidth / 2, Math.tan( angle / 2 * Math.PI / 180 ) * sideWidth / 2 );
            stage.moveTo( 0, 0 );

            while( sideNumber -- )
            {
                stage.lineTo( sideWidth, 0 );
                stage.translate( sideWidth, 0 );
                stage.rotate( ( angle - 180 ) * Math.PI / 180 );
            };

            stage.restore();
        };

        // 建立 多边形 / 线段 路径 //
        var pathPolygon = function( x, y, points )
        {
            stage.save();

            stage.translate( x, y );
            stage.moveTo( points[ 0 ], points[ 1 ] );

            for( var i = 2; i < points.length; i += 2 )
            {
                stage.lineTo( points[ i ], points[ i + 1 ] );
            };

            stage.restore();
        };

        // 检查渲染对象渲染模式来决定是否需要建立路径 //
        if( rendererObject.mode != 'image' )
        {
            stage.beginPath();

            // 检查渲染对象模型类型来建立不同的路径 //
            switch( rendererObject.modelClass )
            {
                case 'rectangle' :
                    pathRectangle( rendererObject.x, rendererObject.y, rendererObject.width, rendererObject.height );
                break;
                case 'circle' :
                    pathCircle( rendererObject.x, rendererObject.y, rendererObject.radius );
                break;
                case 'equilateral' :
                    pathEquilateral( rendererObject.x, rendererObject.y, rendererObject.sideNumber, rendererObject.sideWidth );
                break;
                case 'polygon' :
                    pathPolygon( rendererObject.x, rendererObject.y, rendererObject.points );
                break;
                case 'line' :
                    pathPolygon( rendererObject.x, rendererObject.y, rendererObject.points );
                break;
            };

            // 创建线段模型时不关闭路径 //
            if( rendererObject.modelClass != 'line' ) stage.closePath();
        };

        // 检查渲染对象贴图数据 //
        if( rendererObject.texture != null )
        {
            // 检查渲染对象渲染模式 //
            switch( rendererObject.mode )
            {
                case 'path' :
                break;
                case 'image' :
                    if( rendererObject.texture.image )
                    {
                        stage.globalAlpha = rendererObject.texture.alpha;

                        stage.drawImage
                        (
                            rendererObject.texture.image,
                            rendererObject.x,
                            rendererObject.y,
                            rendererObject.width,
                            rendererObject.height
                        );
                    };
                break;
                case 'fill' :
                    stage.fillStyle = rendererObject.texture.fillStyle;
                    stage.fill();
                break;
                case 'stroke' :
                    stage.lineCap        = rendererObject.texture.lineCap;
                    stage.lineJoin       = rendererObject.texture.lineJoin;
                    stage.lineDashOffset = rendererObject.texture.lineDashOffset;
                    stage.lineWidth      = rendererObject.texture.lineWidth;
                    stage.miterLimit     = rendererObject.texture.miterLimit;
                    stage.strokeStyle    = rendererObject.texture.strokeStyle;

                    stage.stroke();
                break;
                case 'fillStroke' :
                    stage.fillStyle = rendererObject.texture.fillStyle;
                    stage.fill();

                    stage.strokeStyle = rendererObject.texture.strokeStyle;
                    stage.stroke();
                break;
            };
        };

        // 清空路径 //
        if( rendererObject.mode != 'image' )
        {
            stage.beginPath();
            stage.closePath();
        };
    };

    /*
     * eraEngine 中央渲染管理器
     * @extend eraEngine
     * @author CoolRabbit
     * @date 2013/06/13
    */

    era.model.extend(
    {
        // 渲染默认属性 //
        FRAMES_PER_SECOND       : 0,
        FRAMES_TOTAL            : 0,
        FRAMES_DISPLAY          : false,
        FRAMES_DISPLAY_CALLBACK : null,
        FRAMES_DISPLAY_CANVAS   : null,

        // 渲染核心指针 //
        animationFrame : undefined,

        /*
         * 添加模型数据到渲染队列
         * @author CoolRabbit
         * @date 2013/06/16
         * @param model : object
         * @return eraEngine : object
        */

        addModel : function( model )
        {
            this.queueModel.push( model );

            return this;
        },

        /*
         * 添加动作数据到渲染队列
         * @author CoolRabbit
         * @date 2013/06/16
         * @param action : object
         * @return eraEngine : object
        */

        addAction : function( action )
        {
            this.queueAction.push( action );

            return this;
        },

        /*
         * 渲染
         * @author CoolRabbit
         * @date 2013/06/16
         * @return eraEngine : object
        */

        renderer : function( Priority )
        {
            // 复制渲染队列 //
            var queueModel = this.queueModel;
            var queueAction  = this.queueAction;
            var queueRecover = this.queueRecover;

            // 取得队列长度 //
            var modelLength = queueModel.length;
            var actionLength  = queueAction.length;
            var recoverLength = queueRecover.length;

            // 设置遍历起始 //
            var modelSign = 0;
            var actionSign  = 0;
            var recoverSign = 0;

            // 渲染对象副本 //
            var rendererObject;

            // 处理动作渲染 //
            var actionHandle = function()
            {
                for( ; actionSign < actionLength; actionSign ++ )
                {
                    rendererObject = queueAction[ actionSign ];

                    switch( rendererObject.status )
                    {
                        // 当对象状态为 0 时移除它到队列外 //
                        case 0 :
                            queueRecover.push( rendererObject );
                            queueAction.splice( actionSign, 1 );
                            actionSign -= 1;
                            actionLength -= 1;
                        break;
                        // 当对象状态为 1 时正常渲染 //
                        case 1 :
                            rendererAction( rendererObject );
                        break;
                        // 当对象状态为 2 时跳过渲染 //
                        case 2 :
                            return null;
                        break;
                        // 当对象状态为 3 时执行一次性渲染 //
                        case 3 :
                            rendererAction( rendererObject );
                            queueRecover.push( rendererObject );
                            queueAction.splice( actionSign, 1 );
                            actionSign -= 1;
                            actionLength -= 1;
                        break;
                        // 当对象状态为 null 时报告错误 //
                        default:
                            if( this.tip ) throw new Error( 'Action object not found.', 'Error' );

                            return null;
                        break;
                    };
                };
            };

            // 处理模型渲染 //
            // 根据模型深度值重新排列渲染队列元素顺序 //
            queueModel.sort( function( min, max ) { return min.z - max.z } );

            // 渲染队列内容 //
            var modelHandle = function()
            {
                for( ; modelSign < modelLength; modelSign ++ )
                {
                    rendererObject = queueModel[ modelSign ];

                    switch( rendererObject.status )
                    {
                        // 当对象状态为 0 时移除它到队列外 //
                        case 0 :
                            queueRecover.push( rendererObject );
                            queueModel.splice( modelSign, 1 );
                            modelSign -= 1;
                            modelLength -= 1;
                        break;
                        // 当对象状态为 1 时正常渲染 //
                        case 1 :
                            rendererModle( this.stage, rendererObject );
                            rendererAction( rendererObject.action, rendererObject );
                        break;
                        // 当对象状态为 2 时跳过渲染 //
                        case 2 :
                            return null;
                        break;
                        // 当对象状态为 3 时执行一次性渲染 //
                        case 3 :
                            rendererModle( this.stage, rendererObject );
                            rendererAction( rendererObject.action, rendererObject );
                            queueRecover.push( rendererObject );
                            queueModel.splice( modelSign, 1 );
                            modelSign -= 1;
                            modelLength -= 1;
                        break;
                        // 当对象状态为 null 时报告错误 //
                        default:
                            if( this.tip ) throw new Error( 'Model status not found.', 'Error' );

                            return null;
                        break;
                    };
                };
            };

            // 处理渲染优先级 //
            if( Priority )
            {
                modelHandle.call( this );
                actionHandle.call( this );
            }
            else
            {
                actionHandle.call( this );
                modelHandle.call( this );
            };

            return this;
        },

        /*
         * 打开渲染
         * @author CoolRabbit
         * @date 2013/06/16
         * @return eraEngine : object
        */

        rendererStart : function( Priority )
        {
            var these = this;
            var timer = Date.now();
            var timed = 0;
            var framesPerSecond = 0;

            var renderer = function()
            {
                these.animationFrame = requestAnimationFrame( renderer );
                
                these.FRAMES_TOTAL += 1;

                // 检查渲染帧数面板是否打开 //
                if( these.FRAMES_DISPLAY )
                {
                    timed = Date.now();
                    framesPerSecond += 1;

                    if( ( timed - timer ) >= 1000 )
                    {
                        these.FRAMES_PER_SECOND = framesPerSecond;
                        framesPerSecond = 0;
                        timer = Date.now();
                        timed = 0;
                        these.FRAMES_DISPLAY_CALLBACK( these.FRAMES_PER_SECOND );
                    };
                };

                // 检查是否需要设置优先级 //
                if( Priority )
                {
                    these.renderer( Priority );
                }
                else
                {
                    these.renderer();
                };
            };

            renderer();

            return this;
        },

        /*
         * 关闭渲染
         * @author CoolRabbit
         * @date 2013/06/16
         * @return eraEngine : object
        */

        rendererClose : function()
        {
            cancelAnimationFrame( this.animationFrame );

            return this;
        },

        /*
         * 清理渲染回收
         * @author CoolRabbit
         * @date 2013/06/16
         * @return eraEngine : object
        */

        rendererRecover : function()
        {
            var recover = this.queueRecover;
            var recoverSign = 0;
            var recoverLength = recover.length;

            for( ; recoverSign < recoverLength; recoverSign ++ )
            {
                recover[ recoverSign ] = null;
                delete recover[ recoverSign ];
                recover.splice( recoverSign, 1 );
                recoverSign -= 1;
                recoverLength -= 1;
            };

            return this;
        },

        /*
         * 打开渲染帧数
         * @author CoolRabbit
         * @date 2013/06/16
         * @return eraEngine : object
        */

        framesDisplayOpen : function()
        {
            if( this.FRAMES_DISPLAY ) return this;

            var canvas = document.body.appendChild( document.createElement( 'canvas' ) );;
            var stage = canvas.getContext( '2d' );

            var width = 100;
            var height = 100;

            var pointer = 0;
            var records = [];

            canvas.width = width;
            canvas.height = height;

            canvas.style.backgroundColor = '#1D2534';
            canvas.style.border = '#303D54 solid 5px';
            canvas.style.position = 'absolute';
            canvas.style.zIndex = '9999';
            canvas.style.right = '10px';
            canvas.style.top = '10px';
            canvas.style.opacity = '.7';

            stage.font = 'bold 13px Consolas';
            stage.textAlign = "start";
            stage.textBaseline = "alphabetic";

            this.FRAMES_DISPLAY = true;
            this.FRAMES_DISPLAY_CANVAS = canvas;
            this.FRAMES_DISPLAY_CALLBACK = function( framesPerSecond )
            {
                stage.clearRect( 0, 0, width, height );
                stage.fillStyle = '#0096FF';

                for( var i = 0; i < width; i ++ )
                {
                    if( records[ i ] )
                    {
                        stage.fillRect( i, height - records[ i ] / 1.8, 1, records[ i ] / 1.8 );
                    };
                };

                if( pointer < width )
                {
                    records[ pointer ++ ] = framesPerSecond;
                }
                else
                {
                    for( var i = 0; i < records.length - 1; i ++ )
                    {
                        records[ i ] = records[ i + 1 ];
                    };

                    records[ pointer ] = framesPerSecond;
                };

                stage.fillStyle = '#09F';
                stage.fillText( 'FPS:' + framesPerSecond, 3, 13, width - 4 );
                stage.fillText( 'MRL:' + this.queueModel.length, 3, 26, width - 4 );
                stage.fillText( 'ARL:' + this.queueAction.length, 3, 39, width - 4 );
                stage.fillText( 'RRL:' + this.queueRecover.length, 3, 52, width - 4 );
            };
            
            this.FRAMES_DISPLAY_CALLBACK( 0 );

            return this;
        },

        /*
         * 关闭渲染帧数
         * @author CoolRabbit
         * @date 2013/06/16
         * @return eraEngine : object
        */

        framesDisplayShut : function()
        {
            if( !this.FRAMES_DISPLAY ) return this;

            this.FRAMES_DISPLAY = false;
            this.FRAMES_DISPLAY_CALLBACK = null;

            document.body.removeChild( this.FRAMES_DISPLAY_CANVAS );

            return this;
        }
    } );

} )( window );