# Custom String Patterns

Generate random and incrementing string sequences using regex and custom functions.

Interactive Demo available at: https://carlosnz.github.io/custom_string_patterns

**custom_string_patterns** is based on [randexp](https://github.com/fent/randexp.js) by [@fent](https://github.com/fent) -- a package to generate random strings that match given regular expressions. custom_string_patterns takes it a step further by providing a mechanism for string patterns to contain incrementing values and custom replacement functions beyond what regex can do.

**Install**: `npm i custom_string_patterns`  
or: `yarn add custom_string_patterns`

### Contents

- [Usage](#usage-examples)
- [Parameters & Methods](#parameters-and-methods)
- [Shorthand use](#shorthand-use)
- [Dev environment](#dev-environment)

## Usage examples

```js
import Pattern from 'custom-string-patterns'

// Generate strings with 3 random letters, a hyphen, and an incrementing 4-digit value
const serial = new Pattern(/[A-Z]{3}-<+dddd>/)

console.log(await serial.gen()) // XAP-0001
console.log(await serial.gen()) // BYW-0002
console.log(await serial.gen()) // APL-0003
console.log(await serial.gen()) // SUH-0004

// NOTE: Assumes wrapped in an Async function, since `.gen()` is an Async method

// Generate strings using an external counter and a custom replacer function that doubles
// the input parameter and inserts it into the string
const extCounter = new Pattern(/COUNT: <+d> \| DOUBLED: <?double>/, {
  getCounter: DBCounterFunction,
  customReplacers: { double: (n) => n * 2 },
})
// where "DBCounterFunction" is a call to a database that stores a count value,
// returning the next number and incrementing the counter (current value: 123)

console.log(await extCounter.gen({ customArgs: { double: 5 } }))
// => COUNT: 123 | DOUBLED: 10
console.log(await extCounter.gen({ customArgs: { double: -2 } }))
// => COUNT: 124 | DOUBLED: -4
```

Please check out the demo file (`demo.ts`) and the test suite (`patterns.test.ts`) for more detailed examples.

To run the demo file:

```js
import { runDemo } from 'custom-string-patterns'

runDemo()
```

## Parameters and Methods

A new pattern object is constructed with `new Pattern ( pattern, options )`

### pattern -- `string` or `RegExp`

The syntax of pattern is a regular expression (string or object), but with custom enhancements to represent counters, replacement functions, or data fields.

Please see [randexp documentation](https://github.com/fent/randexp.js) for explanation of how a basic regex is used to generate a random string.

All counter/custom/data replacements are wrapped in `< >`, and the first character inside indicates which type of replacement it should be:

- `+` - a Counter, e.g. `<+ddd>`
- `?` - a Function, e.g. `<?toUpper>` (or `<?toUpper(1...)` -- see [below](#customreplacers--funcname-args--string--number--))
- no prefix - object data replacement, e.g. `<user.firstName>`

#### 1. Counter substitutions (`+`)

Counters are placed into the pattern string by using `<+dd>`, where `d` represents a digit in the output string -- numbers will be padded with leading zeroes to match (at least) the length of the `ddd` sequence. i.e. `<+dddd>` with output number `55` yields `0055`

More complex number formatting can be achieved using a `numberFormat` parameter in "options" (see [below](#numberformat--intlnumberformat)).

#### 2. Custom replacers (`?`)

Replacement functions are defined in "options" (see [below](#customreplacers--funcname-args--string--number--)), but are invoked as part of the string pattern using `<?func>`, where "func" is the name of the function defined in options.

In this case, the pre-processor would look for a key named "func" in customReplacers, and apply whatever function definition was provided.

The arguments for the replacement functions can be provided in two different ways:

1. Passing in with `customArgs` field when a new string is generated (see [`.gen()` method](#customargs---funcname-args---)).
2. It's possible to pass the results of the random strings generated by the regex pattern as arguments. For example, you could generate random credit card numbers where the first 15 digits are randomly generated but the last digit needs to be a checksum digit dependent on the first 15 (see this example in demo file). To achieve this, first the relevant elements of the regex must be defined in [capture groups](https://javascript.info/regexp-groups). Each captured substring is indexed starting from 1, and these are written in standard function syntax as part of the pattern.  
   E.g. If you want a replacement function `toUpper` to act on the output of capture group 1, you'd include `<?toUpper(1)>` at the appropriate place in the pattern.

Note that if both are defined, `customArgs` takes precedence over capture groups.

#### 3. Data replacement

The remaining replacements define properties on a "data" object that is passed in to the `.gen()` method (in `data` field)

For example, if the replacement string was `<user.firstName>` and we have a "user" object, such as:

```js
const user = { firstName: 'Albert', lastName: 'Einstein' }
```

When we generate a new string, we can call `.gen( { data: { user } } )` to replace it with "Albert"

### options

"options" is an object argument, with the following properties available (all are optional):

```js
{
  getCounter, setCounter, counterIncrement, counterInit, customReplacers, numberFormat
}
```

#### `getCounter: () => number | string ( | IteratorYieldResult)`

You can provide your own "Counter" function. By default, the Pattern Generator uses a simple internal counter, but it is re-initialised with each new instance of the generator, and there is no data persistence. If you require this (e.g. for a system that is generating ongoing serial numbers), you will need to provide a function to retrieve the current count value from your database or API.

This function takes no parameters and should return either a number or a string. (The exception to this is, when using a Generator function to yield the counter output, you can just return the `IteratorYieldResult` directly, rather than having to wrap your Generator in a seperate function just to extract the `.value` property.) Note, the "counter" doesn't have to be numerical -- you could have a system that generates a sequence of "AAA, AAB, AAC, etc...". As long as calling this function returns the appropriate value in the sequence, it's fine to use.

Ideally, your `getCounter` function should also take care of incrementing the counter, so it can be called time after time and returns a new value each time. However, if this is not possible (i.e. it can only read a value), then you'll also have to provide a seperate function to update the value:

#### `setCounter: (newValue) => void`

Only required if your `getCounter()` function does not also take care of incrementing the counter, you'll need to provide another function to update it. If `setCounter` exists, the Pattern Generator will call it with the new counter value (usually `getCounter() + 1`) as its argument. Note that you should only use seperate get/set counter functions in an isolated system -- if your counter resides on a database that is accessed by multiple clients, you should retrieve and increment the counter atomically, or you'll likely run into concurrency issues.

#### `incrementFunction ((input: string | number) => string | number)`

By default, if using a custom `setCounter` function, or the internal counter, counts will be incremented by `+1` every time. It's possible to over-ride this by providing a `incrementFunction()` function -- it takes the current counter value as input and should return the new value

#### `counterInit: number`

Only relevant if using the internal counter (i.e. no `getCounter` function is provided). This value simply specifies what number to start counting from -- the default is `1`.

#### `incrementStep: number`

Only relevant if using the internal counter (i.e. no `getCounter` function is provided). Specify the step unit for the counter -- default is `1`. Non-integer values can be provided, but you're likely to run into binary precision problems fairly quickly. This is basically a simpler alternative to providing an `incrementFunction` funtion (above) if all you want it to set a step value.

#### `customReplacers { <funcName>: (args) => string | number, ... }`

The Functions required to produce the output for the customReplacer strings ([above](#2-custom-replacers-)). This parameter is a single object, where the keys are the names of the functions referenced in the pattern string, and the values are the functions themselves. Different arguments can be provided to these functions each time a new string is generated by the `.gen()` method (see [below](#numberformat--intlnumberformat)).

#### `numberFormat : Intl.NumberFormat`

The number output of the Counter can be formatted beyond the number of padding digits described above. If `numberFormat` is provided, the counter will be displayed using the [NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) standard of Javascript's [Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) object. The `numberFormat` value must be a valid `Intl.NumberFormat` object, e.g.

```js
 numberFormat: new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }
```

which would render the counter value as a Japanese yen (￥) string.

### Generating a new string -- the `.gen()` method

Call the `.gen()` method on the Pattern object to return a new string -- see examples in [Usage](#usage-examples) above.

Note that `.gen()` is Async, since it's expected that many of the custom functions used by the Pattern Generator (e.g. `getCounter`, customReplacers, etc) are likely to be asynchronous functions.

The `.gen()` method can take a single, optional parameter object, with the following fields:

`{ shouldIncrement, customArgs, data }`

#### `shouldIncrement: boolean`

If `false`, the Pattern Generator will return a new string _without_ incrementing the counter on this occasion. Note that this will only work with the internal (default) counter, or if using seperate get/set counter functions, since we can't override the internal behaviour of a `getCounter` function that also auto-increments. (Default: `true`)

#### `customArgs: { { <funcName>: (args), ... } }`

If your customReplacer functions take arguments, then you supply the arguments to the `.gen()` method here. `customArgs` is an object with the same structure as `customReplacers` ([above](#custom-replacers)), but instead of the values being functions, they are the arguments supplied to those functions.

#### `data: { <key>: <value>, ... }`

The data to be used in [data replacement](#3-data-replacement) fields.

## Shorthand use

If only one output string is required, you can generate it using the short-hand function instead of constructing and calling `.gen()` on a Pattern object: `patternGen(pattern, options, args)`

E.g.

```js
import { patternGen } from 'custom-string-patterns'

console.log(await patternGen(/[A-Z]{3}-<text>-<+dddd>/), { getCounter }, { data: { text: 'XXX' } })
// => PAL-XXX-005
```

## Additional randexp info

Extended features of randexp can be access via the custom_string_patterns constructor options, namely:

- `defaultRangeAdd`, `defaultRangeSubtract`: corresponds to `randexp.defaultRange.add()` and `randexp.defaultRange.subtract()` , respectively. e.g.:  
  `new Pattern(/<pattern>/, { defaultRangeAdd(0, 65535) } )`
- `regexMax`: corresponds to `randexp.max`, e.g.:  
  `new Pattern(/<pattern>/, { regexMax: 10000 } )`

## Dev environment

npm/yarn scripts available from dev environment

- `test` -- run Jest test suite
- `build` -- compile and build (to "build" folder)
- `demo` -- run demo file
- `dev` -- run dev file
