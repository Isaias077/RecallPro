import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFlashcards } from '../../contexts/FlashcardContext';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  Container,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Image as ImageIcon,
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type FlashcardFormData = {
  question: string;
  answer: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'video';
};

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

  // State for previewing markdown
  const [previewQuestion, setPreviewQuestion] = useState(false);
  const [previewAnswer, setPreviewAnswer] = useState(false);

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
    setPreviewQuestion(false);
    setPreviewAnswer(false);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!deckId) {
      setError("No se pudo identificar el mazo.");
      setShowError(true);
      return;
    }

    try {
      if (isEditing && currentFlashcardId) {
        const result = await updateFlashcard(
          currentFlashcardId,
          formData.question,
          formData.answer,
          formData.mediaUrl || undefined,
          formData.mediaType
        );
        if (!result) throw new Error("No se pudo actualizar la tarjeta.");
      } else {
        const result = await createFlashcard(
          deckId,
          formData.question,
          formData.answer,
          formData.mediaUrl || undefined,
          formData.mediaType
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

  // Render media preview based on type
  const renderMediaPreview = (url?: string, type?: string) => {
    if (!url) return null;

    switch (type) {
      case 'image':
        return <img src={url} alt="Flashcard media" style={{ maxWidth: '100%', maxHeight: '200px' }} />;
      case 'audio':
        return <audio controls src={url} style={{ width: '100%' }} />;
      case 'video':
        return <video controls src={url} style={{ maxWidth: '100%', maxHeight: '200px' }} />;
      default:
        return null;
    }
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

  return (<Container maxWidth="md" sx={{ overflow: 'auto', minHeight: '100vh', py: 2 }}>
    <Box>
      <br />
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
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            This deck doesn't have any flashcards yet.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
            sx={{
              mt: 2,
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
            Crea tu primera tarjeta
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {flashcards.map((flashcard) => (
            <Grid item xs={12} sm={6} md={4} key={flashcard.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    <ReactMarkdown>{flashcard.question}</ReactMarkdown>
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    <ReactMarkdown>{flashcard.answer}</ReactMarkdown>
                  </Typography>
                  {flashcard.has_media && flashcard.media_url && (
                    <Box mt={2}>
                      {renderMediaPreview(flashcard.media_url, flashcard.media_type)}
                    </Box>
                  )}
                  {flashcard.next_review_date && (
                    <Box mt={2} display="flex" alignItems="center">
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                        Próxima revisión: {format(new Date(flashcard.next_review_date), 'dd MMM yyyy', { locale: es })}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <Box display="flex" justifyContent="flex-end" p={1}>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenEditDialog(flashcard)}
                    aria-label="edit flashcard"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleOpenDeleteDialog(flashcard.id)}
                    aria-label="delete flashcard"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Flashcard Dialog */}
      <Dialog open={openFlashcardDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Flashcard' : 'Create New Flashcard'}</DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Question</Typography>
              <Button size="small" onClick={() => setPreviewQuestion(!previewQuestion)}>
                {previewQuestion ? 'Edit' : 'Preview'}
              </Button>
            </Box>
            {previewQuestion ? (
              <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                <ReactMarkdown>{formData.question}</ReactMarkdown>
              </Paper>
            ) : (
              <TextField
                autoFocus
                margin="dense"
                name="question"
                label="Question"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.question}
                onChange={handleInputChange}
                required
                multiline
                rows={3}
                helperText="Supports Markdown formatting"
              />
            )}
          </Box>

          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Answer</Typography>
              <Button size="small" onClick={() => setPreviewAnswer(!previewAnswer)}>
                {previewAnswer ? 'Edit' : 'Preview'}
              </Button>
            </Box>
            {previewAnswer ? (
              <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                <ReactMarkdown>{formData.answer}</ReactMarkdown>
              </Paper>
            ) : (
              <TextField
                margin="dense"
                name="answer"
                label="Answer"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.answer}
                onChange={handleInputChange}
                required
                multiline
                rows={3}
                helperText="Supports Markdown formatting"
              />
            )}
          </Box>

          <Box mb={2}>
            <Typography variant="subtitle1" gutterBottom>
              Media (Optional)
            </Typography>
            <FormControl fullWidth margin="dense">
              <InputLabel id="media-type-label">Media Type</InputLabel>
              <Select
                labelId="media-type-label"
                name="mediaType"
                value={formData.mediaType || ''}
                label="Media Type"
                onChange={(event) => handleInputChange(event as any)}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="image">Image</MenuItem>
                <MenuItem value="audio">Audio</MenuItem>
                <MenuItem value="video">Video</MenuItem>
              </Select>
            </FormControl>

            {formData.mediaType && (
              <TextField
                margin="dense"
                name="mediaUrl"
                label="Media URL"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.mediaUrl}
                onChange={handleInputChange}
                helperText="Enter a URL for the media"
                InputProps={{
                  startAdornment: (
                    <Box mr={1}>
                      {formData.mediaType === 'image' && <ImageIcon />}
                      {formData.mediaType === 'audio' && <AudioIcon />}
                      {formData.mediaType === 'video' && <VideoIcon />}
                    </Box>
                  ),
                }}
              />
            )}

            {formData.mediaUrl && formData.mediaType && (
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Media Preview:
                </Typography>
                {renderMediaPreview(formData.mediaUrl, formData.mediaType)}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={!formData.question || !formData.answer}
          >
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Flashcard</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this flashcard? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteFlashcard} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      {/* Error Alert */}
      <Snackbar open={showError} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
    </Container>
  );
}