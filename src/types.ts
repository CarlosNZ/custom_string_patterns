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

type FunctionReplacement = {
  type: 'function'
  funcName: string
  args?: any
  // Below not part of type, but need to avoid errors 🤷‍♂️
  length?: number
  property?: string
}

type CounterReplacement = {
  type: 'counter'
  length: number
  // Below not part of type, but need to avoid errors 🤷‍♂️
  funcName?: number
  args?: any
  property?: string
}

type DataReplacement = {
  type: 'data'
  property: string
  // Below not part of type, but need to avoid errors 🤷‍♂️
  length?: number
  funcName?: number
  args?: any
}
export interface SubstitutionMap {
  [key: string]: FunctionReplacement | CounterReplacement | DataReplacement
}
