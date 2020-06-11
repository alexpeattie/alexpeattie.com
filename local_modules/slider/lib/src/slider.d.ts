import { CSSResultArray, TemplateResult, PropertyValues } from 'lit-element';
import { Focusable } from '@spectrum-web-components/shared/lib/focusable.js';
import { TickLabel } from './tick-label.js';
export declare const variants: string[];
export declare class Slider extends Focusable {
    static get styles(): CSSResultArray;
    type: string;
    defaultNodes: Node[];
    get tickLabels(): Boolean | TickLabel[];
    get value(): number;
    set value(value: number);
    private _value;
    set variant(variant: string);
    get variant(): string;
    private _variant;
    getAriaValueText: (value: number) => string;
    private get ariaValueText();
    label: string;
    ariaLabel?: string;
    max: number;
    min: number;
    step: number;
    tickStep: number;
    disabled: boolean;
    dragging: boolean;
    handleHighlight: boolean;
    private handle;
    private input;
    private supportsPointerEvent;
    private currentMouseEvent?;
    private boundingClientRect?;
    get focusElement(): HTMLElement;
    protected render(): TemplateResult;
    protected updated(changedProperties: PropertyValues): void;
    private renderLabel;
    private renderTrackLeft;
    private renderTrackRight;
    private renderRamp;
    private tickLabelText;
    private renderTicks;
    private renderHandle;
    private renderTrack;
    private renderColorTrack;
    private onPointerDown;
    private onMouseDown;
    private _trackMouseEvent;
    private onPointerUp;
    private onMouseUp;
    private onPointerMove;
    private onMouseMove;
    private onPointerCancel;
    /**
     * Move the handle under the cursor and begin start a pointer capture when the track
     * is moused down
     */
    private onTrackPointerDown;
    private onTrackMouseDown;
    /**
     * Keep the slider value property in sync with the input element's value
     */
    private onInputChange;
    private onInputFocus;
    private onInputBlur;
    /**
     * Returns the value under the cursor
     * @param: PointerEvent on slider
     * @return: Slider value that correlates to the position under the pointer
     */
    private calculateHandlePosition;
    private dispatchInputEvent;
    private dispatchChangeEvent;
    /**
     * Ratio representing the slider's position on the track
     */
    private get trackProgress();
    private get trackLeftStyle();
    private get trackRightStyle();
    private get handleStyle();
}
