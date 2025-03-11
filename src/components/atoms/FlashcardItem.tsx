import { Card, CardContent, Box, Typography } from '@mui/material';
import { forwardRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

export interface FlashcardItemProps {
  question: string;
  answer: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'video';
  flipped?: boolean;
  onFlip?: () => void;
}

/**
 * FlashcardItem atom component that displays a single flashcard with question and answer.
 * This is an atomic component that serves as a building block for flashcard features.
 */
export const FlashcardItem = forwardRef<HTMLDivElement, FlashcardItemProps>((props, ref) => {
  const { question, answer, mediaUrl, mediaType, flipped = false, onFlip } = props;
  const [isFlipped, setIsFlipped] = useState(flipped);
  
  const handleFlip = () => {
    const newFlippedState = !isFlipped;
    setIsFlipped(newFlippedState);
    if (onFlip) {
      onFlip();
    }
  };

  // Render media based on type
  const renderMedia = () => {
    if (!mediaUrl) return null;

    switch (mediaType) {
      case 'image':
        return <img src={mediaUrl} alt="Flashcard media" style={{ maxWidth: '100%', maxHeight: '200px', marginBottom: '16px' }} />;
      case 'audio':
        return <audio controls src={mediaUrl} style={{ width: '100%', marginBottom: '16px' }} />;
      case 'video':
        return <video controls src={mediaUrl} style={{ maxWidth: '100%', maxHeight: '200px', marginBottom: '16px' }} />;
      default:
        return null;
    }
  };

  return (
    <Card 
      ref={ref}
      onClick={handleFlip}
      sx={{
        minHeight: 200,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'transform 0.6s',
        transformStyle: 'preserve-3d',
        position: 'relative',
        backgroundColor: isFlipped ? '#f5f5f5' : 'white',
      }}
    >
      <CardContent>
        {renderMedia()}
        <Box>
          {isFlipped ? (
            <Typography component="div">
              <ReactMarkdown>{answer}</ReactMarkdown>
            </Typography>
          ) : (
            <Typography component="div">
              <ReactMarkdown>{question}</ReactMarkdown>
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
});

FlashcardItem.displayName = 'FlashcardItem';

export default FlashcardItem;