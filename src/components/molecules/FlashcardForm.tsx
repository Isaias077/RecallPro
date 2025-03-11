import { useState } from 'react';
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, Typography, IconButton, SelectChangeEvent } from '@mui/material';
import { Image as ImageIcon, AudioFile as AudioIcon, VideoFile as VideoIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';

export interface FlashcardFormProps {
  initialData?: {
    question: string;
    answer: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'audio' | 'video';
  };
  onSubmit: (data: {
    question: string;
    answer: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'audio' | 'video';
  }) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

/**
 * FlashcardForm molecule component that provides a form for creating and editing flashcards.
 * This component combines various atoms to create a form for flashcard management.
 */
export const FlashcardForm = (props: FlashcardFormProps) => {
  const { initialData, onSubmit, onCancel, isEditing = false } = props;
  
  const [formData, setFormData] = useState({
    question: initialData?.question || '',
    answer: initialData?.answer || '',
    mediaUrl: initialData?.mediaUrl || '',
    mediaType: initialData?.mediaType || undefined as 'image' | 'audio' | 'video' | undefined,
  });
  
  const [previewQuestion, setPreviewQuestion] = useState(false);
  const [previewAnswer, setPreviewAnswer] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<'image' | 'audio' | 'video' | ''>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({ ...prev, [name]: value === '' ? undefined : value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Render media preview based on type
  const renderMediaPreview = () => {
    if (!formData.mediaUrl || !formData.mediaType) return null;

    switch (formData.mediaType) {
      case 'image':
        return <img src={formData.mediaUrl} alt="Flashcard media" style={{ maxWidth: '100%', maxHeight: '200px' }} />;
      case 'audio':
        return <audio controls src={formData.mediaUrl} style={{ width: '100%' }} />;
      case 'video':
        return <video controls src={formData.mediaUrl} style={{ maxWidth: '100%', maxHeight: '200px' }} />;
      default:
        return null;
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Box mb={3}>
        <Box display="flex" alignItems="center" mb={1}>
          <Typography variant="subtitle1">Pregunta</Typography>
          <IconButton size="small" onClick={() => setPreviewQuestion(!previewQuestion)} sx={{ ml: 1 }}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Box>
        
        {previewQuestion ? (
          <Box p={2} border={1} borderColor="divider" borderRadius={1} mb={2} minHeight={100}>
            <ReactMarkdown>{formData.question}</ReactMarkdown>
          </Box>
        ) : (
          <TextField
            name="question"
            value={formData.question}
            onChange={handleInputChange}
            multiline
            rows={4}
            fullWidth
            placeholder="Escribe la pregunta (soporta Markdown)"
            required
          />
        )}
      </Box>

      <Box mb={3}>
        <Box display="flex" alignItems="center" mb={1}>
          <Typography variant="subtitle1">Respuesta</Typography>
          <IconButton size="small" onClick={() => setPreviewAnswer(!previewAnswer)} sx={{ ml: 1 }}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Box>
        
        {previewAnswer ? (
          <Box p={2} border={1} borderColor="divider" borderRadius={1} mb={2} minHeight={100}>
            <ReactMarkdown>{formData.answer}</ReactMarkdown>
          </Box>
        ) : (
          <TextField
            name="answer"
            value={formData.answer}
            onChange={handleInputChange}
            multiline
            rows={4}
            fullWidth
            placeholder="Escribe la respuesta (soporta Markdown)"
            required
          />
        )}
      </Box>

      <Box mb={3}>
        <Typography variant="subtitle1" mb={1}>Media (opcional)</Typography>
        
        <Box display="flex" gap={2} mb={2}>
          <FormControl fullWidth>
            <InputLabel id="media-type-label">Tipo de Media</InputLabel>
            <Select
              labelId="media-type-label"
              name="mediaType"
              value={formData.mediaType || ''}
              label="Tipo de Media"
              onChange={handleSelectChange}
            >
              <MenuItem value=""><em>Ninguno</em></MenuItem>
              <MenuItem value="image">Imagen</MenuItem>
              <MenuItem value="audio">Audio</MenuItem>
              <MenuItem value="video">Video</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            name="mediaUrl"
            value={formData.mediaUrl}
            onChange={handleInputChange}
            fullWidth
            label="URL del Media"
            placeholder="https://ejemplo.com/imagen.jpg"
            disabled={!formData.mediaType}
          />
        </Box>
        
        {formData.mediaUrl && formData.mediaType && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>Vista previa:</Typography>
            {renderMediaPreview()}
          </Box>
        )}
      </Box>

      <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button variant="outlined" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" color="primary">
          {isEditing ? 'Actualizar' : 'Crear'} Tarjeta
        </Button>
      </Box>
    </Box>
  );
};

export default FlashcardForm;