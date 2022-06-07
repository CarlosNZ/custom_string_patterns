/*
This file used as a playground for development. It is not published in the actual package.
*/

import Pattern, { patternGen } from './patterns'

// const basicPattern = new Pattern(/.{10}-<+ddd>/i)

// basicPattern.gen().then((res) => console.log(res))

// const patternWithLiterals = new Pattern(/\<1\>-[A-Z]{3}-<+dd>-<?f1>/, {
//   customReplacers: { f1: () => 'Testing' },
// })

// patternWithLiterals.gen().then((res) => console.log(res))

// patternGen(/Another\<<+dd>-\>\>_<+dddd>_DONE/).then((res) => console.log(res))

const dataAsArgsPattern = new Pattern(/^<?getInits>-<+ddd>$/, {
  customReplacers: {
    getInits: (data: any) => {
      console.log('data', data)
      return (data.user.firstName[0] + data.user.lastName[0]).toUpperCase()
    },
  },
  counterInit: 100,
})

dataAsArgsPattern
  .gen({ data: { user: { firstName: 'Boba', lastName: 'Fett' } } })
  .then((res) => console.log(res))
