import Pattern from './patterns'
import fetch from 'node-fetch'
import { generatePlates } from './customCounters'
const checkdigit = require('checkdigit')

// Basic pattern generator, using internal counters and no customReplacers

const basicPattern = new Pattern(/[A-Za-z]{4,9}-<+ddd>/)
// Between 1 and 9 alphabet chars, followed by - and a number padded with leading 0s to 3 digits

const showBasicPattern = async () => {
  console.log(
    'Basic pattern -- between 1-9 random alphabet chars, followed by an incrementing number padded with 0s, seperated by hyphen:'
  )
  for (let i = 1; i < 20; i++) {
    console.log(await basicPattern.gen())
  }
}

// Function to fetch an item from an online API
const getAlbumString = async (key: number) => {
  const data = await fetch('https://jsonplaceholder.typicode.com/albums')
  return (await data.json())[key].title
}

// More complex pattern with 2 custom replacers and a Intl formatted counter, and a non-standard incrementing function

const fancyPattern = new Pattern(/Album name: <?album>, serial: [A-Z]{3}_<+d> \(<?upper>\)/, {
  counterInit: 5000,
  counterIncrement: (prev) => Number(prev) + 100,
  customReplacers: {
    album: getAlbumString,
    upper: (str: string) => str.toUpperCase(),
  },
  numberFormat: new Intl.NumberFormat('en-US'),
})

const showFancyPattern = async () => {
  console.log(
    '\n\nA more complex pattern with 2 custom replacers and an Intl.NumberFormat formatted counter with a non-standard incrementing function'
  )
  for (let i = 1; i < 5; i++) {
    console.log(
      await fancyPattern.gen({
        customArgs: {
          album: i,
          upper: String.fromCharCode(i + 65),
        },
      })
    )
  }
}

// NZ Number plate generator:
const plates = generatePlates()
const platePattern = new Pattern('Sequential: <+>  Random: [A-Z]{3}[1-9][0-9]{2}', {
  getCounter: () => plates.next(),
})

const showPlates = async () => {
  console.log('\n\nGenerate NZ-style car number plates in sequence')
  for (let i = 1; i < 20; i++) {
    console.log(await platePattern.gen())
  }
}

// Generate credit card numbers with valid checksum
const generateChecksum = (digits: string[]) =>
  checkdigit.mod10.create(digits.join('').replace(/\W/g, ''))

const cardTypeLookup = (initDigits: string) => {
  const startDigitReference: any = {
    4: 'Visa',
    5: 'Mastercard',
  }
  return startDigitReference[initDigits.slice(0, 1)]
}

const creditCardGenerator = new Pattern(
  /(4[0-9]|51|52|53|54|55)([0-9]{2}) ([0-9]{4} [0-9]{4} [0-9]{3})<?checksum(1, 2, 3)> \(<?whichCard(1)>\)/,
  {
    customReplacers: {
      checksum: (...args: string[]) => generateChecksum(args),
      whichCard: cardTypeLookup,
    },
  }
)

const generateCreditCardNums = async () => {
  console.log('\n\nRandom credit card numbers with valid checksums')
  for (let i = 1; i < 20; i++) {
    console.log(await creditCardGenerator.gen())
  }
  console.log(
    'Check validity at: https://www.freeformatter.com/credit-card-number-generator-validator.html'
  )
}

export const runDemo = async () => {
  console.log('See source code in demo.ts and patterns.test.ts for detailed usage examples\n\n')
  await showBasicPattern()
  await showFancyPattern()
  await showPlates()
  await generateCreditCardNums()
}

// // A non-generator counter with seperate .getCounter() and .setCounter() methods
// const makeDumbCounter = (init: number) => ({
//   count: init,
//   getCounter: function () {
//     return this.count
//   },
//   setCounter: function (newCount: number) {
//     this.count = newCount
//   },
// })

// const dumbCounter = makeDumbCounter(99)

// // Pattern using seperate getCounter() and setCounter() methods;
// // Incrementer doubles the counter each iteration
// const dumbPattern = new Pattern(/<+ddddd>_(black|white)/, {
//   getCounter: () => dumbCounter.getCounter(),
//   setCounter: (newCount: number) => dumbCounter.setCounter(newCount),
//   counterIncrement: (current: number | string) => 2 * Number(current),
// })

// test('Separate getCounter, setCounter and incrementer methods', () => {
//   return dumbPattern.gen().then((result: string) => {
//     expect(result).toMatch(/00099_(black|white)/)
//   })
// })

// // Need to wrap in async/await, otherwise separate get/set calls cause
// // concurrency problems -- this is why the getCounter() method should ideally
// // atomically increment the counter in same operation.
// const generateTenMore = async () => {
//   for (let i = 1; i < 10; i++) {
//     await dumbPattern.gen()
//   }
//   return await dumbPattern.gen()
// }

// test('Generate 10 more', () => {
//   return generateTenMore().then((result: string) => {
//     expect(result).toMatch(/101376_(black|white)/)
//   })
// })

// test('Shorthand version of separated methods', () => {
//   return patternGen(/<+ddddd>_(black|white)/, {
//     getCounter: () => dumbCounter.getCounter(),
//     setCounter: (newCount: number) => dumbCounter.setCounter(newCount),
//     counterIncrement: (current: number | string) => 2 * Number(current),
//   }).then((result: string) => {
//     expect(result).toMatch(/^202752_(black|white)$/)
//   })
// })

// // Using a Unix timestamp as a custom replacment
// const getTimestamp = async () => {
//   const data = await fetch('https://showcase.api.linx.twenty57.net/UnixTime/tounix?date=now')
//   return await data.json()
// }

// const timestampPattern = new Pattern('[A-z0-9!@#$%^&]{8}-<?timestamp>', {
//   customReplacers: {
//     timestamp: getTimestamp,
//   },
// })

// test('Timestamp replacer', () => {
//   return timestampPattern.gen().then((result: string) => {
//     expect(result).toMatch(/[A-z0-9!@#$%^&]{8}-\d{10}/)
//   })
// })

// test('Shorthand verion of Timestamp replacer', () => {
//   return patternGen('[A-z0-9!@#$%^&]{8}-<?timestamp>', {
//     customReplacers: {
//       timestamp: getTimestamp,
//     },
//   }).then((result: string) => {
//     expect(result).toMatch(/[A-z0-9!@#$%^&]{8}-\d{10}/)
//   })
// })
