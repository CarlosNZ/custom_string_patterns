import RandExp from 'randexp'
import extractObjectProperty from 'object-property-extractor'
import {
  formatCounter,
  getArgs,
  parseGeneratorOutput,
  processInputPattern,
  ESCAPED_OPEN_ANGLE_BRACKET,
  ESCAPED_CLOSE_ANGLE_BRACKET,
} from './helpers'
import {
  CustomReplacers,
  CustomArgs,
  PatternGeneratorOptions,
  SubstitutionMap,
  RandExpOptions,
  GenerateArgs,
} from './types'

const defaultIncrement = (current: number | string, step: number = 1) => Number(current) + step

// Wrapper to returnn the defaultIncrement function with the step-size backed in
const getDefaultIncrementFn = (step: number) => (current: number | string) =>
  defaultIncrement(current, step)

function* simpleCounter(init: number, increment: Function) {
  let count = init
  while (true) {
    yield count
    count = increment(count)
  }
}

// A "short-hand" function if only one generated string is required
export const patternGen = (
  pattern: string | RegExp,
  options: PatternGeneratorOptions = {},
  args: CustomArgs = {}
) => {
  const pg = new PatternGenerator(pattern, options)
  return pg.gen(args)
}
class PatternGenerator {
  simpleCounter: Generator
  pattern: string | RegExp
  randexpObject: RandExp
  substitutionMap: SubstitutionMap
  randexpPattern: string
  getCounter: Function
  setCounter: Function | null
  incrementFunction: (input: string | number) => string | number
  internalCounter: number
  numberFormat?: Intl.NumberFormat
  customReplacers: CustomReplacers
  fallbackString: string
  randexpOptions: RandExpOptions

  constructor(
    pattern: string | RegExp,
    {
      getCounter,
      setCounter,
      counterInit = 1,
      incrementStep = 1,
      incrementFunction = getDefaultIncrementFn(incrementStep),
      customReplacers = {},
      numberFormat,
      fallbackString,
      defaultRangeAdd,
      defaultRangeSubtract,
      regexMax,
    }: PatternGeneratorOptions = {}
  ) {
    this.simpleCounter = simpleCounter(counterInit, incrementFunction)
    this.getCounter = getCounter ?? (() => this.simpleCounter.next())
    this.setCounter = setCounter ?? null
    this.pattern = pattern
    const { randexpObject, substitionMap, randexpPattern } = processInputPattern(pattern, {
      defaultRangeAdd,
      defaultRangeSubtract,
      regexMax,
    })
    this.randexpObject = randexpObject
    this.substitutionMap = substitionMap
    this.randexpPattern = randexpPattern
    this.incrementFunction = incrementFunction
    this.internalCounter = counterInit
    this.numberFormat = numberFormat
    this.customReplacers = customReplacers
    this.fallbackString = fallbackString ?? ''
    this.randexpOptions = { defaultRangeAdd, defaultRangeSubtract, regexMax }
  }
  public setPattern(newPattern: string | RegExp) {
    const { randexpObject, substitionMap, randexpPattern } = processInputPattern(newPattern, {})
    this.pattern = newPattern
    this.randexpObject = randexpObject
    this.substitutionMap = substitionMap
    this.randexpPattern = randexpPattern
  }
  public setOptions({
    getCounter,
    setCounter,
    // counterIncrement,
    // counterInit -- can't change,
    customReplacers,
    numberFormat,
    fallbackString,
    defaultRangeAdd,
    defaultRangeSubtract,
    regexMax,
  }: PatternGeneratorOptions) {
    if (getCounter) this.getCounter = getCounter
    if (setCounter) this.setCounter = setCounter
    if (customReplacers) this.customReplacers = customReplacers
    if (numberFormat) this.numberFormat = numberFormat
    if (fallbackString) this.fallbackString = fallbackString
    if (defaultRangeAdd) this.randexpObject.defaultRange.add(defaultRangeAdd[0], defaultRangeAdd[1])
    if (defaultRangeSubtract)
      this.randexpObject.defaultRange.subtract(defaultRangeSubtract[0], defaultRangeSubtract[1])
    if (regexMax) this.randexpObject.max = regexMax
  }

  // Generate new string
  public async gen(args: GenerateArgs = {}) {
    const { shouldIncrement = true, customArgs = {}, data = {} } = args

    // Increment counter
    const newCount = shouldIncrement
      ? parseGeneratorOutput(await this.getCounter())
      : this.internalCounter
    this.internalCounter = newCount
    if (this.setCounter) await this.setCounter(await this.incrementFunction(newCount))

    // Create randexp string (with substitutions)
    const generatedRandexString = this.randexpObject.gen()
    const captureGroupMatches =
      generatedRandexString.match(new RegExp(this.randexpPattern))?.slice(1) ?? []

    let outputString = generatedRandexString

    // Replace counters
    const counters = Object.entries(this.substitutionMap).filter((c) => c[1].type === 'counter')
    counters.forEach(([index, counter]) => {
      if ('length' in counter) {
        const formattedCounter = formatCounter({
          value: this.internalCounter,
          numberFormat: this.numberFormat,
          length: counter?.length || 0,
        })
        outputString = outputString.replace(new RegExp(`<${index}>`), formattedCounter)
      }
    })

    // Replace functions
    const functions = Object.entries(this.substitutionMap).filter((f) => f[1].type === 'function')
    const functionResultPromises = functions.map(([index, f]) => {
      if ('funcName' in f) {
        const funcName = f?.funcName
        const args = getArgs(funcName as string, f?.args, customArgs, captureGroupMatches)
        if (!funcName) throw new Error('Missing Function name')
        return this.customReplacers[funcName](...args)
      }
    })
    const functionResults = await Promise.all(functionResultPromises) // for async functions
    functions.forEach(([index, _], i) => {
      outputString = outputString.replace(new RegExp(`<${index}>`), functionResults[i])
    })

    // Extract data properties
    const dataProperties = Object.entries(this.substitutionMap).filter((f) => f[1].type === 'data')
    dataProperties.forEach(([index, propertyObj]) => {
      if ('property' in propertyObj) {
        const { property } = propertyObj
        outputString = outputString.replace(
          new RegExp(`<${index}>`),
          extractObjectProperty(data, property, this.fallbackString) as string
        )
      }
    })

    return outputString
      .replace(new RegExp(ESCAPED_OPEN_ANGLE_BRACKET, 'g'), '<')
      .replace(new RegExp(ESCAPED_CLOSE_ANGLE_BRACKET, 'g'), '>')
  }
}

export default PatternGenerator
