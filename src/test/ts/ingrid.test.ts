import * as assert from 'node:assert'
import { describe, it } from 'node:test'
import * as path from 'node:path'
import * as fs from 'node:fs/promises'
import {
  parseUnixGrid,
  parseLine,
  parseLines,
  getBorders
} from '../../main/ts/ingrid.ts'

const __dirname = path.dirname(new URL(import.meta.url).pathname)
const fixtures = path.resolve(__dirname, '../fixtures')

describe('parseUnixGrid()', () => {
  it('parses ps output', async () => {
    const output = await fs.readFile(path.resolve(fixtures, 'ps-unix-output.txt'), 'utf8')
    const result = parseUnixGrid(output)

    assert.equal(result.length, 16)
    assert.deepEqual(result[0], {
      UID: [ '501' ],
      PID: [ '990' ],
      PPID: [ '607' ],
      CPU: [ '0' ],
      PRI: [ '31' ],
      NI: [ '0' ],
      VSZ: [ '442397872' ],
      RSS: [ '265552' ],
      WCHAN: [ '-' ],
      STAT: [ 'S' ],
      TT: [ '??' ],
      TIME: [ '60:31.09' ],
      COMMAND: [
        '/Applications/Google',
        'Chrome.app/Contents/Frameworks/Google',
        'Chrome',
        'Framework.framework/Versions/122.0.6261.94/Helpers/Google',
        'Chrome',
        'Helper.app/Contents/MacOS/Google',
        'Chrome',
        'Helper',
        '--type=utility',
        '--utility-sub-type=network.mojom.NetworkService',
        '--lang=en-GB',
        '--service-sandbox-type=network',
        '--shared-files',
        '--field-trial-handle=1718379636,r,6744856145341839035,5106998175579676161,262144',
        '--variations-seed-version=20240229-080131.021000',
        '--seatbelt-client=24'
      ]
    })
  })

  it('parses ps shifted heades', async () => {
    const output = await fs.readFile(path.resolve(fixtures, 'ps-unix-shifted-headers.txt'), 'utf8')
    const result = parseUnixGrid(output)

    assert.equal(result.length, 3)
    assert.deepEqual(result[0], {
        COMMAND: ['/usr/sbin/cfprefsd', 'agent'],
        CPU: ['0'],
        NI: ['0'],
        PID: ['593'],
        PPID: ['1'],
        PRI: ['4'],
        RSS: ['14752'],
        STAT: ['S'],
        TIME: ['0:01.73'],
        TT: ['??'],
        UID: ['110274890'],
        VSZ: ['2526928'],
        WCHAN: ['-']
      }
    )
  })
})

describe('parseLine()', () => {
  it('extracts words ans spaces respecting quotes', () => {
    const line = `foo bar "baz qux"   'a b "c"'`
    const result = parseLine(line)
    assert.deepEqual(result, {
      spaces: [3, 7, 17, 18, 19],
      words: [
        {s: 0, e: 2, w: 'foo'},
        {s: 4, e: 6, w: 'bar'},
        {s: 8, e: 16, w: '"baz qux"'},
        {s: 20, e: 28, w: `'a b "c"'`}
      ]
    })
  })

  it('multiline', () => {
    const lines = `foo bar "baz qux"
'a b "c"' d   e
`
    const result = parseLines(lines)
    assert.deepEqual(result, [
      {
        spaces: [3, 7],
        words: [
          {s: 0, e: 2, w: 'foo'},
          {s: 4, e: 6, w: 'bar'},
          {s: 8, e: 16, w: '"baz qux"'}
        ]
      },
      {
        spaces: [9, 11, 12, 13],
        words: [
          {s: 0, e: 8, w: "'a b \"c\"'"},
          {s: 10, e: 10, w: 'd'},
          {s: 14, e: 14, w: 'e'}
        ]
      },
      {
        spaces: [],
        words: []
      }
    ])
  })
})

describe('getBorders()', () => {
  it('detects space-formatted grid', () => {
const output = `
aaa bbb  ccc
aa  bb   cc
a   b    c
`.trim()
    const lines = parseLines(output)
    const result = getBorders(lines)
    assert.deepEqual(result, [3, 7, 8])
  })
})
