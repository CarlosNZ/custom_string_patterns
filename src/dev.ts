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

patternGen(/Another\<<+dd>-\>\>_<+dddd>_DONE/).then((res) => console.log(res))
