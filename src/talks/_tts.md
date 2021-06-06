---
title: 'Teaching Machines to Talk: Modern Speech Synthesis with Deep Learning'
---

<!-- Generate slides with `npx @marp-team/marp-cli src/talks/_tts.md -o src/talks/tts.html` -->

<style>
img[alt~="center"] {
  display: block;
  margin: 0 auto;
}

audio {
  vertical-align: -1em;
  margin: 0.5em 0;
}
</style>

<style scoped>
em {
  color: #f06595;
}

em a {
  color: #c2255c;
  text-decoration: underline;
}
</style>

# Teaching Machines to Talk: Modern Speech Synthesis with Deep Learning

Alex Peattie (alexpeattie.com / [@alexpeattie](https://twitter.com/alexpeattie))

<hr>

![w:300](/assets/images/talks/tts/odsc-logo.png)

_Slides online at alexpeattie.com/talks/tts_

---

## Demo

![bg left](/assets/images/talks/tts/obama.jpg)

> "Over the past few years, speech synthesis systems have seen rapid advances thanks to deep learning. As anyone who owns a voice assistant knows, artificial voices are becoming more and more natural and convincing. The good news is you can recreate this impressive technology yourself, using high quality open-source tools."

<audio controls src='/assets/audio/talks/tts/odsc.wav'></audio>

---

## Agenda

<!-- prettier-ignore -->
* Intro & why
* Breaking down the problem (seq2seq & audio synthesis)
* Solution (acoustic model & vocoder)
  * Step-by-step guide to getting started
* Q&A

---

## Aims

<!-- prettier-ignore -->
* Leave the talk able to train a near state-of-art TTS system, with a voice of your choice, from scratch
* Understand the problem domain and common architectures for solutions
* That the paragraph below won't be gibberish by the end of the session!

<br>

<blockquote data-marpit-fragment>
a recurrent sequence-to-sequence feature prediction network with attention which predicts a sequence of mel spectrogram frames from an input character sequence, combined with a vocoder which generates time-domain waveform samples conditioned on the predicted mel spectrogram frames. — Tacotron 2 paper
</blockquote>

---

<style scoped>
em {
  background-color: #fff3bf;
}
</style>

## Teaching Machines to Talk: Modern Speech Synthesis _with Deep Learning_

---

## A bit of history

![bg right](/assets/images/talks/tts/vocoder-c64.jpg)

<!-- prettier-ignore -->
* Humans have been synthesising speech with computers for decades
* Prior to the emergence of DNNs, two approaches dominated:
  * Concatenative synthesis
  * Parametric synthesis
* But over the past ~5 years, deep learning methods have become the SOTA

---

## Why do deep learning methods dominate?

<div data-marpit-fragment>
First, because they're simpler.
</div>

---

### A 13 stage (!) TTS system from Bell Labs

<br>

![w:1000 center](/assets/images/talks/tts/bell.svg)

---

### A typical modern TTS pipeline

<br>

![w:1000 center](/assets/images/talks/tts/modern.svg)

---

## Why do deep learning methods dominate?

Second, because they sound "better".

---

## Why do deep learning methods dominate?

<style scoped>
em {
  font-style: normal;
  background-color: #fff3bf;
}
</style>

Second, because they sound <em>"better"</em>.

---

## How can we measure how good TTS systems sound?

<!-- prettier-ignore -->
* Ultimately, we have to rely on human judgement
* We want to do that in a structured way
* Industry standard is __Mean Opinion Score (MOS)__
  * Ask a pool of human reviewers to score the naturalness of the speech on a five point scale (1 = Bad, 2 = Poor, 3 = Fair, 4 = Good, 5 = Excellent)
  * Take the average of these scores

---

## MOS: Deep learning vs. legacy systems

<!-- {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": {
    "values": [
      {"mos_error": 0.096, "mos_center": 3.492, "model": "Parametric"},
      {"mos_error": 0.091, "mos_center": 4.166, "model": "Concatenative"},
      {"mos_error": 0.066, "mos_center": 4.526, "model": "Tacotron 2"},
      {"mos_error": 0.053, "mos_center": 4.582, "model": "Ground truth"}
    ]
  },
  "layer": [
    {
      "mark": "errorbar",
      "encoding": {
        "y": {
          "field": "mos_center",
          "type": "quantitative",
          "scale": {
            "domainMin": 3,
            "domainMax": 5
          },
          "title": "MOS"
        },
        "yError": {"field": "mos_error"},
        "x": {
          "field": "model", "type": "ordinal", "title": "Model",
          "sort": {"field": "mos_center"},
          "scale": {
            "padding": 8
          },
          "axis": {
            "labelAngle": -45
          }
        },
        "color": {"field": "model", "type": "nominal", "legend": null}
      }
    },
    {
      "mark": {"type": "point", "filled": true, "size": 50},
      "encoding": {
        "y": {"field": "mos_center", "type": "quantitative"},
        "x": {"field": "model", "type": "ordinal","sort": {"field": "mos_center"}},
        "color": {"field": "model", "type": "nominal", "legend": null}
      }
    }
  ]
} -->

![w:600 center](/assets/images/talks/tts/mos.svg)

---

![bg left](/assets/images/talks/tts/obama2.jpg)

> "And here's another example of speech generated by our deep learning system. Next, let's try and gain a deeper understanding of the relevant problem domains."

<audio controls src='/assets/audio/talks/tts/odsc.wav'></audio>

---

![w:600 center](/assets/images/talks/tts/venn.svg)

---

## Sequence-to-sequence (seq2seq) problem

---

![w:600 center](/assets/images/talks/tts/seq2seq-translation.svg)

---

![w:600 center](/assets/images/talks/tts/seq2seq-audio.svg)

---

## Some observations about seq2seq

![w:600 center](/assets/images/talks/tts/seq2seq-blackbox.svg)

---

## Some observations about seq2seq

_Observation #1:_ Need more than a simple, start to finish, one-to-one mapping between input tokens & output tokens.

---

![w:600 center](/assets/images/talks/tts/seq2seq.svg)

---

![w:600 center](/assets/images/talks/tts/grid.svg)

---

![w:800 center](/assets/images/talks/tts/seq2seq-eggs-noarrows.svg)

---

![w:800 center](/assets/images/talks/tts/seq2seq-eggs.svg)

---

## Some observations about seq2seq

_Observation #1:_ Need more than a simple, start to finish, one-to-one mapping between input tokens & output tokens.

---

## Does observation #1 apply to text to speech?

![w:600 center](/assets/images/talks/tts/seq2seq-audio.svg)

---

![w:600 center](/assets/images/talks/tts/seq2seq-mapping-audio1.svg)

---

![w:600 center](/assets/images/talks/tts/seq2seq-mapping-audio2.svg)

---

![w:600 center](/assets/images/talks/tts/seq2seq-mapping-audio3.svg)

---

## Some observations about seq2seq

_Observation #2:_ We often need to consider multiple items in the input sequence to produce the right item in the output sequence

---

<style scoped>
em {
  font-style: normal;
  background-color: #fff3bf;
}
</style>

Example: He _makes_ a cake

vs.

Example: He _makes_ me happy

---

### Possible translations of "make" into French

faire, fabriquer, préparer, établir, former, prendre, passer, rendre, faciliter, réaménagé, forcer, obliger, atteindre, gagner, réussir, marquer, tourner, arriver, passer, entrer...

---

<style scoped>
em {
  font-style: normal;
  background-color: #fff3bf;
}
</style>

Example: He _makes_ a cake → Il _fait_ un gâteau

vs.

Example: He _makes_ me happy → Il me _rend_ heureux

---

<style scoped>
em {
  font-style: normal;
  background-color: #c5f6fa;
}
</style>

Example: He makes a _cake_ → Il fait un gâteau

vs.

Example: He makes me _happy_ → Il me rend heureux

---

![w:400 center](/assets/images/talks/tts/seq2seq-context1.svg)

---

![w:400 center](/assets/images/talks/tts/seq2seq-context2.svg)

---

Sequence-to-sequence models generally include **attention mechanisms**, which learn which input items we should be paying attention to when generating each output item.

---

![w:600 center](/assets/images/talks/tts/attention-weights.png)

---

## Does observation #2 apply to text to speech?

---

### Example 1: Tokens later in the input sequence

![w:1000 center](/assets/images/talks/tts/seq2seq-question.svg)

---

<style scoped>
em {
  font-style: normal;
  background-color: #fff3bf;
}

span {
  opacity: 0.5;
}
</style>

![bg right](/assets/images/talks/tts/eats-shoots-leaves.jpg)

### Example 2: Tokens earlier in the input sequence

<span>The Panda eats</span><em>,</em> shoots and leaves
<span>The Panda eats</span> shoots and leaves

---

## Some observations about seq2seq

_Observation #3:_ When generating output items, we need to consider (some of) the output sequence we've already generated.

---

_Example: Il a mangé un sandwich_

Could be translated as:

- He has eaten a sandwich
- He ate a sandwich

---

![w:600 center](/assets/images/talks/tts/seq2seq-regress1.svg)

---

![w:600 center](/assets/images/talks/tts/seq2seq-regress2.svg)

---

![w:600 center](/assets/images/talks/tts/seq2seq-regress3.svg)

---

If a model "looks back" at the output sequence (more formally, if it generates each output item by conditioning on previously generated items) we say it is **"autoregressive"**.

Autoregressive models typically give a more fluent output, but they pose performance challenges (as we'll see).

---

## Does observation #3 apply to text to speech?

Short answer: yes.

> For speech synthesis, deep learning techniques generally outperform traditional approaches.

<audio controls src='/assets/audio/talks/tts/disfluency.wav'></audio>

---

### Characteristics of the sequence-to-sequence (seq2seq) problem

<!-- prettier-ignore -->
1) No one-to-one (or one-to-N) mapping between input items and output items
2) An output item could depend on a weighted combination of input items *(attention)*
3) We may need to look back at the output sequence generated so far to ensure fluency *(autoregressive)*

