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
}

type FunctionReplacement = {
  type: 'function'
  funcName: string
  args?: any
  length?: number
}

type CounterReplacement = {
  type: 'counter'
  length: number
  funcName?: number
  args?: any
}
export interface SubstitutionMap {
  [key: string]: FunctionReplacement | CounterReplacement
}
