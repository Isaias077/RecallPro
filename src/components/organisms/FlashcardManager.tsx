import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFlashcards } from '../../contexts/FlashcardContext';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Typography,
  CircularProgress,
  Paper,
  Container,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import FlashcardList from '../molecules/FlashcardList';
import FlashcardForm from '../molecules/FlashcardForm';

type FlashcardFormData = {
  question: string;
  answer: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'video';
};

/**
 * FlashcardManager organism component that combines molecules to create a complete flashcard management interface.
 * This component manages the state and interactions for flashcard creation, editing, and deletion.
 */
export default function FlashcardManager() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const {
    decks,
    flashcards,
    loadingDecks,
    loadingFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    setCurrentDeckId,
  } = useFlashcards();
  
  // State for error handling
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  // Set the current deck ID when the component mounts
  useEffect(() => {
    if (deckId) {
      setCurrentDeckId(deckId);
    }
  }, [deckId, setCurrentDeckId]);

  // State for managing the create/edit flashcard dialog
  const [openFlashcardDialog, setOpenFlashcardDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentFlashcardId, setCurrentFlashcardId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FlashcardFormData>({
    question: '',
    answer: '',
    mediaUrl: '',
    mediaType: undefined,
  });

  // State for managing the delete confirmation dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [flashcardToDelete, setFlashcardToDelete] = useState<string | null>(null);

  // Get the current deck
  const currentDeck = decks.find((deck) => deck.id === deckId);

  // Handle opening the create flashcard dialog
  const handleOpenCreateDialog = () => {
    setIsEditing(false);
    setFormData({
      question: '',
      answer: '',
      mediaUrl: '',
      mediaType: undefined,
    });
    setOpenFlashcardDialog(true);
  };

  // Handle opening the edit flashcard dialog
  const handleOpenEditDialog = (flashcard: any) => {
    setIsEditing(true);
    setCurrentFlashcardId(flashcard.id);
    setFormData({
      question: flashcard.question,
      answer: flashcard.answer,
      mediaUrl: flashcard.media_url || '',
      mediaType: flashcard.media_type,
    });
    setOpenFlashcardDialog(true);
  };

  // Handle closing the flashcard dialog
  const handleCloseDialog = () => {
    setOpenFlashcardDialog(false);
  };

  // Handle form submission
  const handleSubmit = async (data: FlashcardFormData) => {
    if (!deckId) {
      setError("No se pudo identificar el mazo.");
      setShowError(true);
      return;
    }

    try {
      if (isEditing && currentFlashcardId) {
        const result = await updateFlashcard(
          currentFlashcardId,
          data.question,
          data.answer,
          data.mediaUrl || undefined,
          data.mediaType
        );
        if (!result) throw new Error("No se pudo actualizar la tarjeta.");
      } else {
        const result = await createFlashcard(
          deckId,
          data.question,
          data.answer,
          data.mediaUrl || undefined,
          data.mediaType
        );
        if (!result) throw new Error("No se pudo crear la tarjeta.");
      }
      handleCloseDialog();
    } catch (err: any) {
      setError(err.message || "Ha ocurrido un error al procesar la tarjeta.");
      setShowError(true);
    }
  };

  // Handle opening the delete confirmation dialog
  const handleOpenDeleteDialog = (flashcardId: string) => {
    setFlashcardToDelete(flashcardId);
    setOpenDeleteDialog(true);
  };

  // Handle closing the delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setFlashcardToDelete(null);
  };

  // Handle flashcard deletion
  const handleDeleteFlashcard = async () => {
    if (flashcardToDelete) {
      try {
        await deleteFlashcard(flashcardToDelete);
        handleCloseDeleteDialog();
      } catch (err: any) {
        setError(err.message || "No se pudo eliminar la tarjeta.");
        setShowError(true);
        handleCloseDeleteDialog();
      }
    }
  };
  
  // Handle closing error alert
  const handleCloseError = () => {
    setShowError(false);
  };

  // Handle navigating back to decks list
  const handleBackToDecksList = () => {
    navigate('/decks');
  };

  // Handle flashcard flip
  const handleFlashcardFlip = (id: string) => {
    // Additional logic for tracking flashcard flips could be added here
    console.log(`Flashcard flipped: ${id}`);
  };

  if (loadingDecks || loadingFlashcards) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!currentDeck) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{ p: 3 }}
      >
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Mazo no encontrado.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToDecksList}
          sx={{ mt: 2 }}
        >
          Volver a Mazos
        </Button>
      </Box>
    );
  }

  // Convert backend flashcards to the format expected by FlashcardList
  const formattedFlashcards = flashcards.map(card => ({
    id: card.id,
    question: card.question,
    answer: card.answer,
    mediaUrl: card.media_url,
    mediaType: card.media_type as 'image' | 'audio' | 'video' | undefined
  }));

  return (
    <Container maxWidth="md" sx={{ overflow: 'auto', minHeight: '100vh', py: 2 }}>
      <Box>
        <Box display="flex" alignItems="center" mb={2}>
          <IconButton onClick={handleBackToDecksList} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {currentDeck.name}
          </Typography>
        </Box>

        <Typography variant="body1" color="textSecondary" paragraph>
          {currentDeck.description}
        </Typography>

        <Box display="flex" justifyContent="flex-end" mb={3}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
            sx={{
              backgroundColor: "#09ABEF",
              color: "#ffffff",
              textTransform: 'none',
              fontSize: '16px',
              fontWeight: 500,
              padding: '8px 20px',
              borderRadius: '50px',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: "#08A0E0",
                boxShadow: 'none',
              }
            }}
          >
            Agregar Tarjeta
          </Button>
        </Box>

        {flashcards.length === 0 ? (
          <Paper elevation={1} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Este mazo aún no tiene tarjetas.
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              Comienza agregando una nueva tarjeta con el botón de arriba.
            </Typography>
          </Paper>
        ) : (
          <FlashcardList 
            flashcards={formattedFlashcards} 
            onFlip={handleFlashcardFlip} 
          />
        )}
      </Box>

      {/* Create/Edit Flashcard Dialog */}
      <Dialog open={openFlashcardDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Editar Tarjeta' : 'Crear Nueva Tarjeta'}</DialogTitle>
        <DialogContent>
          <FlashcardForm
            initialData={formData}
            onSubmit={handleSubmit}
            onCancel={handleCloseDialog}
            isEditing={isEditing}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar esta tarjeta? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleDeleteFlashcard} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar open={showError} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}