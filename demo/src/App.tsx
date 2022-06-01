import { Box, Center } from '@chakra-ui/react'
import Showcase from './PatternShowcase'
import { generatePlates } from './helpers'

const App = () => {
  const plates = generatePlates()
  const showcases = [
    {
      title: 'Simple serials',
      description:
        'Three random upper-case characters and a three-digit incrementing counter, separated by a hyphen',
      pattern: /[A-Z]{3}-<+ddd>/,
    },
    {
      title: 'Licence plates (NZ format)',
      description: 'Three letters, 3 numbers',
      pattern: /<+>/,
      options: { getCounter: () => plates.next() },
    },
    {
      title: 'Non-consecutive counter',
      description: 'Three letters, 3 numbers',
      pattern: /Serial-<+ddd>/,
      options: { counterIncrement: (curr: number | string) => Number(curr) * 2 },
    },
    // Counter, set starting and increment values
    // Call to an external database to perist count
    // Valid credit card numbers
    // Data replacement where user provides function arg
    // Data replacement -- user provides Object values
    // Data replacement -- take first chars of lastName and add number
  ]

  return (
    <Center>
      <Box id="main-container" maxW={800}>
        {showcases.map((showcase) => (
          <Showcase {...showcase} key={showcase.title} />
        ))}
      </Box>
    </Center>
  )
}

export default App
