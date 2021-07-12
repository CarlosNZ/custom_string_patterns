import { CustomReplacers, CustomArgs } from './types'

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
