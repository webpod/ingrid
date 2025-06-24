import process from 'node:process'
// import * as assert from 'node:assert'
import cp from 'node:child_process'
import { describe, it } from 'node:test'
// import path from 'node:path'
// import * as fs from 'node:fs/promises'

const IS_WIN = process.platform === 'win32'

describe('integration', () => {
  IS_WIN && it('parse wmic output', () => {
    const input = 'wmic process get ProcessId,ParentProcessId,CommandLine'
    const cmd = 'cmd'

    const res = cp.execSync(cmd, {
      input
    }).toString('utf8')

    console.log('res', res)
  })
})

