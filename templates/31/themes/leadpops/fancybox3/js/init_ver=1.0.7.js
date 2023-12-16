/**
 * TODO: Fancy Box
 */


var LP = {
    getHeight: function () {
        return jQuery(window).height();
    },
    checkMobile: function () {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
            return true;
        }
        return false;
    },
    set_iframes_href: function () {
        //var lpfancybox = jQuery('#main-content').find('a.lp_fancybox_iframe');
        var lpfancybox = jQuery('a.lp_fancybox_iframe');
        lpfancybox.each(function (index, el) {
            var _url=jQuery(el).attr('data-src');
            jQuery(el).removeAttr('data-type');
            jQuery(el).removeAttr('data-fancybox-iframe');
            jQuery(el).removeAttr('href');
            jQuery(el).attr("href", _url);
            jQuery(el).attr("target", "_blank");
        });
    },
    get_scale_index: function ($width){
        var $scale = [0.85, 0.8, 0.75, 0.7, 0.56, 0.5];
        if($width >= 1920){
            return $scale[0];
        }else if($width > 1800){
            return $scale[1];
        }else if($width >= 1600){
            return $scale[2];
        }else if($width >= 1440){
            return $scale[3];
        }else if($width >= 1280){
            return $scale[4];
        }else{
            return $scale[5];
        }

    },
    setCrossIcon: function(scale){
        var outer_width = jQuery('.fancybox-iframe').width();
        var _width = jQuery('.fancybox-iframe').contents().find('#content_inner').width();
        if(jQuery('.fancybox-iframe').contents().find('.funnel-box').length > 0){
            _width = jQuery('.fancybox-iframe').contents().find('.funnel-box').width();
        }
        _width = _width * scale
        var right = outer_width - _width;
        jQuery('.fancybox-close-small').css({
            'right': right / 2 - 40,
            'top': -20
        });
    },

    setIframeHeight: async function(scale, custom_height){
        custom_height = custom_height || 0;
        let lp_promise = new Promise(function(resolve, reject) {
            setTimeout(function () {
                _height = jQuery('.fancybox-iframe').contents().find('#main-wrapper').outerHeight();
                if(jQuery('.fancybox-iframe').contents().find('#outerWrapper').length > 0){
                    _height = jQuery('.fancybox-iframe').contents().find('#content_inner').outerHeight()+50;
                }
                if(jQuery('.fancybox-iframe').contents().find('.ada-accessibility').length > 0){
                    _height += 30;
                }
                _height += custom_height;
                resolve(_height);
            })
        });

        let __height = await lp_promise;
        jQuery('.fancybox-content').css({
            "height": 20 + __height * scale
        });
    },

    funnelAccessibleViewEvent: function(){
        var regex = /funnelAccessibleView=(\d+)/;
        window.addEventListener('message', function(e){
            var data = e.data;
            if(data.match){
                if(data.match(regex)){
                    var msg = data.match(regex)
                    var flag = parseInt(msg[1]);
                    var _offset = 90;
                    if(!flag){
                        _offset = 20;
                    }
                    var scale = LP.get_scale_index(jQuery(window).width());
                    LP.setIframeHeight(scale, _offset);
                    setTimeout(function(){
                        jQuery('.fancybox-iframe').contents().find('body').css('overflow','visible');
                    },500)
                }
            }
        });
    },
    funnelAccessibleScrollEvent: function(){
        var regex = /funnelAccessibleViewScroll=(\d+)/;
        window.addEventListener('message', function(e){
            var data = e.data;
            if(data.match){
                if(data.match(regex)){
                    var height = data.match(regex);
                    var _top_offset = parseInt( height[1] );
                    jQuery(".fancybox-slide").animate({
                        'scrollTop': _top_offset + 21
                    },900);
                }
            }
        });
    },
    funnelAccessibleLoaderEvent: function(){
        window.addEventListener('message', function(e){
            var data = e.data;
            if(data == 'funnelAccessibleViewLoader'){
                jQuery(".fancybox-slide").animate({
                    'scrollTop': 0
                },500);
            }
        });
    },
    initializedIframe:function(){
        jQuery('[data-fancybox-iframe]').fancybox({
            toolbar  : false,
            idleTime: false,
            smallBtn : true,
            nextSpeed: 0, //important
            prevSpeed: 0, //important
            clickOutside: "close",
            touch: false,
            slideClass: "delay-animation",
            iframe : {
                preload : true,
                attr: {
                    scrolling: "none"
                }
            },
            spinnerTpl: '',
            beforeLoad: function(instance, current) {
                var window_width=jQuery(window).width();
                var height_mutiply=1.1;

                if(window_width <='1024px' && window_width < '1270px'){
                    height_mutiply=0.5;
                }
                if(window_width >='1280px' && window_width < '1440px'){
                    height_mutiply=0.4;
                }
                if(window_width >='1440px' && window_width < '1600px'){
                    height_mutiply=0.3;
                }
                if(window_width >='1600px' && window_width < '1800px'){
                    height_mutiply=0.15;
                }
                if(window_width >='1800px'){
                    height_mutiply=0.1;
                }
                current.src = current.src + "?ifr="+ (LP.getHeight() * height_mutiply)+"~"+window_width;

            },

            afterShow:function(){
                jQuery("#mask").hide();
                jQuery('.fancybox-slide').removeClass('delay-animation');
                if(jQuery('.fancybox-iframe').contents().find('#outerWrapper').length > 0){
                    jQuery('.fancybox-iframe').contents().find('[name="enteryourzipcode"]').focus();
                }
                var scale = LP.get_scale_index(jQuery(window).width());
                LP.setIframeHeight(scale);
                LP.setCrossIcon(scale);
            },
            beforeShow:function(instance, current){
                jQuery("#mask").css({
                    "background":"rgba(0,0,0,0.6)",
                    "z-index":"9999999999999"
                });
                jQuery("#mask").show();
            },
            onUpdate : function () {
                var scale = LP.get_scale_index(jQuery(window).width());
                LP.setIframeHeight(scale);
                LP.setCrossIcon(scale);
            }
        });
    }
}

jQuery(function () {
    if(LP.checkMobile() == true){
        LP.set_iframes_href();
    }else{
        LP.initializedIframe();
    }
    LP.funnelAccessibleViewEvent();
    LP.funnelAccessibleScrollEvent();
    LP.funnelAccessibleLoaderEvent();
});
var window_width=jQuery( window ).width();

jQuery( window ).resize(function() {
    if(LP.checkMobile() == true){
        LP.set_iframes_href();
    }else{
        LP.initializedIframe();
    }
    var scale = LP.get_scale_index(jQuery(window).width());
    LP.setCrossIcon(scale);
});