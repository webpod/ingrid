import assert from 'node:assert'
import { describe, it } from 'node:test'
import { parse } from '@webpod/ingrid'

describe('esm index', () => {
  it('has proper exports', () => {
    assert.equal(typeof parse, 'function')
  })
})
