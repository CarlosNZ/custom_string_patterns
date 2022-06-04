import { useState } from 'react'
import Pattern from 'custom_string_patterns'
import {
  Box,
  Text,
  Heading,
  Stack,
  Button,
  Flex,
  Input,
  ButtonGroup,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Badge,
  Wrap,
  Spinner,
} from '@chakra-ui/react'
import { PatternGeneratorOptions } from 'custom_string_patterns/build/types'

interface ShowcaseProps {
  title: string
  description: string | JSX.Element
  pattern: string | RegExp
  options?: PatternGeneratorOptions
  explanation?: string
  style?: any
  children?: any
}

const PatternShowcase = ({
  title,
  description,
  pattern: initialPattern,
  options = {},
  explanation,
  style,
  children,
}: ShowcaseProps) => {
  const [stringPattern, setStringPattern] = useState<Pattern>(new Pattern(initialPattern, options))
  const [genCount, setGenCount] = useState(1)
  const [output, setOutput] = useState<string[]>([])
  const [inProgress, setInProgress] = useState(false)

  const handleGenerate = async () => {
    setInProgress(true)
    for (let i = 0; i < genCount; i++) {
      const index = output.length + i
      setOutput((current) => [...current, 'LOADING'])
      const res = await stringPattern.gen()
      setOutput((curr) => [...curr.slice(0, index), res, ...curr.slice(index + 1)])
    }
    setInProgress(false)
  }

  return (
    <Box
      display={'flex'}
      flexDirection="column"
      p={3}
      borderRadius={9}
      backgroundColor="white"
      boxShadow="rgba(0, 0, 0, 0.24) 0px 3px 8px"
      w="100%"
    >
      <Heading as="h2" size="lg" mb={2}>
        {title}
      </Heading>
      <Stack spacing={3}>
        <Text>{description}</Text>
        <Flex justifyContent={'space-between'}>
          <Text textStyle="mono">
            new Pattern{' '}
            <Input
              defaultValue={String(stringPattern.pattern)}
              width="auto"
              onBlur={(e) => stringPattern.setPattern(extractRegExString(e.target.value))}
            />
          </Text>
        </Flex>
        <Flex gap={2} justify="space-between" flexWrap="wrap" alignItems="flex-end">
          <Flex flexDir="row" gap={2} alignItems="center">
            <Text>Generate</Text>
            <NumberInput
              size="sm"
              maxW={16}
              min={1}
              value={genCount}
              onChange={(val) => setGenCount(Number(val))}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>{' '}
            <Text>more</Text>
            <Button
              colorScheme="blue"
              onClick={handleGenerate}
              textStyle="mono"
              disabled={inProgress}
            >
              {'.gen()'}
            </Button>
          </Flex>
          <ButtonGroup>
            <Button size="sm" colorScheme="blue" onClick={() => setOutput([])}>
              Clear
            </Button>{' '}
            <Button
              size="sm"
              colorScheme="blue"
              onClick={() => setStringPattern(new Pattern(stringPattern.pattern, options))}
            >
              Reset counter
            </Button>
          </ButtonGroup>
        </Flex>{' '}
      </Stack>
      <Wrap mt={4} spacing={3}>
        {output.map((result, index) => (
          <Badge
            key={index}
            colorScheme="blue"
            fontSize="1em"
            py={1}
            px={3}
            borderRadius={6}
            minW={120}
            textAlign="center"
          >
            {result === 'LOADING' ? <Spinner size="sm" /> : result}
          </Badge>
        ))}
      </Wrap>
    </Box>
  )
}

export default PatternShowcase

const extractRegExString = (reString: string) => reString.replace(/^\/(.+)\/$/, '$1')
