import * as RandExp from 'randexp'

const defaultIncrement = (current: number | string) => Number(current) + 1

function* simpleCounter(init: number) {
  let count = init
  while (true) {
    yield count++
  }
}

// Wrap counter generator in function so getCounter just returns the value, not the whole iterator object
const simpleCounterWrapper = (counter: Generator) => () => counter.next().value

class PatternGenerator {
  simpleCounter: Generator
  pattern: string | RegExp
  getCounter: Function
  setCounter: Function | null
  private static randexp: RandExp
  counterIncrement: (input: string | number) => string | number
  internalCounter: number
  numberFormat: Intl.NumberFormat
  // shouldWaitForCounter: boolean
  customReplacers: { [key: string]: Function }

  constructor(
    pattern: string | RegExp,
    {
      getCounter,
      setCounter,
      counterIncrement = defaultIncrement,
      counterInit = 1,
      // shouldWaitForCounter = false,
      customReplacers = {},
      numberFormat,
    }: any
  ) {
    this.simpleCounter = simpleCounter(counterInit)
    this.getCounter = getCounter ?? simpleCounterWrapper(this.simpleCounter)
    this.setCounter = setCounter ?? null
    this.pattern = pattern
    this.counterIncrement = counterIncrement
    this.internalCounter = counterInit
    // this.shouldWaitForCounter = shouldWaitForCounter
    this.numberFormat = new Intl.NumberFormat(numberFormat)
    this.customReplacers = customReplacers
  }
  // generate new string
  async gen(shouldIncrement = true) {
    const patternRegex: RegExp =
      typeof this.pattern === 'string' ? new RegExp(this.pattern) : this.pattern
    const source = patternRegex.source
    let randexpPattern = source
    const matches = Array.from(source.matchAll(new RegExp('<(.+?)>', 'g')))
    for (const match of matches) {
      console.log(match)
      if (match[1][0] === '+') {
        const newCount = shouldIncrement ? await this.getCounter() : this.internalCounter
        if (this.setCounter) await this.setCounter(this.counterIncrement(newCount))
        const replacementCounter = replaceCount(match[1], newCount, this.numberFormat)
        randexpPattern = randexpPattern.replace(match[0], replacementCounter)
      } else if (match[1][0] === '?') {
        // console.log('Custom functions not implemented yet')
      }
    }
    console.log(randexpPattern)
    return 'randexpPattern'
  }
}

export default PatternGenerator

const replaceCount = (
  pattern: string,
  count: number | string,
  numberFormat: Intl.NumberFormat | undefined
) => {
  return numberFormat ? numberFormat.format(Number(count)) : String(count)
}
