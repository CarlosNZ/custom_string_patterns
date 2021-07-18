import RandExp from 'randexp'
import { SubstitutionMap, RandExpOptions } from './types'

// Turns input pattern into a randexp object with indexed substitions for
// replacers and counters
export const processInputPattern = (pattern: string | RegExp, randexpOptions: RandExpOptions) => {
  const patternRegex: RegExp = typeof pattern === 'string' ? new RegExp(pattern) : pattern
  const { source, flags } = patternRegex
  const substitionMap: SubstitutionMap = {}
  let randexpPattern = source
  const matches = Array.from(source.matchAll(/(?<!\\)<(.+?)(?<!\\)>/g)).entries()
  for (const [index, match] of Array.from(matches)) {
    const fullMatchString = match[0]
    const captureGroup = match[1]
    const operator = captureGroup[0]
    if (operator === '+') {
      substitionMap[index] = { type: 'counter', length: captureGroup.match(/d/g)?.length || 0 }
    } else if (operator === '?') {
      const [_, funcName, argsString] = captureGroup.match(/([A-z0-9]+)(\(.*\))?/) as Array<string>
      substitionMap[index] = { type: 'function', funcName, args: splitArgs(argsString) }
    } else {
      // Remaining will be object properties to extract
      substitionMap[index] = { type: 'data', property: captureGroup }
    }
    randexpPattern = randexpPattern.replace(fullMatchString, `<${index}>`)
  }
  // Replace literal backslashes with "magic strings" to preserve through so they don't get replaced by subsequent replacements
  randexpPattern = randexpPattern
    .replace(/\\</g, ESCAPED_OPEN_ANGLE_BRACKET)
    .replace(/\\>/g, ESCAPED_CLOSE_ANGLE_BRACKET)

  // Create RandExp object and apply options
  const randexpObject = new RandExp(randexpPattern, flags)
  const { defaultRangeAdd, defaultRangeSubtract, regexMax } = randexpOptions
  if (defaultRangeAdd) randexpObject.defaultRange.add(defaultRangeAdd[0], defaultRangeAdd[1])
  if (defaultRangeSubtract)
    randexpObject.defaultRange.add(defaultRangeSubtract[0], defaultRangeSubtract[1])
  if (regexMax) randexpObject.max = regexMax

  return { randexpObject, substitionMap, randexpPattern }
}

// Remove brackets and split into array of separate args
const splitArgs = (argsString: string) => {
  if (!argsString) return []
  return argsString
    .slice(1, -1)
    .split(',')
    .map((arg) => Number(arg))
}

export const formatCounter = (input: {
  value: number | string
  numberFormat?: Intl.NumberFormat
  length: number
}) => {
  const { value, numberFormat, length } = input
  if (numberFormat) return numberFormat.format(Number(value))
  const numString = String(value)
  return '0'.repeat(Math.max(0, length - numString.length)) + numString
}

export const getArgs = (
  funcName: string,
  argIndexes: number[],
  customArgs: any,
  captureGroups: string[]
) => {
  // Prioritise custom arguments over capture group args
  if (customArgs[funcName]) return [customArgs[funcName]]
  return argIndexes.map((i) => captureGroups[i - 1])
}

// Allows a generator to be used as a counter directly, rather than needing to
// be wrapped in another function
export const parseGeneratorOutput = (counterOutput: string | number | IteratorYieldResult<any>) => {
  if (typeof counterOutput === 'number' || typeof counterOutput === 'string') return counterOutput
  if (counterOutput?.value) return counterOutput.value
  throw new Error('Invalid counter function, or Generator has reached limit')
}

// Magic strings
export const ESCAPED_OPEN_ANGLE_BRACKET = 'L1TERAl_b@CKSL@SH_0pen'
export const ESCAPED_CLOSE_ANGLE_BRACKET = 'L1TERAl_b@CKSL@SH_cl0se'
