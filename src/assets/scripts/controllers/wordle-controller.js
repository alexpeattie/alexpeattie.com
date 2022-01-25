import { Controller } from 'stimulus'
import App from '../components/wordle/Game.vue'
import { createApp, h } from 'vue'

export default class extends Controller {
  async connect() {
    const wordlist = await fetch(
      'https://gist.githubusercontent.com/alexpeattie/777a393caf13c2e47a12e3d15ac31438/raw/8c989737a308ed22a029a061a2b628b7b68d4f8b/wordle-12k.txt'
    )
    const words = (await wordlist.text()).split('\n')

    const app = createApp({
      render: () => h(App, { allWords: words })
    })
    app.mount(this.element)
  }
}
