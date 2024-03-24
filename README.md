# @webpod/ingrid
> A shell-printed tables parser

## Usage
There are so many tools for printing tables in the shell, but much less to parse them back.

```ts
import {parse} from '@webpod/ingrid'

const output = `
foo bar baz
1 2 3
`
const result = parse(output) // {foo: ['1'], bar: ['2'], baz: ['3']}
```

## License
[MIT](./LICENSE)
