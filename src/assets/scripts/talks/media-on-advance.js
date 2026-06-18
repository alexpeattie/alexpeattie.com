;(function () {
  var nextKeys = {
    ArrowRight: true,
    ArrowDown: true,
    PageDown: true,
    ' ': true
  }
  var interactive = {
    AUDIO: true,
    BUTTON: true,
    INPUT: true,
    SELECT: true,
    TEXTAREA: true,
    VIDEO: true
  }

  function playable(root, mode) {
    if (!root) return null

    var selector = 'audio[data-play-on-' + mode + '], video[data-play-on-' + mode + ']'
    if (root.matches && root.matches(selector)) return root

    return root.querySelector ? root.querySelector(selector) : null
  }

  function activeSlide() {
    return document.querySelector('svg.bespoke-marp-slide.bespoke-marp-active')
  }

  function pauseInactiveMedia() {
    var slide = activeSlide()
    var media = document.querySelectorAll('audio, video')

    for (var i = 0; i < media.length; i += 1) {
      if (!slide || !slide.contains(media[i])) {
        media[i].pause()
        delete media[i].dataset.playedOnAdvance
      }
    }
  }

  function play(media) {
    var active = document.querySelectorAll('audio, video')
    for (var i = 0; i < active.length; i += 1) {
      if (active[i] !== media) active[i].pause()
    }

    media.dataset.playedOnAdvance = 'true'
    media.currentTime = 0
    media.play().catch(function () {})
  }

  document.addEventListener(
    'keydown',
    function (event) {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        !nextKeys[event.key] ||
        (event.target && interactive[event.target.nodeName]) ||
        (event.target && event.target.contentEditable === 'true')
      ) {
        return
      }

      var slide = activeSlide()
      if (!slide) return

      var media = playable(slide, 'advance')
      if (media && media.dataset.playedOnAdvance !== 'true') {
        event.preventDefault()
        event.stopImmediatePropagation()
        play(media)
        return
      }

      var fragments = Array.prototype.slice.call(slide.querySelectorAll('[data-marpit-fragment]'))
      var current = -1
      for (var i = 0; i < fragments.length; i += 1) {
        if (fragments[i].hasAttribute('data-bespoke-marp-current-fragment')) {
          current = i
          break
        }
      }

      media = playable(fragments[current + 1], 'fragment')
      if (media) play(media)
      else setTimeout(pauseInactiveMedia, 0)
    },
    true
  )
})()
