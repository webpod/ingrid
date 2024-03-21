# @webpod/ingrid
> A shell-printed tables parser

## Usage
There are so many tools for printing tables in the shell, but much less for parse them back.

```ts
import {parse} from '@webpod/ingrid'

const output = `
f o o
`
const result = parse(output)
```

## License
[MIT](./LICENSE)
