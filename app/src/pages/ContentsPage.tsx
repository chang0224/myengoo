import { useState } from 'react';
import Markdown from 'react-markdown';
import { useVocabulary } from '../hooks/useVocabulary';

export default function ContentsPage() {
  const { contentsFiles, isLoading } = useVocabulary();
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (isLoading) return <div className="p-4 text-gray-400">로딩 중...</div>;
  if (contentsFiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
        <p className="text-5xl mb-4">📄</p>
        <p className="text-gray-500 dark:text-gray-400">원문이 없습니다.</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">contents/ 폴더에 파일을 추가하세요.</p>
      </div>
    );
  }

  const current = contentsFiles[selectedIndex];

  return (
    <div className="flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <select
          value={selectedIndex}
          onChange={e => setSelectedIndex(Number(e.target.value))}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        >
          {contentsFiles.map((file, idx) => (
            <option key={file.fileName} value={idx}>
              {file.date} — {file.title}
            </option>
          ))}
        </select>
      </div>

      <article className="p-4 prose prose-sm dark:prose-invert max-w-none
        prose-headings:text-gray-900 dark:prose-headings:text-white
        prose-p:text-gray-700 dark:prose-p:text-gray-300
        prose-strong:text-gray-900 dark:prose-strong:text-white
        prose-blockquote:text-gray-500 dark:prose-blockquote:text-gray-400
        prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-600">
        <Markdown>{current.content}</Markdown>
      </article>
    </div>
  );
}
