"use strict";

( function( window )
{
    /*
     * eraEngine 工具集
     * @extend eraEngine
     * @author CoolRabbit
     * @date 2013/06/13
    */

    era.model.extend(
    {
        /*
         * 设置画布对象
         * @author CoolRabbit
         * @date 2013/06/13
         *
         * @Method
         * get : status();
         * set : status( { x, y, z, position, width, heigth } )
        */

        status : function( value )
        {
            var status, x, y, z, position, width, height;

            // 参数为空进入 get 方式 //
            if( !value || era.isClass( value ) !== 'object' )
            {
                status = {};

                status.x        = this.canvasX;
                status.y        = this.canvasY;
                status.z        = this.canvasZ;
                status.position = this.canvasPosition;
                status.width    = this.canvasWidth;
                status.height   = this.canvasHeight;

                return status;
            }
            // 参数不为空进入 set 方式 //
            else
            {
                status = value;

                x        = era.isClass( status.x )        === 'number' ? status.x        : this.canvasX;
                y        = era.isClass( status.y )        === 'number' ? status.y        : this.canvasY;
                z        = era.isClass( status.z )        === 'number' ? status.z        : this.canvasZ;
                position = era.isClass( status.position ) === 'string' ? status.position : this.canvasPosition;
                width    = era.isClass( status.width )    === 'number' ? status.width    : this.canvasWidth;
                height   = era.isClass( status.height )   === 'number' ? status.height   : this.canvasHeight;

                if( this.canvasX        != x )        this.canvas.style.left     = x + 'px';
                if( this.canvasY        != y )        this.canvas.style.top      = y + 'px';
                if( this.canvasZ        != z )        this.canvas.style.zIndex   = z;
                if( this.canvasPosition != position ) this.canvas.style.position = position;
                if( this.canvasWidth    != width )    this.canvas.width          = width;
                if( this.canvasHeight   != height )   this.canvas.height         = height;

                this.canvasX        = x;
                this.canvasY        = y;
                this.canvasZ        = z;
                this.canvasPosition = position;
                this.canvasWidth    = width;
                this.canvasHeight   = height;

                return this;
            };
        },

        /*
         * 图像转换到数据
         * @author CoolRabbit
         * @date 2013/06/13
         * @param image : image
         * @param sw : number
         * @param sh : number
         * @param cx : number
         * @param cy : number
         * @param cw : number
         * @param ch : number
         * @return imageData : imageData
        */

        toImageData : function( image, sw, sh, cx, cy, cw, ch )
        {
            var width = sw ? sw : image.width;
            var height = sh ? sh : image.height;

            this.buffCanvas.width = width;
            this.buffCanvas.height = height;
            this.buffStage.drawImage( image, 0, 0, width, height );

            if( cw && ch )
            {
                if( cx || cy )
                {
                    return this.buffStage.getImageData( cx, cy, cw, ch );
                    
                }
                else
                {
                    return this.buffStage.getImageData( 0, 0, cw, ch );
                };
            };

            return this.buffStage.getImageData( 0, 0, width, height );
        },

        /*
         * 图像数据转换到元素或数据连接
         * @author CoolRabbit
         * @date 2013/06/13
         * @param imageData : imageData
         * @param type      : string
        */

        toElement : function( imageData, type )
        {
            var width = imageData.width;
            var height = imageData.height;

            if( type == 'canvas' )
            {
                var canvas = document.createElement( 'canvas' );
                var stage = canvas.getContext( '2d' );

                canvas.width = width;
                canvas.height = height;

                stage.putImageData( imageData, 0, 0 );

                return canvas;
            }
            else if( type = 'src' )
            {
                this.buffCanvas.width = width;
                this.buffCanvas.height = height;
                this.buffStage.putImageData( imageData, 0, 0 );

                return this.buffCanvas.toDataURL( 'image/png' );
            }

            return null;
        }
    } );

} )( window );