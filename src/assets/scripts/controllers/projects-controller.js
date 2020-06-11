import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = ['filter', 'filterable', 'filterInfo']

  initialize() {
    this.applyFilter()
  }

  hashParams() {
    return new URLSearchParams(window.location.hash.substr(1))
  }

  applyFilter() {
    const activeFilter = this.hashParams().get('filter')
    const shouldDisplay = (tags) =>
      !activeFilter || tags.split(',').includes(activeFilter)
    let hiddenCount = 0

    this.filterableTargets.forEach((el) => {
      const hidden = !shouldDisplay(el.dataset.tags)
      el.classList.toggle('hidden', hidden)

      if (hidden) hiddenCount += 1
    })

    this.filterInfoTarget.classList.toggle('hidden', !activeFilter)

    const filterCount = this.filterInfoTarget.querySelector(
      '.clear_filter__count'
    )
    const counts = {
      projects: this.filterableTargets.length,
      visible: this.filterableTargets.length - hiddenCount
    }

    filterCount.textContent = `Showing ${counts.visible}/${counts.projects} projects.`
  }
}
