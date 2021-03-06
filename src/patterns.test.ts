import axios from 'axios'
import Pattern, { patternGen } from './patterns'
import { generatePlates } from './customCounters'
const checkdigit = require('checkdigit')

// Basic pattern generator, using internal counters and no customReplacers

const basicPattern = new Pattern(/[A-Za-z]{1,9}-<+ddd>/)
// Between 1 and 9 alphabet chars, followed by - and a number padded with leading 0s to 3 digits

test('Generate single string - basicPattern', () => {
  return basicPattern.gen().then((result: string) => {
    expect(result).toMatch(/^[A-Za-z]{1,9}-001$/)
  })
})

test('Generate 10 more', () => {
  for (let i = 1; i < 10; i++) {
    basicPattern.gen()
  }
  return basicPattern.gen().then((result: string) => {
    expect(result).toMatch(/^[A-z]{1,9}-011$/)
  })
})

test('Shorthand version of basicPattern', () => {
  return patternGen(/[A-z]{1,9}-<+ddd>/).then((result: string) => {
    expect(result).toMatch(/^[A-z]{1,9}-001$/)
  })
})

test("Don't increment counter", () => {
  return basicPattern.gen({ shouldIncrement: false }).then((result: string) => {
    expect(result).toMatch(/^[A-z]{1,9}-011$/)
  })
})

// Basic pattern generator with counter starting from 100 and one custom replacer. Pattern is in string form.

const basicPattern2 = new Pattern('<+>_(green|blue|red)_<?r1>', {
  counterInit: 100,
  customReplacers: {
    r1: () => 'TEXT',
  },
})

test('Generate single string - basicPattern2', () => {
  return basicPattern2.gen().then((result: string) => {
    expect(result).toMatch(/^100_(green|blue|red)_TEXT$/)
  })
})

test('Generate 10 thousand more', () => {
  for (let i = 1; i < 10000; i++) {
    basicPattern2.gen()
  }
  return basicPattern2.gen().then((result: string) => {
    expect(result).toMatch(/^10100_(green|blue|red)_TEXT$/)
  })
})

test('Shorthand version of basicPattern2', () => {
  return patternGen('<+>_(green|blue|red)_<?r1>', {
    counterInit: 666,
    customReplacers: {
      r1: () => 'TEXT',
    },
  }).then((result: string) => {
    expect(result).toMatch(/^666_(green|blue|red)_TEXT$/)
  })
})

// Basic pattern generator with counter starting from 500 and incrementing in 25s.

const basicPattern3 = new Pattern(/<+>_(A|B|C)/, {
  counterInit: 500,
  incrementStep: 25,
})

test('Generate single string - basicPattern3, non-consecutive increment step', () => {
  return basicPattern3.gen().then((result: string) => {
    expect(result).toMatch(/^500_(A|B|C)$/)
  })
})

test('Generate 10 thousand more', () => {
  for (let i = 1; i < 10000; i++) {
    basicPattern3.gen()
  }
  return basicPattern3.gen().then((result: string) => {
    expect(result).toMatch(/^250500_(A|B|C)$/)
  })
})

// Function to fetch an item from an online API
const getAlbumString = async (key: number) => {
  const response = await axios('https://jsonplaceholder.typicode.com/albums')
  return response.data[key].title
}

// More complex pattern with 2 custom replacers and a Intl formatted counter, and a non-standard incrementing function

const fancyPattern = new Pattern(/^Album name: <?album>, serial: [A-Z]{3}_<+d> \(<?upper>$\)/, {
  counterInit: 5000,
  incrementFunction: (prev) => Number(prev) + 100,
  customReplacers: {
    album: getAlbumString,
    upper: (str: string) => str.toUpperCase(),
  },
  numberFormat: new Intl.NumberFormat('en-US'),
})

test('Generate single string - fancyPattern', () => {
  return fancyPattern
    .gen({
      customArgs: {
        album: 10,
        upper: '_end',
      },
    })
    .then((result: string) => {
      expect(result).toMatch(
        /^Album name: quam nostrum impedit mollitia quod et dolor, serial: [A-Z]{3}_5,000 \(_END\)$/
      )
    })
})

test('Generate 3 more', () => {
  for (let i = 1; i < 3; i++) {
    fancyPattern.gen({
      customArgs: {
        album: i * 4,
        upper: 'anyTHING',
      },
    })
  }
  return fancyPattern
    .gen({
      customArgs: {
        album: 20,
        upper: '--done!',
      },
    })
    .then((result: string) => {
      expect(result).toMatch(
        /^Album name: repudiandae voluptatem optio est consequatur rem in temporibus et, serial: [A-Z]{3}_5,300 \(--DONE!\)$/
      )
    })
})

