import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FlashcardProvider } from './contexts/FlashcardContext';
import { StreakProvider } from './contexts/StreakContext';
import { MindMapProvider } from './contexts/MindMapContext';
import { Box, CircularProgress, Container, CssBaseline, ThemeProvider, createTheme, Typography } from '@mui/material';
import Navigation from './components/layout/Navigation';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import DeckManager from './components/flashcards/DeckManager';
import FlashcardManager from './components/flashcards/FlashcardManager';
import StudySession from './components/flashcards/StudySession';
import ArcadeMode from './components/flashcards/ArcadeMode';
import PomodoroTimer from './components/pomodoro/PomodoroTimer';
import QuizPage from './components/flashcards/QuizPage';
import MindMapManager from './components/mindmap/MindMapManager';
import MindMapEditor from './components/mindmap/MindMapEditor';
import './App.css';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#ffffff',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Public route component (redirects to dashboard if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Home page component
const HomePage = () => (
  <Box textAlign="center" py={4}>
    <Typography variant="h4" component="h1" gutterBottom>
      Welcome to CardsPro
    </Typography>
    <Typography variant="h6" gutterBottom>
      Your Flashcard Learning System with Spaced Repetition
    </Typography>
    <Typography variant="body1" paragraph>
      Create flashcards, organize them into decks, and study efficiently with our spaced repetition system.
    </Typography>
  </Box>
);

// Dashboard component (redirects to decks for now)
const Dashboard = () => <Navigate to="/decks" replace />;

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <FlashcardProvider>
          <StreakProvider>
            <MindMapProvider>
              <Router>
              <Navigation />
            <Container
              component="main"
              disableGutters
              sx={{
                backgroundColor: '#dedede',
                mb: 0,                      // Eliminamos el margen inferior
                maxWidth: 'none !important', // 'none' es mejor que '100%' para eliminar límites
                width: '100%',              // Aseguramos que ocupe el 100% del ancho
                minHeight: '100vh',         // Aseguramos que siempre ocupe al menos el alto completo de la ventana
                height: 'auto',             // Permitimos que crezca si el contenido es mayor
                padding: 0,                 // Eliminamos el padding
                display: 'flex',            // Usamos flexbox
                flexDirection: 'column',    // Organización vertical de elementos
                overflow: 'auto'            // Permitimos scroll cuando sea necesario
              }}
            >
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <LoginForm />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/signup"
                  element={
                    <PublicRoute>
                      <SignupForm />
                    </PublicRoute>
                  }
                />

                {/* Protected routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/decks"
                  element={
                    <ProtectedRoute>
                      <DeckManager />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/decks/:deckId"
                  element={
                    <ProtectedRoute>
                      <FlashcardManager />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/study/:deckId"
                  element={
                    <ProtectedRoute>
                      <StudySession />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pomodoro"
                  element={
                    <ProtectedRoute>
                      <PomodoroTimer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/arcade"
                  element={
                    <ProtectedRoute>
                      <ArcadeMode />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/quiz"
                  element={
                    <ProtectedRoute>
                      <QuizPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mindmap"
                  element={
                    <ProtectedRoute>
                      <MindMapManager />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mindmap/:mindMapId"
                  element={
                    <ProtectedRoute>
                      <MindMapEditor />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Container>
              </Router>
            </MindMapProvider>
          </StreakProvider>
        </FlashcardProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
