import React from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import FlashcardManager from '../flashcards/FlashcardManager';
import PageLayout from '../templates/PageLayout';
import Typography from '../atoms/Typography';

/**
 * FlashcardManagerPage component
 * 
 * A page component that provides an interface for managing flashcards within a deck.
 * This page uses the FlashcardManager organism and is mapped to the /decks/:deckId route.
 */
const FlashcardManagerPage: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();

  return (
    <PageLayout>
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Flashcard Manager
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Create, edit, and organize your flashcards in this deck.
        </Typography>
        <FlashcardManager />
      </Box>
    </PageLayout>
  );
};

export default FlashcardManagerPage;