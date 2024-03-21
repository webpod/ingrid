const assert = require('node:assert')
const { describe, it } = require('node:test')
const { foo } = require('@webpod/ingrid')

describe('cjs foo()', () => {
  it('is callable', () => {
    assert.equal(foo(), undefined)
  })
})
