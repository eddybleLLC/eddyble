
// requestAnimationFrame polyfill starts here
(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
            window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
}());
// requestAnimationFrame polyfill ends here


jQuery(document).ready(function(){
    var $ = jQuery;

    if(!window.LP || !LP.initializedIframe) return;

    if(LP.checkMobile()) return;

    var $iframe = $('.lp-supercalc,.cal_iframe');

    if(!$iframe.length) return;

    try{
        var childIframe = $iframe.get(0).contentWindow;

        if(!childIframe.postMessage) return;
                   
    } catch (e){
        return;
    }
    

    var $body = $('body');

    var $element = $('#supercalc-cta-btn-lightbox-link');
    
    if(! $element.length){
        $element = $('<a data-fancybox-iframe="1" id="supercalc-cta-btn-lightbox-link" style="display:none" data-type="iframe" href="javascript:" class="lp_fancybox_iframe"></a>');
    }

    $body.append($element);

    LP.initializedIframe();

    function messageHandler(e){

        var data = e.data;

        if(data == 'lpSupercalcPingParentListner'){
            requestAnimationFrame(function (){
                childIframe.postMessage('lpSupercalcParentListnerPresent', '*');   
            });
            return;
        }
    
        var regex = /\s*lpSupercalcParentOpenFunnel\=(.+)/;
    
        var match = data.match(regex);
    
        if(!match) return;
    
        var url = match[1];
    
        var domainRegex = /\s*https?\:\/\/([^\/]+)/i;
    
        var urlMatch = url.match(domainRegex);
    
        if(urlMatch){
            url = urlMatch[1];
        }
    
        $element.attr('data-src', window.location.origin + '/funnels/' + url);

        $element.trigger('click');
    }

    window.addEventListener('message', messageHandler);
});


