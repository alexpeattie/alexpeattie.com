export * from './slider';
import { Slider } from './slider';
declare global {
    interface HTMLElementTagNameMap {
        'sp-slider': Slider;
    }
}
