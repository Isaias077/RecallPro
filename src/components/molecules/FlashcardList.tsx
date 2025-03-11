import { Grid } from '@mui/material';
import FlashcardItem from '../atoms/FlashcardItem';

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'video';
}

export interface FlashcardListProps {
  flashcards: Flashcard[];
  onFlip?: (id: string) => void;
}

/**
 * FlashcardList molecule component that displays a grid of flashcards.
 * This component combines multiple FlashcardItem atoms to create a collection view.
 */
export const FlashcardList = (props: FlashcardListProps) => {
  const { flashcards, onFlip } = props;
  
  return (
    <Grid container spacing={3}>
      {flashcards.map((flashcard) => (
        <Grid item xs={12} sm={6} md={4} key={flashcard.id}>
          <FlashcardItem
            question={flashcard.question}
            answer={flashcard.answer}
            mediaUrl={flashcard.mediaUrl}
            mediaType={flashcard.mediaType}
            onFlip={() => onFlip && onFlip(flashcard.id)}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default FlashcardList;