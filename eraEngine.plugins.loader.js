"use strict";

( function( window )
{
    /*
     * 加载管理器
     * @author CoolRabbit
     * @date 2013/07/15
     * @param imageData : object
    */

    Private : var Load = function()
    {
        this.loadList = [];
    };

    Load.prototype =
    {
        complete : 0,
        progress : 0,

        check : function()
        {
            return this.progress == this.complete;
        },
        percen : function()
        {
            return this.progress / this.complete * 100;
        },
        addComplete : function()
        {
            this.complete += 1;
        },
        addProgress : function()
        {
            this.progress += 1;
        },
        find : function( sign )
        {
            for( var i = 0; i < this.loadList.length; i ++ )
            {
                if( sign == this.loadList[ i ].sign )
                {
                    return this.loadList[ i ];
                };
            };
        },
        requestImage : function( path, progressCallBack, completeCallBack )
        {
            var these = this;
            var image = new Image();

            image.onload = function()
            {
                these.addProgress();

                if( typeof progressCallBack == 'function' )
                {
                    progressCallBack.call( these, image );
                };
                if( typeof completeCallBack == 'function' )
                {
                    these.check() ( completeCallBack.call( these ) );
                };
            };

            image.src = path;
            image.sign = path;

            this.addComplete();
            this.loadList.push( image );

            return image;
        }
    };

    Public : var loader = function()
    {
        return new Load();
    };

    /*
     * eraEngine 加载管理器接口
     * @author CoolRabbit
     * @date 2013/06/13
    */

    era.loader = loader;

} )( window );