// NZ Number plate generator:
const plates = generatePlates()

// Pattern with non-numerical "counter", used twice in a string
const platePattern = new Pattern('<+>_<+ddd>', { getCounter: () => plates.next() })

test('Generate a double NZ number plate string', () => {
  return platePattern.gen().then((result: string) => {
    expect(result).toMatch(/^AAA100_AAA100$/)
  })
})

test('Generate 10 more plates', () => {
  for (let i = 1; i < 10; i++) {
    platePattern.gen()
  }
  return platePattern.gen().then((result: string) => {
    expect(result).toMatch(/^AAA110_AAA110$/)
  })
})

test('Return same result without incrementing', () => {
  return platePattern.gen({ shouldIncrement: false }).then((result: string) => {
    expect(result).toMatch(/^AAA110_AAA110$/)
  })
})

// Shorthand version, with a new plate generator
const plates2 = generatePlates('MZZ998')
patternGen('<+>_<+ddd>', { getCounter: () => plates2.next() })
patternGen('<+>_<+ddd>', { getCounter: () => plates2.next() })
patternGen('<+>_<+ddd>', { getCounter: () => plates2.next() })
test('Shorthand version of platePattern', () => {
  return patternGen('<+>_<+ddd>', { getCounter: () => plates2.next() }).then((result: string) => {
    expect(result).toMatch(/^NAA101_NAA101$/)
  })
})

// A non-generator counter with seperate .getCounter() and .setCounter() methods
const makeDumbCounter = (init: number) => ({
  count: init,
  getCounter: function () {
    return this.count
  },
  setCounter: function (newCount: number) {
    this.count = newCount
  },
})

const dumbCounter = makeDumbCounter(99)

// Pattern using seperate getCounter() and setCounter() methods;
// Incrementer doubles the counter each iteration
const dumbPattern = new Pattern(/^<+ddddd>_(black|white)$/, {
  getCounter: () => dumbCounter.getCounter(),
  setCounter: (newCount: number) => dumbCounter.setCounter(newCount),
  incrementFunction: (current: number | string) => 2 * Number(current),
})

test('Separate getCounter, setCounter and incrementer methods', () => {
  return dumbPattern.gen().then((result: string) => {
    expect(result).toMatch(/^00099_(black|white)$/)
  })
})

// Need to wrap in async/await, otherwise separate get/set calls cause
// concurrency problems -- this is why the getCounter() method should ideally
// atomically increment the counter in same operation.
const generateTenMore = async () => {
  for (let i = 1; i < 10; i++) {
    await dumbPattern.gen()
  }
  return await dumbPattern.gen()
}

test('Generate 10 more', () => {
  return generateTenMore().then((result: string) => {
    expect(result).toMatch(/^101376_(black|white)$/)
  })
})

test('Shorthand version of separated methods', () => {
  return patternGen(/<+ddddd>_(black|white)/, {
    getCounter: () => dumbCounter.getCounter(),
    setCounter: (newCount: number) => dumbCounter.setCounter(newCount),
    incrementFunction: (current: number | string) => 2 * Number(current),
  }).then((result: string) => {
    expect(result).toMatch(/^202752_(black|white)$/)
  })
})

// Using a Unix timestamp as a custom replacment
const getTimestamp = async () => {
  const response = await axios('https://showcase.api.linx.twenty57.net/UnixTime/tounix?date=now')
  return response.data
}

const timestampPattern = new Pattern('[A-z0-9!@#$%^&]{8}-<?timestamp>', {
  customReplacers: {
    timestamp: getTimestamp,
  },
})

