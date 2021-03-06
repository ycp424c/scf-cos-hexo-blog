const URL_BASE = 'https://service-h7z96bl8-1259237915.gz.apigw.tencentcs.com/release/publishCosBlog/';

(function($) {
    // Search
    let $searchWrap = $('#search-form-wrap');
    let isSearchAnim = false;
    let searchAnimDuration = 200;

    let startSearchAnim = function() {
        isSearchAnim = true;
    };

    let stopSearchAnim = function(callback) {
        setTimeout(function() {
            isSearchAnim = false;
            callback && callback();
        }, searchAnimDuration);
    };

    $('#nav-search-btn').on('click', function() {
        if (isSearchAnim) return;

        startSearchAnim();
        $searchWrap.addClass('on');
        stopSearchAnim(function() {
            $('.search-form-input').focus();
        });
    });

    $('#header-inner')[0].style.overflow = 'visible'
    $('.search-form-submit')[0].style.top = '13px'
    $('.search-form-input').on('blur', function() {
        setTimeout(function(){
            startSearchAnim();
            $searchWrap.removeClass('on');
            stopSearchAnim();
        },100)     
    });
    let inputArea = document.querySelector(".search-form-input");
    inputArea.autocomplete = 'off'



    function search(){
        $.get(`${window.location.href}?method=search&param={"searchString":"${inputArea.value}"}`,data=>{
            console.log(data)
            if(data.code === 0 && data.result){
                let parent = $('#search-form-wrap form')
               let ele = document.querySelector('.search-result') ||  document.createElement('div')
               ele.classList.add('search-result')
               if(data.result.length === 0){
                   ele.innerHTML = '<ul><li>无搜索结果</li></ul>'
               }else{
                   let htmlText = '<ul>'

                   data.result.forEach(item=>{
                       htmlText+= `<li><a href="${URL_BASE + item.date.split('T')[0].split('-').join('/')+ '/'+item.name.replace('.md','')}">${item.title}</a></li>`
                   })
                   htmlText += '</ul>'
                   ele.innerHTML = htmlText
               }
               parent.append(ele)
            }else{
                alert('查找失败')
            }
        })
    }

    inputArea.onkeydown = function(){ 
        if(event.keyCode == 13) {
            search()
            return false
        }
    }

    // Share
    $('body').on('click', function() {
        $('.article-share-box.on').removeClass('on');
    }).on('click', '.article-share-link', function(e) {
        e.stopPropagation();

        let $this = $(this);
        let url = $this.attr('data-url');
        let encodedUrl = encodeURIComponent(url);
        let id = 'article-share-box-' + $this.attr('data-id');
        let offset = $this.offset();

        if ($('#' + id).length) {
            var box = $('#' + id);

            if (box.hasClass('on')) {
                box.removeClass('on');
                return;
            }
        } else {
            let html = [
                '<div id="' + id + '" class="article-share-box">',
                '<input class="article-share-input" value="' + url + '">',
                '<div class="article-share-links">',
                '<a href="https://twitter.com/intent/tweet?url=' + encodedUrl + '" class="article-share-twitter" target="_blank" title="Twitter"></a>',
                '<a href="https://www.facebook.com/sharer.php?u=' + encodedUrl + '" class="article-share-facebook" target="_blank" title="Facebook"></a>',
                '<a href="http://pinterest.com/pin/create/button/?url=' + encodedUrl + '" class="article-share-pinterest" target="_blank" title="Pinterest"></a>',
                '<a href="https://plus.google.com/share?url=' + encodedUrl + '" class="article-share-google" target="_blank" title="Google+"></a>',
                '</div>',
                '</div>'
            ].join('');

            var box = $(html);

            $('body').append(box);
        }

        $('.article-share-box.on').hide();

        box.css({
            top: offset.top + 25,
            left: offset.left
        }).addClass('on');
    }).on('click', '.article-share-box', function(e) {
        e.stopPropagation();
    }).on('click', '.article-share-box-input', function() {
        $(this).select();
    }).on('click', '.article-share-box-link', function(e) {
        e.preventDefault();
        e.stopPropagation();

        window.open(this.href, 'article-share-box-window-' + Date.now(), 'width=500,height=450');
    });

    // Caption
    $('.article-entry').each(function(i) {
        $(this).find('img').each(function() {
            if ($(this).parent().hasClass('fancybox')) return;

            let alt = this.alt;

            if (alt) $(this).after('<span class="caption">' + alt + '</span>');

            $(this).wrap('<a href="' + this.src + '" title="' + alt + '" class="fancybox"></a>');
        });

        $(this).find('.fancybox').each(function() {
            $(this).attr('rel', 'article' + i);
        });
    });

    if ($.fancybox) {
        $('.fancybox').fancybox();
    }

    // Mobile nav
    let $container = $('#container');
    let isMobileNavAnim = false;
    let mobileNavAnimDuration = 200;

    let startMobileNavAnim = function() {
        isMobileNavAnim = true;
    };

    let stopMobileNavAnim = function() {
        setTimeout(function() {
            isMobileNavAnim = false;
        }, mobileNavAnimDuration);
    };

    $('#main-nav-toggle').on('click', function() {
        if (isMobileNavAnim) return;

        startMobileNavAnim();
        $container.toggleClass('mobile-nav-on');
        stopMobileNavAnim();
    });

    $('#wrap').on('click', function() {
        if (isMobileNavAnim || !$container.hasClass('mobile-nav-on')) return;

        $container.removeClass('mobile-nav-on');
    });
})(jQuery);