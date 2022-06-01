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
} from '@chakra-ui/react'
import { PatternGeneratorOptions } from 'custom_string_patterns/build/types'

interface ShowcaseProps {
  title: string
  description: string
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

  const handleGenerate = async () => {
    const newStrings: string[] = []
    for (let i = 1; i <= genCount; i++) {
      newStrings.push(await stringPattern.gen())
    }
    setOutput((current) => [...current, ...newStrings])
  }

  return (
    <Box display={'flex'} flexDirection="column" m={5} p={3} border={'1px solid grey'}>
      <Heading>{title}</Heading>
      <Text>{description}</Text>
      <Stack>
        <Flex justifyContent={'space-between'}>
          <Text variant="code">
            new Pattern{' '}
            <Input
              defaultValue={String(stringPattern.pattern)}
              width="auto"
              onBlur={(e) => stringPattern.setPattern(extractRegExString(e.target.value))}
            />
          </Text>
        </Flex>
        <Flex gap={2} justify="space-between">
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
            <Button colorScheme="blue" onClick={handleGenerate}>
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
        </Flex>
        <Wrap>
          {output.map((result) => (
            <Badge key={result} colorScheme="green" fontSize="1em">
              {result}
            </Badge>
          ))}
        </Wrap>
      </Stack>
    </Box>
  )
}

export default PatternShowcase

const extractRegExString = (reString: string) => reString.replace(/^\/(.+)\/$/, '$1')
