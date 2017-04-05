/*
 * ys-slide
 * jquery plugin
 */
;(function($) {
  "use strict";

  /**
   * 全屏滚动构造方法
   * @param {object} ele     添加插件的目标元素
   * @param {object} options 配置参数
   */
  function Slide(ele, options) {
    var that = this;
    that.options = options,
      that.ele = $(ele);

    that.init();
    that.renderHtml();
    that.bindScrollEvent();

    //判断是否添加锚点
    if (that.hasLocation && that.options.anchorName) {
      window.location.hash = that.names[that.index];
    } else {
      setTimeout(function() {
        that.animateScrollTo(that.index);
      }, 700)
    }
  }

  var SP = Slide.prototype;

  /**
   * 插件初始化方法--初始化数据
   * @return 
   */
  SP.init = function() {
    var ops = this.options,
      that = this,
      names = [], //记录panel锚点名称
      heights = [], //记录每个panel高度，用于滚动距离
      panels = [], //记录所有面板DOM元素
      currentHash = window.location.hash, //当前锚点名称
      hasLocation = false,
      index = 0; //当前显示的panel索引值

    panels = that.ele.find(ops.sectionPanel);

    //添加顶部toolbar位置
    if (ops.headerH > 0) {
      that.header = {
        name: 'header',
        offsetY: 0
      }

    }

    $(panels).each(function(i, ele) {

      var $ele = $(ele);
      heights[i] = $(ele).offset().top;

      //如果设置了anchorName,则添加锚点
      if (ops.anchorName && $ele.data(ops.anchorName)) {
        names[i] = "#" + $ele.data(ops.anchorName).replace(/ /g, "-");
      } else {
        names[i] = "#" + (i + 1);
      }

      if (currentHash == names[i]) {
        index = i;
        hasLocation = true;
      }

    });

    //添加底部footer位置
    if (ops.footerH > 0) {
      var footerOffset = heights[heights.length - 1] + heights[0] + ops.footerH;
      that.footer = {
        name: 'footer',
        offsetY: footerOffset
      };
    }

    //绑定到当前对象
    that.scrollTop = $(window).scrollTop(),
    that.scrollable = false; //控制滚动条当前是否可以滚动
    that.names = names;
    that.heights = heights;
    that.panels = panels;
    that.currentHash = currentHash;
    that.hasLocation = hasLocation;
    that.target = 'html,body';
    that.index = index; //当前页面数值索引
    that.timeoutId = '';
    that.isMoving = false;

    //初始化完成调用方法
    $.isFunction(ops.endInit) && ops.endInit(index, that.panels[index]);
  };

  //生成相关HTML元素
  SP.renderHtml = function() {
    var that = this,
      ops = this.options,
      panels = this.panels;
    if (ops.nav) {
      that.renderNav();
    }
  };
  //nav html 初始化
  SP.renderNav = function() {
    var that = this,
      ops = that.options,
      panels = that.panels,
      ele = that.ele;

    var $nav = $('<div id="' + 'ys-nav' + '" class="right"><ul></ul></div>');

    $nav.insertAfter(that.ele);

    for (var i = 0; i < panels.length; i++) {
      var navli = [];
      navli.push('<li class="ys-nav-link"><a data-index="', i, '"');
      if (that.index == i) {
        navli.push('class="active"');
      }
      navli.push('><span></span></a><div class="ys-tooltip right">', ops.navTip[i], '</div></li>');

      $nav.find('ul').append(navli.join(''));
    }
    //绑定导航条事件
    $nav.find('a').on('click', function() {
      var index = $(this).data('index');
      that.index = index;
      that.animateScrollTo(index);
    });
    that.nav = $nav;

  };
  //滚动式导航条所触发的效果
  SP.navScrollTo = function() {
    var that = this,
        ops = that.options,
        $nav = that.nav,
        navLinks = $nav.find('.ys-nav-link > a'),
        panels = that.panels,
        index = that.index;

    if(index == -1 || index == panels.length){
      $('#ys-nav a').removeClass('active');
      return;
    }
    $.each(navLinks,function(i,ele){
      var $ele = $(ele);
      if($ele.hasClass('active')){
        $ele.removeClass('active');
      }
    });
    $(navLinks[index]).addClass('active');
  };
  //滚动到某一屏
  SP.animateScrollTo = function(index) {
    var that = this,
      ops = that.options,
      names = that.names,
      heights = that.heights,
      panels = that.panels,
      target = that.target;

    that.isMoving = true;

    //判断依据
    if (names[index] || index == -1 || index == heights.length) {
      //滚动前处理方法
      $.isFunction(ops.beforeScroll) && ops.beforeScroll(that.lastIndex,panels[that.lastIndex],index, panels[index]);

      if (ops.anchorName) {
        window.location.hash = names[index];
      }
      var height;
      if (index == -1) {
        height = that.header.offsetY;
      } else if (index == heights.length) {
        height = that.footer.offsetY;
      } else {
        height = heights[index];
      }

      that.navScrollTo();
      $(target).stop().animate({
        scrollTop: height
      }, ops.scrollSpeed, ops.easing);

      $(target).promise().done(function() {
        that.isMoving = false;
        //滚动结束处理方法
        $.isFunction(ops.afterScroll) && ops.afterScroll(index, panels[index]);
      });
    }

  };
  //绑定全屏滚动时的滚动事件、键盘事件
  SP.bindScrollEvent = function() {
    var that = this,
      heights = that.heights,
      panels = that.panels,
      scrollbar = that.options.scrollbar,
      keyAble = that.options.keyAble;

    var manualScroll = {
      handleMousedown: function() {
        that.scrollable = true;
      },
      handleMouseup: function() {
        that.scrollable = false;
      },
      handleScroll: function() {
        if(! that.isMoving){
          if (that.timeoutId) {
            clearTimeout(that.timeoutId);
          }
          that.lastIndex = that.index;
          that.timeoutId = setTimeout(function() {
            if (that.scrollable == false) {
              return;
            }
            that.scrollable = false;

            var top = $(window).scrollTop();
            if (that.header && top < that.options.headerH) {
              closest = -1;
            } else if (that.footer && top > heights[heights.length - 1]) {
              closest = heights.length;
            } else {
              var i = 1,
                max = heights.length,
                closest = 0,
                prev = Math.abs(heights[0] - top),
                diff;
              for (; i < max; i++) {
                diff = Math.abs(heights[i] - top);

                if (diff < prev) {
                  prev = diff;
                  closest = i;
                }
              }
            }

            that.index = closest;
            that.animateScrollTo(that.index);
          }, 25);
        }
      },
      wheelHandler: function(e, delta) {
        e.preventDefault();
        delta = delta || -e.originalEvent.detail / 3 || e.originalEvent.wheelDelta / 120;

        if(! that.isMoving){
          if (that.timeoutId) {
            clearTimeout(that.timeoutId);
          }
          that.lastIndex = that.index;
          that.timeoutId = setTimeout(function() {

            if (delta < 0) {
              if (that.footer) {
                if(that.index >= heights.length)return;
                that.index++;
              } else {
                if (that.index >= heights.length - 1)return;
                that.index++;
              }
            } else if (delta > 0) {
              if (that.header) {
                if (that.index <= -1)return;
                that.index--;
              } else {
                if (that.index <= 0)return;
                that.index--;
              }
            }
            if (that.index >= -1) {
              that.animateScrollTo(that.index);
            } else {
              that.index = 0;
            }
          }, 25);
        }
      },
      init: function() {
        if (scrollbar) {
          $(window).off('mousedown mouseup scroll');
          $(window).on('mousedown', manualScroll.handleMousedown);
          $(window).on('mouseup', manualScroll.handleMouseup);
          $(window).on('scroll', manualScroll.handleScroll);
        } else {
          $("body").css({
            "overflow": "hidden"
          });
        }
        $(document).off('DOMMouseScroll mousewheel');
        $(document).on('DOMMouseScroll mousewheel', manualScroll.wheelHandler);
      }
    };
    var keyHandler = {
      keyUpHandler: function(e) {
        var timeoutId = that.timeoutId;
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        var keyCode = e.keyCode;
        if (keyCode != 40 && keyCode != 38) return;
        that.lastIndex = that.index;
        timeoutId = setTimeout(function() {
          //down
          if (keyCode == 40) {
            if (that.footer) {
              if (that.index >= heights.length)return;
              that.index++;
            } else {
              if (that.index >= heights.length - 1)return;
              that.index++;
            }
          }
          //up
          if (keyCode == 38) {
            if (that.header) {
              if (that.index <= -1)return;
              that.index--;
            } else {
              if (that.index <= 0)return;
              that.index--;
            }
          }
          if (that.index >= -1) {
            that.animateScrollTo(that.index);
          } else {
            that.index = 0;
          }
        }, 300);
        that.timeoutId = timeoutId;
      },
      init: function() {
        $(document).off('keyup');
        $(document).on('keyup', keyHandler.keyUpHandler);
      }
    };
    manualScroll.init();

    if (keyAble) {
      keyHandler.init();
    }

    that.nav.css({
      display: ''
    });
  };
  SP.unbindEvent = function() {
    var scrollbar = this.options.scrollbar,
      keyAble = this.options.keyAble;
    if (scrollbar) {
      $(window).off('mousedown mouseup scroll');
    }
    $(document).off('DOMMouseScroll mousewheel');
    if (keyAble) {
      $(document).off('keyup');
    }
    this.index = -1;
    this.nav.css({
      display: 'none'
    });
    this.nav.find('li a').removeClass('active');
  };
  /**
   * 全屏滚动插件入口
   * @param  {object} options 传入的全屏滚动的配置项
   * @param  {object}  param   调用方法时需要改变的配置  
   * @return {object}         
   */
  $.fn.ysSlide = function(options, param) {
    return this.each(function() {
      var slide = $.data(this, 'ysSlide');

      //初始化相关
      if (!slide) {
        //参数设置
        options = $.extend($.fn.ysSlide.defaults, options);
        slide = new Slide(this, options);
        $.data(this, 'ysSlide', slide);
      }

      // 调用方法
      if (typeof options === "string" && typeof slide[options] == "function") {
        // 执行插件的方法
        slide[options].call(slide, param);
      }

    });
  };
  //默认参数设置
  $.fn.ysSlide.defaults = {
    scrollSpeed: 700,
    easings: 'easeInOutCubic',
    sectionPanel: '.panel',
    headerBar: 0,
    footer: 0,
    anchorName: 'anchor-name',
    scrollbar: true,
    keyAble: false,
    nav: false,
    beforeScroll: function() {},
    afterScroll: function() {}
  };
})(jQuery);