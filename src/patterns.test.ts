import Pattern, { patternGen } from './patterns'
import fetch from 'node-fetch'

// Basic pattern generator, using internal counters and no customReplacers

const basicPattern = new Pattern(/[A-z]{1,9}-<+ddd>/)
// Between 1 and 9 alphabet chars, followed by - and a number padded with leading 0s to 3 digits

test('Generate single string - basicPattern', () => {
  return basicPattern.gen().then((result: string) => {
    expect(result).toMatch(/^[A-z]{1,9}-001$/)
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
