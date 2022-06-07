import { Box, Center, Heading, Text, Stack, Icon, Flex } from '@chakra-ui/react'
import { FaNpm, FaExternalLinkAlt, FaGithub } from 'react-icons/fa'
import Showcase from './PatternShowcase'
import { examples } from './examples'

const App = () => {
  return (
    <Center>
      <Box id="main-container" maxW={800} px={3} pb={10}>
        <Flex justify="space-between" align="baseline" mt={5} mb={3}>
          <Heading as="h1" size="2xl">
            Custom String Patterns
          </Heading>
          <Flex align="center" gap={5}>
            <a
              href="https://github.com/CarlosNZ/custom_string_patterns"
              target="_blank"
              rel="noreferrer"
            >
              <Icon boxSize="2em" as={FaGithub} />
            </a>
            <a
              href="https://www.npmjs.com/package/custom_string_patterns"
              target="_blank"
              rel="noreferrer"
            >
              <Icon boxSize="3em" as={FaNpm} />
            </a>
          </Flex>
        </Flex>
        <Text>
          by{' '}
          <a href="https://github.com/CarlosNZ" target="_blank" rel="noreferrer">
            @CarlosNZ
          </a>
        </Text>
        <Box mb={5}></Box>
        <Box mb={5}>
          <Text mb={3}>
            Generate sequences of random and incrementing strings using regular expressions and
            custom functions
          </Text>
          <Text>
            <a
              href="https://www.npmjs.com/package/custom_string_patterns"
              target="_blank"
              rel="noreferrer"
            >
              • Usage and documentation <Icon as={FaExternalLinkAlt} />
            </a>
          </Text>
        </Box>
        <Box mb={4}>
          <Heading as="h2" size="lg" mb={2}>
            Examples
          </Heading>
          <Text>
            Generate a range of string patterns below — and edit the pattern string to see the
            resulting effects:
          </Text>
        </Box>
        <Stack spacing={8} display="flex" flexDirection="column" alignItems="center">
          {examples.map((example) => (
            <Showcase {...example} key={example.title} />
          ))}
        </Stack>
        <Text align="center" fontSize="sm" mt={5} mb={5}>
          <a
            href="https://github.com/CarlosNZ/custom_string_patterns"
            target="_blank"
            rel="noreferrer"
          >
            Github
          </a>
          &nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;
          <a
            href="https://www.npmjs.com/package/custom_string_patterns"
            target="_blank"
            rel="noreferrer"
          >
            npm
          </a>
        </Text>
      </Box>
    </Center>
  )
}

export default App
