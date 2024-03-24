export type TIngridResponse = Record<string, string[]>[]

export type TIngridParseOpts = Partial<{
  format: 'unix' | 'win'
}>

export type TIngridParse = (input: string) => TIngridResponse

const EOL = /\r?\n|\r|\n/

type TLineDigest = {
  spaces: number[],
  words: {s: number, e: number, w: string}[]
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export const parseLine = (line: string, sep = ' '): TLineDigest => {
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
  input.split(EOL).map(l => parseLine(l, sep))

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

const cut = (line: string, points: number[], pad = 2): string[] => {
  const chunks: string[] = []
  let s = 0
  for (const i in [...points, Number.POSITIVE_INFINITY]) {
    const chunk = line.slice(s, points[i])
    chunks.push(chunk)
    s = points[i] + pad
  }

  return chunks
}

export const parseWinGrid = (input: string): TIngridResponse => {
  const lines = input.split(EOL)
  const headers = lines[0].trim().split(/\s+/)
  const data: TIngridResponse = []

  let memo = null
  for (const line of lines.slice(1)) {
    if (!line) continue

    const {spaces} = parseLine(line)
    const borders = spaces.filter((s, i) => spaces[i + 1] === s + 1 && spaces[i + 2] !== s + 2)

    let chunks = (borders.length > 0 ? cut(line, borders, 2) : [line]).map(l => l.trim())//.filter(Boolean)
    if (chunks.length < headers.length) {
      memo = chunks
      continue
    } else if (chunks[0]?.trim()) {
      memo = null
    } else {
      chunks = [...(memo || ['<unknown>']), ...chunks].filter(Boolean)
    }

    const entry: TIngridResponse[number] = Object.fromEntries(headers.map((header, i) =>
      [header, parseLine(chunks[i]).words.map(({w}) => w)]
    ))
    data.push(entry)
  }

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
