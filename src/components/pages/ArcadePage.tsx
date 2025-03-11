import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlashcards } from '../../contexts/FlashcardContext';
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
    Casino as CasinoIcon,
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
  margin-bottom: 40px;
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
  background-color: rgba(255, 255, 255, 0.651);
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

export default function ArcadeMode() {
    const navigate = useNavigate();
    const { decks, loadingDecks, getAllFlashcards } = useFlashcards();

    // State for managing the arcade session
    const [loading, setLoading] = useState(true);
    const [allFlashcards, setAllFlashcards] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [sessionStats, setSessionStats] = useState({
        total: 0,
        completed: 0,
        easy: 0,
        medium: 0,
        hard: 0,
    });

    // State for error handling
    const [error, setError] = useState<string | null>(null);
    const [showError, setShowError] = useState(false);

    // Fetch all flashcards when the component mounts
    useEffect(() => {
        const fetchAllFlashcards = async () => {
            setLoading(true);
            try {
                // Get all flashcards from all decks
                const flashcards = await getAllFlashcards();

                // Shuffle the flashcards for random order
                const shuffledFlashcards = [...flashcards].sort(() => Math.random() - 0.5);

                setAllFlashcards(shuffledFlashcards);
                setSessionStats(prev => ({ ...prev, total: shuffledFlashcards.length }));

                // Make sure answer is hidden initially
                setShowAnswer(false);
            } catch (error: any) {
                console.error('Error fetching flashcards for arcade mode:', error);
                setError(error.message || 'Error al cargar las tarjetas para el modo arcade');
                setShowError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchAllFlashcards();
    }, [getAllFlashcards]);

    // Handle revealing the answer
    const handleRevealAnswer = () => {
        setShowAnswer(true);
    };

    // Handle rating the flashcard (in arcade mode, this doesn't affect spaced repetition)
    const handleRateFlashcard = (difficulty: 'easy' | 'medium' | 'hard') => {
        if (allFlashcards.length === 0 || currentIndex >= allFlashcards.length) return;

        // Update session stats (just for this session, not saved to database)
        setSessionStats(prev => ({
            ...prev,
            completed: prev.completed + 1,
            [difficulty]: prev[difficulty as keyof typeof prev] + 1,
        }));

        // Move to the next flashcard or end the session
        if (currentIndex < allFlashcards.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setShowAnswer(false);
        } else {
            setSessionComplete(true);
        }
    };

    // Handle navigating back to decks list
    const handleBackToDecksList = () => {
        navigate('/decks');
    };

    // Handle restarting the arcade session with new random cards
    const handleRestartArcade = async () => {
        setLoading(true);
        try {
            // Get all flashcards again and reshuffle
            const flashcards = await getAllFlashcards();
            const shuffledFlashcards = [...flashcards].sort(() => Math.random() - 0.5);

            setAllFlashcards(shuffledFlashcards);
            setCurrentIndex(0);
            setShowAnswer(false);
            setSessionComplete(false);
            setSessionStats({
                total: shuffledFlashcards.length,
                completed: 0,
                easy: 0,
                medium: 0,
                hard: 0,
            });
        } catch (error: any) {
            console.error('Error restarting arcade mode:', error);
            setError(error.message || 'Error al reiniciar el modo arcade');
            setShowError(true);
        } finally {
            setLoading(false);
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

    if (allFlashcards.length === 0) {
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
                            No hay tarjetas disponibles
                        </Typography>
                        <Typography variant="body1" sx={{ textAlign: 'center', mb: 3 }} paragraph>
                            Crea algunas tarjetas en tus mazos para poder usar el modo arcade.
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
                            Volver a los mazos
                        </Button>
                    </Box>
                </Paper>
            </PageContainer>
        );
    }

    if (sessionComplete) {
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
                    <Box textAlign="center">
                        <Typography variant="h4" gutterBottom sx={{ color: '#8B48BD', fontWeight: 'bold' }}>
                            ¡Modo Arcade Completado!
                        </Typography>

                        <Typography variant="body1" paragraph>
                            Has completado todas las tarjetas en este modo arcade.
                        </Typography>

                        <Box sx={{ my: 4 }}>
                            <Typography variant="h6" gutterBottom sx={{ color: '#8B48BD' }}>
                                Estadísticas de la sesión
                            </Typography>

                            <Stack direction="row" spacing={3} justifyContent="center" sx={{ mb: 3 }}>
                                <Chip
                                    icon={<CheckCircleIcon />}
                                    label={`Fácil: ${sessionStats.easy}`}
                                    color="success"
                                    variant="outlined"
                                    sx={{ padding: '20px 10px', borderRadius: '20px' }}
                                />
                                <Chip
                                    icon={<HelpIcon />}
                                    label={`Medio: ${sessionStats.medium}`}
                                    color="warning"
                                    variant="outlined"
                                    sx={{ padding: '20px 10px', borderRadius: '20px' }}
                                />
                                <Chip
                                    icon={<CancelIcon />}
                                    label={`Difícil: ${sessionStats.hard}`}
                                    color="error"
                                    variant="outlined"
                                    sx={{ padding: '20px 10px', borderRadius: '20px' }}
                                />
                            </Stack>

                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                Total de tarjetas: {sessionStats.total}
                            </Typography>
                        </Box>

                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                            <Button
                                variant="outlined"
                                startIcon={<ArrowBackIcon />}
                                onClick={handleBackToDecksList}
                                sx={{
                                    borderColor: '#8B48BD',
                                    color: '#8B48BD',
                                    '&:hover': { borderColor: '#7b3dad', backgroundColor: 'rgba(139, 72, 189, 0.04)' }
                                }}
                            >
                                Volver a los mazos
                            </Button>

                            <Button
                                variant="contained"
                                startIcon={<CasinoIcon />}
                                onClick={handleRestartArcade}
                                sx={{
                                    backgroundColor: '#8B48BD',
                                    '&:hover': { backgroundColor: '#7b3dad' }
                                }}
                            >
                                Jugar de nuevo
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </PageContainer>
        );
    }

    const currentFlashcard = allFlashcards[currentIndex];
    const deckName = decks.find(deck => deck.id === currentFlashcard.deck_id)?.name || 'Desconocido';

    return (
        <PageContainer> <br />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-evenly', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={handleBackToDecksList}
                        variant="contained"
                        size="small"
                        sx={{ backgroundColor: 'white', color: '#8B48BD' }}
                    >
                        Volver a los mazos
                    </Button>

                    <Chip
                        icon={<CasinoIcon />}
                        label="Modo Arcade"
                        color="secondary"
                        variant="filled"
                        sx={{ backgroundColor: 'white', color: '#8B48BD' }}
                    />
                </Box>
                <br />
                <Box>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                        Tarjeta {currentIndex + 1} de {allFlashcards.length}
                    </Typography>
                    <Chip
                        label={`Mazo: ${deckName}`}
                        size="small"
                        variant="outlined"
                        sx={{ backgroundColor: 'white', borderColor: '#8B48BD', color: '#8B48BD' }}
                    />
                </Box> 
            </Box><br />

            <CardContainer>
                <ThirdCard />
                <SecondCard />
                <BaseCard className='mainCard' style={{ left: 0, right: 0, margin: '0 auto' }}>
                    <Box sx={{ width: '100%', textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                            {currentFlashcard.question}
                        </Typography>

                        {renderMedia(currentFlashcard)}

                        {showAnswer && (
                            <AnswerText>
                                <ReactMarkdown>{currentFlashcard.answer}</ReactMarkdown>
                            </AnswerText>
                        )}

                        {!showAnswer && (
                            <Box sx={{ mt: 4 }}>
                                <AnswerButton onClick={handleRevealAnswer}>
                                    RESPUESTA
                                </AnswerButton>
                            </Box>
                        )}
                    </Box>
                </BaseCard>
            </CardContainer>

            <RatingSection show={showAnswer}>
                <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                    ¿Qué te pareció?
                </Typography>
                <DifficultyContainer>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <DifficultyButton
                            title="Difícil"
                            onClick={() => handleRateFlashcard('hard')}
                        >
                            👎
                        </DifficultyButton>
                        <Typography variant="body2" sx={{ color: 'white', mt: 1 }}>
                            Difícil
                        </Typography>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <DifficultyButton
                            title="Normal"
                            onClick={() => handleRateFlashcard('medium')}
                        >
                            😐
                        </DifficultyButton>
                        <Typography variant="body2" sx={{ color: 'white', mt: 1 }}>
                            Normal
                        </Typography>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <DifficultyButton
                            title="Fácil"
                            onClick={() => handleRateFlashcard('easy')}
                        >
                            👍
                        </DifficultyButton>
                        <Typography variant="body2" sx={{ color: 'white', mt: 1 }}>
                            Fácil
                        </Typography>
                    </div>
                </DifficultyContainer>
            </RatingSection>

            <Box sx={{ textAlign: 'center' }}><br /> <br />
                <Typography variant="body2" sx={{ color: 'white', opacity: 0.8 }}>
                    Modo Arcade: Las respuestas en este modo no afectan tus estadísticas ni tu racha de estudio.
                </Typography>
            </Box>

            <Snackbar open={showError} autoHideDuration={6000} onClose={handleCloseError}>
                <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </PageContainer>
    );
}