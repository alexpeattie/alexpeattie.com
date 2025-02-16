import { Controller } from 'stimulus'
import { ScrollSpy } from 'bootstrap'

export default class extends Controller {
  connect() {
    const article = document.querySelector('article')
    this.scrollspy = new ScrollSpy(article, {
      target: this.element.querySelector('.toc__inner')
    })

    article.addEventListener('activate.bs.scrollspy', (e) => {
      document.querySelector('.section-active')?.classList?.remove('section-active')
      e.relatedTarget.classList.add('section-active')
    })

    this.element.addEventListener('click', (e) => {
      if (e.target.matches('a')) {
        document.querySelector('.section-active')?.classList?.remove('section-active')
      }
    })
  }

  disconnect() {
    this.scrollspy.dispose()
  }
}
