import Turbolinks from 'turbolinks'
import { Application } from 'stimulus'
import projectsController from './controllers/projectsController'

Turbolinks.start()

document.addEventListener('turbolinks:click', function (event) {
  if (event.target.getAttribute('href').charAt(0) === '#') {
    Turbolinks.controller.pushHistoryWithLocationAndRestorationIdentifier(
      event.data.url,
      Turbolinks.uuid()
    )
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    event.preventDefault()
  }
})

const application = Application.start()
application.register('projects', projectsController)
