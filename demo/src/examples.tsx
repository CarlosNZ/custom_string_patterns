import { Box, Center, Heading, Text, Stack, Icon, Flex } from '@chakra-ui/react'
import { generatePlates } from './helpers'

import { getCounter } from './database/database'

let plates = generatePlates()

export const examples = [
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
    hideAdjustments: true,
  },
  {
    title: 'Licence plates (NZ format)',
    description: 'Three letters, 3 numbers',
    pattern: /<+>/,
    options: { getCounter: () => plates.next() },
    resetCounterMethod: (newStartVal: string) => (plates = generatePlates(newStartVal)),
    initCounterInput: 'AAA100',
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
