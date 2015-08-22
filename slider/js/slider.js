/*
 * @version 1.0
 * @date 2012-10-26 18:30
 * @author qianmingwei
 * @description 这是一个焦点图插件
 */
;(function ($) {
	"use strict";//严格模式
	var izp = window.izp = window.izp || {};
	izp.slider = {};
	insertCss('slider');//动态引入css
	
	$.slider = function(elem, opt) {
		return new Slider().init(elem, opt);
	}
	
	$.fn.slider = function(opt) {
		return new Slider().init(this, opt);
	}
	
	/**
	*构造函数
	*/
	function Slider(){
		this.setting = {};
		this.currTime = -1;
		this.defaultConfig = {
			customNav : false,			//是否自定义导航控制
			customNavClsName : '',		//自定义导航控制时className
			customNavControlClsName : '',//自定义导航控制时当前控制项className
			mouseover : function(){},	//自定义导航控制时鼠标移上时触发
			mouseout : function(){},	//自定义导航控制时鼠标移出时触发
			loop : true,				//true循环自动切换, false只能点击导航控制时切换
			scrollSpeed : 500,			//速度（单位豪秒）
			scrollDelay : 4000,			//切换时间间隔（单位豪秒）
			animationType: "slide",		//切换效果fade淡入、slide_h或slide水平方向 、slide_v竖直方向
			mouse : 'click',			//click鼠标点击 hover鼠标划过
			controlNav: 'h',			//导航控制方向h水平，v垂直, none不显示
			controlNavLeft : false,		//导航控制距左边距离 4个方向其中两个配合使用其它两个设为false
			controlNavTop : false,		//导航控制上边距离
			controlNavRight : 10,		//导航控制距右边距离
			controlNavBottom : 10,		//导航控制距下边距离
			controlShowNum : true,		//导航控制是否显示数字
			directionNav : 'none',		//h水平，v垂直, none不显示
			itemWidth : 640,			//每一项的宽度
			itemHeight : 420,			//每一项的高度
			itemMargin : 0,				//每一项的margin
			items : 0,					//总项数
			showItems : 1,				//在页面中显示项数
			currItem : 0,				//当前显示的基数默认显示 从0开始
			/*tabList : {
					autoLoad : true,
					async : true,
					url : ['www.baidu.com', 'www.baidu.com', 'www.baidu.com', 'www.baidu.com'],
					succCallback : function(){},
					failCallback : function(){}
			},*/
			tabList : false,			//选项卡列表
			async : false,				//是否同步
			pauseOnHover : true,		//mouse 移入时是否暂停
			keyboardNav : false			//未实现
		};
	}
	
	Slider.prototype = {
		constructor : Slider,
		init : function(elem, opt){
			if($.type(opt) == 'undefined'){
				opt = {};
			}
			$.extend(this.setting, this.defaultConfig, opt);
			
			var setting = this.setting,
				that = this;
			this.container = $(elem);
			this.sliderContainer =this.container.find('div.main');
			this.sliderULContainer = this.sliderContainer.find('ul.sliders');
			this.sliderLIContainer = this.sliderULContainer.find('>li');
			
			//根据需要重置参数
			setting.itemWidth = setting.itemWidth || parseInt($imgs.css('width'));
			setting.itemHeight = setting.itemHeight || parseInt($imgs.css('height'));
			setting.itemMargin = setting.showItems == 1 ? 0 : setting.itemMargin;
			
			if(setting.tabList){
				setting.controlNav = 'none';
				setting.loop = false;
				this.controlTabList();
			}
			setting.items = setting.items || this.sliderLIContainer.size();
			if(this.tabListULContainer){
				setting.items = this.tabListLIContainer.size();	
			}
			setting.showItems = setting.showItems > setting.items ? setting.items : setting.showItems;

			this.pauseOnHover();
			this.controlNav();
			this.directionNav();
			this.customNav();//图片导航
			this.size();
			this.firstDisplay(setting.currItem);
			this.animation();
			if(setting.loop){
				this.timer();	
			}
			
			if(setting.tabList && setting.tabList.autoLoad){
				this.autoLoadTabList();
			}
			return this;
		},
		
		//自定义导航
		customNav : function(){
			var that = this,
				setting = this.setting;
			if(setting.customNav === true){
				this.container.find('ul.custom_nav').addClass(setting.customNavClsName);
				this.picContainer = this.container.find('ul.custom_nav li');
				this.picContainer.hover(function(){
						setting.mouseover($(this).find('a'));
					},
					function(){
						setting.mouseout($(this).find('a'));
					}
				);
				
				this.hover(this.picContainer, 
						function(){
							
							//$(this).find('a').css('background-position', '50px 50px');
							that.clearThread(that.thread, 'interval');
							that.clearThread(that.timerAnimationThread);
							setting.currItem = $(this).index();
							that.animation(true);
						},
						function(){
							
							//$(this).find('a').css('background-position', '0px 0px');
							that.clearThread(that.thread, 'interval');
							that.currTime = that.currNum;
							that.timerAnimation(that.currTime);
						}
					);
			}
		},
		
		/**
		*自动加载TabList
		*/
		autoLoadTabList : function(){
			var len = this.tabListLIContainer.size();
			for(var i=0;i<len;i++){
				this.loadTabList(i);
			}
		},
		
		/**
		*选项卡
		*/
		controlTabList : function(){
			var that = this,
				setting = this.setting;
			if(setting.tabList){
				this.tabListULContainer = this.container.find('ul.tab_list');
				this.tabListLIContainer = this.tabListULContainer.find('li');
				
				if(setting.mouse == 'click'){
					this.tabListLIContainer.click(function(){
						var tabList = setting.tabList;
						var i = $(this).index();
						if(i == setting.currItem){
							return ;
						}
						setting.currItem = i;
						that.animation(true);
						that.animation();	
						that.loadTabList(setting.currItem);
					});
					this.hover(this.tabListLIContainer, function(){$(this).addClass('focus');},function(){$(this).removeClass('focus');});
				}else{
					this.hover(this.tabListLIContainer, 
						function(){
							$(this).addClass('focus');
							that.clearThread(that.thread, 'interval');
							that.clearThread(that.timerAnimationThread);
							setting.currItem = $(this).index();
							that.animation(true);
							that.loadTabList(setting.currItem);
						},
						function(){
							$(this).removeClass('focus');
							that.clearThread(that.thread, 'interval');
							that.currTime = that.currNum;
							that.timerAnimation(that.currTime);
						}
					);
				}
			}
		},
	
		/**
		*加载TabList
		*/
		loadTabList : function(i){
			var that = this,
				tabList = this.setting.tabList;
				
			that.tabList = that.tabList || [];
			if(that.tabList && $.inArray(i, that.tabList) == -1){
				$.ajax({
					url: tabList.url[i],
					async:tabList.async,
					dataType : tabList.dataType,
					success: function(data){
						that.tabList.push(i);
						tabList.succCallback(data, that.sliderLIContainer.eq(i));
					},
					fail : function(){
						tabList.failCallback();
					}
				});
			}
		},
		
		/**
		*mouse 移入暂停
		*/
		pauseOnHover : function(){
			var setting = this.setting,
				that = this;
			if(setting.pauseOnHover){
				this.hover(this.sliderLIContainer
					,function(){
						that.clearThread(that.thread, 'interval');
						that.clearThread(that.timerThread, 'interval');
					},function(){
						that.clearThread(that.thread, 'interval');
						that.currTime = that.currNum;
						that.timerAnimation(that.currTime);
					}
				);
			}
		},
		
		/**
		*设置导航控制器
		*/
		controlNav : function(){
			var that = this,
				setting = this.setting;
			if(setting.controlNav != 'none'){
				this.createControlNav(setting);
				this.controlNavContainer = this.sliderContainer.find('ul.control_nav');
				this.controlNavLIContainer = this.controlNavContainer.find('li');
				this.controlNavPos(setting.controlNavLeft, setting.controlNavTop, setting.controlNavRight, setting.controlNavBottom);
				this.controlNavContainer.addClass(setting.controlNav == 'h' ? 'control_nav_h' : 'control_nav_v');
				if(setting.controlShowNum)this.controlNavContainer.addClass('control_nav_num');
				
				if(setting.mouse == 'click'){
					this.controlNavLIContainer.click(function(){
						var i = $(this).index();
						if(i == setting.currItem){
							return ;
						}
						setting.currItem = i;
						that.animation(true);
						that.animation();	
					});
					this.hover(this.controlNavLIContainer,
						function(){
							$(this).addClass('focus');
						},
						function(){
							$(this).removeClass('focus');
						}
					);
				}else{
					this.hover(this.controlNavLIContainer,
						function(){
							$(this).addClass('focus');
							that.clearThread(that.thread, 'interval');
							that.clearThread(that.timerAnimationThread);
							setting.currItem = $(this).index();
							that.animation(true);
						},
						function(){
							$(this).removeClass('focus');
							that.clearThread(that.thread, 'interval');
							that.currTime = that.currNum;
							that.timerAnimation(that.currTime);
						}
					);
				}
			}
		},
		
		/**
		*创建导航控制器
		*@param setting 配置信息
		*/
		createControlNav : function(setting){
			var strArr = ['<ul class="control_nav">'],
				controlShowNum = setting.controlShowNum,
				num = '',
				len = Math.ceil(setting.items/setting.showItems);
			for(var i=0; i<len;i++){
				num = controlShowNum ? i + 1 : '';
				strArr[strArr.length] = '<li><a>'+ num +'</a></li>';
			}
			strArr[strArr.length] = '</ul>';
			this.sliderContainer.append(strArr.join(''));
		},
		
		/**
		*设置导航控制器位置
		*@param right 距右距离
		*@param bottom 距左距离
		*/
		controlNavPos : function(left , top, right, bottom){
			var opt = {};
			
			if(left){
				opt.paddingLeft = left;
				opt.left = 0;	
			}
			if(top){
				opt.paddingTop = top;
				opt.top = 0;
			}
			if(right){
				opt.paddingRight = right;
				opt.right = 0;	
			}
			if(bottom){
				opt.paddingBottom = bottom;	
				opt.bottom = 0;
			}
			this.controlNavContainer.css(opt);		
		},
		
		/**
		*方向导航控制器
		*/
		directionNav : function(){
			var that = this,
				setting = this.setting;
			if(setting.directionNav != 'none'){
				this.createDirectionNav(setting.directionNav);
				this.directionNavContainer = this.sliderContainer.find('ul.direction_nav');
				this.preBtn = this.directionNavContainer.find('[class^=slider_prev]');
				this.nextBtn = this.directionNavContainer.find('[class^=slider_next]');
				this.preBtn.mousedown(function(){
					if(that.sliderULContainer.is(':animated')){
						return ;
					}
					setting.currItem--;
					that.animation(true);
				});
				
				this.nextBtn.mousedown(function(){
					if(that.sliderULContainer.is(':animated')){
						return ;
					}
					setting.currItem++;
					that.animation(true);
				});
				
				this.preBtn.hover(function(){
					$(this).addClass('focus');
					that.clearThread(that.thread, 'interval');
					that.clearThread(that.timerThread, 'interval');
					that.clearThread(that.timerAnimationThread);
				}, function(){
					$(this).removeClass('focus');
					that.clearThread(that.thread, 'interval');
					that.currTime = that.currNum;
					that.timerAnimation(that.currTime);
				});
				
				this.nextBtn.hover(function(){
					$(this).addClass('focus');
					that.clearThread(that.thread, 'interval');
					that.clearThread(that.timerThread, 'interval');
					that.clearThread(that.timerAnimationThread);
				}, function(){
					$(this).removeClass('focus');
					that.clearThread(that.thread, 'interval');
					that.currTime = that.currNum;
					that.timerAnimation(that.currTime);
				});
			}
		},
		
		/**
		*创建方向导航
		*@param setting 配置信息
		*/
		createDirectionNav : function(dir){
			var dirLeft = '',
				dirRight = '';
			if(dir !== 'v'){
				dir = 'h';
				dirLeft = '<';
				dirRight = '>';
			}
			
			var str = '<ul class="direction_nav"><li><a class="slider_prev_'+ dir +'">'+ dirLeft +'</a></li><li><a class="slider_next_'+ dir +'">'+ dirRight +'</a></li></ul>';
			this.sliderContainer.append(str);
		},
		
		/**
		*设置大小
		*/
		size : function(){
			var setting = this.setting,
				sliderWidth,
				sliderHeight,
				sliderULWidth,
				sliderULHeight;
			this.sliderLIContainer.css('margin', setting.itemMargin);
			this.sliderULContainer.addClass(setting.animationType);
			
			sliderWidth = setting.itemWidth + setting.itemMargin * 2;
			sliderHeight = setting.itemHeight + setting.itemMargin * 2;
			sliderULWidth = sliderWidth;
			sliderULHeight = sliderHeight;
			if(setting.animationType == 'fade'){
			}else if(setting.animationType == 'slide_h' || setting.animationType == 'slide'){
				sliderULWidth = sliderULWidth * setting.items;
				sliderWidth = sliderWidth * setting.showItems;
			}else if(setting.animationType == 'slide_v'){
				sliderULHeight = sliderULHeight * setting.items;
				sliderHeight = sliderHeight * setting.showItems;
			}
			this.sliderContainer.css({width : sliderWidth, height : sliderHeight});
			this.sliderULContainer.css({width : sliderULWidth, height : sliderULHeight});
			this.sliderLIContainer.css({width : setting.itemWidth, height : setting.itemHeight, overflow : 'hidden'});
		},
		
		/**
		*第一次运行时默认显示
		*@param currItem int 
		*/
		firstDisplay : function(currItem){
			var animationType = this.setting.animationType;
			if(animationType == 'fade'){
				this.sliderLIContainer.hide().eq(currItem).show();
			}
			this.animation(animationType, true);
		},
		
		/**
		*鼠标移出时剩下currTime内执行
		*@param currTime number 
		*/
		timerAnimation : function(currTime){
			var that = this,
				setting = this.setting,
				scrollDelay = currTime != -1 ? setting.scrollDelay - currTime * 1000 : setting.scrollDelay;
			this.currTime = -1;
			that.currNum = 0;
			if(that.timerAnimationThread) clearTimeout(that.timerAnimationThread);
			that.timerAnimationThread = setTimeout(function(){
				that.timer();
				setting.currItem ++;
				that.animation(true);
				that.animation();
			}, scrollDelay);
		},
		
		/**
		*鼠标移入定时用
		*/
		timer : function(){
			var that = this;
			that.currNum = 0;
			this.timerThread = setInterval(function(){
				that.currNum ++;
				if(that.currNum == that.setting.scrollDelay/1000){
					that.currNum = 0;
				}
			},1000);
		},
		
		/**
		*根据动画类型切换效果
		*@param animationType 动画类型
		*@param one 执行一次
		*/
		animation : function(one){
			var that = this,
				setting = this.setting,
				fun = setting.animationType == 'fade' ? 'fadeAnim' : 'slideAnim';
			
			this.clearThread(this.thread, 'interval');
			this.currNum = 0;
			
			if(one){
				that[fun]();
			}else if(setting.loop){
				this.thread = setInterval(function(){
					setting.currItem ++ ;
					that[fun]();
				}, setting.scrollDelay);
			}
		},
		
		/**
		*淡入淡出效果
		*/
		fadeAnim : function(){
			var that = this,
				setting = that.setting;
				
			that.changeMinMax();
			that.sliderLIContainer.eq(that.pre).fadeOut(setting.scrollSpeed);
			that.sliderLIContainer.eq(setting.currItem).fadeIn(setting.scrollSpeed);
			that.controlNavLIContainer ? that.controlNavLIContainer.removeClass('curr').eq(setting.currItem).addClass('curr') : '';
			that.picContainer && setting.customNavControlClsName ? that.picContainer.removeClass(setting.customNavControlClsName).eq(setting.currItem).addClass(setting.customNavControlClsName) : '';
			that.tabListLIContainer ? that.tabListLIContainer.removeClass('curr').eq(setting.currItem).addClass('curr') : '';
			that.pre = setting.currItem;
		},
		
		/**
		*从边切换效果
		*/
		slideAnim : function(){
			var that = this,
				setting = that.setting,
				maxItem = Math.ceil(setting.items/setting.showItems) - 1,
				params = {},
				len,
				totalLen,
				delayFn = function(){},
				dir = 'left',
				wh = 'Width',
				opt = {},
				itemFocus,
				scrollSpeed = setting.scrollSpeed,
				currItem = setting.currItem;
			
			if(setting.animationType == 'slide_v'){
				dir = 'top';
				wh = 'Height';
			}
			
			if(currItem == -1){//实现由第一个切换到最后一个时一个方向动画
				//opt这里实现动态传入参数
				opt.position = 'relative';
				opt[dir] = '-' + that.sliderULContainer.css(wh.toLowerCase());
				if(setting.showItems === 1){
					that.sliderLIContainer.last().css(opt);
				}else{
					that.sliderLIContainer.slice(-setting.showItems).css(opt)
				}
				itemFocus = Math.ceil(setting.items/setting.showItems);
				
				delayFn = function(){//动画完成后执行
				
					opt.position = '';
					opt[dir] = '';
					if(setting.showItems === 1){
						that.sliderLIContainer.last().css(opt);
					}else{
						that.sliderLIContainer.slice(-setting.showItems).css(opt)
					}
					
					setting.currItem = maxItem;
					opt =  {};
					opt[dir] = -setting.currItem * (setting['item' + wh] + setting.itemMargin * 2) * setting.showItems;
					that.sliderULContainer.css(opt);
				}
			}else if(currItem < -1){
				setting.currItem = -1;
			}
			
			if(currItem == maxItem + 1){
				opt.position = 'relative';
				opt[dir] = that.sliderULContainer.css(wh.toLowerCase());
				if(setting.showItems === 1){
					that.sliderLIContainer.first().css(opt);
				}else{
					that.sliderLIContainer.slice(0, setting.showItems).css(opt)
				}
				itemFocus = 0;
				
				delayFn = function(){
					opt.position = '';
					opt[dir] = '';
					if(setting.showItems === 1){
						that.sliderLIContainer.first().css(opt);
					}else{
						that.sliderLIContainer.slice(0, setting.showItems).css(opt)
					}
					setting.currItem = 0;
					opt =  {};
					opt[dir] = 0;
					that.sliderULContainer.css(opt);
				}
				delayFn.flag = true;
			}else if(currItem > maxItem + 1){
				setting.currItem = maxItem;
			}
			len = currItem * (setting['item' + wh] + setting.itemMargin * 2) * setting.showItems;
			params[dir] = -len;
			if(typeof itemFocus == 'undefined'){
				itemFocus = currItem;
			}
			that.controlNavLIContainer ? that.controlNavLIContainer.removeClass('curr').eq(itemFocus).addClass('curr') : '';
			that.picContainer && setting.customNavControlClsName ? that.picContainer.removeClass(setting.customNavControlClsName).eq(itemFocus).addClass(setting.customNavControlClsName) : '';
			that.tabListLIContainer ? that.tabListLIContainer.removeClass('curr').eq(currItem).addClass('curr') : '';
			that.params = params;
			that.paramsFn = delayFn;
			that.sliderULContainer.animate(params, scrollSpeed, 'swing', delayFn);
			
		},
		
		changeMinMax : function(){
			var setting = this.setting,
				maxItem = Math.ceil(setting.items/setting.showItems) - 1;
			if(setting.currItem > maxItem){
				setting.currItem = 0;
			}else if(setting.currItem < 0){
				setting.currItem = maxItem;
			}
		},
		
		/**
		*连续多个元素hover时一定时间内不触发hover
		*@param $o 要绑定的jQuery对象
		*@param fn1 进入元素时执行函数
		*@param fn2 移出元素时执行函数
		*@param interval 时间间隔
		*/
		hover : function($o, fn1, fn2, interval){
			var that = this;
			fn1 = fn1 || $.noop();
			fn2 = fn2 || $.noop();
			interval = interval || 200;
			
			$o.hover(function(){
				var self = this;
					that.hoverThread = setTimeout(function(){
						fn1.call(self);
					}, interval);
				},
				function(){
					that.clearThread(that.hoverThread);
					fn2.call(this);
				}
			);
		},
		
		clearThread : function(threadId, type){
			if(threadId){
				if(type == 'interval'){
					clearInterval(threadId);
				}else{
					clearTimeout(threadId);	
				}
			}
		},
		
		desdroy : function(){
			this.clearThread(this.thread, 'interval');
			this.clearThread(this.timerThread, 'interval');
			this.clearThread(this.hoverThread);
			this.clearThread(this.timerAnimationThread);
			
			this.container = null;
			this.sliderContainer = null;
			this.sliderULContainer = null;
			this.sliderLIContainer = null;
			this.tabListULContainer = null;
			this.tabListLIContainer = null;
			this.directionNavContainer = null;
			this.controlNavContainer = null;
			this.controlNavLIContainer = null;
			this.preBtn = null;
			this.nextBtn = null;
		}
	}
	
	/**
	*动态引入css文件
	@param filename 文件名
	*@return scriptSrc
	*/
	function insertCss(filename){
		var cssHref = getPath(filename) + 'css/'+ filename +'.min.css',
			$link = $('<link>');
		
		$link.attr({
				type : 'text/css',
				rel : 'stylesheet',
				href : cssHref
			});
		$("head")[0].appendChild($link[0])
	}

	/**
	*获取本脚本文件路径
	@param filename 文件名
	*@return scriptSrc
	*/
	function getPath(filename){
		var scriptSrc = '';
		
		$('script').each(function() {
            var src = $(this).prop('src').toLowerCase();
			var pos = src.indexOf('js/'+ filename +'.min.js');
			pos = pos >= 0 ? pos : src.indexOf('js/'+ filename +'.js');
			if(pos >= 0){
				scriptSrc = src.substr(0, pos);
				return false;
			}
        });
		return scriptSrc;
	}
	
})(jQuery);