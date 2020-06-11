import { Controller } from 'stimulus'
import 'debounce'
// import 'ap-spectrum-web-components-slider'
import '@spectrum-web-components/theme/lib/theme-lightest'
import '@spectrum-web-components/theme/lib/scale-large'
import '@spectrum-web-components/theme/lib/theme'

export default class extends Controller {
  static targets = ['image']

  connect() {
    this.changeQuality()
    this.scale = this.data.get('scale').split(',')
  }

  changeQuality(event) {
    let quality = this.data.get('quality')
    let newQuality

    if (event) {
      newQuality = this.scale[Number.parseInt(event.target.value, 10)]
    } else {
      newQuality = quality
    }

    if (event && quality === newQuality) {
      return
    } else {
      this.data.set('quality', newQuality)
    }

    this.imageTarget.src = this.baseSrc().replace('??', newQuality)
  }

  baseSrc() {
    return this.imageTarget.dataset.src
  }
}
