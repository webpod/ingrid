import process from 'node:process'

export type TIngridResponse = {
  headers: string[]
  rows: string[][]
}

export type TIngridParseOpts = Partial<{
  format: 'unix' | 'win'
}>

export type TIngridParse = (input: string) => TIngridResponse | undefined

const isWin = process.platform === 'win32'
const EOL = /\r?\n|\r|\n/

type TLineDigest = {
  spaces: number[],
  words: {s: number, e: number, w: string}[]
}

export const parseLine = <T>(line: string): TLineDigest => {
  const result: TLineDigest = {
    spaces: [],
    words: []
  }
  const capture = () => {
    if (word) {
      result.words.push({
        s,
        e: s + word.length,
        w: word
      })
      word = ''
    }
  }
  let bb: string | undefined
  let word = ''
  let s = 0
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
    if (char === ' ') {
      result.spaces.push(+i)
      capture()
      continue
    }
    s = +i
    if (char === '"' || char === "'") bb = char
    word += char
  }

  capture()

  return result
}

export const parseLines = (input: string): TLineDigest[] =>
  input.split(EOL).map(parseLine)

export const getBorders = (lines: TLineDigest[]): number[] =>
  lines[0].spaces.reduce<number[]>((m, i) => {
    if (lines.every(l => l.spaces.includes(i))) {
      m.push(i)
    }
    return m
  }, [])

export const parseUnixGrid = (input: string): TIngridResponse | undefined => {}

export const parseWinGrid = (input: string): TIngridResponse | undefined => {}

const parsers = {
  unix: parseUnixGrid,
  win: parseWinGrid
}

export const parse: TIngridParse = (input, {format = isWin ? 'win' : 'unix'}: TIngridParseOpts = {}) => {
  const parser = parsers[format]
  if (!parser) throw new Error(`unsupported format: ${format}`)

  return parser(input)
}

