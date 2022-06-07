import { Text } from '@chakra-ui/react'
import { generatePlates } from './helpers'
import { ShowcaseProps } from './PatternShowcase'
// @ts-ignore
import checkdigit from 'checkdigit'

import { getDatabaseCounter } from './database/database'

let plates = generatePlates()

const generateChecksum = (digits: string[]) =>
  checkdigit.mod10.create(digits.join('').replace(/\W/g, ''))

const cardTypeLookup = (digits: string) => {
  const initDigit = digits[0]
  if (initDigit === '4') return 'Visa'
  if (initDigit === '5') return 'Mastercard'
  return 'Unknown 🤷‍♂️'
}

export const examples: ShowcaseProps[] = [
  {
    title: 'Simple serials',
    description:
      'Three random upper-case characters and a three-digit incrementing counter, separated by a hyphen.',
    pattern: /[A-Z]{3}-<+ddd>/,
    codeStringTemplate: `const pattern = new Pattern(\${pattern}\${options})

// Simple generator using internal counter,
// no additional config options

pattern.gen()`,
  },
  {
    title: 'Persistent counter',
    description: (
      <span>
        A custom{' '}
        <Text as="span" textStyle="mono">
          getCounter
        </Text>{' '}
        method uses a counter from an external database so its value is persisted independently of
        this module.
      </span>
    ),
    pattern: /Count: <+dddd>/,
    options: { getCounter: () => getDatabaseCounter('simple_demo') },
    hideCounterReset: true,
    codeStringTemplate: `const pattern = new Pattern(\${pattern}, {
            getCounter: () => getDatabaseCounter('simple_demo')
        })

  // When the .gen() method is called, the provided getCounter()
  // method is used instead of the default internal counter.
  // The external database can't have it's counter reset at all.

  pattern.gen()`,
  },
  {
    title: 'Licence plates (NZ format)',
    description:
      'Generate a consecutive sequence of New Zealand licence plate values (3 upper-case letters, 3 digits).',
    pattern: /<+>/,
    options: { getCounter: () => plates.next() },
    resetCounterMethod: (newStartVal: string) => (plates = generatePlates(newStartVal)),
    counterInputInit: 'AAA100',
    codeStringTemplate: `// Custom plate number-generating function
  const plates = generatePlates("\${counterInit}") // defined elsewhere

  const pattern = new Pattern(\${pattern}\${options})

  // The getCounter method can be any function that returns a new
  // string when called, so a custom sequence generator can be used,
  // in this case a generator function that returns NZ-formatted
  // licence plates

  pattern.gen()`,
    codeStringFixedOptions: `getCounter: () => plates.next()`,
  },
  {
    title: 'Non-consecutive counter',
    description: 'Counter can increment by any amount, in this case units of 100.',
    pattern: /<+dddd>-[a-z]{2,4}/,
    options: { incrementStep: 100, counterInit: 100 },
    counterInputInit: '100',
    codeStringTemplate: `const pattern = new Pattern(\${pattern}\${options})

  pattern.gen()`,
    codeStringFixedOptions: 'incrementStep: 100,',
  },
  {
    title: 'Custom replacers',
    description:
      "Inserts first three chars of user's surname into counter string, which starts from 100",
    pattern: /<?surnameExtract>-<+ddd>/,
    options: {
      counterInit: 100,
      customReplacers: { surnameExtract: (name: string) => name.slice(0, 3).toUpperCase() },
    },
    customArgsInit: { surnameExtract: 'Smith' },
    codeStringTemplate: `//Custom replacement function to return first 3 chars of an input string
  const surnameExtract = (name) => name.slice(0, 3).toUpperCase()

  const pattern = new Pattern(\${pattern}\${options}),

  // The argument for the extraction function is provided to each
  // .gen() call so can be different for every generated string

  pattern.gen({ custom Args: {surnameExtract: \${arg1} }} )`,
    codeStringFixedOptions: `customReplacers: { surnameExtract }`,
  },
  {
    title: 'Simple data replacement',
    description: 'Replaces part of string with data supplied to generate function',
    pattern: /<+ddd>_<name.first>_<name.last>/,
    customDataInit: { name: { first: 'Boba', last: 'Fett' } },
    codeStringTemplate: `const pattern = new Pattern(\${pattern}\${options}),

  // We can extract any deeply nested property from "data"
  // object passed to the .gen() method

  pattern.gen({ data: \${data} })`,
  },
  {
    title: 'International formatting',
    description: (
      <Text>
        Counter can be formatted as a currency, or any number format available in Javascript's{' '}
        <a
          href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl"
          target="_blank"
          rel="noreferrer"
        >
          Intl
        </a>{' '}
        object
      </Text>
    ),
    pattern: /<+dddd>/,
    options: {
      numberFormat: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
      counterInit: 1000,
    },
    counterInputInit: '1000',
    codeStringTemplate: `const pattern = new Pattern(\${pattern}\${options})

  // Note the thousands separator that is added, as well as the
  // currency symbol and decimal notation

  pattern.gen()`,
    codeStringFixedOptions:
      "numberFormat: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),",
  },
  {
    title: 'Combination string',
    description:
      "A combination of a user's initials, a 4-digit counter, an ISO timestamp of the current time and a random 6-char string",
    pattern: /<?getInits>-<+dddd>-<?getISOTime>-[A-Za-z!@#$%?]{6}/,
    options: {
      customReplacers: {
        getInits: (data: any) => (data.user.firstName[0] + data.user.lastName[0]).toUpperCase(),
        getISOTime: () => new Date().toISOString(),
      },
    },
    customDataInit: { user: { firstName: 'Luke', lastName: 'Skywalker' } },
    codeStringTemplate: `const pattern = new Pattern(\${pattern}\${options})

  // Note that in this case the argument for the "genInits" function
  // is the "data" object itself.

  pattern.gen({ data: \${data} })`,
    codeStringFixedOptions: `customReplacers: {
        getInits: (data) => (data.user.firstName[0] + data.user.lastName[0]).toUpperCase(),
        getISOTime: () => new Date().toISOString()
      },`,
  },
  {
    title: 'Valid credit card numbers',
    description: (
      <>
        <Text>
          Use a custom function to verify a randomly-generated string in order to generate valid{' '}
          <strong>Visa</strong> or <strong>Mastercard</strong> numbers. See{' '}
          <a
            href="https://www.freeformatter.com/credit-card-number-generator-validator.html"
            target="_blank"
            rel="noreferrer"
          >
            here
          </a>{' '}
          for validity rules.
        </Text>
      </>
    ),

    pattern:
      /(4[0-9]|51|52|53|54|55)([0-9]{2}) ([0-9]{4} [0-9]{4} [0-9]{3})<?checksum(1, 2, 3)> \(<?whichCard(1)>\)/,
    options: {
      customReplacers: {
        checksum: (...args: string[]) => generateChecksum(args),
        whichCard: cardTypeLookup,
      },
    },
    codeStringTemplate: `// Function to create a single-digit checksum that makes the whole number valid
  // Uses https://www.npmjs.com/package/checkdigit
  const generateChecksum = (digits) =>
    checkdigit.mod10.create(digits.join('').replace(/\W/g, ''))

  // Determines what type of credit card based on first digit
  // https://www.freeformatter.com/credit-card-number-generator-validator.html
  const cardTypeLookup = (digits) => {
    const initDigit = digits[0]
    if (initDigit === '4') return 'Visa'
    if (initDigit === '5') return 'Mastercard'
    return 'Unknown 🤷‍♂️'
  }

  // This pattern uses a more complicated Regex to generate the random
  // strings, then uses two custom replacement functions -- one to
  // generate the check digit and one to show which type of
  // credit card it is
  const pattern = new Pattern(\${pattern}\${options}),

  // Note also that this time we don't pass in arguments to the
  // functions -- they are extracted automatically from the
  // generated string using Regex capture groups

  pattern.gen()`,
    codeStringFixedOptions: `customReplacers: {
        checksum: (...args) => generateChecksum(args),
        whichCard: cardTypeLookup,
      },`,
  },
]
