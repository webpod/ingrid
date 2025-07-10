export type TIngridResponse = Record<string, string[]>[]

export type TIngridParseOpts = Partial<{
  format: 'unix' | 'win'
}>

export type TIngridParse = (input: string) => TIngridResponse

const EOL = /\r?\n|\r|\n/
const EMPTY = '-'

type TLineDigest = {
  spaces: number[],
  words: {s: number, e: number, w: string}[]
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export const parseLine = (line: string, sep = ' '): TLineDigest => {
  if (typeof line !== 'string') throw new Error('parseLine: line must be a string')

  const result: TLineDigest = {
    spaces: [],
    words: []
  }
  const capture = () => {
    if (word) {
      result.words.push({
        s,
        e: s + word.length - 1,
        w: word
      })
      word = ''
      s = -1
    }
  }
  let bb: string | undefined
  let word = ''
  let s = -1
  for (const i in [...line]) {
    const prev: string = line[+i - 1]
    const char = line[i]
    if (bb) {
      word += char
      if (char === bb && prev !== '\\') {
        bb = undefined
      }
      continue
    }
    if (char === sep) {
      result.spaces.push(+i)
      capture()
      continue
    }
    if (s === -1) s = +i
    if (char === '"' || char === "'") bb = char
    word += char
  }

  capture()

  return result
}

export const parseLines = (input: string, sep?: string): TLineDigest[] =>
  input.split(EOL).filter(Boolean).map(l => parseLine(l, sep))

const countWordsByIndex = ({words}: TLineDigest, index: number): number => words.filter(({e}) => e < index).length

export const getBorders = (lines: TLineDigest[]): number[] =>
  lines[0].spaces.reduce<number[]>((m, i) => {
    const c = countWordsByIndex(lines[0], i)
    if (lines.every(l => l.spaces.includes(i) && c === countWordsByIndex(l, i))) {
      m.push(i)
    }
    return m
  }, [])

// eslint-disable-next-line sonarjs/cognitive-complexity
export const parseUnixGrid = (input: string): TIngridResponse => {
  const lines = parseLines(input)
  const borders = getBorders(lines)
  const _borders = [Number.NEGATIVE_INFINITY, ...borders, Number.POSITIVE_INFINITY]
  const grid: string[][][] = []

  for (const {words} of lines) {
    const row: string[][] = []
    grid.push(row)
    for (const n in words) {
      const {w, s, e} = words[n]

      for (const _b in _borders) {
        const a = _borders[+_b]
        const b = _borders[+_b + 1]
        if (b === undefined) break
        const block = row[_b] || (row[_b] = [])
        if (s > a && e < b) block.push(w)
      }
    }
  }

  return gridToData(grid)
}

// eslint-disable-next-line sonarjs/cognitive-complexity
const gridToData = (grid: string[][][]): TIngridResponse => {
  const data: TIngridResponse = []
  const [headers, ...body] = grid

  for (const row of body) {
    const entry: TIngridResponse[number] = {}
    data.push(entry)

    for (const i in headers) {
      const keys = headers[i]
      if (keys.length === 0) continue
      if (keys.length > row[i].length) {
        throw new Error('Malformed grid: row has more columns than headers')
      }
      for (const k in keys) {
        const key = keys[k]
        const to = +k + 1 === keys.length ? Number.POSITIVE_INFINITY : +k + 1
        entry[key] = row[i].slice(+k, to)
      }
    }
  }

  return data
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export const parseWinGrid = (input: string): TIngridResponse => {
  const _lines = input.split(/\r?\n/)
  const lines = _lines.filter(Boolean)
  const headline = lines.shift()!
  const headers = headline.split(/\s+/)
  const ll = lines[0].length
  const hl = headers.length

  if (lines.every(l => l.length === ll)) {
    const spaces = Array
      .from({ length: ll })
      .map((_, i) =>
        lines.every(l => l[i] === ' ')
      )
    const borders = spaces
      .reduce<number[]>((m, v, i, a) => {
        if ( v && !a[i - 1]) m.push(i)
        return m
      }, [0])
    const data: TIngridResponse = []

    for (const line of lines) {
      const props: [string, [string]][] = []
      for (const i in headers) {
        const k = headers[i]
        const s = borders[i]
        const e = borders[+i + 1] || ll
        const v = line.slice(s, e).trim()
        props.push([k, [v || EMPTY]])
      }
      data.push(Object.fromEntries(props))
    }
    return data
  }

  let w = ''
  let p
  const body = input.slice(headline.length)
  const vals: string[] = []
  const data: TIngridResponse = []

  const cap = (v?: string) => {
    const _v = w.trim() || (vals.length === 0 ? v : w.trim())
    if (!_v) return

    vals.push(_v)
    if (vals.length === hl) {
      data.push(Object.fromEntries(headers.map((h, i) => [h, [vals[i]]])))
      vals.length = 0
    }
    w = ''
  }

  for (const c of body) {
    w += c
    if (c === ' ') {
      if (p === '\n') {
        cap(EMPTY)
      } else if (p === ' ') {
        cap()
      }
    } else if (c === '\n') {
      cap()
    }
    p = c
  }
  cap()

  return data
}

const parsers = {
  unix: parseUnixGrid,
  win: parseWinGrid
}

export const parse = (input: string, {format = 'unix'}: TIngridParseOpts = {}) => {
  const parser = parsers[format]
  if (!parser) throw new Error(`unsupported format: ${format}`)

  return parser(input)
}
