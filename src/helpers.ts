import RandExp from 'randexp'

import { CustomReplacers, CustomArgs, SubstitutionMap } from './types'

export const formatCounter = ({
  value,
  numberFormat,
  length,
}: {
  value: number | string
  numberFormat?: Intl.NumberFormat
  length: number
}) => {
  if (numberFormat) return numberFormat.format(Number(value))
  const numString = String(value)
  return '0'.repeat(Math.max(0, length - numString.length)) + numString
}

export const replaceCount = (
  pattern: string,
  count: number | string,
  numberFormat: Intl.NumberFormat | undefined
) => {
  const numDigits = pattern.match(/d/g)?.length || 0
  const numString = String(count)
  const paddedNumString = '0'.repeat(Math.max(0, numDigits - numString.length)) + numString
  return escapeLiterals(numberFormat ? numberFormat.format(Number(count)) : paddedNumString)
}

export const getArgs = (
  index: string,
  funcName: string,
  argIndexes: number[],
  customArgs: any,
  captureGroups: string[]
) => {
  // Prioritise custom arguments over capture group args
  if (customArgs[funcName]) return customArgs[funcName]
  return argIndexes.map((i) => captureGroups[i - 1])
}

export const replaceCustom = async (
  pattern: string,
  customReplacers: CustomReplacers,
  customArgs: CustomArgs
) => {
  const funcName = pattern.slice(1)
  if (!customReplacers[funcName]) throw new Error('Missing custom replacer function: ' + funcName)
  const result = await customReplacers[funcName](customArgs?.[funcName])
  return escapeLiterals(String(result))
}

export const escapeLiterals = (value: string) =>
  value.replace(/(\.|\+|\*|\?|\^|\$|\(|\)|\[|\]|\{|\}|\||\\)/g, '\\$1')

// Allows a generator to be used as a counter directly, rather than needing to
// be wrapped in another function
export const parseGeneratorOutput = (counterOutput: string | number | IteratorYieldResult<any>) => {
  if (typeof counterOutput === 'number' || typeof counterOutput === 'string') return counterOutput
  if (counterOutput?.value) return counterOutput.value
  throw new Error('Invalid counter function, or Generator has reached limit')
}

// Turns input pattern into a randexp object with indexed substitions for
// replacers and counters
export const processInputPattern = (pattern: string | RegExp) => {
  const patternRegex: RegExp = typeof pattern === 'string' ? new RegExp(pattern) : pattern
  const { source, flags } = patternRegex
  const substitionMap: SubstitutionMap = {}
  let randexpPattern = source
  const matches = Array.from(source.matchAll(/<(.+?)>/g)).entries()
  for (const [index, match] of Array.from(matches)) {
    const fullMatchString = match[0]
    const captureGroup = match[1]
    const operator = captureGroup[0]
    if (operator === '+') {
      substitionMap[index] = { type: 'counter', length: captureGroup.match(/d/g)?.length || 0 }
    } else if (operator === '?') {
      const [_, funcName, argsString] = captureGroup.match(/([A-z0-9]+)(\(.*\))?/) as Array<string>
      substitionMap[index] = { type: 'function', funcName, args: stripArgs(argsString) }
    }
    randexpPattern = randexpPattern.replace(fullMatchString, `<${index}>`)
  }
  const randexpObject = new RandExp(randexpPattern, flags)
  return { randexpObject, substitionMap, randexpPattern }
}

// Remove brackets and split into array of separate args
const stripArgs = (argsString: string) => {
  if (!argsString) return []
  return argsString
    .slice(1, -1)
    .split(',')
    .map((arg) => Number(arg))
}