---

## Audio synthesis

---

![w:600 center](/assets/images/talks/tts/seq2seq-audio.svg)

---

### We're generating waveforms

![w:1000 center](/assets/images/talks/tts/cello.svg)

<br>

<div data-marpit-fragment>
1-dimensional with respect to time. We're measuring <strong>Amplitude</strong>.
</div>
<div data-marpit-fragment>
Amplitude usually measured in <strong>decibels</strong> and can be thought of as the sound's "loudness".
</div>

---

![w:800 center](/assets/images/talks/tts/waveform-breakdown.png)

---

![w:1000 center](/assets/images/talks/tts/cello.svg)

---

### Waveform frequency

![w:400 center](/assets/images/talks/tts/waveform-frequency.svg)

<div data-marpit-fragment>
A Note: 880Hz (880 repetitions per second)<br><audio controls src='/assets/audio/talks/tts/note-a.wav'></audio><br>
E Note: ~1320Hz (1320 repetitions per second)<br><audio controls src='/assets/audio/talks/tts/note-e.wav'></audio>
</div>

---

### How to store waveforms digitally?

<div data-marpit-fragment>
  <img alt='center' width='500' src='/assets/images/talks/tts/quantize1.svg'>
</div>

---

### Reduced sample rate

![w:500 center](/assets/images/talks/tts/quantize2.svg)

