import { Controller } from 'stimulus'

export default class FootnotesHighlightController extends Controller {
  connect() {
    this.highlightFootnote()
  }

  highlightFootnote() {
    const existingHighlight = document.querySelector('.footnote--highlight')
    if (existingHighlight)
      existingHighlight.classList.remove('footnote--highlight')

    if (document.location.hash.match('#fn-[0-9]+')) {
      document
        .querySelector(document.location.hash)
        .classList.add('footnote--highlight')
    }
  }
}
