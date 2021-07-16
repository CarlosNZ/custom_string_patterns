import RandExp from 'randexp/types'

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

type RegexReplacement = {
  type: 'regex'
  randexp: RandExp
  regexIndex: number
}

export interface SubstitutionMap {
  [key: string]: CounterReplacement | FunctionReplacement | DataReplacement
}
