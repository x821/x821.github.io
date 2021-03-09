$(function () {
  const blogNameWidth = $('#site-name').width()
  const menusWidth = $('#menus').width()

  const adjustMenu = () => {
    const $nav = $('#nav')
    let t
    if (window.innerWidth < 768) t = true
    else t = blogNameWidth + menusWidth > $nav.width() - 30

    if (t) {
      $nav.addClass('hide-menu')
    } else {
      $nav.removeClass('hide-menu')
    }
  }

  // 初始化header
  const initAdjust = () => {
    adjustMenu()
    $('#nav').addClass('show')
  }

  // sidebar menus
  const sidebarFn = () => {
    const $toggleMenu = $('#toggle-menu')
    const $mobileSidebarMenus = $('#sidebar-menus')
    const $menuMask = $('#menu-mask')
    const $body = $('body')

    function openMobileSidebar () {
      btf.sidebarPaddingR()
      $body.css('overflow', 'hidden')
      $menuMask.fadeIn()
      $toggleMenu.removeClass('close').addClass('open')
      $mobileSidebarMenus.addClass('open')
    }

    function closeMobileSidebar () {
      $body.css({ overflow: '', 'padding-right': '' })
      $menuMask.fadeOut()
      $toggleMenu.removeClass('open').addClass('close')
      $mobileSidebarMenus.removeClass('open')
    }

    $toggleMenu.on('click', function () {
      openMobileSidebar()
    })

    $menuMask.on('click touchstart', function (e) {
      if ($toggleMenu.hasClass('open')) {
        closeMobileSidebar()
      }
    })

    $(window).on('resize', function (e) {
      if (!$toggleMenu.is(':visible')) {
        if ($toggleMenu.hasClass('open')) closeMobileSidebar()
      }
    })
  }

  /**
 * 首頁top_img底下的箭頭
 */
  const scrollDownInIndex = () => {
    $('#scroll-down').on('click', function () {
      btf.scrollToDest('#content-inner')
    })
  }

  /**
 * 代碼
 * 只適用於Hexo默認的代碼渲染
 */
  const addHighlightTool = function () {
    const isHighlightCopy = GLOBAL_CONFIG.highlight.highlightCopy
    const isHighlightLang = GLOBAL_CONFIG.highlight.highlightLang
    const isHighlightShrink = GLOBAL_CONFIG_SITE.isHighlightShrink
    const isShowTool = isHighlightCopy || isHighlightLang || isHighlightShrink !== undefined
    const $figureHighlight = GLOBAL_CONFIG.highlight.plugin === 'highlighjs' ? $('figure.highlight') : $('pre[class*="language-"]')

    if (isShowTool && $figureHighlight.length) {
      const isPrismjs = GLOBAL_CONFIG.highlight.plugin === 'prismjs'

      let highlightShrinkEle = ''
      let highlightCopyEle = ''
      const highlightShrinkClass = isHighlightShrink === true ? 'closed' : ''

      if (isHighlightShrink !== undefined) {
        highlightShrinkEle = `<i class="fas fa-angle-down expand ${highlightShrinkClass}"></i>`
      }

      if (isHighlightCopy) {
        highlightCopyEle = '<div class="copy-notice"></div><i class="fas fa-paste copy-button"></i>'
      }

      if (isHighlightLang) {
        if (isPrismjs) {
          $figureHighlight.each(function () {
            const $this = $(this)
            const langName = $this.attr('data-language') !== undefined ? $this.attr('data-language') : 'Code'
            const highlightLangEle = `<div class="code-lang">${langName}</div>`
            $this.wrap('<figure class="highlight"></figure>').before(`<div class="highlight-tools ${highlightShrinkClass}">${highlightShrinkEle + highlightLangEle + highlightCopyEle}</div>`)
          })
        } else {
          $figureHighlight.each(function (i, o) {
            const $this = $(this)
            let langName = $this.attr('class').split(' ')[1]
            if (langName === 'plain' || langName === undefined) langName = 'Code'
            const highlightLangEle = `<div class="code-lang">${langName}</div>`
            $this.prepend(`<div class="highlight-tools ${highlightShrinkClass}">${highlightShrinkEle + highlightLangEle + highlightCopyEle}</div>`)
          })
        }
      } else {
        const ele = `<div class="highlight-tools ${highlightShrinkClass}">${highlightShrinkEle + highlightCopyEle}</div>`
        if (isPrismjs) $figureHighlight.wrap('<figure class="highlight"></figure>').before(ele)
        else $figureHighlight.prepend(ele)
      }

      /**
     * 代碼收縮
     */

      if (isHighlightShrink !== undefined) {
        $('.highlight-tools >.expand').on('click', function () {
          const $this = $(this)
          const $table = $this.parent().nextAll()
          $this.toggleClass('closed')
          $table.is(':visible') ? $table.css('display', 'none') : $table.css('display', 'block')
        })
      }

      /**
     * 代碼copy
     */
      if (isHighlightCopy) {
        const copy = function (text, ctx) {
          if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
            document.execCommand('copy')
            if (GLOBAL_CONFIG.Snackbar !== undefined) {
              btf.snackbarShow(GLOBAL_CONFIG.copy.success)
            } else {
              $(ctx).prev('.copy-notice')
                .text(GLOBAL_CONFIG.copy.success)
                .animate({
                  opacity: 1
                }, 450, function () {
                  setTimeout(function () {
                    $(ctx).prev('.copy-notice').animate({
                      opacity: 0
                    }, 650)
                  }, 400)
                })
            }
          } else {
            if (GLOBAL_CONFIG.Snackbar !== undefined) {
              btf.snackbarShow(GLOBAL_CONFIG.copy.noSupport)
            } else {
              $(ctx).prev('.copy-notice').text(GLOBAL_CONFIG.copy.noSupport)
            }
          }
        }

        // click events
        $('.highlight-tools >.copy-button').on('click', function () {
          const $buttonParent = $(this).parents('figure.highlight')
          $buttonParent.addClass('copy-true')
          const selection = window.getSelection()
          const range = document.createRange()
          if (isPrismjs) range.selectNodeContents($buttonParent.find('> pre code')[0])
          else range.selectNodeContents($buttonParent.find('table .code pre')[0])
          selection.removeAllRanges()
          selection.addRange(range)
          const text = selection.toString()
          copy(text, this)
          selection.removeAllRanges()
          $buttonParent.removeClass('copy-true')
        })
      }
    }
  }

  /**
 * PhotoFigcaption
 */
  function addPhotoFigcaption () {
    const images = $('#article-container img').not('.justified-gallery img')
    images.each(function (i, o) {
      const $this = $(o)
      if ($this.attr('alt')) {
        const t = $('<div class="img-alt is-center">' + $this.attr('alt') + '</div>')
        $this.after(t)
      }
    })
  }

  /**
 * justified-gallery 圖庫排版
 */

  let detectJgJsLoad = false
  const runJustifiedGallery = function () {
    const $justifiedGallery = $('.justified-gallery')
    if ($justifiedGallery.length) {
      const $imgList = $justifiedGallery.find('img')
      $imgList.unwrap()
      if ($imgList.length) {
        $imgList.each(function (i, o) {
          if ($(o).attr('data-lazy-src')) $(o).attr('src', $(o).attr('data-lazy-src'))
          $(o).wrap('<div></div>')
        })
      }

      if (detectJgJsLoad) btf.initJustifiedGallery($justifiedGallery)
      else {
        $('head').append(`<link rel="stylesheet" type="text/css" href="${GLOBAL_CONFIG.justifiedGallery.css}">`)
        $.getScript(`${GLOBAL_CONFIG.justifiedGallery.js}`, function () {
          btf.initJustifiedGallery($justifiedGallery)
        })
        detectJgJsLoad = true
      }
    }
  }

  /**
 * fancybox和 mediumZoom
 */
  const addLightBox = function () {
    if (GLOBAL_CONFIG.lightbox === 'fancybox') {
      const images = $('#article-container img:not(.gallery-group-img)').not($('a>img'))
      images.each(function (i, o) {
        const lazyloadSrc = $(o).attr('data-lazy-src') ? $(o).attr('data-lazy-src') : $(o).attr('src')
        const dataCaption = $(o).attr('alt') ? $(o).attr('alt') : ''
        $(o).wrap(`<a href="${lazyloadSrc}" data-fancybox="group" data-caption="${dataCaption}" class="fancybox"></a>`)
      })

      $().fancybox({
        selector: '[data-fancybox]',
        loop: true,
        transitionEffect: 'slide',
        protect: true,
        buttons: ['slideShow', 'fullScreen', 'thumbs', 'close'],
        hash: false
      })
    } else {
      const zoom = mediumZoom(document.querySelectorAll('#article-container :not(a)>img'))
      zoom.on('open', function (event) {
        const photoBg = $(document.documentElement).attr('data-theme') === 'dark' ? '#121212' : '#fff'
        zoom.update({
          background: photoBg
        })
      })
    }
  }

  /**
 * 滾動處理
 */
  const scrollFn = function () {
    let initTop = 0
    let isChatShow = true
    const $rightside = $('#rightside')
    const $nav = $('#nav')
    const isChatBtnHide = typeof chatBtnHide === 'function'
    const isChatBtnShow = typeof chatBtnShow === 'function'
    $(window).scroll(btf.throttle(function (event) {
      const currentTop = $(this).scrollTop()
      const isDown = scrollDirection(currentTop)
      if (currentTop > 56) {
        if (isDown) {
          if ($nav.hasClass('visible')) $nav.removeClass('visible')
          if (isChatBtnShow && isChatShow === true) {
            chatBtnHide()
            isChatShow = false
          }
        } else {
          if (!$nav.hasClass('visible')) $nav.addClass('visible')
          if (isChatBtnHide && isChatShow === false) {
            window.chatBtnShow()
            isChatShow = true
          }
        }
        $nav.addClass('fixed')
        if ($rightside.css('opacity') === '0') {
          $rightside.css({ opacity: '1', transform: 'translateX(-38px)' })
        }
      } else {
        if (currentTop === 0) {
          $nav.removeClass('fixed').removeClass('visible')
        }
        $rightside.css({ opacity: '', transform: '' })
      }
    }, 200))

    // find the scroll direction
    function scrollDirection (currentTop) {
      const result = currentTop > initTop // true is down & false is up
      initTop = currentTop
      return result
    }
  }

  /**
 *  toc
 */
  const tocFn = function () {
    const $cardTocLayout = $('#card-toc')
    const $cardToc = $cardTocLayout.find('.toc-content')
    const $tocChild = $cardToc.find('.toc-child')
    const $tocLink = $cardToc.find('.toc-link')
    const $article = $('#article-container')

    $tocChild.hide()

    // main of scroll
    $(window).scroll(btf.throttle(function (event) {
      const currentTop = $(this).scrollTop()
      scrollPercent(currentTop)
      findHeadPosition(currentTop)
    }, 100))

    // expand toc-item
    const expandToc = function ($item) {
      if ($item.is(':visible')) {
        return
      }
      $item.fadeIn(400)
    }

    const scrollPercent = function (currentTop) {
      const docHeight = $article.height()
      const winHeight = $(window).height()
      const headerHeight = $article.offset().top
      const contentMath = (docHeight > winHeight) ? (docHeight - winHeight) : ($(document).height() - winHeight)
      const scrollPercent = (currentTop - headerHeight) / (contentMath)
      const scrollPercentRounded = Math.round(scrollPercent * 100)
      const percentage = (scrollPercentRounded > 100) ? 100
        : (scrollPercentRounded <= 0) ? 0
          : scrollPercentRounded
      $cardToc.attr('progress-percentage', percentage)
    }

    // anchor
    const isAnchor = GLOBAL_CONFIG.isanchor
    const updateAnchor = function (anchor) {
      if (window.history.replaceState && anchor !== window.location.hash) {
        window.history.replaceState(undefined, undefined, anchor)
      }
    }

    const mobileToc = {
      open: () => {
        $cardTocLayout.css('display', 'block')
      },

      close: () => {
        $cardTocLayout.css('animation', 'toc-close .2s')
        setTimeout(() => {
          $cardTocLayout.css({ display: '', animation: '' })
        }, 100)
      }
    }

    $('#mobile-toc-button').on('click', () => {
      if ($cardTocLayout.is(':visible')) {
        mobileToc.close()
      } else {
        mobileToc.open()
      }
    })

    // toc元素點擊
    $tocLink.on('click', function (e) {
      e.preventDefault()
      btf.scrollToDest(decodeURI($(this).attr('href')))
      if (window.innerWidth < 900) {
        mobileToc.close()
      }
    })

    const autoScrollToc = function (currentTop, item) {
      const activePosition = item.offset().top
      const $tocContent = $cardToc
      const sidebarScrollTop = $tocContent.scrollTop()
      if (activePosition > (currentTop + $(window).height() - 100)) {
        $tocContent.scrollTop(sidebarScrollTop + 100)
      }
      if (activePosition < currentTop + 100) {
        $tocContent.scrollTop(sidebarScrollTop - 100)
      }
    }

    // find head position & add active class
    // DOM Hierarchy:
    // ol.toc > (li.toc-item, ...)
    // li.toc-item > (a.toc-link, ol.toc-2child > (li.toc-item, ...))
    const list = $article.find('h1,h2,h3,h4,h5,h6')

    const findHeadPosition = function (top) {
    // assume that we are not in the post page if no TOC link be found,
    // thus no need to update the status
      if ($tocLink.length === 0) {
        return false
      }

      let currentId = ''
      list.each(function () {
        const head = $(this)
        if (top > head.offset().top - 70) {
          currentId = '#' + encodeURI($(this).attr('id'))
        }
      })

      if (currentId === '') {
        $tocLink.removeClass('active')
        $tocChild.hide()
      }

      const currentActive = $tocLink.filter('.active')
      if (currentId && currentActive.attr('href') !== currentId) {
        if (isAnchor) updateAnchor(currentId)

        $tocLink.removeClass('active')

        const _this = $tocLink.filter('[href="' + currentId + '"]')
        _this.addClass('active')
        autoScrollToc(top, _this)

        const parents = _this.parents('.toc-child')
        // Returned list is in reverse order of the DOM elements
        // Thus `parents.last()` is the outermost .toc-child container
        // i.e. list of subsections
        const topLink = (parents.length > 0) ? parents.last() : _this
        expandToc(topLink.closest('.toc-item').find('.toc-child'))
        topLink
        // Find all top-level .toc-item containers, i.e. sections
        // excluding the currently active one
          .closest('.toc-item').siblings('.toc-item')
        // Hide their respective list of subsections
          .find('.toc-child').hide()
      }
    }
  }

  /**
 * Rightside
 */

  const $rightsideEle = $('#rightside')

  // read-mode
  $rightsideEle.on('click', '#readmode', function () {
    $('body').toggleClass('read-mode')
  })

  // Switch Between Light And Dark Mode
  if ($('#darkmode').length) {
    const switchReadMode = function () {
      const nowMode = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
      if (nowMode === 'light') {
        activateDarkMode()
        saveToLocal.set('theme', 'dark', 2)
        GLOBAL_CONFIG.Snackbar !== undefined && btf.snackbarShow(GLOBAL_CONFIG.Snackbar.day_to_night)
      } else {
        activateLightMode()
        saveToLocal.set('theme', 'light', 2)
        GLOBAL_CONFIG.Snackbar !== undefined && btf.snackbarShow(GLOBAL_CONFIG.Snackbar.night_to_day)
      }
    }

    $rightsideEle.on('click', '#darkmode', () => {
      switchReadMode()
      typeof utterancesTheme === 'function' && utterancesTheme()
      typeof FB === 'object' && window.loadFBComment()
      window.DISQUS && $('#disqus_thread').children().length && setTimeout(() => window.disqusReset(), 200)
    })
  }

  // rightside 點擊設置 按鈕 展開
  $rightsideEle.on('click', '#rightside_config', () => $('#rightside-config-hide').toggleClass('show'))

  // Back to top
  $rightsideEle.on('click', '#go-up', () => btf.scrollToDest('body'))

  $rightsideEle.on('click', '#hide-aside-btn', () => {
    const $htmlDom = $(document.documentElement)
    if ($htmlDom.hasClass('hide-aside')) {
      $htmlDom.removeClass('hide-aside')
      saveToLocal.set('aside-status', 'show', 2)
    } else {
      $htmlDom.addClass('hide-aside')
      saveToLocal.set('aside-status', 'hide', 2)
    }
  })

  /**
 * menu
 * 側邊欄sub-menu 展開/收縮
 * 解決menus在觸摸屏下，滑動屏幕menus_item_child不消失的問題（手機hover的bug)
 */
  const clickFnOfSubMenu = function () {
    $('#sidebar-menus .expand').on('click', function () {
      $(this).parents('.menus_item').find('> .menus_item_child').slideToggle()
      $(this).toggleClass('hide')
    })

    $(window).on('touchmove', function (e) {
      const $menusChild = $('#nav .menus_item_child')
      if ($menusChild.is(':visible')) {
        $menusChild.css('display', 'none')
      }
    })
  }

  /**
 * 複製時加上版權信息
 */
  const addCopyright = () => {
    const copyright = GLOBAL_CONFIG.copyright
    document.body.oncopy = (e) => {
      e.preventDefault()
      let textFont; const copyFont = window.getSelection(0).toString()
      if (copyFont.length > copyright.limitCount) {
        textFont = copyFont + '\n' + '\n' + '\n' +
        copyright.languages.author + '\n' +
        copyright.languages.link + window.location.href + '\n' +
        copyright.languages.source + '\n' +
        copyright.languages.info
      } else {
        textFont = copyFont
      }
      if (e.clipboardData) {
        return e.clipboardData.setData('text', textFont)
      } else {
        return window.clipboardData.setData('text', textFont)
      }
    }
  }

  /**
 * 網頁運行時間
 */
  const addRuntime = () => {
    const $runtimeCount = $('#runtimeshow')
    if ($runtimeCount.length) {
      const publishDate = $runtimeCount.attr('data-publishDate')
      $runtimeCount.text(btf.diffDate(publishDate) + ' ' + GLOBAL_CONFIG.runtime)
    }
  }

  /**
 * 最後一次更新時間
 */
  const addLastPushDate = () => {
    const $lastPushDateItem = $('#last-push-date')
    if ($lastPushDateItem.length) {
      const lastPushDate = $lastPushDateItem.attr('data-lastPushDate')
      const diffDay = btf.diffDate(lastPushDate, true)
      $lastPushDateItem.text(diffDay)
    }
  }

  /**
 * table overflow
 */
  const addTableWrap = function () {
    const $table = $('#article-container table').not($('figure.highlight > table'))
    $table.each(function () {
      $(this).wrap('<div class="table-wrap"></div>')
    })
  }

  /**
 * tag-hide
 */
  const clickFnOfTagHide = function () {
    const $hideInline = $('.hide-button')
    if ($hideInline.length) {
      $hideInline.on('click', function (e) {
        const $this = $(this)
        const $hideContent = $(this).next('.hide-content')
        $this.toggleClass('open')
        $hideContent.toggle()
        if ($this.hasClass('open')) {
          if ($hideContent.find('.justified-gallery').length > 0) {
            btf.initJustifiedGallery($hideContent.find('.justified-gallery'))
          }
        }
      })
    }
  }

  const tabsFn = {
    clickFnOfTabs: function () {
      const $tab = $('#article-container .tabs')
      $tab.find('.tab > button:not(.tab-to-top)').on('click', function (e) {
        const $this = $(this)
        const $tabItem = $this.parent()

        if (!$tabItem.hasClass('active')) {
          const $tabContent = $this.parents('.nav-tabs').next()
          $tabItem.siblings('.active').removeClass('active')
          $tabItem.addClass('active')
          const tabId = $this.attr('data-href')
          $tabContent.find('> .tab-item-content').removeClass('active')
          $tabContent.find(`> ${tabId}`).addClass('active')
          const $isTabJustifiedGallery = $tabContent.find(tabId).find('.justified-gallery')
          if ($isTabJustifiedGallery.length > 0) {
            btf.initJustifiedGallery($isTabJustifiedGallery)
          }
        }
      })
    },
    backToTop: () => {
      const backToTopBtn = $('#article-container .tabs .tab-to-top')
      backToTopBtn.on('click', function () {
        btf.scrollToDest($(this).parents('.tabs'))
      })
    }
  }

  const toggleCardCategory = function () {
    const $cardCategory = $('#aside-cat-list .card-category-list-item.parent i')
    $cardCategory.on('click', function (e) {
      e.preventDefault()
      $(this).toggleClass('expand').parents('.parent').next().slideToggle(300)
    })
  }

  const switchComments = function () {
    let switchDone = false
    $('#comment-switch > .switch-btn').on('click', function () {
      const $btn = $(this)
      $btn.hasClass('move') ? $btn.removeClass('move') : $btn.addClass('move')
      $('#post-comment > .comment-wrap > div').each(function (i, o) {
        const $this = $(o)
        if ($this.is(':visible')) {
          $this.hide()
        } else {
          $this.css({
            display: 'block',
            animation: 'tabshow .5s'
          })
        }
      })
      if (!switchDone && typeof loadOtherComment === 'function') {
        switchDone = true
        loadOtherComment()
      }
    })
  }

  const addPostOutdateNotice = function () {
    const data = GLOBAL_CONFIG.noticeOutdate
    var diffDay = btf.diffDate(GLOBAL_CONFIG_SITE.postUpdate)
    if (diffDay >= data.limitDay) {
      const code = `<div class="post-outdate-notice">${data.messagePrev + ' ' + diffDay + ' ' + data.messageNext}</div>`
      if (data.position === 'top') {
        $('#article-container').prepend(code)
      } else {
        $('#article-container').append(code)
      }
    }
  }

  const lazyloadImg = () => {
    window.lazyLoadInstance = new LazyLoad({
      elements_selector: 'img',
      threshold: 0,
      data_src: 'lazy-src'
    })
  }

  const relativeDate = function (selector) {
    selector.each((i, o) => {
      const $this = $(o)
      const timeVal = $this.attr('datetime')
      $this.text(btf.diffDate(timeVal, true)).css('display', 'inline')
    })
  }

  const unRefreshFn = function () {
    $(window).on('resize', function () {
      adjustMenu()
    })

    clickFnOfSubMenu()
    GLOBAL_CONFIG.islazyload && lazyloadImg()
    GLOBAL_CONFIG.copyright !== undefined && addCopyright()
  }

  window.refreshFn = function () {
    initAdjust()

    if (GLOBAL_CONFIG_SITE.isPost) {
      GLOBAL_CONFIG_SITE.isToc && tocFn()
      GLOBAL_CONFIG.noticeOutdate !== undefined && addPostOutdateNotice()
      GLOBAL_CONFIG.relativeDate.post && relativeDate($('#post-meta time'))
    } else {
      GLOBAL_CONFIG.relativeDate.homepage && relativeDate($('#recent-posts time'))
      GLOBAL_CONFIG.runtime && addRuntime()
      addLastPushDate()
      toggleCardCategory()
    }

    sidebarFn()
    GLOBAL_CONFIG_SITE.isHome && scrollDownInIndex()
    GLOBAL_CONFIG.highlight && addHighlightTool()
    GLOBAL_CONFIG.isPhotoFigcaption && addPhotoFigcaption()
    runJustifiedGallery()
    GLOBAL_CONFIG.lightbox !== 'null' && addLightBox()
    scrollFn()
    addTableWrap()
    clickFnOfTagHide()
    tabsFn.clickFnOfTabs()
    tabsFn.backToTop()
    switchComments()
  }

  refreshFn()
  unRefreshFn()
})
