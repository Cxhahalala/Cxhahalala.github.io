/**
 * 导航栏滚动交互优化脚本
 *
 * 使用双重 RAF 确保在 Butterfly 主题 rafThrottle 之后执行。
 *
 * 关键修复：Butterfly 的 scrollFn 使用 flag 变量缓存滚动方向，
 * 只在方向切换时才移除 nav-visible。一旦我们在大图区域把 nav-visible 加回来，
 * 主题的 flag 已经是 'down'，后续向下滚动不会再移除它。
 * 因此，离开大图区域后向下滚动时，必须主动移除 nav-visible。
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
        // 大图已滚出且向上滚动 → 不干预，主题会自动添加 nav-visible 显示导航栏
      })
    })
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true })
  window.addEventListener('resize', handleNavScroll, { passive: true })
  document.addEventListener('DOMContentLoaded', function () {
    lastTop = window.scrollY || document.documentElement.scrollTop
    handleNavScroll()
  })
  document.addEventListener('pjax:complete', function () {
    pendingRAF = null
    lastTop = window.scrollY || document.documentElement.scrollTop
    handleNavScroll()
  })

  handleNavScroll()
})()
