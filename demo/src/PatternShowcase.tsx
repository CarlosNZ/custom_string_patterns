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
import { Animate } from 'react-simple-animate'
import { PatternGeneratorOptions } from 'custom_string_patterns/build/types'

interface ShowcaseProps {
  title: string
  description: string | JSX.Element
  // pattern: Pattern
  pattern: string | RegExp
  options?: PatternGeneratorOptions
  resetCounterMethod?: (newVal: string) => void
  initCounterInput?: string
  explanation?: string
  style?: any
  children?: any
}

const DELAY_PER_ITEM = 0.1
const MAX_TOTAL_DELAY = 0.5

const PatternShowcase = ({
  title,
  description,
  pattern: initialPattern,
  options = {},
  resetCounterMethod,
  initCounterInput,
  explanation,
  style,
  children,
}: ShowcaseProps) => {
  const [stringPattern, setStringPattern] = useState<Pattern>(new Pattern(initialPattern, options))
  const [genCount, setGenCount] = useState(1)
  const [counterInit, setCounterInit] = useState(initCounterInput ?? '1')
  const [output, setOutput] = useState<string[]>([])
  const [inProgress, setInProgress] = useState(false)

  const handleGenerate = async () => {
    setInProgress(true)
    for (let i = 0; i < genCount; i++) {
      try {
        const index = output.length + i
        setOutput((current) => [...current, 'LOADING'])
        const res = await stringPattern.gen()
        setOutput((curr) => [...curr.slice(0, index), res, ...curr.slice(index + 1)])
      } catch (err: any) {
        setOutput((current) => [...current.slice(0, -1), 'ERROR'])
        console.log(err.message)
      }
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
      <Heading as="h2" size="md" mb={2}>
        {title}
      </Heading>
      <Stack spacing={3}>
        <Text>{description}</Text>
        <Flex justifyContent={'space-between'}>
          <Text>
            {' '}
            Pattern{' '}
            <Input
              fontSize="sm"
              defaultValue={String(stringPattern.pattern)}
              width="auto"
              onBlur={(e) => stringPattern.setPattern(extractRegExString(e.target.value))}
            />
          </Text>
          <Text>
            Reset counter to:
            <Input
              fontSize="sm"
              defaultValue={counterInit}
              width="100px"
              onBlur={(e) =>
                resetCounterMethod
                  ? resetCounterMethod(e.target.value)
                  : setCounterInit(e.target.value)
              }
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
              onClick={() =>
                setStringPattern(
                  new Pattern(stringPattern.pattern, {
                    ...options,
                    counterInit: Number(counterInit),
                  })
                )
              }
            >
              Reset counter
            </Button>
          </ButtonGroup>
        </Flex>{' '}
      </Stack>
      <Wrap mt={4} spacing={3}>
        {output.map((result, index) => (
          <Animate
            key={index}
            sequenceIndex={index}
            play
            start={{ opacity: 0 }}
            end={{ opacity: 1 }}
            duration={0.5}
            delay={(index - (output.length - genCount)) * calculateDelay(genCount)}
          >
            <Badge
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
          </Animate>
        ))}
      </Wrap>
    </Box>
  )
}

export default PatternShowcase

const extractRegExString = (reString: string) => reString.replace(/^\/(.+)\/$/, '$1')

const calculateDelay = (genCount: number) => {
  const totalTime = DELAY_PER_ITEM * genCount
  if (totalTime <= MAX_TOTAL_DELAY) return DELAY_PER_ITEM
  else {
    const factor = (DELAY_PER_ITEM * genCount) / MAX_TOTAL_DELAY
    return DELAY_PER_ITEM / factor
  }
}
