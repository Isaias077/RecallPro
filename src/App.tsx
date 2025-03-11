import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FlashcardProvider } from './contexts/FlashcardContext';
import { StreakProvider } from './contexts/StreakContext';
import { MindMapProvider } from './contexts/MindMapContext';
import { Box, CircularProgress, Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Navigation from './components/layout/Navigation';
import Typography from './components/atoms/Typography';
import Button from './components/atoms/Button';
import Card from './components/atoms/Card';
import DeckManager from './components/flashcards/DeckManager';
import FlashcardManager from './components/flashcards/FlashcardManager';
import ArcadePage from './components/pages/ArcadePage';
import PomodoroTimer from './components/pomodoro/PomodoroTimer';
import QuizPage from './components/flashcards/QuizPage';
import MindMapEditor from './components/mindmap/MindMapEditor';
import './App.css';
import { DashboardPage, LoginPage, MindMapPage, SignupPage, StudySessionPage } from './components/pages';

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
  <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    {/* Hero Section */}
    <Box
      sx={{
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        color: 'white',
        py: 8,
        textAlign: 'center',
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
          Potencia tu Aprendizaje con RecallPro
        </Typography>
        <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
          Sistema de aprendizaje inteligente con repetición espaciada, mapas mentales y más
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            href="/signup"
            sx={{ mr: 2, backgroundColor: 'white', color: '#2196F3' }}
          >
            Comenzar Gratis
          </Button>
          <Button
            variant="outlined"
            size="large"
            href="/login"
            sx={{ color: 'white', borderColor: 'white' }}
          >
            Iniciar Sesión
          </Button>
        </Box>
      </Container>
    </Box>

    {/* Features Section */}
    <Box sx={{ py: 8, backgroundColor: '#f5f5f5' }}>
      <Container maxWidth="lg">
        <Typography variant="h3" component="h2" gutterBottom textAlign="center" sx={{ mb: 6 }}>
          Características Principales
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 4,
          }}
        >
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
            <Typography variant="h5" component="h3" gutterBottom color="primary">
              Flashcards Inteligentes
            </Typography>
            <Typography variant="body1">
              Crea y organiza tus tarjetas de estudio con nuestro sistema de repetición espaciada para un aprendizaje óptimo.
            </Typography>
          </Card>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
            <Typography variant="h5" component="h3" gutterBottom color="primary">
              Mapas Mentales
            </Typography>
            <Typography variant="body1">
              Visualiza y conecta conceptos con nuestro editor de mapas mentales interactivo.
            </Typography>
          </Card>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
            <Typography variant="h5" component="h3" gutterBottom color="primary">
              Temporizador Pomodoro
            </Typography>
            <Typography variant="body1">
              Mejora tu concentración y productividad con nuestro temporizador Pomodoro integrado.
            </Typography>
          </Card>
        </Box>
      </Container>
    </Box>

    {/* Call to Action Section */}
    <Box sx={{ py: 8, textAlign: 'center', backgroundColor: '#e0e0e0' }}>
      <Container maxWidth="md">
        <Typography variant="h4" component="h2" gutterBottom>
          Comienza tu Viaje de Aprendizaje Hoy
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Únete a nuestra comunidad de estudiantes y profesionales que ya están mejorando su forma de aprender.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          href="/signup"
          sx={{ backgroundColor: '#2196F3', color: 'white' }}
        >
          Crear Cuenta Gratuita
        </Button>
      </Container>
    </Box>
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
                      <LoginPage />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/signup"
                  element={
                    <PublicRoute>
                      <SignupPage />
                    </PublicRoute>
                  }
                />

                {/* Protected routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
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
                      <StudySessionPage />
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
                      <ArcadePage />
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
                      <MindMapPage />
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
