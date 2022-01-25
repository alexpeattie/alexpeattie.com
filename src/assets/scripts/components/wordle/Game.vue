<script setup>
import { onUnmounted, watchEffect } from 'vue'
import Keyboard from './Keyboard.vue'

const props = defineProps(['allWords'])
const illWords = ['bills', 'cills', 'dills', 'fills', 'gills', 'hills', 'jills', 'kills', 'lills', 'mills', 'nills', 'pills', 'rills', 'sills', 'tills', 'vills', 'wills', 'yills', 'zills']
const inputTimeout = 1600

const LetterState = {
  INITIAL: 0,
  CORRECT: 'correct',
  PRESENT: 'present',
  ABSENT: 'absent'
}

let answerIdx = $ref(Math.floor(Math.random() * illWords.length))
const answer = $computed(() => illWords[answerIdx])

// Board state. Each tile is represented as { letter, state }
const board = $ref(
  Array.from({ length: 6 }, () =>
    Array.from({ length: 5 }, () => ({
      letter: '',
      state: LetterState.INITIAL
    }))
  )
)
// Current active row.
let currentRowIndex = $ref(0)
const currentRow = $computed(() => board[currentRowIndex])
const gameOver = $computed(() => currentRowIndex === board.length)

let grid = $ref('')
let shakeRowIndex = $ref(-1)
let success = $ref(false)

// Keep track of revealed letters for the virtual keyboard
const letterStates = $ref({})
// Handle keyboard input.
let allowInput = true

const onKeyup = (e) => onKey(e.key)
window.addEventListener('keyup', onKeyup)
onUnmounted(() => {
  window.removeEventListener('keyup', onKeyup)
})

function newGame(event) {
  for (const letter in letterStates) delete letterStates[letter]
  for (const row in board) {
    board[row] = Array.from({ length: 5 }, () => ({
      letter: '',
      state: LetterState.INITIAL
    }))
  }

  answerIdx = Math.floor(Math.random() * illWords.length)
  grid = ''
  currentRowIndex = 0
  shakeRowIndex = -1
  success = false
  allowInput = false

  setTimeout(() => {
    allowInput = true
  }, inputTimeout)

  if(event) event.target.blur()
}

function onKey(key) {
  if (!allowInput) return
  if (/^[a-zA-Z]$/.test(key)) {
    fillTile(key.toLowerCase())
  } else if (key === 'Backspace') {
    clearTile()
  } else if (key === 'Enter') {
    completeRow()
  }
}
function fillTile(letter) {
  for (const tile of currentRow) {
    if (!tile.letter) {
      tile.letter = letter
      break
    }
  }
}
function clearTile() {
  for (const tile of [...currentRow].reverse()) {
    if (tile.letter) {
      tile.letter = ''
      break
    }
  }
}
function completeRow() {
  const answerLetters = answer.split('')

  if (currentRow.every((tile) => tile.letter)) {
    const guess = currentRow.map((tile) => tile.letter).join('')
    if (!props.allWords.includes(guess) && guess !== answer) {
      shake()
      return
    }
    
    // first pass: mark correct ones
    currentRow.forEach((tile, i) => {
      if (answerLetters[i] === tile.letter) {
        tile.state = letterStates[tile.letter] = LetterState.CORRECT
        answerLetters[i] = null
      }
    })
    // second pass: mark the present
    currentRow.forEach((tile) => {
      if (!tile.state && answerLetters.includes(tile.letter)) {
        tile.state = LetterState.PRESENT
        answerLetters[answerLetters.indexOf(tile.letter)] = null
        if (!letterStates[tile.letter]) {
          letterStates[tile.letter] = LetterState.PRESENT
        }
      }
    })
    // 3rd pass: mark absent
    currentRow.forEach((tile) => {
      if (!tile.state) {
        tile.state = LetterState.ABSENT
        if (!letterStates[tile.letter]) {
          letterStates[tile.letter] = LetterState.ABSENT
        }
      }
    })
    allowInput = false
    if (currentRow.every((tile) => tile.state === LetterState.CORRECT)) {
      // yay!
      setTimeout(() => {
        grid = genResultGrid()
        success = true
      }, inputTimeout)
    } else if (currentRowIndex < board.length - 1) {
      // go the next row
      currentRowIndex++
      setTimeout(() => {
        allowInput = true
      }, inputTimeout)
    } else {
      // game over :(
      setTimeout(() => {
        currentRowIndex++
      }, inputTimeout)
    }
  } else {
    shake()
  }
}

function shake() {
  shakeRowIndex = currentRowIndex
  setTimeout(() => {
    shakeRowIndex = -1
  }, 1000)
}
const icons = {
  [LetterState.CORRECT]: '🟩',
  [LetterState.PRESENT]: '🟨',
  [LetterState.ABSENT]: '⬜',
  [LetterState.INITIAL]: null
}
function genResultGrid() {
  return board
    .slice(0, currentRowIndex + 1)
    .map((row) => {
      return row.map((tile) => icons[tile.state]).join('')
    })
    .join('\n')
}
</script>

