import { Box, Center, Heading, Text, Stack } from '@chakra-ui/react'
import Showcase from './PatternShowcase'
import { generatePlates } from './helpers'
import { getCounter } from './database/database'

const App = () => {
  const plates = generatePlates()
  const showcases = [
    {
      title: 'Simple serials',
      description:
        'Three random upper-case characters and a three-digit incrementing counter, separated by a hyphen.',
      pattern: /[A-Z]{3}-<+ddd>/,
    },
    {
      title: 'Persistent counter',
      description: (
        <span>
          A custom{' '}
          <Text as="span" textStyle="mono">
            getCounter
          </Text>{' '}
          method saves to external database so counter value is persisted.
        </span>
      ),
      pattern: /Count: <+dddd>/,
      options: { getCounter: () => getCounter('simple_demo') },
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
      <Box id="main-container" maxW={800} px={3}>
        <Heading as="h1" size="2xl" textAlign="center" mt={5} mb={3}>
          Custom String Patterns
        </Heading>
        <Box mb={5}>
          <Text>Custom string patterns is...</Text>
        </Box>
        <Stack spacing={8} display="flex" flexDirection="column" alignItems="center">
          {showcases.map((showcase) => (
            <Showcase {...showcase} key={showcase.title} />
          ))}
        </Stack>
      </Box>
    </Center>
  )
}

export default App