---

### Choosing a sample rate

![w:1000 center](/assets/images/talks/tts/sample-rates.svg)

---

### Sample rate comparison

24kHz: <audio controls src='/assets/audio/talks/tts/prayer-24k.wav'></audio>
16kHz: <audio controls src='/assets/audio/talks/tts/prayer-16k.wav'></audio>
8kHz: <audio controls src='/assets/audio/talks/tts/prayer-8k.wav'></audio>

(Source: ["Prayer St Francis"](https://freesound.org/people/shadoWisp/sounds/268020/) by shadoWisp on freesound, licensed under CCBY 3.0)

---

### Choosing a sample rate

![w:1000 center](/assets/images/talks/tts/sample-rates.svg)

---

At this stage you hopefully understand what a waveform is (amplitude changing over time), and how it can be digitize (by taking thousands of discretes samples per second of the changing amplitude).

<div data-marpit-fragment>
However, in practice we <strong>rarely generate raw waveforms directly</strong> with deep learning-based TTS approaches. Why not?
</div>

---

Recall that in seq2seq problems, we'll usually (with _autoregressive_ models) need to look back in the sequence generated so far. Let's say we wanted to check the previous second of audio that was generated, to ensure fluency.

<div data-marpit-fragment>
That would mean for a 16kHz sample rate WAV, at each output step we'd need to condition on the <strong>previous 16,000 output steps</strong>. We've crashed head first into the curse of dimensionality.
</div>

---

### Solutions?

<!-- prettier-ignore -->
1) Avoid autoregressive models (likely to hurt quality)
2) Find a more efficient representation for our output sequence than a waveform

