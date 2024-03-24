const assert = require('node:assert')
const { describe, it } = require('node:test')
const { parse } = require('@webpod/ingrid')

describe('cjs index', () => {
  it('has proper exports', () => {
    assert.equal(typeof parse, 'function')
  })
})
