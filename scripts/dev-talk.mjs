#!/usr/bin/env node

import { existsSync } from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'

const usage = `Usage: npm run dev:talk <talk-slug>

Example:
  npm run dev:talk generative-audio`

const args = process.argv.slice(2).filter((arg) => arg !== '--')
const wantsHelp = args.includes('--help') || args.includes('-h')
const dryRun = args.includes('--dry-run') || process.env.npm_config_dry_run === 'true'
const slug = args.find((arg) => !arg.startsWith('-'))

if (wantsHelp) {
  console.log(usage)
  process.exit(0)
}

if (!slug) {
  console.error(usage)
  process.exit(1)
}

if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error(`Invalid talk slug: ${slug}`)
  console.error('Talk slugs should contain only lowercase letters, numbers, and hyphens.')
  process.exit(1)
}

const root = process.cwd()
const source = path.join(root, 'src', 'talks', `_${slug}.md`)
const output = path.join(root, 'src', 'talks', `${slug}.html`)

if (!existsSync(source)) {
  console.error(`Could not find Marp source: ${path.relative(root, source)}`)
  process.exit(1)
}

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const rel = (filename) => path.relative(root, filename)
const marpEnv = {
  ...process.env,
  LANG: 'en_US.UTF-8',
  LC_ALL: 'en_US.UTF-8'
}

const marpArgs = ['@marp-team/marp-cli', rel(source), '-o', rel(output)]
const marpWatchArgs = [...marpArgs, '--watch']

if (dryRun) {
  console.log(`$ LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 ${npxCmd} ${marpArgs.join(' ')}`)
  console.log(`$ LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 ${npxCmd} ${marpWatchArgs.join(' ')}`)
  console.log(`$ ${npmCmd} run dev`)
  process.exit(0)
}

function run(command, commandArgs, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, { stdio: 'inherit', ...options })

    child.on('error', reject)
    child.on('exit', (code, signal) => {
      if (code === 0) resolve()
      else reject(new Error(`${command} exited with ${signal || code}`))
    })
  })
}

function start(command, commandArgs, options = {}) {
  const child = spawn(command, commandArgs, {
    detached: process.platform !== 'win32',
    stdio: 'inherit',
    ...options
  })
  children.push(child)
  return child
}

let shuttingDown = false
const children = []

function stopChildren(exitCode = 0) {
  if (shuttingDown) return

  shuttingDown = true
  for (const child of children) {
    if (!child.pid) continue

    try {
      if (process.platform === 'win32') child.kill('SIGTERM')
      else process.kill(-child.pid, 'SIGTERM')
    } catch (error) {
      if (error.code !== 'ESRCH') console.error(error.message)
    }
  }

  setTimeout(() => process.exit(exitCode), 250)
}

process.on('SIGINT', () => stopChildren(0))
process.on('SIGTERM', () => stopChildren(0))

console.log(`Generating ${rel(output)} from ${rel(source)}...`)
await run(npxCmd, marpArgs, { env: marpEnv })

console.log(`Watching ${rel(source)} with Marp and starting the site dev server...`)

for (const [name, child] of [
  ['marp:watch', start(npxCmd, marpWatchArgs, { env: marpEnv })],
  ['dev', start(npmCmd, ['run', 'dev'])]
]) {
  child.on('error', (error) => {
    console.error(`${name} failed:`, error)
    stopChildren(1)
  })

  child.on('exit', (code, signal) => {
    if (shuttingDown) return
    console.error(`${name} exited with ${signal || code}`)
    stopChildren(code || 1)
  })
}
