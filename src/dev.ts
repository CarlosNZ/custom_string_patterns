import { randexp } from 'randexp'
import Pattern from './patterns'
// const randexp = new RandExp(/<([a-z]\w{0,20})>foo<\1>/)

// console.log(randexp(/<([a-z]\w{0,20})>foo<\1>/))
const x = new Pattern(/something<+Incrementer>something<?Function>/g, {})

x.gen()
x.gen()
x.gen()

const y = new Pattern(/xxx xtreme dragon warrior <+number> xxx/i, { counterInit: 5 })

console.log(y.gen())
console.log(y.gen())
console.log(y.gen())
console.log(y.gen())
console.log(y.gen())
console.log(y.gen())
