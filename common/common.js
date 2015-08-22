$(function(){
	//执行每个demo,添加测试按钮
	$('div.demoarea .code').each(function(){
		var $this = $(this),
		$testBtn = $('<input class="testDemo" style="padding:5px" type="button" value="测试">');
		
		$testBtn.on('click', function(){
			autoExec($(this).prev('.code'));
		});
		
		autoExec(this);
		$this.after($testBtn);
		/*var $code = $('<div>code代码:</div>');
		$this.prepend($code);
		//var $copy = $('<a>复制</a>');
		if($code.zclip){
			$this.find('>div').first().append('<a class="copy">复制</a>');
			$this.find('a.copy').zclip({
				copy : $this.find('xmp').text(),
				clickAfter : true,
				afterCopy : function(){
					alert('复制成功')
				}
			});
			//$code.append($copy);
		}*/
		//添加html和code标识和复制按钮
		$this.prepend('<div>js代码:</div>');
		$this.prev('.html').prepend('<div>html代码:</div>');
		//return false;
	});
	
	//编辑后执行代码
	function autoExec(elem){
		var $this = $(elem),
			code = $this.find('xmp').text(),
			html = $this.prev('.html').find('xmp').text();
		$this.prev('.html').prev().html(html);
		eval(code);
	}
	
	//双击后编辑
	$('.demoarea xmp').dblclick(function(){
		var $this = $(this),
			$textarea = $('<textarea>');
		
		$textarea.val($this.text());
		$textarea.css({'height' : $this.css('height'), 'border' : 'red solid 2px'});
		$this.after($textarea);
		$this.hide();
		
		if(typeof CodeMirror !== 'undefined' && CodeMirror.fromTextArea){
			var editor = null,
				opt = {
					lineNumbers: true,
					matchBrackets: true,
					extraKeys: {"Enter": "newlineAndIndentContinueComment"}
					//theme  : 'eclipse'
				}
			if($this.parent('div').hasClass('code')){
				opt.mode = "text/javascript";
			}else{
				opt.mode = "text/html";
				opt.tabMode = "indent";
			}
			editor = CodeMirror.fromTextArea($textarea[0], opt);
			$(editor.getWrapperElement()).css({'height' : $this.outerHeight(), 'border' : 'red solid 2px'});
			
			//console.log(editor)
			editor.focus();
			editor.on('blur', function(){
				editor.toTextArea();
				$this.text($textarea.val());
				$this.show();
				$textarea.remove();
			});
			
		}else{
			$textarea.focus();
			$textarea.blur(function(){
				$this.text($(this).val());
				$this.show();
				$(this).remove();
			});
		}
	});
		
	
	$('xmp').attr('title', '双击可编辑后在测试！');
	
	
	//快捷入口
	var $selectItem = $('#selectItem');
	$('h3').each(function(i){
		this.id = 'item_' + i;
		$(this).text((i + 1) + '.' +$(this).text());
		$selectItem.append('<option value="'+ this.id +'">'+ $(this).text() +'</option>');
	});
		
	
	//跳转到每个demo
	$selectItem.change(function(){
		location.href = '#'+this.value;	
	});
	
	//设置快捷方式浮动
	$('#shortcut').css({position : 'fixed', top : '48%', right : '10px', background : '#29E', padding : '10px', 'border-radius' : '8px', 'z-index' : 9999});
	
	var $returnTop = $('<a style=" width:80px;height:80px;position:fixed;right:40px;top:57.62%;background:#29E;color:white; display:block; font-size:28px; line-height:40px; text-align:center;text-decoration:none;border-radius:16px;">返回顶部</a>');
	$returnTop.click(function(){
		$("html, body").animate({ scrollTop: 0 });
  		return false;	
	});
	$returnTop.hover(function(){
		$(this).css('background', '#28B');	
	},function(){
		$(this).css('background', '#29E');	
	});
	$(document.body).append($returnTop);
	
	$(window).scroll(function(){
		if($(this).scrollTop() > 700){
			$returnTop.show();	
		}else{
			$returnTop.hide();	
		}
	});
	
	insertCss('codemirror.css', '../common/codemirror/');
	insertCss('eclipse.css', '../common/codemirror/');
	
	insertJs('codemirror.js', '../common/codemirror/', function(){
		insertJs('xml.js', '../common/codemirror/', function(){
			insertJs('javascript.js', '../common/codemirror/', function(){
				insertJs('css.js', '../common/codemirror/', function(){
					insertJs('htmlmixed.js', '../common/codemirror/');
				});
			});
		});
	});
	
	/*insertJs('codemirror.js', '../codemirror/');
	insertJs('xml.js', '../codemirror/');
	insertJs('javascript.js', '../codemirror/');
	insertCss('css.js', '../codemirror/');
	insertJs('htmlmixed.js', '../codemirror/');*/
	
	//动态引入css文件
	function insertCss(filename, path){
		path = path || '';
		
		var cssHref = path + filename,
			$link = $('<link>');
		
		$link.attr({
				type : 'text/css',
				rel : 'stylesheet',
				href : cssHref
			});
		$("head")[0].appendChild($link[0]);
	}
	
	//动态引入js文件
	function insertJs(filename, path, callback){
		path = path || '';
		
		var jsSrc = path + filename,
			$script = $('<script>');
			
		$script.attr({
			type : 'text/javascript',
			src : jsSrc
		});
		$("head")[0].appendChild($script[0]);
		if(callback){
			$script.load(function(){
				callback();	
			});
		}
	}

	var href = location.href;
	if(href.indexOf('moreDemo') > 0){
		var $customBtn = $('<input class="customBtn" style="padding:5px" type="button" value="以此模板定制">');
		
		$customBtn.click(function(){
			var $demoArea = $(this).closest('.demoarea');
			var $demoArea2 = $demoArea.clone(true);
			var r = parseInt(Math.random() * 10000) + 10000;
			
			$demoArea2.addClass('customDemoarea').css('border', '2px solid red');
			$demoArea2.find('xmp').each(function(){
				$(this).text($(this).text().replace(/id=(['"])(.*?)\1/gm, function(m, quote, id){
					id = id.replace(/\d/, '');
					return 'id="'+ id + r +'"';
				}).replace(/\$\((['"])(#.*?)\1\)/g, function(m, quote, id){
					id = id.replace(/\d/, '');
					return '$('+ quote + id + r + quote +')';
				}));
			});
			var $customSubmit = $('<input class="submit" style="padding:5px" type="button" value="复制定制">');
			
			$demoArea2.find('input.customBtn').hide().after($customSubmit);
			$demoArea2.hide();
			$demoArea.after($demoArea2);
			$("html, body").animate({ scrollTop: $demoArea.offset().top + $demoArea.height() }, 50);
			
			$demoArea2.slideDown('slow');
			
			$demoArea2.find('input.testDemo').click();
			
			$customSubmit.zclip({
				path : '../zclip/res/ZeroClipboard.swf',
				copy : function(){
					var $demoarea = $(this).closest('.demoarea');
					var title = $demoarea.find('h3').text().replace(/\d+\./, '');
					var html = $demoarea.find('div.html>xmp').html();
					var code = $demoarea.find('div.code>xmp').html();
					
					var demoarea = '<div class="demoarea">\r\n\
						<h3>' + title + '</h3>\r\n\
						<div></div>\r\n\
						<div class="html">\r\n\
							<xmp>\
							   '+ html +'\
							</xmp>\r\n\
						</div>\r\n\
						<div class="code">\r\n\
							<xmp>\
								'+ code +'\
							</xmp>\r\n\
						</div>\r\n\
					</div>';
					return demoarea;
				},
				afterCopy : function(){
					alert('已复制到剪切板！请粘贴到moreDemo.html文件内，并提交svn供它人参考！谢谢');
				}
			});
			
			
		});
		$('input.testDemo').after($customBtn);	
		$demoArea2.find('input.testDemo').click();
	}

});