---

![bg right](/assets/images/talks/tts/sample-mel.png)

## Enter the spectrogram

<!-- https://miro.medium.com/max/1400/1*baPJcGNY6mpRkio3zEi6gw.png -->

---

First, recall that for a pure tone, like this:

![w:400 center](/assets/images/talks/tts/waveform-frequency.svg)

<audio controls src='/assets/audio/talks/tts/note-a.wav'></audio><br>

We can describe it very efficiently, e.g. a 800Hz sine wave, at 60dB, lasting for 1 second (no need for thousands of samples!).

---

## What if we want to describe a more complex sound?

Like a cello (below), or speech?

![w:1000 center](/assets/images/talks/tts/cello.svg)

---

## Another useful concept is additive synthesis/harmonics

![w:600 center](/assets/images/talks/tts/additive.svg)

---

## Here's an audible example

300Hz tone: <audio controls src='/assets/audio/talks/tts/300hz.wav'></audio>
400Hz tone: <audio controls src='/assets/audio/talks/tts/400hz.wav'></audio>
500Hz tone: <audio controls src='/assets/audio/talks/tts/500hz.wav'></audio>

300Hz + 400Hz + 500Hz tone: <audio controls src='/assets/audio/talks/tts/chord.wav'></audio>

---

## Let's say this is 800Hz wave + 200Hz wave

![w:600 center](/assets/images/talks/tts/additive.svg)

---

## Another useful tool: discrete Fourier transform

![w:600 center](/assets/images/talks/tts/fft-pre.jpg)

---

## Another useful tool: discrete Fourier transform

![w:600 center](/assets/images/talks/tts/fft-after.png)

---

## Mel spectrogram idea #1

Effectively a data compression technique. Like many compression techniques, we'll optimise for **human perception**:

![w:800 center](/assets/images/talks/tts/image-compression.png)

As with image compression techniques we'll ignore differences that humans can't perceive, and preserve differences which humans can percieve.

---

## Mel spectrogram idea #2

Let's figure out a way to accurately, but efficiently describe a short snippet of audio (~1/20th of a second).

<div data-marpit-fragment>
We'll describe the snippet as the weighted combination of 80† frequency "channels", going from the highest frequencies a human can hear, down to the lowest. We'll also ensure these channels sound evenly spaced to human ears.
<br>
<small>†80 is most common num of channels for TTS</small>

</div>

---

## Mel spectrogram idea #2

![w:1000 center](/assets/images/talks/tts/mel-concept.svg)

---

## Mel spectrogram idea #3

Now we can efficiently describe for a single "frame" of audio (~1/20th of a second), to describe a longer audio waveform, we just repeat the process as many times as neccessary.

<div data-marpit-fragment>
That's all there is to it!
</div>

---

## Example spectrogram

![w:600 center](/assets/images/talks/tts/spectrogram.png)

