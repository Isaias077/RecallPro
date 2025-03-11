/**
 * Interface for Flashcard Service
 * Following the Interface Segregation Principle (ISP) and Dependency Inversion Principle (DIP)
 */
import { Deck, Flashcard } from '../../lib/supabase';

export interface IFlashcardService {
  /**
   * Get all decks for the current user
   */
  getDecks(): Promise<{
    data: Deck[] | null;
    error: Error | null;
  }>;

  /**
   * Create a new deck
   * @param name Deck name
   * @param description Deck description
   */
  createDeck(name: string, description: string): Promise<{
    data: Deck | null;
    error: Error | null;
  }>;

  /**
   * Update an existing deck
   * @param id Deck ID
   * @param name Deck name
   * @param description Deck description
   */
  updateDeck(id: string, name: string, description: string): Promise<{
    data: Deck | null;
    error: Error | null;
  }>;

  /**
   * Delete a deck
   * @param id Deck ID
   */
  deleteDeck(id: string): Promise<{
    error: Error | null;
  }>;

  /**
   * Get all flashcards for a deck
   * @param deckId Deck ID
   */
  getFlashcards(deckId: string): Promise<{
    data: Flashcard[] | null;
    error: Error | null;
  }>;

  /**
   * Create a new flashcard
   * @param deckId Deck ID
   * @param question Flashcard question
   * @param answer Flashcard answer
   * @param mediaUrl Optional media URL
   * @param mediaType Optional media type
   */
  createFlashcard(
    deckId: string,
    question: string,
    answer: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'audio' | 'video'
  ): Promise<{
    data: Flashcard | null;
    error: Error | null;
  }>;

  /**
   * Update an existing flashcard
   * @param id Flashcard ID
   * @param question Flashcard question
   * @param answer Flashcard answer
   * @param mediaUrl Optional media URL
   * @param mediaType Optional media type
   */
  updateFlashcard(
    id: string,
    question: string,
    answer: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'audio' | 'video'
  ): Promise<{
    data: Flashcard | null;
    error: Error | null;
  }>;

  /**
   * Delete a flashcard
   * @param id Flashcard ID
   */
  deleteFlashcard(id: string): Promise<{
    error: Error | null;
  }>;

  /**
   * Update flashcard review data
   * @param id Flashcard ID
   * @param difficulty Review difficulty
   */
  reviewFlashcard(id: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<{
    data: Flashcard | null;
    error: Error | null;
  }>;

  /**
   * Get flashcards due for review
   * @param deckId Optional deck ID to filter by
   */
  getDueFlashcards(deckId?: string): Promise<{
    data: Flashcard[] | null;
    error: Error | null;
  }>;
  
  /**
   * Get all flashcards from all decks
   */
  getAllFlashcards(): Promise<{
    data: Flashcard[] | null;
    error: Error | null;
  }>;
}