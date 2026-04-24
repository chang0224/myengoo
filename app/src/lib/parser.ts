import type { KeyExpression, ParsedVocabularyFile, VocabularyWord } from '../types';

const VOCAB_SECTION_HEADER = '## 📚 B2+ 단어장';
const EXPRESSION_SECTION_HEADER = '## 💡 핵심 표현';

const VOCABULARY_LINE_RE = /^\*\*(.+?)\*\*(?:\s*\(pl\.\s*\*\*.+?\*\*\s*\/[^)]+\/\))?\s*\/([^/]+)\/\s*\[([^\]]+)\]\s*(.+)$/;
const CONTEXT_LINE_RE = /^-\s*본문\s*\[([^\]]+)\]\([^)]+\):\s*"(.+)"$/;
const EXAMPLE_LINE_RE = /^-\s*예문:\s*(.+)$/;
const EXPRESSION_LINE_RE = /^-\s*\*\*(.+?)\*\*\s*\[([^\]]+)\]\([^)]+\)\s*—\s*(.+)$/;
const EXPRESSION_QUOTE_RE = /^\s+-\s*"(.+)"$/;

function stripBoldMarkers(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '$1').trim();
}

function warnMalformed(fileName: string, lineNumber: number, message: string, line: string): void {
  console.warn(`[parser:${fileName}:${lineNumber}] ${message}: ${line}`);
}

function isSkippableLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed === '' || trimmed === '---';
}

export function generateItemId(sourceFile: string, term: string): string {
  return `${sourceFile}::${term.toLowerCase().trim()}`;
}

export function parseVocabularyFile(content: string, fileName: string): ParsedVocabularyFile {
  const lines = content.split(/\r?\n/);
  const date = fileName.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] ?? '';
  const title = content.match(/^#\s+단어장:\s*(.+)$/m)?.[1] ?? '';

  const vocabStart = lines.findIndex((line) => line.trim() === VOCAB_SECTION_HEADER);
  const expressionStart = lines.findIndex((line) => line.trim() === EXPRESSION_SECTION_HEADER);

  if (vocabStart === -1) {
    console.warn(`[parser:${fileName}] Missing vocabulary section header: ${VOCAB_SECTION_HEADER}`);
  }

  if (expressionStart === -1) {
    console.warn(`[parser:${fileName}] Missing expression section header: ${EXPRESSION_SECTION_HEADER}`);
  }

  const words: VocabularyWord[] = [];
  const expressions: KeyExpression[] = [];

  if (vocabStart !== -1) {
    const vocabEnd = expressionStart === -1 ? lines.length : expressionStart;

    for (let i = vocabStart + 1; i < vocabEnd; i += 1) {
      const line = lines[i];

      if (isSkippableLine(line)) {
        continue;
      }

      const wordMatch = line.match(VOCABULARY_LINE_RE);

      if (!wordMatch) {
        warnMalformed(fileName, i + 1, 'Skipping malformed vocabulary line', line);
        continue;
      }

      const [, word, ipa, partOfSpeech, definition] = wordMatch;
      const contextLine = lines[i + 1] ?? '';
      const exampleLine = lines[i + 2] ?? '';
      const contextMatch = contextLine.match(CONTEXT_LINE_RE);
      const exampleMatch = exampleLine.match(EXAMPLE_LINE_RE);

      if (!contextMatch) {
        warnMalformed(fileName, i + 2, 'Skipping vocabulary entry with malformed context line', contextLine);
        continue;
      }

      if (!exampleMatch) {
        warnMalformed(fileName, i + 3, 'Skipping vocabulary entry with malformed example line', exampleLine);
        continue;
      }

      const [, contextRef, contextQuote] = contextMatch;
      const [, exampleSentence] = exampleMatch;

      words.push({
        type: 'word',
        word: word.trim(),
        ipa: `/${ipa.trim()}/`,
        partOfSpeech: partOfSpeech.trim(),
        definition: definition.trim(),
        contextQuote: stripBoldMarkers(contextQuote),
        contextRef: contextRef.trim(),
        exampleSentence: exampleSentence.trim(),
        sourceFile: fileName,
        sourceDate: date,
      });

      i += 2;
    }
  }

  if (expressionStart !== -1) {
    for (let i = expressionStart + 1; i < lines.length; i += 1) {
      const line = lines[i];

      if (isSkippableLine(line)) {
        continue;
      }

      const expressionMatch = line.match(EXPRESSION_LINE_RE);

      if (!expressionMatch) {
        warnMalformed(fileName, i + 1, 'Skipping malformed expression line', line);
        continue;
      }

      const quoteLine = lines[i + 1] ?? '';
      const quoteMatch = quoteLine.match(EXPRESSION_QUOTE_RE);

      if (!quoteMatch) {
        warnMalformed(fileName, i + 2, 'Skipping expression entry with malformed quote line', quoteLine);
        continue;
      }

      const [, expression, contextRef, koreanExplanation] = expressionMatch;
      const [, contextQuote] = quoteMatch;

      expressions.push({
        type: 'expression',
        expression: expression.trim(),
        koreanExplanation: koreanExplanation.trim(),
        contextQuote: stripBoldMarkers(contextQuote),
        contextRef: contextRef.trim(),
        sourceFile: fileName,
        sourceDate: date,
      });

      i += 1;
    }
  }

  return {
    fileName,
    date,
    title,
    words,
    expressions,
  };
}
