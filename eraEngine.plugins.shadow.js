"use strict";

( function( window )
{
    // 创建缓冲画布 //
    var buffCanvas = document.createElement( 'canvas' );
    var buffStage  = buffCanvas.getContext( '2d' );

    // 获取轮廓 //
    var contour = function( imageData )
    {
        var data   = imageData.data;
        var length = data.length;
        var sign   = 0;

        var width  = imageData.width;
        var height = imageData.height;

        var point  = [];

        var x, y, alpha, node;

        for( y = 0; y < height; y ++ )
        {
            node = true;

            // 逐行寻找轮廓点 //
            for( x = 0; x < width; x ++ )
            {
                alpha = data[ ( width * y + x ) * 4 + 3 ];

                // 寻找点的开始和结束位置，用透明度判断
                if( node )
                {
                    if( alpha )
                    {
                        point.push( x );
                        point.push( y );
                        node = false;
                    };
                }
                else
                {
                    if( !alpha )
                    {
                        point.push( x - 1 );
                        point.push( y );
                        node = true;
                    };
                };
            };
        };

        return point;
    };

    // 倾斜轮廓 //
    var tilt = function( point, angleNS, angleEW )
    {
        var ponitLength = point.length;
        var ponitSign = 0;

        var squeeze = Math.sin( angleNS * Math.PI / 180 );
        var slant   = Math.tan( angleEW * Math.PI / 180 );

        var max        = point.slice( -1 );
        var correction = max * ( 1 - squeeze );

        var x, y;

        for( ; ponitSign < ponitLength; ponitSign += 2 )
        {
            x = point[ ponitSign + 0 ];
            y = point[ ponitSign + 1 ];

            point[ ponitSign + 0 ] = Math.round( x + ( max - y ) * slant );
            point[ ponitSign + 1 ] = Math.round( y * squeeze + correction );
        };

        return point;
    };

    /*
     * 创建景物阴影
     * @author CoolRabbit
     * @date 2013/07/08
     * @param stageWidth  : number
     * @param stageHeight : number
     * @param image       : image
     * @param angleNS     : number
     * @param angleEW     : number
     * @param color       : color
     * @return imageData  : object
    */

    var scenery = function( stageWidth, stageHeight, image, angleNS, angleEW, color )
    {
        // 绘制图像到缓冲画布 //
        var imageWidth = image.width;
        var imageHeight = image.height;
        var imageX = Math.round( ( stageWidth - imageWidth ) / 2 );
        var imageY = Math.round( ( stageHeight - imageHeight ) / 2 );

        var canvasWidth = stageWidth   < window.innerWidth  ? stageWidth  : window.innerWidth ;
        var canvasHeight = stageHeight < window.innerHeight ? stageHeight : window.innerHeight;

        buffCanvas.width  = canvasWidth;
        buffCanvas.height = canvasHeight;

        buffStage.drawImage( image, imageX, imageY );

        // 转换图像到数据 //
        var imageData = buffStage.getImageData( 0, 0, stageWidth, stageWidth );

        // 倾斜图像数据 //
        var point = tilt( contour( imageData ), angleNS, angleEW );

        var ponitLength = point.length;
        var ponitSign   = 0;
        var x1, y1, x2, y2;

        // 清空画布并绘入阴影数据 //
        buffStage.clearRect( 0, 0, canvasWidth, canvasHeight );

        buffStage.beginPath();
        buffStage.lineWidth = 2;
        buffStage.strokeStyle = color || 'rgba( 0, 0, 0, 1 )';

        // 填充阴影 //
        for( ponitSign = 0; ponitSign < ponitLength; ponitSign += 4 )
        {
            x1 = point[ ponitSign + 0 ];
            y1 = point[ ponitSign + 1 ];
            x2 = point[ ponitSign + 2 ];
            y2 = point[ ponitSign + 3 ];
            
            buffStage.moveTo( x1, y1 );
            buffStage.lineTo( x2, y2 );
        };

        buffStage.stroke();

        return buffStage.getImageData( 0, 0, buffCanvas.width, buffCanvas.height );
    };

    /*
     * eraEngine 阴影处理接口
     * @author CoolRabbit
     * @date 2013/06/13
    */

    era.shadow =
    {
        scenery : scenery
    };

} )( window );