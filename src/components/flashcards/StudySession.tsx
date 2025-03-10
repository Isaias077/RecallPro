import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFlashcards } from '../../contexts/FlashcardContext';
import { useStreak } from '../../contexts/StreakContext';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Stack,
  Chip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import styled from '@emotion/styled';

// Styled components for the card stack UI
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(180deg, #8B48BD 0%, #87C8E4 100%);
  padding: 20px;
`;

const CardContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px; /* Always reserve space for rating section */
  transition: all 0.3s ease;
`;

const BaseCard = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 34px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(7.5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const ThirdCard = styled(BaseCard)`
  background: #C6E8E8;
  opacity: 0.54;
  width: 100%;
  max-width: 550px;
  transform: scale(0.701) translateY(135px);
  z-index: 1;
  left: 0;
  right: 0;
  margin: 0 auto;
`;

const SecondCard = styled(BaseCard)`
  background: #C6E8E8;
  transform: scale(0.857) translateY(40px);
  max-width: 515px;
  height: 430px;
  width: 100%;
  z-index: 2;
  left: 0;
  right: 0;
  margin: 0 auto;
`;

const AnswerText = styled.div`
  color: #333;
  text-align: center;
  margin: 20px 0;
  font-size: 1.2rem;
  font-weight: 500;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeIn 0.5s ease-out forwards;
  
  @keyframes fadeIn {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const AnswerButton = styled.button`
  background: #8B48BD;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s ease;

  &:hover {
    background: #7b3dad;
  }
`;

const RatingSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  width: 100%;
  max-width: 600px;
  opacity: 0;
  visibility: ${({ show }: { show?: boolean }) => show ? 'visible' : 'hidden'};
  animation: fadeIn 0.6s ease-out 0.2s forwards;
  transition: visibility 0s, opacity 0.6s ease-out;
  
  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }
`;

const DifficultyContainer = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-top: 10px;
`;

const DifficultyButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 2rem;
  transition: transform 0.2s ease;
  background-color: white;
  border-radius: 100%;
  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
  margin-bottom: 5px;
  padding: 10px;
  opacity: 0;
  transform: scale(0.8);
  animation: popIn 0.4s ease-out forwards;
  
  &:nth-of-type(1) {
    animation-delay: 0.3s;
  }
  
  &:nth-of-type(2) {
    animation-delay: 0.4s;
  }
  
  &:nth-of-type(3) {
    animation-delay: 0.5s;
  }
  
  @keyframes popIn {
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  &:hover {
    transform: scale(1.2);
  }
`;

export default function StudySession() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const {
    decks,
    loadingDecks,
    getDueFlashcards,
    reviewFlashcard,
    setCurrentDeckId,
  } = useFlashcards();
  
  // Get streak context
  const { updateStreak } = useStreak();

  // State for managing the study session
  const [loading, setLoading] = useState(true);
  const [dueFlashcards, setDueFlashcards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyComplete, setStudyComplete] = useState(false);
  const [studyStats, setStudyStats] = useState({
    total: 0,
    completed: 0,
    easy: 0,
    medium: 0,
    hard: 0,
  });
  
  // State for error handling
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  // Get the current deck
  const currentDeck = decks.find((deck) => deck.id === deckId);

  // Fetch due flashcards when the component mounts
  useEffect(() => {
    const fetchDueFlashcards = async () => {
      if (deckId) {
        setCurrentDeckId(deckId);
        setLoading(true);
        try {
          const flashcards = await getDueFlashcards(deckId);
          setDueFlashcards(flashcards);
          setStudyStats(prev => ({ ...prev, total: flashcards.length }));
          
          // Make sure answer is hidden initially
          setShowAnswer(false);
        } catch (error: any) {
          console.error('Error fetching due flashcards:', error);
          setError(error.message || 'Error al cargar las tarjetas para estudio');
          setShowError(true);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDueFlashcards();
  }, [deckId, getDueFlashcards, setCurrentDeckId]);

  // Handle revealing the answer
  const handleRevealAnswer = () => {
    setShowAnswer(true);
  };

  // Handle rating the flashcard
  const handleRateFlashcard = async (difficulty: 'easy' | 'medium' | 'hard') => {
    if (dueFlashcards.length === 0 || currentIndex >= dueFlashcards.length) return;

    try {
      const currentFlashcard = dueFlashcards[currentIndex];
      await reviewFlashcard(currentFlashcard.id, difficulty);

      // Update study stats
      setStudyStats(prev => ({
        ...prev,
        completed: prev.completed + 1,
        [difficulty]: prev[difficulty as keyof typeof prev] + 1,
      }));

      // Move to the next flashcard or end the study session
      if (currentIndex < dueFlashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        setStudyComplete(true);
        // Update user's streak when study session is completed
        await updateStreak();
      }
    } catch (error: any) {
      console.error('Error al calificar la tarjeta:', error);
      setError(error.message || 'Error al calificar la tarjeta');
      setShowError(true);
    }
  };

  // Handle navigating back to decks list
  const handleBackToDecksList = () => {
    navigate('/decks');
  };

  // Handle starting a new study session
  const handleRestartStudy = async () => {
    if (deckId) {
      setLoading(true);
      try {
        const flashcards = await getDueFlashcards(deckId);
        setDueFlashcards(flashcards);
        setCurrentIndex(0);
        setShowAnswer(false);
        setStudyComplete(false);
        setStudyStats({
          total: flashcards.length,
          completed: 0,
          easy: 0,
          medium: 0,
          hard: 0,
        });
      } catch (error: any) {
        console.error('Error fetching due flashcards:', error);
        setError(error.message || 'Error al reiniciar la sesión de estudio');
        setShowError(true);
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Handle closing error alert
  const handleCloseError = () => {
    setShowError(false);
  };

  // Render media based on type
  const renderMedia = (flashcard: any) => {
    if (!flashcard.has_media || !flashcard.media_url) return null;

    switch (flashcard.media_type) {
      case 'image':
        return <img src={flashcard.media_url} alt="Flashcard media" style={{ maxWidth: '100%', maxHeight: '200px' }} />;
      case 'audio':
        return <audio controls src={flashcard.media_url} style={{ width: '100%' }} />;
      case 'video':
        return <video controls src={flashcard.media_url} style={{ maxWidth: '100%', maxHeight: '200px' }} />;
      default:
        return null;
    }
  };

  if (loading || loadingDecks) {
    return (
    <PageContainer>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress sx={{ color: 'white' }} size={60} />
      </Box>
    </PageContainer>
    );
  }

  if (!currentDeck) {
    return (
    <PageContainer>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 4,
          maxWidth: 600,
          mx: 'auto',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Box 
          display="flex" 
          flexDirection="column" 
          justifyContent="center" 
          alignItems="center"
          sx={{ p: 3 }}
        >
          <Typography variant="h5" sx={{ color: '#8B48BD', fontWeight: 'bold', mb: 2 }} gutterBottom>
            Mazo no encontrado
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToDecksList}
            sx={{ 
              backgroundColor: '#8B48BD', 
              '&:hover': { backgroundColor: '#7b3dad' }
            }}
          >
            Volver a Mazos
          </Button>
        </Box>
      </Paper>
    </PageContainer>
    );
  }

  if (dueFlashcards.length === 0) {
    return (
    <PageContainer>
      <Box sx={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToDecksList}
          variant="contained"
          size="small"
          sx={{ backgroundColor: 'white', color: '#8B48BD' }}
        >
          Volver a los mazos
        </Button>
      </Box>
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 4,
          maxWidth: 600,
          mx: 'auto',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Box 
          display="flex" 
          flexDirection="column" 
          justifyContent="center" 
          alignItems="center"
          sx={{ p: 3 }}
        >
          <Typography variant="h5" sx={{ color: '#8B48BD', fontWeight: 'bold', mb: 2 }} gutterBottom>
            Estudiando: {currentDeck.name}
          </Typography>
          <Typography variant="h6" gutterBottom>
            No hay tarjetas pendientes para revisar
          </Typography>
          <Typography variant="body1" paragraph sx={{ textAlign: 'center', mb: 3 }}>
            Has completado todas tus revisiones para este mazo. Vuelve más tarde para revisar más tarjetas.
          </Typography>
          <Button
            variant="contained"
            onClick={handleBackToDecksList}
            sx={{ 
              backgroundColor: '#8B48BD', 
              '&:hover': { backgroundColor: '#7b3dad' }
            }}
          >
            Volver a los mazos
          </Button>
        </Box>
      </Paper>
    </PageContainer>
    );
  }

  if (studyComplete) {
    return (
    <PageContainer>
      <Box sx={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToDecksList}
          variant="contained"
          size="small"
          sx={{ backgroundColor: 'white', color: '#8B48BD' }}
        >
          Volver a los mazos
        </Button>
      </Box>
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 4,
          maxWidth: 600,
          mx: 'auto',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Box 
          display="flex" 
          flexDirection="column" 
          justifyContent="center" 
          alignItems="center"
          sx={{ p: 3 }}
        >
          <Typography variant="h5" sx={{ color: '#8B48BD', fontWeight: 'bold', mb: 2 }} gutterBottom>
            ¡Sesión de estudio completada!
          </Typography>
          
          <Box my={3}>
            <Typography variant="h6" gutterBottom>
              Estadísticas de la sesión:
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center" mb={2}>
              <Chip 
                icon={<CheckCircleIcon />} 
                label={`Fácil: ${studyStats.easy}`} 
                color="success" 
                variant="outlined" 
              />
              <Chip 
                icon={<HelpIcon />} 
                label={`Medio: ${studyStats.medium}`} 
                color="warning" 
                variant="outlined" 
              />
              <Chip 
                icon={<CancelIcon />} 
                label={`Difícil: ${studyStats.hard}`} 
                color="error" 
                variant="outlined" 
              />
            </Stack>
            <Typography variant="body1" align="center">
              Has revisado {studyStats.completed} de {studyStats.total} tarjetas.
            </Typography>
          </Box>

          <Box display="flex" justifyContent="center" gap={2}>
            <Button
              variant="outlined"
              onClick={handleBackToDecksList}
              sx={{ borderColor: '#8B48BD', color: '#8B48BD' }}
            >
              Volver a los mazos
            </Button>
            <Button
              variant="contained"
              onClick={handleRestartStudy}
              sx={{ 
                backgroundColor: '#8B48BD', 
                '&:hover': { backgroundColor: '#7b3dad' }
              }}
            >
              Estudiar de nuevo
            </Button>
          </Box>
        </Box>
      </Paper>
    </PageContainer>
    );
  }

  const currentFlashcard = dueFlashcards[currentIndex];

  return (
    <PageContainer>
      <Box sx={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToDecksList}
          variant="contained"
          size="small"
          sx={{ backgroundColor: 'white', color: '#8B48BD' }}
        >
          Volver a los mazos
        </Button>
      </Box>
      
      <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
        <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
          Tarjeta {currentIndex + 1} de {dueFlashcards.length} • {studyStats.completed} completados
        </Typography>
      </Box>

      <CardContainer>
        <ThirdCard />
        <SecondCard />
        <BaseCard className='mainCard' style={{ left: 0, right: 0, margin: '0 auto' }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
            <ReactMarkdown>{currentFlashcard.question}</ReactMarkdown>
          </Typography>
          
          {currentFlashcard.has_media && renderMedia(currentFlashcard)}

          {showAnswer && (
            <AnswerText>
              <ReactMarkdown>{currentFlashcard.answer}</ReactMarkdown>
            </AnswerText>
          )}
          <br />
          <AnswerButton onClick={handleRevealAnswer}>
            {showAnswer ? 'Ya lo tengo' : 'RESPUESTA'}
          </AnswerButton>
        </BaseCard>
      </CardContainer>
      
      <RatingSection show={showAnswer}>
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>¿Qué tan bien sabías esto?</Typography>
        <DifficultyContainer>
          <div className="fDc">
            <DifficultyButton 
              title="Difícil" 
              onClick={() => handleRateFlashcard('hard')}
            >👎</DifficultyButton>
            <Typography variant="body2" sx={{ color: 'white' }}>Difícil</Typography>
          </div>
          <div className="fDc">
            <DifficultyButton 
              title="Normal" 
              onClick={() => handleRateFlashcard('medium')}
            >😐</DifficultyButton>
            <Typography variant="body2" sx={{ color: 'white' }}>Normal</Typography>
          </div>
          <div className="fDc">
            <DifficultyButton 
              title="Fácil" 
              onClick={() => handleRateFlashcard('easy')}
            >👍</DifficultyButton>
            <Typography variant="body2" sx={{ color: 'white' }}>Fácil</Typography>
          </div>
        </DifficultyContainer>
      </RatingSection>
      
      {/* Error Alert */}
      <Snackbar open={showError} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
}