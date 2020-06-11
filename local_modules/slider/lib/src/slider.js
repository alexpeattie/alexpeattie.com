/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { __decorate } from "tslib";
import { html, property, query, queryAssignedNodes } from 'lit-element';
import spectrumSliderStyles from './spectrum-slider.css.js';
import sliderStyles from './slider.css.js';
import { Focusable } from '@spectrum-web-components/shared/lib/focusable.js';
import { TickLabel } from './tick-label.js';
export const variants = ['color', 'filled', 'ramp', 'range', 'tick'];
export class Slider extends Focusable {
    constructor() {
        super(...arguments);
        this.type = '';
        this._value = 10;
        /* Ensure that a '' value for `variant` removes the attribute instead of a blank value */
        this._variant = '';
        this.getAriaValueText = (value) => `${value}`;
        this.label = '';
        this.max = 20;
        this.min = 0;
        this.step = 1;
        this.tickStep = 0;
        this.disabled = false;
        this.dragging = false;
        this.handleHighlight = false;
        this.supportsPointerEvent = 'setPointerCapture' in this;
        this.onMouseUp = (event) => {
            // Retain focus on input element after mouse up to enable keyboard interactions
            this.focus();
            this.currentMouseEvent = event;
            document.removeEventListener('mousemove', this.onMouseMove);
            document.removeEventListener('mouseup', this.onMouseUp);
            requestAnimationFrame(() => {
                this.handleHighlight = false;
                this.dragging = false;
                this.dispatchChangeEvent();
            });
        };
        this.onMouseMove = (event) => {
            this.currentMouseEvent = event;
        };
    }
    static get styles() {
        return [...super.styles, sliderStyles, spectrumSliderStyles];
    }
    get tickLabels() {
        const labels = this.defaultNodes.filter((node) => node instanceof TickLabel);
        return labels.length > 0 ? labels : this.hasAttribute('tickLabels');
    }
    get value() {
        return this._value;
    }
    set value(value) {
        const oldValue = this.value;
        if (this.input) {
            this.input.value = String(value);
        }
        const newValue = this.input ? parseFloat(this.input.value) : value;
        if (newValue === oldValue) {
            return;
        }
        this._value = newValue;
        this.requestUpdate('value', oldValue);
    }
    set variant(variant) {
        const oldVariant = this.variant;
        if (variant === this.variant) {
            return;
        }
        if (variants.includes(variant)) {
            this.setAttribute('variant', variant);
            this._variant = variant;
        }
        else {
            this.removeAttribute('variant');
            this._variant = '';
        }
        this.requestUpdate('variant', oldVariant);
    }
    get variant() {
        return this._variant;
    }
    get ariaValueText() {
        if (!this.getAriaValueText) {
            return `${this.value}`;
        }
        return this.getAriaValueText(this.value);
    }
    get focusElement() {
        return this.input ? this.input : this;
    }
    render() {
        return html `
      ${this.renderLabel()}
      ${this.variant === 'color' ? this.renderColorTrack() : this.renderTrack()}
    `;
    }
    updated(changedProperties) {
        if (changedProperties.has('value')) {
            this.dispatchInputEvent();
        }
    }
    renderLabel() {
        return html `
      <div id="labelContainer">
        <label id="label" for="input">${this.label}</label>
        <div
          id="value"
          role="textbox"
          aria-readonly="true"
          aria-labelledby="label"
        >
          ${this.ariaValueText}
        </div>
      </div>
    `;
    }
    renderTrackLeft() {
        if (this.variant === 'ramp') {
            return html ``;
        }
        return html `
      <div
        class="track"
        id="track-left"
        style=${this.trackLeftStyle}
        role="presentation"
      ></div>
    `;
    }
    renderTrackRight() {
        if (this.variant === 'ramp') {
            return html ``;
        }
        return html `
      <div
        class="track"
        id="track-right"
        style=${this.trackRightStyle}
        role="presentation"
      ></div>
    `;
    }
    renderRamp() {
        if (this.variant !== 'ramp') {
            return html ``;
        }
        return html `
      <div id="ramp">
        <svg
          viewBox="0 0 240 16"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M240,4v8c0,2.3-1.9,4.1-4.2,4L1,9C0.4,9,0,8.5,0,8c0-0.5,0.4-1,1-1l234.8-7C238.1-0.1,240,1.7,240,4z"
          ></path>
        </svg>
      </div>
    `;
    }
    tickLabelText(i) {
        const tickStep = this.tickStep || this.step;
        if (this.tickLabels instanceof Array) {
            return this.tickLabels[i].textContent || `${i * tickStep}`;
        }
        return `${i * tickStep}`;
    }
    renderTicks() {
        if (this.variant !== 'tick') {
            return html ``;
        }
        const tickStep = this.tickStep || this.step;
        const tickCount = (this.max - this.min) / tickStep;
        const ticks = new Array(tickCount + 1);
        ticks.fill(0, 0, tickCount + 1);
        return html `
      <div class="ticks">
        ${ticks.map((tick, i) => html `
            <div class="tick">
              ${this.tickLabels
            ? html `
                    <div class="tickLabel">
                      ${this.tickLabelText(i)}
                    </div>
                  `
            : html ``}
            </div>
          `)}
      </div>
    `;
    }
    renderHandle() {
        return html `
      <div
        id="handle"
        style=${this.handleStyle}
        @pointermove=${this.onPointerMove}
        @pointerdown=${this.onPointerDown}
        @mousedown=${this.onMouseDown}
        @pointerup=${this.onPointerUp}
        @pointercancel=${this.onPointerCancel}
        role="presentation"
      >
        <input
          type="range"
          id="input"
          value="${this.value}"
          step="${this.step}"
          min="${this.min}"
          max="${this.max}"
          aria-disabled=${this.disabled ? 'true' : 'false'}
          aria-label=${this.ariaLabel || this.label}
          aria-valuenow=${this.value}
          aria-valuemin=${this.min}
          aria-valuemax=${this.max}
          aria-valuetext=${this.ariaValueText}
          @change=${this.onInputChange}
          @focus=${this.onInputFocus}
          @blur=${this.onInputBlur}
        />
      </div>
    `;
    }
    renderTrack() {
        return html `
            <div id="controls"
                @pointerdown=${this.onTrackPointerDown}
                @mousedown=${this.onTrackMouseDown}
            >
                ${this.renderTrackLeft()}
                ${this.renderRamp()}
                ${this.renderTicks()}
                ${this.renderHandle()}
                ${this.renderTrackRight()}
                </div>
            </div>
        `;
    }
    renderColorTrack() {
        return html `
      <div id="controls" @pointerdown=${this.onTrackPointerDown}>
        <div class="track"></div>
        ${this.renderHandle()}
      </div>
    `;
    }
    onPointerDown(event) {
        if (this.disabled) {
            return;
        }
        this.boundingClientRect = this.getBoundingClientRect();
        this.focus();
        this.dragging = true;
        this.handle.setPointerCapture(event.pointerId);
    }
    onMouseDown(event) {
        if (this.supportsPointerEvent) {
            return;
        }
        if (this.disabled) {
            return;
        }
        this.boundingClientRect = this.getBoundingClientRect();
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
        this.focus();
        this.dragging = true;
        this.currentMouseEvent = event;
        this._trackMouseEvent();
    }
    _trackMouseEvent() {
        if (!this.currentMouseEvent || !this.dragging) {
            return;
        }
        this.value = this.calculateHandlePosition(this.currentMouseEvent);
        requestAnimationFrame(() => this._trackMouseEvent());
    }
    onPointerUp(event) {
        // Retain focus on input element after mouse up to enable keyboard interactions
        this.focus();
        this.handleHighlight = false;
        this.dragging = false;
        this.handle.releasePointerCapture(event.pointerId);
        this.dispatchChangeEvent();
    }
    onPointerMove(event) {
        if (!this.dragging) {
            return;
        }
        this.value = this.calculateHandlePosition(event);
    }
    onPointerCancel(event) {
        this.dragging = false;
        this.handle.releasePointerCapture(event.pointerId);
    }
    /**
     * Move the handle under the cursor and begin start a pointer capture when the track
     * is moused down
     */
    onTrackPointerDown(event) {
        if (event.target === this.handle || this.disabled) {
            return;
        }
        this.boundingClientRect = this.getBoundingClientRect();
        this.dragging = true;
        this.handle.setPointerCapture(event.pointerId);
        /**
         * Dispatch a synthetic pointerdown event to ensure that pointerdown
         * handlers attached to the slider are invoked before input handlers
         */
        event.stopPropagation();
        const syntheticPointerEvent = new PointerEvent('pointerdown', event);
        this.dispatchEvent(syntheticPointerEvent);
        this.value = this.calculateHandlePosition(event);
    }
    onTrackMouseDown(event) {
        if (this.supportsPointerEvent) {
            return;
        }
        if (event.target === this.handle || this.disabled) {
            return;
        }
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
        this.boundingClientRect = this.getBoundingClientRect();
        this.dragging = true;
        this.currentMouseEvent = event;
        this._trackMouseEvent();
    }
    /**
     * Keep the slider value property in sync with the input element's value
     */
    onInputChange() {
        const inputValue = parseFloat(this.input.value);
        this.value = inputValue;
        this.dispatchChangeEvent();
    }
    onInputFocus() {
        this.handleHighlight = true;
    }
    onInputBlur() {
        this.handleHighlight = false;
    }
    /**
     * Returns the value under the cursor
     * @param: PointerEvent on slider
     * @return: Slider value that correlates to the position under the pointer
     */
    calculateHandlePosition(event) {
        if (!this.boundingClientRect) {
            return this.value;
        }
        const rect = this.boundingClientRect;
        const minOffset = rect.left;
        const offset = event.clientX;
        const size = rect.width;
        const percent = (offset - minOffset) / size;
        const value = this.min + (this.max - this.min) * percent;
        return value;
    }
    dispatchInputEvent() {
        if (!this.dragging) {
            return;
        }
        const inputEvent = new Event('input', {
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(inputEvent);
    }
    dispatchChangeEvent() {
        this.input.value = this.value.toString();
        const changeEvent = new Event('change', {
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(changeEvent);
    }
    /**
     * Ratio representing the slider's position on the track
     */
    get trackProgress() {
        const range = this.max - this.min;
        const progress = this.value - this.min;
        return progress / range;
    }
    get trackLeftStyle() {
        return `width: ${this.trackProgress * 100}%`;
    }
    get trackRightStyle() {
        const width = `width: ${(1 - this.trackProgress) * 100}%;`;
        const halfHandleWidth = `var(--spectrum-slider-handle-width, var(--spectrum-global-dimension-size-200)) / 2`;
        const offset = `left: calc(${this.trackProgress * 100}% + ${halfHandleWidth})`;
        return width + offset;
    }
    get handleStyle() {
        return `left: ${this.trackProgress * 100}%`;
    }
}
__decorate([
    property()
], Slider.prototype, "type", void 0);
__decorate([
    queryAssignedNodes('')
], Slider.prototype, "defaultNodes", void 0);
__decorate([
    property({ reflect: true })
], Slider.prototype, "value", null);
__decorate([
    property({ type: String })
], Slider.prototype, "variant", null);
__decorate([
    property({ attribute: false })
], Slider.prototype, "getAriaValueText", void 0);
__decorate([
    property({ attribute: false })
], Slider.prototype, "ariaValueText", null);
__decorate([
    property()
], Slider.prototype, "label", void 0);
__decorate([
    property({ reflect: true, attribute: 'aria-label' })
], Slider.prototype, "ariaLabel", void 0);
__decorate([
    property({ type: Number })
], Slider.prototype, "max", void 0);
__decorate([
    property({ type: Number })
], Slider.prototype, "min", void 0);
__decorate([
    property({ type: Number })
], Slider.prototype, "step", void 0);
__decorate([
    property({ type: Number, attribute: 'tick-step' })
], Slider.prototype, "tickStep", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], Slider.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], Slider.prototype, "dragging", void 0);
__decorate([
    property({ type: Boolean, reflect: true, attribute: 'handle-highlight' })
], Slider.prototype, "handleHighlight", void 0);
__decorate([
    query('#handle')
], Slider.prototype, "handle", void 0);
__decorate([
    query('#input')
], Slider.prototype, "input", void 0);
//# sourceMappingURL=slider.js.map