test('Timestamp replacer', () => {
  return timestampPattern.gen().then((result: string) => {
    expect(result).toMatch(/^[A-z0-9!@#$%^&]{8}-\d{10}$/)
  })
})

test('Shorthand verion of Timestamp replacer', () => {
  return patternGen('[A-z0-9!@#$%^&]{8}-<?timestamp>', {
    customReplacers: {
      timestamp: getTimestamp,
    },
  }).then((result: string) => {
    expect(result).toMatch(/^[A-z0-9!@#$%^&]{8}-\d{10}$/)
  })
})

// Use regex random results as arguments in functions
const dynamicArgPattern = new Pattern(/^([a-z]{3,6})-(test)-<+ddd>-<?upper(1, 2)>-<?lower>$/, {
  customReplacers: {
    upper: (...args: string[]) => args.join('').toUpperCase(),
    lower: (chars: string) => chars.toLowerCase(),
  },
})

test('Use regex output as arguments in custom replacer functions -- dynamicArgPattern', () => {
  return dynamicArgPattern.gen({ customArgs: { lower: 'SomEThiNG' } }).then((result: string) => {
    expect(result).toMatch(/^([a-z]{3,6})-(test)-\d{3}-[A-Z]{3,6}TEST-something$/)
  })
})

// Use data object as parameter in custom replacer
const dataAsArgsPattern = new Pattern(/^<?getInits>-<+ddd>$/, {
  customReplacers: {
    getInits: (data: any) => (data.user.firstName[0] + data.user.lastName[0]).toUpperCase(),
  },
  counterInit: 100,
})

test('Use "data" object as parameters for custom function', () => {
  return dataAsArgsPattern
    .gen({ data: { user: { firstName: 'Boba', lastName: 'Fett' } } })
    .then((result: string) => {
      expect(result).toBe('BF-100')
    })
})

// Generate random credit card numbers, including correct check digit

const calculateCheckDigit = (digits: string[]) =>
  checkdigit.mod10.create(digits.join('').replace(/\W/g, ''))

const visaCardPattern = new Pattern(
  /(4[0-9]|51|52|53|54|55)([0-9]{2}) ([0-9]{4} [0-9]{4} [0-9]{3})<?checksum(1, 2, 3)>/,
  {
    customReplacers: {
      checksum: (...args: string[]) => calculateCheckDigit(args),
    },
  }
)

test('Generate valid random credit card number (with checkdigit)', () => {
  return visaCardPattern.gen().then((result: string) => {
    expect(result).toMatch(/^(4[0-9]|51|52|53|54|55)([0-9]{2}) [0-9]{4} [0-9]{4} [0-9]{4}$/)
  })
})

// Extract object data

const dataPattern = new Pattern(/<?f1>-[A-Z]{3}-<user.firstName>-<+ddd>/, {
  customReplacers: { f1: () => 'Testing' },
  counterInit: 123,
})

test('Extract object properties from replacer field (info.firstName)', () => {
  return dataPattern.gen({ data: { user: { firstName: 'Carl' } } }).then((result: string) => {
    expect(result).toMatch(/^Testing-[A-Z]{3}-Carl-123$/)
  })
})
test('Object property field missing', () => {
  return dataPattern.gen({ data: { info: 'Nope' } }).then((result: string) => {
    expect(result).toMatch(/^Testing-[A-Z]{3}--124$/)
  })
})

test('Shorthand form, with two fields and a fallback', () => {
  return patternGen(
    /<?f1>-[A-Z]{3}-<user.firstName>_<user.lastName>-<+ddd>/,
    {
      customReplacers: {
        f1: (chars: string) => chars.toUpperCase(),
      },
      counterInit: 10,
      fallbackString: 'MISSING_PROPERTY',
    },
    { customArgs: { f1: 'flutter' }, data: { user: { firstName: 'Bodhi' } } }
  ).then((result: string) => {
    expect(result).toMatch(/^FLUTTER-[A-Z]{3}-Bodhi_MISSING_PROPERTY-010$/)
  })
})

// Handle literal <>

const patternWithLiterals = new Pattern(/\<1\>-[A-Z]{3}-<+dd>-<?f1>/, {
  customReplacers: { f1: () => 'Testing' },
})

test('Pattern with literal <> chars', () => {
  return patternWithLiterals.gen().then((result: string) => {
    expect(result).toMatch(/^<1>-[A-Z]{3}-01-Testing$/)
  })
})

test('Pattern with incomplete (non-closed) literal < char', () => {
  return patternGen(/Another\<<+dd>-\>\>_<+dddd>_DONE/).then((result: string) => {
    expect(result).toMatch(/^Another<01->>_0001_DONE$/)
  })
})

// Change Pattern properties in place

const patternForMutation = new Pattern(/[A-Z]{3}-<+ddd>/)
test('Pattern output before update Pattern', () => {
  return patternForMutation.gen().then((result: string) => {
    expect(result).toMatch(/^[A-Z]{3}-001/)
  })
})

test('Pattern output after update Pattern', () => {
  patternForMutation.setPattern(/[A-Z]{4} - <+dddd>/)
  return patternForMutation.gen().then((result: string) => {
    expect(result).toMatch(/^[A-Z]{4} - 0002/)
  })
})

test('Pattern output after update Options', () => {
  patternForMutation.setOptions({
    getCounter: () => 1000,
  })
  return patternForMutation.gen().then((result: string) => {
    expect(result).toMatch(/^[A-Z]{4} - 1000/)
  })
})