---

## Spectrogram: test yourself

Which is the female speaker, which the male speaker? (They're saying the same sentence).

![w:800 center](/assets/images/talks/tts/spectrogram-test.png)

<div data-marpit-fragment>
The female speaker is on the left (notice there is more activity in the higher frequency channels).
</div>

---

## Spectrogram: advantages 1

We've dramatically reduced the space required to describe an audio clip. For example a 10 second clip sampled at 22050Hz would contain 220,000 data points when represented as a waveform. As a mel spectrogram, we need only approximately 80 × 300 or 24,000 - an order of magnitude reduction.

Additionally, for the purposes of autoregressive models, looking back 1 second now only means looking back ~30 or so steps (reduction by 3 orders of magnitude).

---

## Spectrogram: advantages 2

Because we're ignoring frequencies that humans can't hear, and scaling our frequency scale to match human perception, only differences in our audio files which are **perceptible to humans** should be registered in our spectrogram (and vice versa).

---

## Spectrogram: the big disadvantage

Spectrograms are a lossy format, as we'll see if we convert audio into a spectrogram, then naively convert it back to an audio waveform (i.e. an audio file):

Before: <audio controls src='/assets/audio/talks/tts/gl-before.wav'></audio>
After: <audio controls src='/assets/audio/talks/tts/gl-after.wav'></audio>

<!-- https://users.aalto.fi/~ljuvela/interspeech19/ -->

<div data-marpit-fragment>
Why is this happening?
</div>

---

## Spectrogram: why the loss of fidelity?

Well, we're using a finite number of channels (e.g. 80) to capture all the possible frequencies in the spectrum of human hearing.

<div data-marpit-fragment>
But that's not the problem, in practice 80 channels is plenty. The problem lies elsewhere, with the last audio concept we have to become acquainted with: <strong>phase</strong>.
</div>

---

## Phase

![w:800 center](/assets/images/talks/tts/waveform-addition-phase.svg)

<div data-marpit-fragment>
Left: constructive interference, right: destructive interference.
</div>

---

## Subtle phase shifts of component frequencies distort our resultant waveform

<video autoplay loop muted width=800>
  <source src="/assets/images/talks/tts/phase-shift.mp4" type="video/mp4">
</video>

---

## Solving the phase problem

Our mel spectrogram doesn't include phase information, that's the key reason for the unpleasant "tinny" distortions when I convert it back to audio.

<div data-marpit-fragment>
Should we just include phase information in our spectrogram?
</div>

---

Short answer: no! We have to be ruthless, our spectrograms have greatly reduced the footprint of our data, so ditching phase is a reasonable sacrifice!

<div data-marpit-fragment>
  <img alt='center' src='/assets/images/talks/tts/phase-spectrogram.png'>
  Additionally, as you can see above, the phase information doesn't have a clean structure in the way that our mel spec does (it sort of looks like noise). This will be hard to compress, and won't be a great input to our model.
</div>

---

Our example from before used an algorithm called Griffin-Lim, which sets the phase randomly (and then does repeatedly fowards- and backwards- Fourier transforms). It gives an OK approximation, with some distortion.

However, as we'll see in the next section, we'll be able to recover the phase information almost perfectly, using a specially trained deep learning model (called a vocoder):

---

## Audio synthesis: summary

<!-- prettier-ignore -->
* Ultimately we want to produce a __time domain waveform__ which describes changes in amplitude (i.e. air pressure, "loudness") over time
* We'll use a __mel spectrogram__ as a convenient compressed representation
  * Mel spectrograms describe sounds as a weighted combination of (usually 80) human perceptible frequencies channels, each 1/20th of a second (or so)
  * Mel spectograms overcome the "curse of dimensionality" for autoregressive TTS models
* Mel spectograms throw away __phase__ information. We'll need to reconstruct it using either an approximate method (Griffin-Lim, sounds OK) or using a __vocoder__ (sounds much better)

<!--  frame level reconstruction loss (L2) -->
