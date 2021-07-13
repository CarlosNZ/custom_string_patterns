/*
This file used as a playground for development. It is not published in the actual package.
*/

import Pattern, { patternGen } from './patterns'
import fetch from 'node-fetch'
const checkdigit = require('checkdigit')

// Function to fetch an item from an online API
const getAlbumString = async (key: number) => {
  const data = await fetch('https://jsonplaceholder.typicode.com/albums')
  return (await data.json())[key].title
}

const fancyPattern = new Pattern(/Album name: <?album>, serial: [A-Z]{3}_<+d> \(<?upper>\)/, {
  counterInit: 5000,
  counterIncrement: (prev) => Number(prev) + 100,
  customReplacers: {
    album: getAlbumString,
    upper: (str: string) => str.toUpperCase(),
  },
  numberFormat: new Intl.NumberFormat('en-US'),
})

fancyPattern
  .gen({
    customArgs: {
      album: 10,
      upper: '_end',
    },
  })
  .then((res) => console.log(res))

const dynamicArgPattern = new Pattern(/([a-z]{3,6})-(test)-<+ddd>-<?upper(1, 2)>-<?lower>/, {
  customReplacers: {
    upper: (args: string[]) => args.join('').toUpperCase(),
    lower: (chars: string) => chars.toLowerCase(),
  },
})

const showDynamicArgPattern = async () => {
  console.log('Testing passing capture groups to customReplacers')
  for (let i = 1; i < 12; i++) {
    console.log('Output:', await dynamicArgPattern.gen({ customArgs: { lower: 'SomThiNG' } }))
  }
}

showDynamicArgPattern()
