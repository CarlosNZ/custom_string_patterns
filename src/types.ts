export interface CustomReplacers {
  [key: string]: Function
}

export interface CustomArgs {
  [key: string]: any
}

export interface GenerateArgs {
  shouldIncrement?: boolean
  customArgs?: CustomArgs
}

export interface PatternGeneratorOptions {
  getCounter?: Function
  setCounter?: Function
  counterIncrement?: (input: string | number) => string | number
  counterInit?: number
  customReplacers?: CustomReplacers
  numberFormat?: Intl.NumberFormat
  fallbackString?: string
  defaultRangeAdd?: [number, number]
  defaultRangeSubtract?: [number, number]
  regexMax?: number
}

type CounterReplacement = {
  type: 'counter'
  length: number
}

type FunctionReplacement = {
  type: 'function'
  funcName: string
  args?: any
}

type DataReplacement = {
  type: 'data'
  property: string
}
export interface SubstitutionMap {
  [key: string]: CounterReplacement | FunctionReplacement | DataReplacement
}

export type RandExpOptions = {
  defaultRangeAdd?: [number, number]
  defaultRangeSubtract?: [number, number]
  regexMax?: number
}
