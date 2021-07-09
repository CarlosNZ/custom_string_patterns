import * as RandExp from 'randexp'

const defaultIncrement = (current: number | string) => Number(current) + 1

function* simpleCounter(init: number) {
  let count = init
  while (true) {
    yield count++
  }
}

class PatternGenerator {
  pattern: string | RegExp
  setCounter: Function
  getCounter: Function
  private static randexp: RandExp
  counterIncrement: (input: string | number) => string | number
  internalCounter: number
  shouldWaitForCounter: boolean
  customReplacers: { [key: string]: Function }

  constructor(
    pattern: string | RegExp,
    {
      setCounter,
      getCounter,
      counterIncrement = defaultIncrement,
      counterInit = 1,
      shouldWaitForCounter = false,
      customReplacers = {},
    }: any
  ) {
    this.setCounter = setCounter ?? function () {}
    this.getCounter = getCounter ?? function () {}
    this.pattern = pattern
    this.counterIncrement = counterIncrement
    this.internalCounter = counterInit
    this.shouldWaitForCounter = shouldWaitForCounter
    this.customReplacers = customReplacers
  }
  // generate new string
  async gen(shouldIncrement = true) {
    const randexpPattern = await generateRandExpPattern(
      this.pattern,
      this.getCounter,
      this.setCounter,
      this.counterIncrement,
      this.shouldWaitForCounter,
      this.customReplacers,
      shouldIncrement
    )
  }
}

const generateRandExpPattern = async (
  pattern: string | RegExp,
  getCounter: Function,
  setCounter: Function,
  increment: Function,
  shouldWaitForCounter: boolean,
  customReplacers: { [key: string]: Function },
  shouldIncrement: boolean
) => {
  const patternRegex: RegExp = typeof pattern === 'string' ? new RegExp(pattern) : pattern
  const source = patternRegex.source
  const matches = Array.from(source.matchAll(new RegExp('<(.+?)>', 'g')))
  for (const match of matches) {
    console.log(match)
    if (match[1][0] === '+') {
      // Increment counter, format string, replace in source
    } else if (match[1][0] === '?') {
      console.log('Custom functions not implemented yet')
    }
  }
  return 'NEW REGEX'
}

export default PatternGenerator
