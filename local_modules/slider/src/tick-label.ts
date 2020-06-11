import { html, LitElement, CSSResultArray, TemplateResult } from 'lit-element'

import styles from './tick-label.css.js'

/**
 * @element sp-tick-label
 */
export class TickLabel extends LitElement {
  public static get styles(): CSSResultArray {
    return [styles]
  }

  protected render(): TemplateResult {
    return html` <slot></slot> `
  }
}
