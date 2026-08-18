/**
 * 导航栏滚动交互优化 & 全局日夜间模式强同步 & 顶部大图灵动流体波浪过渡
 *
 * 1. 导航栏交互：首屏大图区域常驻，进入正文后向下平滑收缩，向上即刻唤出。
 * 2. 主题模式全局强同步：
 *    - 监听 pageshow 事件（解决浏览器回退/前进 bfcache 导致的暗黑模式脱节）
 *    - 监听 storage 事件（解决多标签页打开时，在文章页切换暗黑模式后首页未同步的问题）
 * 3. 顶部大图底部灵动流体波浪（Fluid Wave Transition）：
 *    - 抹平大图与正文区域的生硬硬切线，带来丝滑优雅的起伏流动质感。
 */
;(function () {
  var pendingRAF = null
  var lastTop = 0

  function handleNavScroll() {
    if (pendingRAF) cancelAnimationFrame(pendingRAF)

    pendingRAF = requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var header = document.getElementById('page-header')
        if (!header) return
        if (header.classList.contains('not-top-img')) return

        var headerRect = header.getBoundingClientRect()
        var stillInHeader = headerRect.bottom > 64

        var currentTop = window.scrollY || document.documentElement.scrollTop
        var isDown = currentTop > lastTop
        lastTop = currentTop

        if (stillInHeader) {
          // 大图仍在视野中 → 强制保持导航栏可见
          header.classList.add('nav-visible')
        } else if (isDown) {
          // 大图已滚出且正在向下滚动 → 强制移除 nav-visible 使导航栏隐藏
          header.classList.remove('nav-visible')
        }
      })
    })
  }

  // 全局主题状态实时同步函数
  function syncGlobalTheme() {
    if (!window.btf || !btf.saveToLocal) return
    var currentTheme = btf.saveToLocal.get('theme')
    var htmlTheme = document.documentElement.getAttribute('data-theme')

    if (currentTheme && currentTheme !== htmlTheme) {
      if (currentTheme === 'dark' && typeof btf.activateDarkMode === 'function') {
        btf.activateDarkMode()
      } else if (currentTheme === 'light' && typeof btf.activateLightMode === 'function') {
        btf.activateLightMode()
      }
    }
  }

  // 顶部大图动态流体波浪插入
  function initHeaderWaves() {
    var header = document.getElementById('page-header')
    if (!header || header.classList.contains('not-top-img')) return
    if (header.querySelector('.waves-area')) return

    var waveDiv = document.createElement('div')
    waveDiv.className = 'waves-area'
    waveDiv.innerHTML =
      '<svg class="waves-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">' +
      '<defs><path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" /></defs>' +
      '<g class="parallax">' +
      '<use href="#gentle-wave" xlink:href="#gentle-wave" x="48" y="0" class="wave-layer wave-1" />' +
      '<use href="#gentle-wave" xlink:href="#gentle-wave" x="48" y="3" class="wave-layer wave-2" />' +
      '<use href="#gentle-wave" xlink:href="#gentle-wave" x="48" y="5" class="wave-layer wave-3" />' +
      '<use href="#gentle-wave" xlink:href="#gentle-wave" x="48" y="7" class="wave-layer wave-4" />' +
      '</g></svg>'

    header.appendChild(waveDiv)
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true })
  window.addEventListener('resize', handleNavScroll, { passive: true })

  // 页面加载/DOM 就绪时初始化
  document.addEventListener('DOMContentLoaded', function () {
    lastTop = window.scrollY || document.documentElement.scrollTop
    handleNavScroll()
    syncGlobalTheme()
    initHeaderWaves()
  })

  // 浏览器前进/后退（Back-Forward Cache）唤醒时强制同步主题与波浪
  window.addEventListener('pageshow', function () {
    syncGlobalTheme()
    initHeaderWaves()
  })

  // 多标签页跨页面即时同步
  window.addEventListener('storage', function (e) {
    if (e.key === 'theme') {
      syncGlobalTheme()
    }
  })

  // PJAX 路由切换时同步
  document.addEventListener('pjax:complete', function () {
    pendingRAF = null
    lastTop = window.scrollY || document.documentElement.scrollTop
    handleNavScroll()
    syncGlobalTheme()
    initHeaderWaves()
  })

  handleNavScroll()
  syncGlobalTheme()
  initHeaderWaves()
})()
