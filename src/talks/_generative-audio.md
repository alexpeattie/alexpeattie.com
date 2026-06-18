---
title: 'Models that talk, sing and make noise: Generative AI for audio'
description: 'In this talk, I look at why generative audio has become such an interesting area to play with. Modern systems can clone voices, generate music and produce convincing speech, but audio still presents challenges on paper: waveforms are complex, speech depends on context, and our ears are hard to please. The talk explains how recent systems effectively overcome these problems by learning compact representations, and by leveraging the power of LLMs and diffusion techniques.'
lang: en-US
---

<!-- Edit slides with `npm run dev:talk generative-audio` -->

<style>
img[alt~="center"], video {
  display: block;
  margin: 0 auto;
}

img[alt~="hidden"] {
  visibility: hidden;
}

audio {
  vertical-align: -1em;
  margin: 0.5em 0;
}

mark {
  background-color: #fff3bf;
}

h3.accent {
  color: #f06595;
}

pre {
  line-height: 150%;
}

em {
  background-color: #fff3bf;
  font-style: normal;
}

.nac > span {
  display: inline-grid;
  place-items: center;
  inline-size: 1.25em;
  aspect-ratio: 1;
  border-radius: 0.1em;
  font-family: "Apple Symbols", "Segoe UI Symbol", "Noto Sans Symbols 2", sans-serif;
  font-size: 0.9em;
  line-height: 1;
  margin: 0.08em;
  color: white;
  vertical-align: middle;
  text-shadow: 0 0.04em 0.08em rgba(0, 0, 0, 0.22);
  box-shadow:
    inset 0 0.08em 0 rgba(255, 255, 255, 0.28),
    inset 0 -0.06em 0 rgba(0, 0, 0, 0.08);
}

