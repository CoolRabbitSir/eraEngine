"use strict";

( function( window )
{
    /*
     * 通道处理算法
     * @author CoolRabbit
     * @date 2013/06/16
     * @param imageData : object
    */

    var channelColor = function( imageData, color, sign )
    {
        var filterData = imageData.data;
        var dataLength = filterData.length;
        var dataSign   = 0;

        for( ; dataSign < dataLength; dataSign += 4 )
        {
            filterData[ dataSign + sign ] = filterData[ dataSign + sign ] + color;
        };
    };

    /*
     * 卷积算法
     * @author Ilmari Heikkinen
     * @date 2011/05/25
     * @param imageData : object
     * @param weights   : array
     * @param opaque    : boolean
    */

    var convolute = function( imageData, weights, opaque )
    {
        var filterData = imageData.data;
        var sourceData = Array.prototype.slice.call( filterData, 0 );

        var side     = Math.round( Math.sqrt( weights.length ) );
        var halfSide = Math.floor( side / 2 );
        
        var width  = imageData.width;
        var height = imageData.height;

        var alpha = opaque ? 1 : 0;

        for( var y = 0; y < height; y ++ )
        {
            for( var x = 0 ; x < width; x ++ )
            {
                var r = 0, g = 0, b = 0, a = 0;
                var filterDataOff = ( y * width + x ) * 4;

                for( var cy = 0; cy < side; cy ++ )
                {
                    for( var cx = 0; cx < side; cx ++ )
                    {
                        var scy = y + cy - halfSide;
                        var scx = x + cx - halfSide;

                        if ( scy >= 0 && scy < height && scx >= 0 && scx < width )
                        {
                            var sourceDataOff = ( scy * width + scx ) * 4;
                            var modulus = weights[ cy * side + cx ];

                            r += sourceData[ sourceDataOff + 0 ] * modulus;
                            g += sourceData[ sourceDataOff + 1 ] * modulus;
                            b += sourceData[ sourceDataOff + 2 ] * modulus;
                            a += sourceData[ sourceDataOff + 3 ] * modulus;
                        };
                    };
                };

                filterData[ filterDataOff + 0 ] = r;
                filterData[ filterDataOff + 1 ] = g;
                filterData[ filterDataOff + 2 ] = b;
                filterData[ filterDataOff + 3 ] = a + alpha * ( 255 - a );
            };
        };
    };

    /*
     * 去色滤镜
     * @author CoolRabbit
     * @date 2013/06/16
     * @param imageData  : object
     * @return imageData : object
    */

    var desaturate = function( imageData )
    {
        var filterData = imageData.data;
        var dataLength = filterData.length;
        var dataSign   = 0;

        var color;

        for( ; dataSign < dataLength; dataSign += 4 )
        {
            color = filterData[ dataSign + 0 ] +
                    filterData[ dataSign + 1 ] +
                    filterData[ dataSign + 2 ];

            color = color / 3;

            filterData[ dataSign + 0 ] = color;
            filterData[ dataSign + 1 ] = color;
            filterData[ dataSign + 2 ] = color;
        };

        return imageData;
    };

    /*
     * 通道滤镜
     * @author CoolRabbit
     * @date 2013/06/16
     * @param imageData  : object
     * @param r          : number
     * @param g          : number
     * @param b          : number
     * @param a          : number
     * @return imageData : object
    */

    var channel = function( imageData, r, g, b, a )
    {
        era.isClass( r ) === 'number' && ( channelColor( imageData, r, 0 ) );
        era.isClass( g ) === 'number' && ( channelColor( imageData, g, 1 ) );
        era.isClass( b ) === 'number' && ( channelColor( imageData, b, 2 ) );
        era.isClass( a ) === 'number' && ( channelColor( imageData, a, 3 ) );

        return imageData;
    };

    /*
     * 对比度滤镜
     * @author CoolRabbit
     * @date 2013/06/16
     * @param imageData  : object
     * @param amount     : number
     * @return imageData : object
    */

    var contrast = function( imageData, amount )
    {
        var filterData = imageData.data;
        var dataLength = filterData.length;
        var dataSign   = 0;

        var r, g, b;

        for( ; dataSign < dataLength; dataSign += 4 )
        {
            r = filterData[ dataSign + 0 ];
            g = filterData[ dataSign + 1 ];
            b = filterData[ dataSign + 2 ];

            filterData[ dataSign + 0 ] = ( ( ( ( r / 255 ) - 0.5 ) * amount ) + 0.5 ) * 255;
            filterData[ dataSign + 1 ] = ( ( ( ( g / 255 ) - 0.5 ) * amount ) + 0.5 ) * 255;
            filterData[ dataSign + 2 ] = ( ( ( ( b / 255 ) - 0.5 ) * amount ) + 0.5 ) * 255;
        };

        return imageData;
    };

    /*
     * 反相滤镜
     * @author CoolRabbit
     * @date 2013/06/16
     * @param imageData  : object
     * @return imageData : object
    */

    var inverting = function( imageData )
    {
        var filterData = imageData.data;
        var dataLength = filterData.length;
        var dataSign   = 0;

        for( ; dataSign < dataLength; dataSign += 4 )
        {
            filterData[ dataSign + 0 ] = 255 - filterData[ dataSign + 0 ];
            filterData[ dataSign + 1 ] = 255 - filterData[ dataSign + 1 ];
            filterData[ dataSign + 2 ] = 255 - filterData[ dataSign + 2 ];
        };

        return imageData;
    };

    /*
     * 阈值滤镜
     * @author CoolRabbit
     * @date 2013/06/16
     * @param imageData  : object
     * @param amount     : number
     * @param background : object
     * @param foreground : object
     * @return imageData : object
    */

    var threshold = function( imageData, amount, background, foreground )
    {
        var filterData = imageData.data;
        var dataLength = filterData.length;
        var dataSign   = 0;

        var r, g, b, color;

        var foreground = foreground ? foreground : { r : 255, g : 255, b : 255 };
        var background = background ? background : { r : 0,   g : 0,   b : 0 };

        for( ; dataSign < dataLength; dataSign += 4 )
        {
            r = filterData[ dataSign + 0 ];
            g = filterData[ dataSign + 1 ];
            b = filterData[ dataSign + 2 ];

            color = ( 0.2126 * r + 0.7152 * g + 0.0722 * b >= amount ) ? foreground : background;

            filterData[ dataSign + 0 ] = color.r;
            filterData[ dataSign + 1 ] = color.g;
            filterData[ dataSign + 2 ] = color.b;
        };

        return imageData;
    };

    /*
     * 锐化滤镜
     * @author CoolRabbit
     * @date 2013/06/16
     * @param imageData  : object
     * @param amount     : number
     * @return imageData : object
    */

    var sharpen = function( imageData, amount )
    {
        var mete_1 = -( amount - 1 ) / 4;
        var mete_2 = 0;
        var weights =
        [
            mete_2,  mete_1, mete_2,
            mete_1,  amount, mete_1,
            mete_2,  mete_1, mete_2
        ];

        convolute( imageData, weights, false );

        return imageData;
    };

    /*
     * 浮雕滤镜
     * @author CoolRabbit
     * @date 2013/06/16
     * @param imageData  : object
     * @param amount     : number
     * @return imageData : object
    */

    var relief = function( imageData, amount )
    {
        var mete_1 = 1;
        var mete_2 = -1;
        var weights =
        [
            mete_1,  mete_1, mete_1,
            mete_1,  amount, mete_2,
            mete_2,  mete_2, mete_2
        ];

        convolute( imageData, weights, false );

        return imageData;
    };

    /*
     * 高斯模糊滤镜
     * @author CoolRabbit
     * @date 2013/06/16
     * @param imageData  : object
     * @return imageData : object
     *
     * @source author Mario Klingemann
     * @contact mario@quasimondo.com
     * @website http://www.quasimondo.com/StackBlurForCanvas/StackBlurDemo.html
    */

    var gaussianBlur = function( imageData, radius )
    {
        var filterData = imageData.data;

        var width  = imageData.width;
        var height = imageData.height;

        var mul_table =
        [
            512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512, 
            454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512, 
            482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456, 
            437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512, 
            497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328, 
            320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456, 
            446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335, 
            329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512, 
            505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405, 
            399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328, 
            324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271, 
            268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456, 
            451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388, 
            385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335, 
            332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292, 
            289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259
        ];

        var shg_table =
        [
             9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17,
            17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19,
            19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20,
            20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21,
            21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,
            21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22,
            22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
            22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23,
            23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
            23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
            23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
            23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
            24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
            24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
            24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
            24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24
        ];

        var BlurStack = function()
        {
            this.r = 0;
            this.g = 0;
            this.b = 0;
            this.a = 0;
            this.next = null;
        };

        var x, y, i, p, yp, yi, yw,
            r_sum, g_sum, b_sum,
            r_out_sum, g_out_sum, b_out_sum,
            r_in_sum, g_in_sum, b_in_sum,
            pr, pg, pb, rbs;

        var div = radius + radius + 1;
        var w4 = width << 2;
        var widthMinus1  = width - 1;
        var heightMinus1 = height - 1;
        var radiusPlus1  = radius + 1;
        var sumFactor = radiusPlus1 * ( radiusPlus1 + 1 ) / 2;

        var stackStart = new BlurStack();
        var stack = stackStart;

        for ( i = 1; i < div; i ++ )
        {
            stack = stack.next = new BlurStack();
            if( i == radiusPlus1 ) var stackEnd = stack;
        };

        stack.next = stackStart;

        var stackIn = null;
        var stackOut = null;

        yw = yi = 0;

        var mul_sum = mul_table[ radius ];
        var shg_sum = shg_table[ radius ];

        for( y = 0; y < height; y ++ )
        {
            r_in_sum = g_in_sum = b_in_sum = r_sum = g_sum = b_sum = 0;
            
            r_out_sum = radiusPlus1 * ( pr = filterData[ yi ] );
            g_out_sum = radiusPlus1 * ( pg = filterData[ yi + 1 ] );
            b_out_sum = radiusPlus1 * ( pb = filterData[ yi + 2 ] );
            
            r_sum += sumFactor * pr;
            g_sum += sumFactor * pg;
            b_sum += sumFactor * pb;
            
            stack = stackStart;
            
            for( i = 0; i < radiusPlus1; i ++ )
            {
                stack.r = pr;
                stack.g = pg;
                stack.b = pb;
                stack = stack.next;
            };
            
            for( i = 1; i < radiusPlus1; i ++ )
            {
                p = yi + ( ( widthMinus1 < i ? widthMinus1 : i ) << 2 );

                r_sum += ( stack.r = ( pr = filterData[ p     ] ) ) * ( rbs = radiusPlus1 - i );
                g_sum += ( stack.g = ( pg = filterData[ p + 1 ] ) ) * rbs;
                b_sum += ( stack.b = ( pb = filterData[ p + 2 ] ) ) * rbs;
                
                r_in_sum += pr;
                g_in_sum += pg;
                b_in_sum += pb;
                
                stack = stack.next;
            };
            
            stackIn = stackStart;
            stackOut = stackEnd;

            for ( x = 0; x < width; x ++ )
            {
                filterData[ yi     ] = ( r_sum * mul_sum ) >> shg_sum;
                filterData[ yi + 1 ] = ( g_sum * mul_sum ) >> shg_sum;
                filterData[ yi + 2 ] = ( b_sum * mul_sum ) >> shg_sum;
                
                r_sum -= r_out_sum;
                g_sum -= g_out_sum;
                b_sum -= b_out_sum;
                
                r_out_sum -= stackIn.r;
                g_out_sum -= stackIn.g;
                b_out_sum -= stackIn.b;
                
                p =  ( yw + ( ( p = x + radius + 1 ) < widthMinus1 ? p : widthMinus1 ) ) << 2;
                
                r_in_sum += ( stackIn.r = filterData[ p     ] );
                g_in_sum += ( stackIn.g = filterData[ p + 1 ] );
                b_in_sum += ( stackIn.b = filterData[ p + 2 ] );
                
                r_sum += r_in_sum;
                g_sum += g_in_sum;
                b_sum += b_in_sum;
                
                stackIn = stackIn.next;
                
                r_out_sum += ( pr = stackOut.r );
                g_out_sum += ( pg = stackOut.g );
                b_out_sum += ( pb = stackOut.b );
                
                r_in_sum -= pr;
                g_in_sum -= pg;
                b_in_sum -= pb;
                
                stackOut = stackOut.next;

                yi += 4;
            };

            yw += width;
        };
        
        for ( x = 0; x < width; x ++ )
        {
            r_in_sum = g_in_sum = b_in_sum = r_sum = g_sum = b_sum = 0;
            
            yi = x << 2;

            r_out_sum = radiusPlus1 * ( pr = filterData[ yi    ] );
            g_out_sum = radiusPlus1 * ( pg = filterData[ yi + 1] );
            b_out_sum = radiusPlus1 * ( pb = filterData[ yi + 2] );
            
            r_sum += sumFactor * pr;
            g_sum += sumFactor * pg;
            b_sum += sumFactor * pb;
            
            stack = stackStart;
            
            for( i = 0; i < radiusPlus1; i++ )
            {
                stack.r = pr;
                stack.g = pg;
                stack.b = pb;

                stack = stack.next;
            };

            yp = width;

            for( i = 1; i <= radius; i++ )
            {
                yi = ( yp + x ) << 2;
                
                r_sum += ( stack.r = ( pr = filterData[ yi    ] ) ) * ( rbs = radiusPlus1 - i );
                g_sum += ( stack.g = ( pg = filterData[ yi + 1] ) ) * rbs;
                b_sum += ( stack.b = ( pb = filterData[ yi + 2] ) ) * rbs;
                
                r_in_sum += pr;
                g_in_sum += pg;
                b_in_sum += pb;
                
                stack = stack.next;
            
                i < heightMinus1 && ( yp += width );
            };

            yi = x;

            stackIn = stackStart;
            stackOut = stackEnd;

            for ( y = 0; y < height; y++ )
            {
                p = yi << 2;

                filterData[ p     ] = ( r_sum * mul_sum ) >> shg_sum;
                filterData[ p + 1 ] = ( g_sum * mul_sum ) >> shg_sum;
                filterData[ p + 2 ] = ( b_sum * mul_sum ) >> shg_sum;

                r_sum -= r_out_sum;
                g_sum -= g_out_sum;
                b_sum -= b_out_sum;

                r_out_sum -= stackIn.r;
                g_out_sum -= stackIn.g;
                b_out_sum -= stackIn.b;

                p = ( x + ( ( ( p = y + radiusPlus1 ) < heightMinus1 ? p : heightMinus1 ) * width ) ) << 2;

                r_sum += ( r_in_sum += ( stackIn.r = filterData[ p     ] ) );
                g_sum += ( g_in_sum += ( stackIn.g = filterData[ p + 1 ] ) );
                b_sum += ( b_in_sum += ( stackIn.b = filterData[ p + 2 ] ) );

                stackIn = stackIn.next;

                r_out_sum += ( pr = stackOut.r );
                g_out_sum += ( pg = stackOut.g );
                b_out_sum += ( pb = stackOut.b );

                r_in_sum -= pr;
                g_in_sum -= pg;
                b_in_sum -= pb;

                stackOut = stackOut.next;

                yi += width;
            };
        };

        return imageData;
    };

    /*
     * eraEngine 滤镜接口
     * @author CoolRabbit
     * @date 2013/06/13
    */

    era.filter =
    {
        desaturate   : desaturate,
        channel      : channel,
        contrast     : contrast,
        inverting    : inverting,
        threshold    : threshold,
        sharpen      : sharpen,
        relief       : relief,
        gaussianBlur : gaussianBlur
    };

} )( window );