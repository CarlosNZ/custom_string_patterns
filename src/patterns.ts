import RandExp from 'randexp'
import { formatCounter, getArgs, parseGeneratorOutput, processInputPattern } from './helpers'
import {
  CustomReplacers,
  GenerateArgs as CustomArgs,
  PatternGeneratorOptions,
  SubstitutionMap,
} from './types'

const defaultIncrement = (current: number | string) => Number(current) + 1

function* simpleCounter(init: number, increment: Function) {
  let count = init
  while (true) {
    yield count
    count = increment(count)
  }
}

// A "short-hand" function if only one generated string is required
export const patternGen = (pattern: string | RegExp, options: PatternGeneratorOptions = {}) => {
  const pg = new PatternGenerator(pattern, options)
  return pg.gen()
}
class PatternGenerator {
  simpleCounter: Generator
  pattern: string | RegExp
  randexpObject: RandExp
  substitutionMap: SubstitutionMap
  randexpPattern: string
  getCounter: Function
  setCounter: Function | null
  counterIncrement: (input: string | number) => string | number
  internalCounter: number
  numberFormat?: Intl.NumberFormat
  customReplacers: CustomReplacers

  constructor(
    pattern: string | RegExp,
    {
      getCounter,
      setCounter,
      counterIncrement = defaultIncrement,
      counterInit = 1,
      customReplacers = {},
      numberFormat,
    }: PatternGeneratorOptions = {}
  ) {
    this.simpleCounter = simpleCounter(counterInit, counterIncrement)
    this.getCounter = getCounter ?? (() => this.simpleCounter.next())
    this.setCounter = setCounter ?? null
    this.pattern = pattern
    const { randexpObject, substitionMap, randexpPattern } = processInputPattern(pattern)
    this.randexpObject = randexpObject
    this.substitutionMap = substitionMap
    this.randexpPattern = randexpPattern
    this.counterIncrement = counterIncrement
    this.internalCounter = counterInit
    this.numberFormat = numberFormat
    this.customReplacers = customReplacers
  }
  // Generate new string
  async gen(args: CustomArgs = {}) {
    const { shouldIncrement = true, customArgs = {} } = args
    // Increment counter
    const newCount = shouldIncrement
      ? parseGeneratorOutput(await this.getCounter())
      : this.internalCounter
    this.internalCounter = newCount
    if (this.setCounter) await this.setCounter(await this.counterIncrement(newCount))

    // Create randexp string (with substitutions)
    const generatedRandexString = this.randexpObject.gen()
    const captureGroupMatches =
      generatedRandexString.match(new RegExp(this.randexpPattern))?.slice(1) ?? []

    const counters = Object.entries(this.substitutionMap).filter((c) => c[1].type === 'counter')
    const functions = Object.entries(this.substitutionMap).filter((f) => f[1].type === 'function')
    let outputString = generatedRandexString

    // Replace counters
    counters.forEach(([index, counter]) => {
      const formattedCounter = formatCounter({
        value: this.internalCounter,
        numberFormat: this.numberFormat,
        length: counter?.length || 0,
      })
      outputString = outputString.replace(`<${index}>`, formattedCounter)
    })

    // Replace functions
    const functionPromises = functions.map(([index, f]) => {
      const funcName = f?.funcName
      const args = getArgs(index, funcName as string, f?.args, customArgs, captureGroupMatches)
      if (!funcName) throw new Error('Missing Function name')
      return this.customReplacers[funcName](args)
    })
    const functionResults = await Promise.all(functionPromises) // for async functions
    functions.forEach(([index, func], i) => {
      outputString = outputString.replace(`<${index}>`, functionResults[i])
    })

    return outputString
  }
}

export default PatternGenerator
