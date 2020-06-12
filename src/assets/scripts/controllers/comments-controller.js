import { Controller } from 'stimulus'

export default class extends Controller {
  async connect() {
    const existingScript = document.getElementById('commento-script')
    const loadComments = () => {
      window.commento.main()
    }

    if (!existingScript || !window.commento.main) {
      if (existingScript) existingScript.parentNode.removeChild(existingScript)
      const script = document.createElement('script')
      script.src = 'https://cdn.commento.io/js/commento.js'
      script.id = 'commento-script'
      script.dataset.autoInit = 'false'
      script.dataset.noFonts = 'true'

      const countScript = document.createElement('script')
      countScript.src = 'https://cdn.commento.io/js/count.js'

      document.body.appendChild(script)
      document.body.appendChild(countScript)

      script.onload = loadComments
    } else {
      loadComments()
    }
  }
}