.nac > span:nth-child(6n+1) {
  background: linear-gradient(#f87171, #dc2626);
}

.nac > span:nth-child(6n+2) {
  background: linear-gradient(#fdba74, #f97316);
}

.nac > span:nth-child(6n+3) {
  background: linear-gradient(#fde047, #eab308);
}

.nac > span:nth-child(6n+4) {
  background: linear-gradient(#4ade80, #16a34a);
}

.nac > span:nth-child(6n+5) {
  background: linear-gradient(#60a5fa, #2563eb);
}

.nac > span:nth-child(6n+6) {
  background: linear-gradient(#e879f9, #c026d3);
}
</style>

<script src="/assets/scripts/talks/media-on-advance.js"></script>

<style scoped>
em {
  color: #f06595;
}

em a {
  color: #c2255c;
  text-decoration: underline;
}
</style>

# Models that talk, sing and make noise:<br>Generative AI for audio

Alex Peattie (alexpeattie.com / [@alexpeattie](https://twitter.com/alexpeattie))
Sr. Director of Engineering, Front

<hr>

DSSAI 2026

_Slides online at alexpeattie.com/talks/generative-audio_

---

## Agenda

<!-- prettier-ignore -->
* Why is audio generation interesting?
* What makes audio generation hard
* And what actually makes it easy

---

# *Why* is audio generation interesting?

---

## Demo: text to speech

![w:200](/assets/images/talks/generative-audio/rogan-thumb.jpg)

> Did you hear about the Data Science Summit in Warsaw? Apparently it's absolutely crazy.

<audio controls data-play-on-advance src='/assets/audio/talks/generative-audio/rogan.flac'></audio>

---

<video controls data-play-on-advance src='/assets/images/talks/generative-audio/rogan.mp4' height='400'></video>

---

## Demo: music generation

> A song about how audio generation is easy, in the style of 2000s Hip Hop

<audio controls data-play-on-advance src='/assets/audio/talks/generative-audio/easy.mp3'></audio>

---

## Demo: music style control

<video controls data-play-on-advance src='/assets/images/talks/generative-audio/lora.mp4' height='400'></video>

---

![w:1000 center](/assets/images/talks/generative-audio/audio-tasks.svg)

---

![w:1000 center](/assets/images/talks/generative-audio/small-labs.png)

---

<style scoped>
em {
  font-style: normal;
  background-color: #fff3bf;
}
</style>

![bg left](/assets/images/talks/generative-audio/luke.jpg)

> "If AI research is Star Wars and OpenAI is the death star, then without a doubt the rebels are *building audio models*. The best models for voice – TTS, STS, STT, and the like – are not coming from the big labs. Instead, they’re built by their *underfunded, understaffed, and underhyped* siblings,"

---

<style scoped>
section {
  padding: 0 5em;
}

.voice-cloning-comparison {
  display: grid;
  gap: 5em;
  grid-template-columns: 1fr 1fr;
}

.voice-cloning-comparison img {
  height: 150px;
  width: auto;
  margin-bottom: 1em;
}

.voice-cloning-fact {
  font-size: 1.2em;
}
</style>

<div class="voice-cloning-comparison">
  <div>
    <img src="/assets/images/talks/generative-audio/elevenlabs-logo.png" alt="ElevenLabs">
    <p class="voice-cloning-fact" data-marpit-fragment>$11Bn company</p>
    <p class="voice-cloning-fact" data-marpit-fragment>$?? millions in training cost</p>
  </div>
  <div>
    <img src="/assets/images/talks/generative-audio/omnivoice-logo.jpeg" alt="OmniVoice">
    <p class="voice-cloning-fact" data-marpit-fragment>Small non-profit</p>
    <p class="voice-cloning-fact" data-marpit-fragment>~250 H800 hours<br>~$500 training cost</p>
  </div>
</div>

---

## Goal

* Point future audio rebels who want to experiment with their own models in the right direction.
* Give an understanding of the key concepts used by the SoTA audio generation models in 2026.

---

<style scoped>
h2 {
  color: #aaa;
  margin-top: 0;
  font-style: italic;
  font-weight: normal;
}
</style>

# What makes audio generation *hard*
## (on paper)

---

<!-- prettier-ignore -->
1) Audio is high-dimensional
2) Audio generation requires linguistic and cultural context
3) Our ears are unforgiving

---

<style scoped>
.dimensionality-grid {
  display: grid;
  gap: 16px;
}

.dimensionality-row {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, 1fr);
}

.dimensionality-row div {
  padding: 12px;
  text-align: left;
  font-size: 1.2em;
}
</style>

## Building blocks

<style scoped>
.tkn-0 {
  background: rgba(107, 64, 216, .3);
}
  
.tkn-1 {
  background: rgba(104, 222, 122, .4);
}
  
.tkn-2 {
  background: rgba(244, 172, 54, .4);
}
</style>

<div class="dimensionality-grid">
  <div class="dimensionality-row" data-marpit-fragment>
    <div>"Hello DSSAI"</div>
    <div>Tokens</div>
    <div>"<span class="tkn-0">Hello</span><span class="tkn-1"> DSS</span><span class="tkn-2">AI</span>"</div>
  </div>
  <div class="dimensionality-row" data-marpit-fragment>
    <div>
      <img src="/assets/images/talks/generative-audio/ghost.png" height="150">
    </div>
    <div>Pixels (naively)</div>
    <div>
      <img src="/assets/images/talks/generative-audio/ghost-pixels.png" height="150">
    </div>
  </div>
  <div class="dimensionality-row" data-marpit-fragment>
    <div>
      <img src="/assets/images/talks/generative-audio/waveform.svg" height="250">
    </div>
    <div>Audio samples (naively)</div>
    <div>
      <img src="/assets/images/talks/generative-audio/sampled-waveform.svg" height="250">
    </div>
  </div>
</div>

---

![w:1200 center](/assets/images/talks/generative-audio/sample-example.jpg)

<p data-marpit-fragment style="text-align:center">16,000 - 48,000 samples per second</p>

---

<style scoped>
.sample-comparison {
  display: grid;
  gap: 4em;
  grid-template-columns: 1fr 1fr;
  text-align: center;
}
.sample-column { display: grid; grid-template-rows: 72px auto; row-gap: 1.2em; align-items: center; justify-items: center; }
.sample-example { font-size: 1.6em; }
.sample-count,
.sample-difference { font-size: 1.2em; }
.sample-comparison img { height: 44px; width: auto; }
.sample-difference { grid-column: 1 / -1; margin-top: 1em; }
.tkn-0 { background: rgba(107, 64, 216, .3); }
.tkn-1 { background: rgba(104, 222, 122, .4); }
.tkn-2 { background: rgba(244, 172, 54, .4); }
</style>

<div class="sample-comparison">
  <div class="sample-column">
    <div class="sample-example">"<span class="tkn-0">Hello</span><span class="tkn-1"> DSS</span><span class="tkn-2">AI</span>"</div>
    <div class="sample-count" data-marpit-fragment>3 tokens</div>
  </div>
  <div class="sample-column">
    <img src="/assets/images/talks/generative-audio/audio-samples.svg" alt="">
    <div class="sample-count" data-marpit-fragment>20-50k samples</div>
  </div>
  <div class="sample-difference" data-marpit-fragment><em>10,000x</em> difference</div>
</div>

---

# Audio generation requires *linguistic* and *cultural* context

---

<style scoped>
.context-visual { font-size: 4em; text-align: center; }
</style>

<div class="context-visual">abc → 🔊</div>

---

<style scoped>
section {
  font-size: 3em;
}
</style>

![bg right](/assets/images/talks/generative-audio/dog-lead.jpg)

The <em>LED</em> dog <em>lead</em> was made of <em>lead</em>.

---

<style scoped>
section {
  font-size: 2.5em;
}
</style>

![bg right](/assets/images/talks/generative-audio/sabrina-carpenter.avif)

"A boppy, uptempo pop tune in the style of Sabrina Carpenter"

---

## A subtler example

> Little Lucy, seeing the dog, said "What a cute puppy!"

<audio controls data-play-on-advance src='/assets/audio/talks/generative-audio/fry.flac'></audio>

---

# Human ears are *unforgiving*

---

## Incredible range

<style scoped>
.dynamic-range {
  display: grid;
  gap: 1.1em;
  margin-bottom: 2em;
}

.dynamic-range svg {
  width: 100%;
}

.dynamic-range-legend {
  display: flex;
  justify-content: space-between;
  font-size: 1.1em;
}
</style>

<div class="dynamic-range">
  <svg viewBox="0 0 1000 120" role="img" aria-label="Dynamic range from falling leaf to jumbo jet takeoff">
    <defs>
      <linearGradient id="dynamic-range-gradient" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%" stop-color="#22c55e" />
        <stop offset="35%" stop-color="#3b82f6" />
        <stop offset="70%" stop-color="#f59e0b" />
        <stop offset="100%" stop-color="#ef4444" />
      </linearGradient>
    </defs>
    <path d="M0 60 95 14v28h810V14l95 46-95 46V78H95v28Z" fill="url(#dynamic-range-gradient)" />
  </svg>

  <div class="dynamic-range-legend">
    <span><em>Falling leaf</em> 🍂</span>
    <span><em>Jumbo jet takeoff</em> 🛫</span>
  </div>
</div>

<!-- prettier-ignore -->
* 1 trillion times difference between quietest and loudest sounds
* For the quietest sounds, our eardrum moves *one picometer* (100x smaller than a hydrogen atom’s diameter)

---

## We're sensitive to...

- Noise
- Tinny or metallic speech
- Crackle or hiss
- Glitches

---

## Audio is linear

<style scoped>
.linear-comparison { display: grid; gap: 2em; grid-template-columns: 1fr 1fr; align-items: center; }
.linear-comparison img { max-height: 400px; max-width: 400px; width: auto; justify-self: start; }
</style>

<div class="linear-comparison">
  <img src="/assets/images/talks/generative-audio/linear-audio.png" alt="">
  <img src="/assets/images/talks/generative-audio/ai-image.jpg" alt="">
</div>

---

1. Audio is high-dimensional
2. Audio generation requires linguistic and cultural context
3. Our ears are unforgiving

---

<style scoped>
h2 {
  color: #aaa;
  margin-top: 0;
  font-style: italic;
  font-weight: normal;
}
</style>

# What makes audio generation *easy*
## (how we solve these problems in practice)

---

1) Audio is high-dimensional → *Neural audio codecs*
2) Audio generation requires linguistic and cultural context → Use *pre-trained LLMs*
3) Our ears are unforgiving → Leverage *diffusion* techniques

---

<style scoped>
.codec-steps { display: grid; gap: 1.2em; grid-template-columns: 1fr auto 1fr auto 1fr; align-items: center; text-align: center; }
.codec-step { display: grid; grid-template-rows: 150px auto; row-gap: 1em; align-items: center; justify-items: center; }
.codec-step img { max-height: 150px; max-width: 100%; width: auto; }
.codec-step h2,
.codec-step h3 { margin: 0; }
.codec-labels { display: grid; row-gap: .1em; }
.codec-fragment { display: contents; }
.codec-arrow { color: #777; font-size: 2em; }
.codec-question { color: #999; font-size: 6em; line-height: 1; }
h3 { font-weight: normal; }
</style>

<div class="codec-steps">
  <div class="codec-step" data-marpit-fragment>
    <img src="/assets/images/talks/generative-audio/sampled-waveform.svg" alt="">
    <div class="codec-labels">
      <h2>Sampled audio</h2>
      <h3>Baseline</h3>
    </div>
  </div>
  <div class="codec-fragment" data-marpit-fragment>
    <div class="codec-arrow">→</div>
    <div class="codec-step">
      <img src="/assets/images/talks/generative-audio/spectrogram.png" alt="">
      <div class="codec-labels">
        <h2>Spectrogram</h2>
        <h3>20x compression</h3>
      </div>
    </div>
  </div>
  <div class="codec-fragment" data-marpit-fragment>
    <div class="codec-arrow">→</div>
    <div class="codec-step">
      <div class="codec-question">?</div>
      <div class="codec-labels">
        <h2>?</h2>
        <h3>??? compression</h3>
      </div>
    </div>
  </div>
</div>

---

## Let's play a game...

---

<style scoped>
.movie-clues { display: grid; grid-template-columns: 1fr 1.4fr; gap: .7em 1.2em; align-items: center; font-size: 1.5em; }
.movie-clue { text-align: right; white-space: nowrap; }
.movie-answer { text-align: left; }
</style>

<div class="movie-clues">
  <div class="movie-clue">🌴🏐 →</div>
  <div class="movie-answer">Castaway</div>
  <div class="movie-clue" data-marpit-fragment>💍💍💍💍⚰️ →</div>
  <div class="movie-answer" data-marpit-fragment>Four Weddings and a Funeral</div>
  <div class="movie-clue" data-marpit-fragment>🔇🐑🐑🐑 →</div>
  <div class="movie-answer" data-marpit-fragment>The Silence of the Lambs</div>
  <div class="movie-clue" data-marpit-fragment>👦🏻👦🏼💍🌋⏎👑 →</div>
  <div class="movie-answer" data-marpit-fragment>Lord of the Rings: The Return of the King</div>
</div>

---

## Observations

<!-- prettier-ignore -->
* This is effectively a compression task
* Consider 💍 - it's learned, and contextual
* Compressing efficiently required a powerful, expensive model (our brains 🧠!)

---

<style scoped>
.codec-diagram {
  display: grid;
  place-items: center;
}

.codec-flow {
  display: grid;
  justify-items: center;
  row-gap: .18em;
}

.codec-wave {
  width: 240px;
}

.codec-arrow {
  font-size: 1em;
  line-height: .8;
}

.codec-funnel {
  position: relative;
  width: 210px;
  height: 48px;
}

.codec-funnel::before,
.codec-funnel::after {
  content: "";
  position: absolute;
  clip-path: polygon(0 0, 100% 0, 84% 100%, 16% 100%);
}

.codec-funnel::before {
  inset: 0;
  background: #777;
}

.codec-funnel::after {
  inset: 3px;
  background: #fff;
}

.codec-funnel.decode::before,
.codec-funnel.decode::after {
  clip-path: polygon(16% 0, 84% 0, 100% 100%, 0 100%);
}

.codebook-row {
  position: relative;
}

.codebook {
  border: 3px dashed #777;
  padding: .42em;
}

.codebook .nac {
  display: grid;
  grid-template-columns: repeat(8, auto);
  gap: .16em;
  font-size: .82em;
}

.codebook .nac > span {
  margin: 0;
}

.codebook-label {
  font-size: 1em;
  font-weight: 700;
  left: calc(100% + 1.2em);
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  white-space: nowrap;
}
</style>

<div class="codec-diagram">
  <div class="codec-flow">
    <img class="codec-wave" src="/assets/images/talks/generative-audio/audio-samples.svg" alt="">
    <div class="codec-arrow">↓</div>
    <div class="codec-funnel"></div>
    <div class="codec-arrow">↓</div>
    <div class="codebook-row">
      <div class="codebook">
        <div class="nac">
          <span>🜱</span><span>🜲</span><span>🜶</span><span>🜻</span><span>🝡</span><span>🝊</span><span>🝋</span><span>🝃</span>
          <span>🜏</span><span>🜠</span><span>🝤</span><span>🜼</span><span>🝣</span><span>🝢</span><span>🝌</span><span>🝮</span>
          <span>🜘</span><span>🜉</span><span>🜃</span><span>🝊</span><span>🜶</span><span>🝋</span><span>🜲</span><span>🜻</span>
          <span>🝣</span><span>🜱</span><span>🝤</span><span>🜼</span><span>🝢</span><span>🜠</span><span>🝃</span><span>🝮</span>
        </div>
      </div>
      <div class="codebook-label" data-marpit-fragment>Codebook</div>
    </div>
    <div class="codec-arrow">↓</div>
    <div class="codec-funnel decode"></div>
    <div class="codec-arrow">↓</div>
    <img class="codec-wave" src="/assets/images/talks/generative-audio/audio-samples.svg" alt="">
  </div>
</div>

---

<style scoped>
section {
  justify-content: flex-start;
  padding: 50px 80px;
}

.codec-compression {
  position: relative;
  width: 1040px;
  height: 560px;
  margin: 0 auto;
  color: #30363d;
}

.codec-source,
.codec-target {
  position: absolute;
  top: 0;
  font-size: .8em;
  font-weight: 700;
}

.codec-source {
  left: 20px;
  color: #f87171;
}

.codec-target {
  right: 70px;
  color: #3b82f6;
}

.audio-bar {
  width: 98px;
  height: 26px;
  margin-top: .45em;
  border: 2px solid #f87171;
  border-radius: 4px;
  background: #fca5a5;
}

.token-bar {
  width: 10px;
  height: 30px;
  margin-top: .45em;
  border: 3px solid #3b82f6;
  border-radius: 3px;
  background: #bfdbfe;
}

.compression-arrow {
  position: absolute;
  top: 2px;
  left: 375px;
  width: 290px;
  text-align: center;
  font-size: .95em;
  font-weight: 700;
}

.compression-arrow-line {
  width: 260px;
  height: 34px;
  margin-top: .2em;
}

.codec-via {
  position: absolute;
  top: 95px;
  left: 50%;
  height: 100px;
  border-left: 4px dotted #30363d;
}

.codec-via span {
  position: absolute;
  top: 50%;
  left: 24px;
  transform: translateY(-50%);
  font-size: .95em;
  font-weight: 700;
}

.codec-model {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 350px;
  box-sizing: border-box;
  border: 3px solid #f59e0b;
  border-radius: 4px;
  background: #fb923c;
  color: white;
  font-size: 1.45em;
  font-weight: 700;
  padding: 1.2em;
}
</style>

<div class="codec-compression">
  <div class="codec-source">
    <div>200kb audio</div>
    <div class="audio-bar"></div>
  </div>

  <div class="compression-arrow">
    <div>compressed to</div>
    <svg class="compression-arrow-line" viewBox="0 0 260 34" aria-hidden="true">
      <path d="M8 17H218" fill="none" stroke="#30363d" stroke-width="5" stroke-linecap="round" />
      <polygon points="218,5 252,17 218,29" fill="#30363d" />
    </svg>
  </div>

  <div class="codec-target">
    <div>0.8kb tokens</div>
    <div class="token-bar"></div>
  </div>

  <div data-marpit-fragment>
    <div class="codec-via"><span>via</span></div>
    <div class="codec-model">3GB model</div>
  </div>
</div>

---

<style scoped>
.sample-comparison {
  display: grid;
  gap: 4em;
  grid-template-columns: 1fr 1fr 1fr;
  text-align: center;
}
.sample-column { display: grid; grid-template-rows: 72px auto; row-gap: 1.2em; align-items: center; justify-items: center; }
.sample-example { font-size: 1.6em; }
.sample-count,
.sample-difference { font-size: 1.2em; }
.sample-comparison img { height: 44px; width: auto; }
.sample-difference { grid-column: 1 / -1; margin-top: 1em; }
.tkn-0 { background: rgba(107, 64, 216, .3); }
.tkn-1 { background: rgba(104, 222, 122, .4); }
.tkn-2 { background: rgba(244, 172, 54, .4); }
</style>

<div class="sample-comparison">
  <div class="sample-column">
    <div class="sample-example">"<span class="tkn-0">Hello</span><span class="tkn-1"> DSS</span><span class="tkn-2">AI</span>"</div>
    <div class="sample-count">3 tokens</div>
  </div>
  <div class="sample-column">
    <img src="/assets/images/talks/generative-audio/audio-samples.svg" alt="">
    <div class="sample-count">20-50k samples</div>
  </div>
  <div class="sample-column">
    <div class="sample-example nac"><span>🜱</span><span>🜲</span><span>🜶</span><span>🜻</span>…</div>
    <div class="sample-count">100 tokens</div>
  </div>
  <div class="sample-difference" data-marpit-fragment><em>500x-1000x</em> effective compression</div>
</div>

---

<style scoped>
.codec-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: 2.4em;
  font-size: 1em;
  font-weight: 700;
  line-height: 1.25;
}

.codec-col {
  display: grid;
  row-gap: .35em;
}

.codec-list span {
  color: var(--c);
  opacity: 0;
  transform: translateY(.1em);
  animation: codec-list-in .6s ease-out forwards;
  animation-delay: calc(var(--i) * 45ms);
}

@keyframes codec-list-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<div class="codec-list">
  <div class="codec-col">
    <span style="--c:#e11d48;--i:0">EnCodec</span>
    <span style="--c:#ef4444;--i:1">DAC</span>
    <span style="--c:#f97316;--i:2">TiCodec</span>
    <span style="--c:#f59e0b;--i:3">SNAC</span>
    <span style="--c:#eab308;--i:4">WavTokenizer</span>
    <span style="--c:#84cc16;--i:5">Stable-Codec</span>
    <span style="--c:#22c55e;--i:6">SpeechTokenizer</span>
    <span style="--c:#10b981;--i:7">X-Codec</span>
  </div>
  <div class="codec-col">
    <span style="--c:#14b8a6;--i:8">Mimi</span>
    <span style="--c:#06b6d4;--i:9">LinaCodec</span>
    <span style="--c:#0ea5e9;--i:10">SemantiCodec</span>
    <span style="--c:#3b82f6;--i:11">FACodec</span>
    <span style="--c:#6366f1;--i:12">LSCodec</span>
    <span style="--c:#8b5cf6;--i:13">WavLM</span>
    <span style="--c:#a855f7;--i:14">MOSS-Audio-Tokenizer</span>
    <span style="--c:#c026d3;--i:15">ContentVec</span>
  </div>
  <div class="codec-col">
    <span style="--c:#d946ef;--i:16">UniCodec</span>
    <span style="--c:#ec4899;--i:17">FuseCodec</span>
    <span style="--c:#f43f5e;--i:18">MagiCodec</span>
    <span style="--c:#fb7185;--i:19">LongCat-Audio-Codec</span>
    <span style="--c:#fb923c;--i:20">LayaCodec</span>
    <span style="--c:#facc15;--i:21">Kanade</span>
    <span style="--c:#4ade80;--i:22">H-Codec-2.0</span>
    <span style="--c:#22d3ee;--i:23">Fish Audio Codec</span>
  </div>
</div>

---

# Using *pre-trained LLMs*

---

<style scope>
.smaller {
  font-size: 80%;
  font-style: italic;
}
</style>

Here's an approach that works remarkably well:

<!-- prettier-ignore -->
* Take a pretrained, open-weights LLM (e.g. Llama 1B)
* Take audio files with transcriptions (human or AI generated)
* Encode the audio as neural audio codec tokens
* Fine-tune the LLM!

<p class='smaller' data-marpit-fragment>
  (Cf. Llasa: Scaling Train-Time and Inference-Time Compute for Llama-based Speech Synthesis)
</p>

---

## Training

<pre class='nac'>
&lt;text&gt;It was the best of times, it was the worst of times&lt;/text&gt;
&lt;audio&gt;<span>🜃</span><span>🝃</span><span>🜶</span><span>🜻</span><span>🜼</span><span>🝊</span><span>🝋</span>…&lt;/audio&gt;
</pre>

---

## Inference

Prompt:

<pre class='nac'>
&lt;text&gt;Here's a brand new sentence&lt;/text&gt;
&lt;audio&gt;
</pre>

Continuation:

<pre class='nac'>
<i></i><i></i><span>🝤</span><span>🜱</span><span>🝣</span><span>🜲</span><span>🝊</span><span>🝢</span>…&lt;/audio&gt;
</pre>

---

## Voice cloning (via one-shot prompting)

Prompt:

<pre class='nac'>
&lt;text&gt;Get to the chopper!&lt;/text&gt;
&lt;audio&gt;<span>🝊</span><span>🝢</span><span>🜼</span><span>🝣</span><span>🝌</span><span>🜠</span>…&lt;/audio&gt;

&lt;text&gt;I'll be back&lt;/text&gt;
&lt;audio&gt;
</pre>

Continuation:

<pre class='nac'>
<span>🜘</span><span>🝊</span><span>🝣</span><span>🜱</span><span>🝋</span>…&lt;/audio&gt;
</pre>

---

<style scoped>
div {
  display: flex;
  align-items: center;
}

pre {
  width: 750px;
}

p {
  padding: 1em;
}
</style>

<div data-marpit-fragment>
  <pre class='nac'>
&lt;low-quality&gt;<i></i><span>🜻</span><span>🜶</span><span>🜃</span><span>🝊</span><span>🜉</span><span>🝋</span>&lt;/low-quality&gt;
&lt;high-quality&gt;<i></i><i></i><span>🜼</span><span>🜠</span><span>🜲</span><span>🜶</span><span>🝊</span><span>🝮</span>&lt;/high-quality&gt;</pre>
  <p>Audio enhancement</p>
</div>

<div data-marpit-fragment>
  <pre class='nac'>
&lt;audio&gt;<span>🜻</span><span>🜉</span><span>🜃</span><span>🜏</span><span>🝤</span><span>🝣</span>&lt;/audio&gt;
&lt;instruction&gt;Replace hello with hi&lt;/instruction&gt;
&lt;audio&gt;<span>🜻</span><span>🜉</span><span>🝃</span><span>🝤</span><span>🝣</span>&lt;/audio&gt;</pre>
  <p>Speech editing</p>
</div>

<div data-marpit-fragment>
  <pre class='nac'>
&lt;speech&gt;<i></i><span>🝣</span><span>🝋</span><span>🝢</span><span>🜼</span><span>🝌</span><span>🝮</span>&lt;/speech&gt;
&lt;rap&gt;<i></i><i></i><i></i><i></i><span>🜲</span><span>🜉</span><span>🜼</span><span>🜃</span><span>🝌</span><span>🜘</span>&lt;/rap&gt;</pre>
  <p>Speech-to-rap</p>
</div>

---

## The recipe

<!-- prettier-ignore -->
* Assemble your dataset
* Choose your LLM
  * LLASA = Llama 1B/8B, VibeVoice = Qwen 2.5 1B/7B, OmniVoice = Qwen 3 0.6B
* Choose your neural audio codec
* Choose your training method (full fine tune, LoRA, DoRA, adapter, …)
* Order-of-magnitude training costs $100s - $1000s
  * Less if you fine-tune from a foundation audio model for your task

---

<style scoped>
h2 {
  color: #aaa;
  margin-top: 0;
  font-style: italic;
  font-weight: normal;
}
</style>

# Leverage *diffusion* techniques
## (or flow matching)

---

## Denoising diffusion: the intuition

<style scoped>
.diffusion-intuition {
  position: relative;
  width: 1080px;
  height: 470px;
  margin: 0 auto;
  color: #30363d;
}

.diffusion-intuition img {
  position: absolute;
  width: 180px;
  height: 180px;
  object-fit: cover;
  border-radius: 2px;
}

.diffusion-original { left: 0; top: 185px; }
.diffusion-noisy { left: 420px; top: 185px; }
.diffusion-good { left: 800px; top: 25px; }
.diffusion-bad { left: 800px; top: 285px; }

.diffusion-arrows {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.noise-label {
  position: absolute;
  left: 210px;
  top: 205px;
  width: 180px;
  text-align: center;
  font-size: 1.05em;
  font-weight: 700;
}

.diffusion-result {
  position: absolute;
  left: 1015px;
  font-size: 3em;
  font-weight: 800;
  line-height: 1;
}

.diffusion-result.good {
  top: 75px;
  color: #16a34a;
}

.diffusion-result.bad {
  top: 335px;
  color: #dc2626;
}

.diffusion-fragment {
  display: contents;
}
</style>

<div class="diffusion-intuition">
  <div class="diffusion-fragment">
    <img class="diffusion-original" src="/assets/images/talks/generative-audio/ecce-a.jpg" alt="">
  </div>
  <div class="diffusion-fragment" data-marpit-fragment>
    <img class="diffusion-noisy" src="/assets/images/talks/generative-audio/ecce-b.jpg" alt="">
    <svg class="diffusion-arrows" viewBox="0 0 1080 470" aria-hidden="true">
      <path d="M210 275H368" fill="none" stroke="#30363d" stroke-width="6" stroke-linecap="round" />
      <polygon points="368,263 396,275 368,287" fill="#30363d" />
    </svg>
    <div class="noise-label">add noise</div>
  </div>
  <div class="diffusion-fragment" data-marpit-fragment>
    <img class="diffusion-good" src="/assets/images/talks/generative-audio/ecce-a.jpg" alt="">
    <img class="diffusion-bad" src="/assets/images/talks/generative-audio/ecce-c.jpg" alt="">
    <svg class="diffusion-arrows" viewBox="0 0 1080 470" aria-hidden="true">
      <path d="M620 255L759 139" fill="none" stroke="#30363d" stroke-width="6" stroke-linecap="round" />
      <polygon points="780,121 766,148 751,130" fill="#30363d" />
      <path d="M620 300L756 379" fill="none" stroke="#30363d" stroke-width="6" stroke-linecap="round" />
      <polygon points="780,393 750,389 762,369" fill="#30363d" />
    </svg>
    <div class="diffusion-result good">✓</div>
    <div class="diffusion-result bad">×</div>
  </div>
</div>

---

<style scoped>
.training {
  display: flex;
  align-items: center;
  font-size: 1.5em;
}

.training p {
  font-size: 0.7em;
  font-style: italic;
}

.training img,
.noise-frame {
  margin: 0.5em;
}

.training img {
  display: block;
}

.noise-frame {
  position: relative;
  display: inline-block;
  line-height: 0;
}

.noise-frame img {
  margin: 0;
}

.noise-frame::after {
  content: "";
  position: absolute;
  inset: 0;
  background: url("/assets/images/talks/generative-audio/diffusion-noise.svg?v=2") center / 100% 100% no-repeat;
  image-rendering: pixelated;
  opacity: var(--noise);
  pointer-events: none;
}

.noise-20 { --noise: .35; }
.noise-40 { --noise: .55; }
.noise-60 { --noise: .75; }
.noise-80 { --noise: .92; }
</style>

<div data-marpit-fragment>
  <h3>During training</h3>
  
  Learn denoising step
  
  <div class='training'>
    <img src="/assets/images/talks/generative-audio/dog.jpg" width="100"> → <span class="noise-frame noise-20"><img src="/assets/images/talks/generative-audio/dog.jpg" width="100"></span> → <img src="/assets/images/talks/generative-audio/dog.jpg" width="100">
    <p>"A dog"</p>
  </div>
</div>

<div data-marpit-fragment>
  <h3>During inference</h3>
  
  Chain denoising steps to go from pure noise to novel output
  
  <div class='training inference'>
    <span class="noise-frame noise-80"><img src="/assets/images/talks/generative-audio/cat.jpg" width="100"></span> → <span class="noise-frame noise-60"><img src="/assets/images/talks/generative-audio/cat.jpg" width="100"></span> → <span class="noise-frame noise-40"><img src="/assets/images/talks/generative-audio/cat.jpg" width="100"></span> → <span class="noise-frame noise-20"><img src="/assets/images/talks/generative-audio/cat.jpg" width="100"></span> → <img src="/assets/images/talks/generative-audio/cat.jpg" width="100">
    <p>"A cat"</p>
  </div>
</div>

---

## Advantage: naturally tends to generate clean outputs

<!-- prettier-ignore -->
* Diffusion models generate by denoising
* So they tend to be good add producing clean, sharp outputs
* Good for avoiding audio artifacts

---

## Advantage: CFG for control

<style scoped>
.cfg-slider {
  position: relative;
  width: 100%;
  height: 260px;
  margin: 1.4em 0 0;
  color: #30363d;
}

.cfg-track {
  position: absolute;
  top: 120px;
  left: 0;
  right: 0;
  height: 6px;
  border-radius: 999px;
  background: #30363d;
}

.cfg-knob {
  position: absolute;
  top: 95px;
  left: 0;
  width: 48px;
  height: 48px;
  border: 5px solid #30363d;
  border-radius: 50%;
  background: #a5d8ff;
  animation: cfg-sweep 4s ease-in-out infinite alternate;
}

.cfg-label {
  position: absolute;
  font-size: 1.05em;
  font-weight: normal;
}

.cfg-low { top: 0; left: 0; }
.cfg-high { top: 0; right: 0; }
.cfg-quality { bottom: 0; left: 0; }
.cfg-adherence { right: 0; bottom: 0; text-align: right; }

@keyframes cfg-sweep {
  0% { transform: translateX(220px); }
  100% { transform: translateX(940px); }
}
</style>

<div class="cfg-slider">
  <div class="cfg-label cfg-low">Low CFG</div>
  <div class="cfg-label cfg-high">High CFG</div>
  <div class="cfg-track"></div>
  <div class="cfg-knob"></div>
  <div class="cfg-label cfg-quality">Better quality</div>
  <div class="cfg-label cfg-adherence">Better prompt<br>adherence</div>
</div>

---

## Diffusion for audio

<!-- prettier-ignore -->
* Modify or mask (delete) audio tokens
* Or, introduce noise elsewhere (into the waveform or spectrogram)
* Then reconstruct clean audio

---

<style scoped>
.example {
  column-gap: .8em;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 8em;
  align-items: center;
  font-size: 1.05em;
  margin-bottom: 1em;
  min-height: 3.6em;
}

.example p {
  font-style: italic;
  margin: 0;
  white-space: nowrap;
}

.example .diagram {
  align-items: center;
  display: flex;
  font-size: .75em;
  min-width: 0;
}

.example .arrow {
  align-items: center;
  display: inline-flex;
  flex: 0 0 1.35em;
  font-size: 1.2em;
  justify-content: center;
  line-height: 1;
}

.example .nac {
  flex: 0 0 auto;
}

.nac span.masked {
  background: #000;
  color: rgba(0, 0, 0, 0);
  border: none;
  border-radius: 0;
  box-shadow: none;
}
</style>

## Example diffusion approach: masked diffusion

<div data-marpit-fragment>
  During training:
  
  <div class="example">
    <div class="diagram">
      <div class="nac"><span>🜱</span><span>🜲</span><span>🜶</span><span>🜻</span><span>🝡</span></div>
      <span class="arrow">→</span>
      <div class="nac"><span>🜱</span><span class="masked">🜲</span><span>🜶</span><span>🜻</span><span class="masked">🝡</span></div>
      <span class="arrow">→</span>
      <div class="nac"><span>🜱</span><span>🜲</span><span>🜶</span><span>🜻</span><span>🝡</span></div>
    </div>
    <p>"Hello world"</p>
  </div>
</div>

<div data-marpit-fragment>
  During training:
  
  <div class="example">
    <div class="diagram">
      <div class="nac"><span class="masked">🜏</span><span class="masked">🜠</span><span class="masked">🜱</span><span class="masked">🜲</span><span class="masked">🝡</span><span class="masked">🜶</span></div>
      <span class="arrow">→</span>
      <div class="nac"><span>🜏</span><span class="masked">🜠</span><span>🜱</span><span class="masked">🜲</span><span class="masked">🝡</span><span class="masked">🜶</span></div>
      <span class="arrow">→</span>
      <div class="nac"><span>🜏</span><span class="masked">🜠</span><span>🜱</span><span>🜲</span><span class="masked">🝡</span><span>🜶</span></div>
      <span class="arrow">→</span>
      <div class="nac"><span>🜏</span><span>🜠</span><span>🜱</span><span>🜲</span><span>🝡</span><span>🜶</span></div>
    </div>
    <p>"Goodbye world"</p>
  </div>
</div>

---

## LLM vs. Diffusion

- We can use pure diffusion
- Or we can use pure LLM-backed generation
- Most frontier models use a *combination*

---

## The frontier recipe

- Assemble your dataset
- Choose your *LLM backbone*
- Choose your neural audio codec
- Choose your training method
- Choose your *diffusion approach*

---

# Recap

---

<!-- prettier-ignore -->
* Audio generation has never been more exciting
* And it's still accessible to small labs and hobbyists

---

<!-- prettier-ignore -->
1) Audio is high-dimensional → *Neural audio codecs*
2) Audio generation requires linguistic and cultural context → Use *pre-trained LLMs*
3) Our ears are unforgiving → Leverage *diffusion* techniques

---

<style scoped>
h1 {
  margin-bottom: 0;
}

p {
  margin-top: 3em;
}
</style>

# Thank you!
## alexpeattie.com/talks/generative-audio
<p data-marpit-fragment>Questions?</p>
