import process from 'node:process'
import { EOL } from 'node:os'
// import * as assert from 'node:assert'
import cp from 'node:child_process'
import { describe, it } from 'node:test'
import {
  parseUnixGrid,
  parseWinGrid
} from '../../main/ts/ingrid.ts'
// import path from 'node:path'
// import * as fs from 'node:fs/promises'

const IS_WIN = process.platform === 'win32'


describe('integration', () => {
  IS_WIN && it('parse wmic output', () => {
    const input = `wmic process get ProcessId,ParentProcessId,CommandLine ${EOL}`
    const cmd = 'cmd'
    const extractWmic = (stdout: string): string =>
      stdout.slice(stdout.indexOf('CommandLine'))

    const res = cp.spawnSync(cmd, {
      input,
      encoding: 'utf-8'
    }).stdout

    console.log('res', res)
    console.log('parsed', parseWinGrid(extractWmic(res)))
  })

  !IS_WIN && it('parses ps output', () => {
    const cmd = 'ps'
    const args = ['-lx']

    const res = cp.spawnSync(cmd, args, {
      encoding: 'utf-8',
      windowsHide: true,
      maxBuffer: 1024 * 1024
    }).stdout

    console.log('parsed', parseUnixGrid(res))
  })
})

