import { randexp } from 'randexp'
import Pattern from './patterns'
// const randexp = new RandExp(/<([a-z]\w{0,20})>foo<\1>/)

// console.log(randexp(/<([a-z]\w{0,20})>foo<\1>/))
const x = new Pattern(/something<+Incrementer>something<?Function>/g, {})

x.gen()