<template>
  <div class='wordle'>
    <div class='menu'>
      <button @click="newGame($event)" class='new-game'>
        <span class='icon'>🔁</span> New game
      </button>
      <!-- <label class="cl-switch">
        <input type="checkbox" v-model="unluckyMode">
        <span class="switcher"></span>
        <span class="label">Unlucky mode</span>
      </label> -->
    </div>

    <div id="board">
      <div
        v-for="(row, index) in board"
        :class="[
          'row',
          shakeRowIndex === index && 'shake',
          success && currentRowIndex === index && 'jump'
        ]"
      >
        <div
          v-for="(tile, index) in row"
          :class="['tile', tile.letter && 'filled', tile.state && 'revealed']"
        >
          <div class="front" :style="{ transitionDelay: `${index * 300}ms` }">
            {{ tile.letter }}
          </div>
          <div
            :class="['back', tile.state]"
            :style="{
              transitionDelay: `${index * 300}ms`,
              animationDelay: `${index * 100}ms`
            }"
          >
            {{ tile.letter }}
          </div>
        </div>
      </div>
    </div>
    <p class="answer">
      Secret word:
      <span class="secret">{{ success || gameOver ? answer[0] : '_' }}ills</span>
    </p>
    <Keyboard @key="onKey" :letter-states="letterStates" />
  </div>
</template>

<style scoped>
/* TODO: Allow SASS vars in Vue components */
* {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.wordle {
  margin: 2rem 0 5rem;
}

.menu {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem
}

.new-game {
  background: #e7f5ff;
  border: 1px solid #d0ebff;
  border: none;
  padding: 1rem;
  border-radius: 5px;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
}

.new-game:hover {
  background: #d0ebff;;
}

.new-game .icon {
  margin-right: 0.2rem;
}

#board {
  display: grid;
  grid-template-rows: repeat(6, 1fr);
  grid-gap: 5px;
  padding: 10px;
  box-sizing: border-box;
  --height: min(420px, calc(var(--vh, 100vh) - 310px));
  height: var(--height);
  width: min(350px, calc(var(--height) / 6 * 5));
  margin: 0px auto;
}

.row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 5px;
}

.tile {
  width: 100%;
  font-size: 2rem;
  line-height: 2rem;
  font-weight: bold;
  vertical-align: middle;
  text-transform: uppercase;
  user-select: none;
  position: relative;
}

.tile.filled {
  animation: zoom 0.2s;
}

.tile .front,
.tile .back {
  box-sizing: border-box;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.tile .front {
  border: 2px solid #d3d6da;
}

.tile.filled .front {
  border-color: #999;
}

.tile .back {
  transform: rotateX(180deg);
}

.tile.revealed .front {
  transform: rotateX(180deg);
}

.tile.revealed .back {
  transform: rotateX(0deg);
}

.correct,
.present,
.absent {
  color: #fff !important;
}

.correct {
  background-color: #6aaa64 !important;
}

.present {
  background-color: #c9b458 !important;
}

.absent {
  background-color: #787c7e !important;
}

.answer {
  text-align: center;
  font-size: 1.5rem;
  margin: 1rem;
}

.answer .secret {
  text-transform: uppercase;
  letter-spacing: 0.1rem;
  font-weight: 600;
}

@keyframes zoom {
  0% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.shake {
  animation: shake 0.5s;
}

@keyframes shake {
  0% {
    transform: translate(1px);
  }
  10% {
    transform: translate(-2px);
  }
  20% {
    transform: translate(2px);
  }
  30% {
    transform: translate(-2px);
  }
  40% {
    transform: translate(2px);
  }
  50% {
    transform: translate(-2px);
  }
  60% {
    transform: translate(2px);
  }
  70% {
    transform: translate(-2px);
  }
  80% {
    transform: translate(2px);
  }
  90% {
    transform: translate(-2px);
  }
  100% {
    transform: translate(1px);
  }
}

.jump .tile .back {
  animation: jump 0.5s;
}

@keyframes jump {
  0% {
    transform: translateY(0px);
  }
  20% {
    transform: translateY(5px);
  }
  60% {
    transform: translateY(-25px);
  }
  90% {
    transform: translateY(3px);
  }
  100% {
    transform: translateY(0px);
  }
}

@media (max-height: 680px) {
  .tile {
    font-size: 3vh;
  }
}

.cl-switch input[type="checkbox"] {
  display: none;
  visibility: hidden;
}

.cl-switch .switcher {
  display: inline-block;
  border-radius: 100px;
  width: 35px;
  height: 15px;
  background-color: #ccc;
  position: relative;
  box-sizing: border-box;
  vertical-align: middle;
  cursor: pointer;
}

.cl-switch .switcher:before {
  content: "";
  display: block;
  width: 20px;
  height: 20px;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  margin-top: -3px;
  position: absolute;
  top: 0;
  left: 0;
  transition: all 0.2s;
}

.cl-switch .switcher:active:before {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.6), 0 0 0 10px rgba(63, 81, 181, 0.3);
  transition: all, 0.1s;
}

.cl-switch .label {
  cursor: pointer;
  vertical-align: middle;
  margin: 0 1rem;
}

.cl-switch input[type="checkbox"]:checked + .switcher {
  background-color: #a5d8ff;
}

.cl-switch input[type="checkbox"]:checked + .switcher:before {
  left: 100%;
  margin-left: -20px;
  background-color: #339af0;
}
</style>