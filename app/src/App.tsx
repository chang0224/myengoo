import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { VocabularyProvider } from './hooks/useVocabulary';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import ContentsPage from './pages/ContentsPage';
import DailyNewsPage from './pages/DailyNewsPage';
import StudyHubPage from './pages/StudyHubPage';
import FlashcardPage from './pages/FlashcardPage';
import QuizPage from './pages/QuizPage';
import FillBlankPage from './pages/FillBlankPage';
import ReviewPage from './pages/ReviewPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <ErrorBoundary>
      <VocabularyProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="contents" element={<ContentsPage />} />
              <Route path="daily-news" element={<DailyNewsPage />} />
              <Route path="study" element={<StudyHubPage />} />
              <Route path="flashcard" element={<FlashcardPage />} />
              <Route path="quiz" element={<QuizPage />} />
              <Route path="fill-blank" element={<FillBlankPage />} />
              <Route path="review" element={<ReviewPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </VocabularyProvider>
    </ErrorBoundary>
  );
}

export default App;
