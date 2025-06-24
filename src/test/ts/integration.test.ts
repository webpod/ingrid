import process from 'node:process'
import { EOL } from 'node:os'
import * as assert from 'node:assert'
import cp from 'node:child_process'
import { describe, it } from 'node:test'
import {
  parseUnixGrid,
  parseWinGrid
} from '../../main/ts/ingrid.ts'

const IS_WIN = process.platform === 'win32'

describe('integration', () => {
  IS_WIN && it('parse wmic output', () => {
    const input = `wmic process get ProcessId,ParentProcessId,CommandLine${EOL}`
    const cmd = 'cmd'
    const extractWmic = (stdout: string): string =>
      stdout.slice(stdout.indexOf(input) + input.length).trim()
    const res = cp.spawnSync(cmd, {
      input,
      encoding: 'utf-8'
    }).stdout.trim()
    const parsed = parseWinGrid(extractWmic(res))
    const first = parsed[0]
    console.log('first', first)

    assert.ok(parsed.length > 0)
    assert.equal(typeof first.CommandLine[0], 'string')
    assert.equal(typeof first.ParentProcessId[0], 'string')
  })

  !IS_WIN && it('parses ps output', () => {
    const cmd = 'ps'
    const args = ['-lx']
    const res = cp.spawnSync(cmd, args, {
      encoding: 'utf-8',
      windowsHide: true,
      maxBuffer: 1024 * 1024
    }).stdout.trim()
    const parsed = parseUnixGrid(res)
    const first = parsed[0]
    console.log('first', first)

    assert.ok(parsed.length > 0)
    assert.equal(typeof (first.CMD || first.COMMAND)[0], 'string')
    assert.equal(typeof first.PID[0], 'string')
  })
})

