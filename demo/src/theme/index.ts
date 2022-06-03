import { extendTheme } from '@chakra-ui/react'

import colors from './colours'
import fonts from './fonts'
import components from './components'

const theme = extendTheme({
  styles: {
    global: {
      'html, body': { bgColor: 'background' },
    },
  },
  config: {
    initialColorMode: 'light',
  },
  textStyles: {
    mono: {
      fontFamily: 'mono',
      color: 'gray.600',
    },
  },
  colors,
  fonts,
  components,
})

export default theme
