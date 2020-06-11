import { html, LitElement } from 'lit-element';
import styles from './tick-label.css.js';
/**
 * @element sp-tick-label
 */
export class TickLabel extends LitElement {
    static get styles() {
        return [styles];
    }
    render() {
        return html ` <slot></slot> `;
    }
}
//# sourceMappingURL=tick-label.js.map