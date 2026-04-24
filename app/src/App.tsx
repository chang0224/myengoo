import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { VocabularyProvider } from './hooks/useVocabulary';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import FlashcardPage from './pages/FlashcardPage';
import QuizPage from './pages/QuizPage';
import FillBlankPage from './pages/FillBlankPage';
import ReviewPage from './pages/ReviewPage';

function App() {
  return (
    <ErrorBoundary>
      <VocabularyProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="flashcard" element={<FlashcardPage />} />
              <Route path="quiz" element={<QuizPage />} />
              <Route path="fill-blank" element={<FillBlankPage />} />
              <Route path="review" element={<ReviewPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </VocabularyProvider>
    </ErrorBoundary>
  );
}

export default App;
