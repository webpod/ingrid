# @webpod/ingrid
> A shell-printed tables parser

## Usage
There are so many tools for printing tables in the shell, but much less to parse them back.

```ts
import { parse } from '@webpod/ingrid'

const table = `
foo bar baz
1   2   3
`
const result = parse(table.trim())
// {foo: ['1'], bar: ['2'], baz: ['3']}
```

To parse [wmic](https://en.wikipedia.org/wiki/Windows_Management_Instrumentation) grids, set the `format` option:

```ts
const table = `
foo  bar  baz
1

  2  3

a

  b  c

  d  e
`

const result = parse(table.trim(), {format: 'win'})
/**
 [
   { foo: ['1'], bar: ['2'], baz: ['3'] },
   { foo: ['a'], bar: ['b'], baz: ['c'] },
   { foo: ['d'], bar: ['e'], baz: ['-'] }
 ]
 */
```

## License
[MIT](./LICENSE)
