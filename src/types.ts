type GenericObject = { [key: string]: GenericObject | unknown }
export interface CustomReplacers {
  [key: string]: Function
}
export interface CustomArgs {
  [key: string]: unknown
}

export interface GenerateArgs {
  shouldIncrement?: boolean
  customArgs?: CustomArgs
  data?: GenericObject | unknown
}

export interface PatternGeneratorOptions {
  getCounter?: Function
  setCounter?: Function
  incrementFunction?: (input: string | number) => string | number
  counterInit?: number
  incrementStep?: number
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
