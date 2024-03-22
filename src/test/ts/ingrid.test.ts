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

// describe('parseUnixGrid()', () => {
//   it('parses ps output', async () => {
//     const output = await fs.readFile(path.resolve(fixtures, 'ps-unix-output.txt'), 'utf8')
//     const result = parseUnixGrid(output)
//     console.log(result)
//     // assert.equal(foo(), undefined)
//   })
// })

describe('parseLine()', () => {
  it('extracts words ans spaces respecting quotes', () => {
    const line = `foo bar "baz qux"   'a b "c"'`
    const result = parseLine(line)
    assert.deepEqual(result, {
      spaces: [3, 7, 17, 18, 19],
      words: [
        {s: 2, e: 5, w: 'foo'},
        {s: 6, e: 9, w: 'bar'},
        {s: 8, e: 17, w: '"baz qux"'},
        {s: 20, e: 29, w: `'a b "c"'`}
      ]
    })
  })

  it ('multiline', () => {
    const lines = `foo bar "baz qux"
'a b "c"' d   e
`
    const result = parseLines(lines)
    assert.deepEqual(result, [
      {
        spaces: [3, 7],
        words: [
          {s: 2, e: 5, w: 'foo'},
          {s: 6, e: 9, w: 'bar'},
          {s: 8, e: 17, w: '"baz qux"'}
        ]
      },
      {
        spaces: [9, 11, 12, 13],
        words: [
          {s: 0, e: 9, w: "'a b \"c\"'"},
          {s: 10, e: 11, w: 'd'},
          {s: 14, e: 15, w: 'e'}
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
