import * as assert from 'node:assert'
import { describe, it } from 'node:test'
import { parse } from '../../main/ts/index.ts'

describe('index', () => {
  it('has proper exports', () => {
    assert.equal(typeof parse, 'function')
  })
})
