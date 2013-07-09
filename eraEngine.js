"use strict";

/*
 * eraEngine JavaScript Library v1.0.0
 * http://eraEngine.ausiu.com
 *
 * Copyright 2013, CoolRabbit
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
 * IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * eraEngine JavaScript 纪元游戏引擎
 *
 * CoolRabbit( 63986605@qq.com / eraEngine.ausiu.com ) 版权所有
 *
 * 被授权人有权利使用、复制、修改、合并、出版发布、散布、但不包含任何形式的商业用途、贩售软件及软件的副本。
 * 被授权人可根据程序的需要修改许可协议为适当的内容。
 *
 * 在软件和软件的所有副本中都必须包含版权声明和许可声明。
 *
 * 此许可协议并非属 Copyleft 的自由软件许可协议条款，允许在自由及开放源代码软件或非自由软件（Proprietary software）所使用。
 * MIT的内容可依照程序著作权者的需求更改内容。此亦为MIT与BSD（The BSD license, 3-clause BSD license）本质上不同处。
 * MIT许可协议可与其他许可协议并存。另外，MIT条款也是自由软件基金会（FSF）所认可的自由软件许可协议条款，与GPL兼容。
 *
 * 引擎子类文件夹包括：
 *
 * eraEngine.model.js : 模型创建管理器
 * eraEngine.texture.js 贴图创建管理器
 * eraEngine.action.js 动作创建管理器
 * eraEngine.renderer.js 中央渲染管理器
 * eraEngine.tools.js 工具集

 * eraEngine.plugins.filter.js 滤镜创建插件
 * eraEngine.plugins.shadow.js 阴影创建插件

 * 待定 eraEngine.keyboard.js : 键盘事件管理器
 * 待定 eraEngine.mouse.js : 鼠标事件管理器
 * 待定 eraEngine.touch.js : 触屏事件管理器
 * 待定 eraEngine.mobile.js : 移动设备管理器
 * 待定 eraEngine.resources.js : 资源加载管理器
 * 待定 eraEngine.arithmetic.js : 算法集
 */

 ( function( window )
 {
    // 使用正确的窗口参数 ( 沙盒 ) //
    var document = window.document;
    var navigator = window.navigator;

    /*
     * 判断对象类型
     * @author CoolRabbit
     * @date 2013/06/13
     * @param value : object
     * @return isClass : string
    */

    var isClass = function( value )
    {
        var type = 
        {
            "[object Boolean]"  : "boolean",
            "[object Number]"   : "number",
            "[object String]"   : "string",
            "[object Function]" : "function",
            "[object Array]"    : "array",
            "[object Date]"     : "date",
            "[object RegExp]"   : "regexp",
            "[object Object]"   : "object"
        };

        return typeof value === "object" || typeof value === "function" ?
               type[ Object.prototype.toString.call( value ) ] || "object" :
               typeof value;
    };

    /*
     * 包含外部脚本
     * @author CoolRabbit
     * @date 2013/06/13
     * @param scriptName : string
    */

    var include = function( scriptName )
    {
        if( !scriptName || isClass( scriptName ) !== 'string' )
        {
            if( this.tip ) throw new Error( 'Parameter type error.', 'Error' );
        }
        else
        {
            var scriptGroup  = document.scripts;
            var scriptNumber = scriptGroup.length;
            var scriptFind   = undefined;
            var scriptPath   = undefined;

            // 从加载的脚本中找到 eraEngine.js //
            for( ; scriptNumber > 0; scriptNumber -- )
            {
                scriptFind = scriptGroup[ scriptNumber - 1 ].src;

                if( scriptFind.indexOf( 'eraEngine.js' ) > -1 )
                {
                    scriptPath = scriptFind.substring( 0, scriptFind.lastIndexOf( '/' ) + 1 );

                    break;
                };
            };

            var script = document.head.appendChild( document.createElement( 'script' ) );
            var ajax = new XMLHttpRequest() || new ActiveXObject( 'Microsoft.XMLHTTP' );

            ajax.open( 'GET', scriptPath + scriptName, false );
            ajax.send( null );

            script.text = ajax.responseText;
            script.setAttribute( 'src', scriptName );
        };
    };

    /*
     * 初始化 eraEngine
     * @author CoolRabbit
     * @date 2013/06/13
     * @param node : string
     * @return object : eraEngine object
    */

    var eraEngine = function( node )
    {
        return new eraEngine.model.initial( node );
    };

    /*
     * eraEngine 对象原型
     * @author CoolRabbit
     * @date 2013/06/13
    */

    eraEngine.model = eraEngine.prototype =
    {
        // 初始化 eraEngine 信息 //
        tip       : true,
        eraEngine : 1215,

        // 初始化 eraEngine 公共属性 //
        canvas         : null,
        stage          : null,
        canvasX        : 0,
        canvasY        : 0,
        canvasZ        : 0,
        canvasPosition : null,
        canvasWidth    : 0,
        canvasHeight   : 0,

        // 初始化画布对象 //
        initial : function( node )
        {
            var canvas;

            // 处理 era( '' ), era( null ), 或 era( undefined ) //
            if( !node )
            {
                return this;
            };

            // 处理 era( DOMElement / window ) //
            if( node.nodeType || node === window )
            {
                if( this.tip ) throw new Error( 'Parameter type error.', 'Error' );

                return this;
            };

            // 处理 era( string ) //
            if( isClass( node ) === 'string' )
            {
                canvas = document.getElementById( node );

                if( canvas.nodeType == 1 && canvas.nodeName == 'CANVAS' )
                {
                    this.canvas         = canvas;
                    this.stage          = canvas.getContext( '2d' );
                    this.canvasX        = this.canvas.offsetLeft;
                    this.canvasY        = this.canvas.offsetTop;
                    this.canvasZ        = this.canvas.style.zIndex;
                    this.canvasPosition = this.canvas.style.position;
                    this.canvasWidth    = this.canvas.width;
                    this.canvasHeight   = this.canvas.height;
                }
                else
                {
                    if( this.tip ) throw new Error( 'Canvas object not found.', 'Error' );

                    return this;
                };
            };
            
            // 初始化渲染队列 //
            this.queueModel   = [];
            this.queueAction  = [];
            this.queueRecover = [];

            // 初始化缓存画布 //
            this.buffCanvas = document.createElement( 'canvas' );
            this.buffStage  = this.buffCanvas.getContext( '2d' );

            return this;
        }
    };

    /*
     * eraEngine 继承
     * @author CoolRabbit
     * @date 2013/06/13
    */

    eraEngine.extend = eraEngine.model.extend = function()
    {
        var methodNumber = 0;
        var methodName   = undefined;

        for( ; methodNumber < arguments.length; methodNumber ++ )
        {
            for( methodName in arguments[ methodNumber ] )
            {
                this[ methodName ] = arguments[ methodNumber ][ methodName ];
            };
        };
    };

    // 定义初始化函数的原型 //
    eraEngine.model.initial.prototype = eraEngine.model;

    // 公开 eraEngine 全局对象 //
    window.eraEngine = window.era = eraEngine;

    // 链接 eraEngine 私有方法 //
    eraEngine.isClass = isClass;
    eraEngine.include = include;

    // 包含子类文件 //
    include( 'eraEngine.model.js' );
    include( 'eraEngine.texture.js' );
    include( 'eraEngine.action.js' );
    include( 'eraEngine.renderer.js' );
    include( 'eraEngine.tools.js' );

    include( 'eraEngine.plugins.filter.js' );
    include( 'eraEngine.plugins.shadow.js' );

 } )( window );