import Turbolinks from 'turbolinks'
import { Application } from 'stimulus'
import StimulusControllerResolver from 'stimulus-controller-resolver'

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

StimulusControllerResolver.install(application, async (controllerName) => {
  return (
    await import(
      /* webpackChunkName: "[request]" */ `./controllers/${controllerName}-controller`
    )
  ).default
})
