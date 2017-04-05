/**
 * 视频播放插件-基于jquery
 * 				包装百度视频播放插件
 * @return {object} 视频播放对象
 * @author chy
 * @date 2015/11/19
 */
(function($){
	//检查浏览器是否支持flash
	var flash_checker=(function flashChecker() {
        var hasFlash = false;   //是否安装了flash
        var version = 0;        //flash版本

        var swf;
        if(document.all) {
            try {
                swf = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
            } catch (e) {
                hasFlash = false;
            }
            if(swf) {
                hasFlash = true;
                version = parseInt(swf.GetVariable("$version").split(" ")[1].split(",")[0]);
            }
        }else if (navigator.plugins && navigator.plugins.length > 0) {
            swf = navigator.plugins["Shockwave Flash"];
            if(swf) {
                hasFlash = true;
                var words = swf.description.split(" ");
                for (var i = 0; i < words.length; ++i) {
                    if (isNaN(parseInt(words[i]))) continue;
                    version = parseInt(words[i]);
                }
            }
        }
        return {
            hasFlash: hasFlash,
            version: version
        };
    }());
    
	//图标常量
	var close_icon = 'data:image/png;base64,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';
	var loading = 'data:image/gif;base64,R0lGODlhPAA8APeKADo6OicnJzw8PDs7Ozc3NxsbGzY2NhISEg8PDxAQEBMTE2VlZTU1NSgoKBQUFD4+PiIiIg4ODhUVFTQ0NA0NDRYWFi0tLSoqKisrKy4uLjMzMy8vLyMjIxgYGCkpKRkZGSAgIDAwMDExMR8fHx4eHiUlJRoaGkZGRhwcHB0dHWhoaP///8nJyZOTk0RERENDQ0xMTD8/P0FBQUVFRUBAQFVVVWJiYuzs7GBgYEdHR2dnZ1FRUYmJiVhYWKWlpU5OTlJSUkhISFBQUFdXV0pKSrq6ulNTU1xcXIWFhV9fX0lJSQQEBAAAAE9PT1ZWVl5eXmZmZk1NTbu7u2RkZPz8/EJCQsbGxltbW5GRkVlZWYqKiu3t7QsLC0tLS5KSkoSEhGNjY1paWqSkpMfHx1RUVP39/WFhYaioqF1dXYeHh6ampoiIiI2NjYaGhmlpaYyMjG1tbXBwcJSUlH9/f25ubnFxcWxsbMjIyMrKyri4uJWVlZCQkI+Pj3R0dI6Ojrm5uSQkJDIyMjk5OSwsLCEhIRcXFxERETg4OD09PSYmJv///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/wtYTVAgRGF0YVhNUDw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RkYzM0E4NUQ0QTJCMTFFNTg1MDFBRjQwOUYwNUU3NkQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RkYzM0E4NUU0QTJCMTFFNTg1MDFBRjQwOUYwNUU3NkQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGRjMzQTg1QjRBMkIxMUU1ODUwMUFGNDA5RjA1RTc2RCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGRjMzQTg1QzRBMkIxMUU1ODUwMUFGNDA5RjA1RTc2RCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgH//v38+/r5+Pf29fTz8vHw7+7t7Ovq6ejn5uXk4+Lh4N/e3dzb2tnY19bV1NPS0dDPzs3My8rJyMfGxcTDwsHAv769vLu6ubi3trW0s7KxsK+urayrqqmop6alpKOioaCfnp2cm5qZmJeWlZSTkpGQj46NjIuKiYiHhoWEg4KBgH9+fXx7enl4d3Z1dHNycXBvbm1sa2ppaGdmZWRjYmFgX15dXFtaWVhXVlVUU1JRUE9OTUxLSklIR0ZFRENCQUA/Pj08Ozo5ODc2NTQz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';
	// 弹窗情况下存储所有弹窗
	var _list= {
		hasVideo:false,
		videoPops:[]
	};

	/**
	 * 视频播放插件构造器
	 * @param  {object} config 配置参数
	 * @return 
	 */
	function videoPlayer(config,target){
		var that = this,
			options = {
				key:'',
				container:'videoPlayer',
				videoUrl:'https://statics.ys7.com/ajax/getVod.html',
				vid:'',
				origin:'inside',//视频来源，暂时只处理内部(视频广场)视频，外部视频待考虑
				videoType:'videoGqUrl',//视频源清晰度videoFileUrl/videoBqUrl/videoGqUrl/videoCqUrl
				videoCover:'',//视频封面图片
				type:'pop',//视频打开类型 pop 弹窗 embed 嵌入
                autoStart:true,
                repeat:false//是否重复播放
			};
		that.target = target;
		that.options = $.extend(options,config);
		that.videoInfo = void 0;//初始化视频源数据

		that.init();
	}
	/**
	 * 设置pop key
	 */
	var _setPopKey = function(){
		var that = this,
			ops = that.options,
			key = ops.key,
			num = 0,
			videoPops = _list.videoPops;

		if(key)return;//参数自定义pop key直接返回不作处理

		num = videoPops.length;
		key = num;

		that.options.key = key;
	};
	/**
	 * 数据初始化
	 * 		1.获取视频源地址，并缓存
	 * 		2.初始化相关DOM
	 * @return {[type]} [description]
	 */
	videoPlayer.prototype.init = function(){
		var that = this,
			ops = that.options,
			type = ops.type,
            videoCover = ops.videoCover,
			videoType = ops.videoType;

		_setPopKey.call(that);

        if(videoCover){
            loading = videoCover;
        }

		that.renderHtml();
	
		if(type == 'pop'){
			_popShow.call(that);
		}
        if(flash_checker.hasFlash){
    		if(ops.origin == 'inside'){
    			that.getVideoFile(_successFn,_failFn);
    		}
        }else{
            that.videoLoad.css({
                backgroundImage:'none',
                color:'#fff'
            }).find('.load-text').css({display:'block'}).html('请下载或更新flash插件支持播放。<br><a style="color:#fff;" target="_blank" href="https://get.adobe.com/cn/flashplayer/">点击此处下载</a>');
            if(type == 'pop'){
                that.videoClose.off('click').on('click',function(){
                    _popHide.call(that);
                });
            }
        }
	};
	/**
	 * 初始化视频播放DOM节点，两种情况
	 * 			1. 弹窗播放时，所需的弹出层
	 * 			2. 嵌入播放时所需的嵌入层
	 * @return {[type]} [description]
	 */
	videoPlayer.prototype.renderHtml = function(){
		var that = this,
			ops = that.options,
			type = ops.type;

		if(type == 'pop'){
			that.renderPopHtml();
		}

		if(type == 'embed'){
			that.renderEmbedHtml();
		}
	};
	/**
	 * 生成弹窗播放窗口
	 * @return 
	 */
	videoPlayer.prototype.renderPopHtml = function(){
		var that = this,
			ops = that.options,
			container = ops.container,
			key = ops.key,
			type = ops.type;

		var videoWrapper = $('<div class="video-pop" id="video-'+key+'"></div>');
				videoWrapper.css({
					display:'none',
					position: 'fixed',
					width:'810px',
					height:'520px',
					left:'50%',
					marginLeft: '-415px',
					top:'50%',
					marginTop:'-270px',
					padding:'10px',
					borderRadius: '5px',
					backgroundColor: '#fff',
					border:'1px solid #ccc',
					boxShadow: '#949494 0px 2px 5px 2px'
				});
		var videoLoad = $('<div class="load-img"></div>');
			videoLoad.css({
				    position: 'absolute',
				    left: '10px',
				    right: '10px',
				    top: '40px',
				    bottom: '10px',
				    background: '#000',
				    background:'url("'+loading+'") no-repeat center center',
				    backgroundColor:'#000',
				    textAlign:'center',
                    zIndex:1
				 });
			var loadText = $('<div class="load-text"></div>');
				loadText.css({
					display:'none',
					position:'absolute',
					left:0,
					right:0,
					top:'45%'
				});
			loadText.appendTo(videoLoad);
			var videoTitleDiv = $('<div class="video-pop-title"></div>');
				videoTitleDiv.css({
					height: '30px',
					lineHeight: '30px',
					verticalAlign: 'middle'
				});
				var videoTitle = $('<h2 class="video-title"></h2>');
					videoTitle.css({
						color:'#5e5e5e',
						fontSize: '14px'
					});
				var videoClose = $('<span class="video-close"></span>');
					videoClose.css({
						display: 'inline-block',
						background:'url("'+close_icon+'") no-repeat center center',
						position:'absolute',
						top:'5px',
						right:'5px',
						width:'27px',
						height:'27px',
						cursor:'pointer'
					});
				videoTitle.appendTo(videoTitleDiv);
				videoClose.appendTo(videoTitleDiv);
			var videoBox = $('<div class="video-pop-box"></div>');
				videoBox.css({
					width:'810px',
					height:'490px'
				});
				var videoPlayer = $('<div id="'+container+'-'+key+'"></div>');
				videoPlayer.appendTo(videoBox);

		videoLoad.appendTo(videoWrapper)
		videoTitleDiv.appendTo(videoWrapper);
		videoBox.appendTo(videoWrapper);
		videoWrapper.appendTo($('body'));

		that.videoWrapper = videoWrapper;
		that.videoClose = videoClose;
		that.videoTitle = videoTitle;
		that.videoLoad = videoLoad;

		_list.videoPops.push(that.videoWrapper);
	};
	/**
	 * 打开视频播放弹窗
	 * @return 
	 */
	videoPlayer.prototype.openVideo = function(config){
		var that = this,
			ops = that.options,
			vid = that.options.vid,
            type = ops.type,
			videoWrapper = that.videoWrapper;
            if(type != 'pop')return;
			if(_list.hasVideo)return;

			_popShow.call(that);
			if(ops.origin == 'inside'&&flash_checker.hasFlash){
				that.getVideoFile(_successFn,_failFn);
			}
	};
	/**
	 * 弹窗打开的处理方法 私有方法
	 *
	 * @todo 预留回调函数接口
	 * @return {[type]} [description]
	 */
	var _popShow = function(callback){
		var that = this,
			ops = that.options,
			videoWrapper = that.videoWrapper,
			videoLoad = that.videoLoad;
		if(_list.hasVideo)return;

		videoWrapper.css({
			display:'block'
		});
		videoLoad.show();
		_list.hasVideo = true;
		callback&&callback.call(that);
	};
	/**
	 * 弹窗隐藏的处理方法
	 * 				播放器的弹窗为公用，只创建一次供多视频源使用
	 * @todo 预留回调函数接口
	 * @return {[type]} [description]
	 */
	var _popHide = function(callback){
		var that = this,
			ops = that.options,
            player = that.player,
			videoWrapper = that.videoWrapper;
        player&&player.stop();
		that.videoTitle.html('');
		videoWrapper.css({
			display:'none'
		});
		_list.hasVideo = false;
		callback&&callback.call(that);
	};
	/**
	 * 生成embed播放dom
	 * @return 
	 */
	videoPlayer.prototype.renderEmbedHtml = function(){
		var that = this,
			ops = that.options,
			container = ops.container,
			key = ops.key,
			type = ops.type;

		var videoWrapper = $('<div id="video-'+key+'"></div>');	
			videoWrapper.css({
				position:'absolute',
				left:0,
				right:0,
				top:0,
				bottom:0
			});
			var videoLoad = $('<div class="load-img"></div>');
			videoLoad.css({
				    position: 'absolute',
				    left: 0,
				    right: 0,
				    top: 0,
				    bottom: 0,
				    background: '#000',
				    background:'url("'+loading+'") no-repeat center center',
				    backgroundColor:'#000',
				    textAlign:'center',
                    zIndex:1
				 });
			var loadText = $('<div class="load-text"></div>');
				loadText.css({
					display:'none',
					position:'absolute',
					left:0,
					right:0,
					top:'45%'
				});
			loadText.appendTo(videoLoad);
			var videoPlayer = $('<div id="'+container+'-'+key+'"></div>');
		videoLoad.appendTo(videoWrapper);
		videoPlayer.appendTo(videoWrapper);
		videoWrapper.appendTo(that.target);

		that.videoWrapper = videoWrapper;
		that.videoLoad = videoLoad;

		_list.videoPops.push(that.videoWrapper);
	};
	/**
	 * 视频源请求成功处理方法 私有方法
	 * @param  {object} videoInfo 视频源数据
	 * @return            
	 */
	var _successFn = function(videoInfo){
		var that = this,
			ops = that.options,
			type = ops.type,
            repeat = ops.repeat,
			video = ops.container+'-'+ops.key,
			videoType = that.options.videoType;

		if(type == 'pop'){that.videoTitle.html(videoInfo.title)};

		var file = videoInfo[videoType];
		//处理无指定视频源的情况
		if(!file){
			var videoTypes = ['videoFileUrl','videoBqUrl','videoGqUrl','videoCqUrl'];
			for(var i=0;i<videoTypes.length;i++){
				var type = videoInfo[videoTypes[i]];
				if(videoType != type){
					if(type){
						file = type;
					}
				}
			}
		}
        file = file.replace(/http:/,'https:');
		var player = cyberplayer(video).setup({
			width : '100%',//百分比依据父元素宽高
	        height : '100%',
	        backcolor : "#FFFFFF",
	        stretching : "exactfit",
	        file : file, 
	        image : ops.videoCover,
	        autoStart : ops.autoStart,
	        repeat : repeat,
	        volume : 100,
	        controls : "over"
		});
		player.onReady(function(){
			that.videoLoad.fadeOut();
		});
		that.player = player;
		if(type == 'pop'){
			that.videoClose.off('click').on('click',function(){
				_popHide.call(that);
			});
		}
	};
	var _failFn = function(result){
		var that = this,
			ops = that.options,
			type = ops.type,
			videoLoad = that.videoLoad;

		that.videoLoad.css({
			backgroundImage:'none',
			color:'#fff'
		}).find('.load-text').css({display:'block'}).html('Error Code ' + result.retcode);
		if(type == 'pop'){
			that.videoClose.off('click').on('click',function(){
				_popHide.call(that);
			});
		}
	};
	/**
	 * 获取视频源信息方法
	 * 				如果视频源已存在则返回不执行
	 * @return {[type]} [description]
	 */
	videoPlayer.prototype.getVideoFile = function(successFn,failFn){
		var that =this,
			ops = that.options,
			videoInfo = that.videoInfo;
		if(videoInfo) return;//如果信息已存在则不执行方法直接返回

		$.support.cors = true;
		$.ajax({
			crossDomain:true,
			url:ops.videoUrl+'?vid='+ops.vid,
			type:'GET',
			dataType:'JSON',
			success:function(result){
				//0 获取视频源成功 1 获取视频源失败
				if(result.retcode == 0){
					videoInfo = {
						title:result.videoRecord.title,
						videoFileUrl:result.videoRecord.videoFileUrl,
						videoBqUrl:result.videoRecord.videoBqUrl,
						videoGqUrl:result.videoRecord.videoGqUrl,
						videoCqUrl:result.videoRecord.videoCqUrl
					};
					successFn.call(that,videoInfo);
				}else{
					failFn&&failFn.call(that,result);
				}	
			},
			error:function(xhr,status,info){
				var result = {
					retcode:xhr.statusText+' , '+info
				};
				failFn&&failFn.call(that,result);
			}
		});
	};
	$.fn.videoPlayer = function(config){
		return this.each(function(){
			var that = this,
				video = $.data(this,'video');
			if(video){
				video.openVideo(config);
			}else{
				$.data(this,'video',new videoPlayer(config,$(that)));
			}

		});
	};
})($);
