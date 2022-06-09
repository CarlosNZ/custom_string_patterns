import { useEffect, useState } from 'react'
import Pattern from 'custom_string_patterns'
import {
  Box,
  Text,
  Heading,
  Stack,
  VStack,
  HStack,
  Button,
  Flex,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Badge,
  Wrap,
  Spinner,
  Textarea,
} from '@chakra-ui/react'
import { Animate } from 'react-simple-animate'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { PatternGeneratorOptions } from 'custom_string_patterns/build/types'

export interface ShowcaseProps {
  title: string
  description: string | JSX.Element
  pattern: string | RegExp
  options?: PatternGeneratorOptions
  codeStringTemplate: string
  codeStringFixedOptions?: string
  resetCounterMethod?: (newVal: string) => void
  counterInputInit?: string
  hideCounterReset?: boolean
  customArgsInit?: { [key: string]: string | number }
  customDataInit?: { [key: string]: any }
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
  counterInputInit,
  customArgsInit,
  customDataInit,
  hideCounterReset,
  codeStringTemplate,
  codeStringFixedOptions,
  style,
  children,
}: ShowcaseProps) => {
  const [stringPattern, setStringPattern] = useState<Pattern>(new Pattern(initialPattern, options))
  const [genCount, setGenCount] = useState(1)
  const [counterInit, setCounterInit] = useState(counterInputInit ?? '1')
  const [customArgs, setCustomArgs] = useState<{ [key: string]: string | number } | undefined>(
    customArgsInit
  )
  const [customDataString, setCustomDataString] = useState(JSON.stringify(customDataInit, null, 2))
  const [codeString, setCodeString] = useState(
    generateCodeString({
      codeStringTemplate,
      codeStringFixedOptions,
      stringPattern,
      counterInit,
      customArgs,
      customDataString,
    })
  )
  const [dataInputError, setDataInputError] = useState(false)
  const [output, setOutput] = useState<string[]>([])
  const [inProgress, setInProgress] = useState(false)
  const [update, setUpdate] = useState(false)

  useEffect(() => {
    if (!update) return
    console.log('Pattern changed')
    setCodeString(
      generateCodeString({
        codeStringTemplate,
        codeStringFixedOptions,
        stringPattern,
        counterInit,
        customArgs,
        customDataString,
      })
    )
    setUpdate(false)
  }, [update])

  const handleGenerate = async () => {
    setInProgress(true)
    const newStrings: string[] = []
    for (let i = 0; i < genCount; i++) {
      const startTime = performance.now()
      try {
        const res = await stringPattern.gen({
          customArgs,
          data: customDataString ? JSON.parse(customDataString) : undefined,
        })
        // For React performance reasons, fast generators should push
        // to output all at once when done, but slow ones (e.g. database
        // queries) should push one at a time so UI gets updated
        if (performance.now() - startTime > 100) {
          setOutput((curr) => [...curr, ...newStrings, res])
          newStrings.length = 0
        } else newStrings.push(res)
      } catch (err: any) {
        if (performance.now() - startTime > 100) {
          setOutput((curr) => [...curr, ...newStrings, 'ERROR'])
          newStrings.length = 0
        } else newStrings.push('ERROR')
        console.log(err.message)
      }
    }
    setOutput((curr) => [...curr, ...newStrings])
    setInProgress(false)
  }

  const handleDataInput = (e: any) => {
    try {
      const data = JSON.parse(e.target.value)
      setCustomDataString(JSON.stringify(data, null, 2))
      setDataInputError(false)
    } catch {
      setDataInputError(true)
    } finally {
      setUpdate(true)
    }
  }

  return (
    <Box
      display={'flex'}
      flexDirection="column"
      p={5}
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
        <Flex gap={5} wrap="wrap" style={{ marginBottom: 10 }}>
          <Box minW="75%" maxW={585} fontSize="0.9em" style={{ wordBreak: 'break-word' }}>
            <SyntaxHighlighter
              language="javascript"
              wrapLongLines
              customStyle={{ borderRadius: 8 }}
            >
              {codeString}
            </SyntaxHighlighter>
          </Box>
          {!hideCounterReset && (
            <VStack spacing={1} align="flex-start" flexGrow={1}>
              <Text fontSize="sm">Reset counter to:</Text>
              <Input
                fontSize="sm"
                defaultValue={counterInit}
                width="100px"
                onBlur={(e) => {
                  setCounterInit(e.target.value)
                  if (resetCounterMethod) resetCounterMethod(e.target.value)
                }}
              />
              <Button
                colorScheme="blue"
                style={{ marginTop: '15px' }}
                onClick={() => {
                  setStringPattern(
                    new Pattern(stringPattern.pattern, {
                      ...options,
                      counterInit: Number(counterInit),
                    })
                  )
                  setUpdate(true)
                }}
              >
                Reset
              </Button>
            </VStack>
          )}
        </Flex>
        <Flex gap={8}>
          {customArgs && (
            <VStack align="flex-start" maxW="50%">
              <Text>
                <strong>Args for replacment functions:</strong>
              </Text>
              {Object.entries(customArgs).map(([key, value]) => (
                <HStack textStyle="mono" key={key}>
                  <Text>{key}:</Text>
                  <Input
                    fontSize="sm"
                    minW={150}
                    defaultValue={value}
                    onBlur={(e) => {
                      setCustomArgs((curr) => ({ ...curr, [key]: e.target.value }))
                      setUpdate(true)
                    }}
                  />
                </HStack>
              ))}
            </VStack>
          )}
          {customDataString && (
            <VStack align="flex-start" maxW={360} flexGrow={1}>
              <Text>
                <strong>Data</strong>
              </Text>
              <Textarea
                isInvalid={dataInputError}
                textStyle="mono"
                fontSize="sm"
                value={customDataString}
                resize="vertical"
                height="120"
                onChange={(e) => setCustomDataString(e.target.value)}
                onBlur={handleDataInput}
              />
              {dataInputError && (
                <Text fontSize="sm" color="red">
                  Invalid JSON input
                </Text>
              )}
            </VStack>
          )}
        </Flex>
        <Flex gap={5} flexWrap="wrap" alignItems="flex-end">
          <Text>
            Pattern:{' '}
            <Input
              fontSize="sm"
              defaultValue={String(stringPattern.pattern)}
              textStyle="mono"
              width="auto"
              onBlur={(e) => {
                stringPattern.setPattern(new RegExp(extractRegExString(e.target.value)))
                setUpdate(true)
              }}
            />
          </Text>
          <Flex flexDir="row" gap={2} alignItems="center" flexWrap="wrap">
            <Text>Generate</Text>
            <NumberInput
              size="sm"
              maxW={20}
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
            <Text>more:</Text>
            <Button
              colorScheme="blue"
              width={150}
              onClick={handleGenerate}
              textStyle="mono"
              disabled={inProgress}
            >
              {inProgress ? <Spinner /> : 'pattern.gen()'}
            </Button>
            <Button colorScheme="blue" onClick={() => setOutput([])}>
              Clear
            </Button>
          </Flex>
        </Flex>
      </Stack>
      {output.length > 0 && (
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
                colorScheme={result === 'ERROR' ? 'red' : 'blue'}
                fontSize="1em"
                py={1}
                px={3}
                borderRadius={6}
                minW={120}
                textAlign="center"
                style={{ textTransform: 'none' }}
              >
                {result === 'LOADING' ? <Spinner size="sm" /> : result}
              </Badge>
            </Animate>
          ))}
        </Wrap>
      )}
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
interface CodeStringProps {
  codeStringTemplate: string
  codeStringFixedOptions?: string
  stringPattern: Pattern
  counterInit: string
  customArgs: { [key: string]: string | number } | undefined
  customDataString: string
}
const generateCodeString = ({
  codeStringTemplate,
  codeStringFixedOptions = '',
  stringPattern,
  counterInit,
  customArgs = {},
  customDataString,
}: CodeStringProps): string => {
  const includeCounterInit = !codeStringTemplate.match(/\${counterInit}/) && counterInit !== '1'

  let output = codeStringTemplate.replace(/\${counterInit}/, String(counterInit))

  let optionsString = ''

  if (includeCounterInit) {
    if (codeStringFixedOptions === '') optionsString = `counterInit: ${Number(counterInit)}`
    else optionsString = `counterInit: ${Number(counterInit)},\n    ${codeStringFixedOptions}`
  } else optionsString = codeStringFixedOptions

  optionsString =
    optionsString !== ''
      ? `, {
    ${optionsString}
  }`
      : ''

  const args = Object.values(customArgs)

  output = output
    .replace('${pattern}', String(stringPattern.pattern))
    .replace('${options}', optionsString)
    .replace('${arg1}', String(args[0]))
    .replace('${arg2}', String(args[1]))
    .replace('${arg3}', String(args[2]))
    .replace('${data}', customDataString)
  return output
}
