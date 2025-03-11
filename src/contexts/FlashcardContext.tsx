import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Deck, Flashcard } from '../lib/supabase';
import { ServiceFactory } from '../services/ServiceFactory';
import { IFlashcardService } from '../services/interfaces/IFlashcardService';
import { useAuth } from './AuthContext';

type FlashcardContextType = {
  // Decks
  decks: Deck[];
  loadingDecks: boolean;
  createDeck: (name: string, description: string) => Promise<Deck | null>;
  updateDeck: (id: string, name: string, description: string) => Promise<Deck | null>;
  deleteDeck: (id: string) => Promise<void>;
  
  // Flashcards
  flashcards: Flashcard[];
  loadingFlashcards: boolean;
  createFlashcard: (deckId: string, question: string, answer: string, mediaUrl?: string, mediaType?: 'image' | 'audio' | 'video') => Promise<Flashcard | null>;
  updateFlashcard: (id: string, question: string, answer: string, mediaUrl?: string, mediaType?: 'image' | 'audio' | 'video') => Promise<Flashcard | null>;
  deleteFlashcard: (id: string) => Promise<void>;
  
  // Study and Spaced Repetition
  reviewFlashcard: (id: string, difficulty: 'easy' | 'medium' | 'hard') => Promise<void>;
  getDueFlashcards: (deckId?: string) => Promise<Flashcard[]>;
  getCurrentDeckId: () => string | null;
  setCurrentDeckId: (deckId: string | null) => void;
  
  // Arcade Mode
  getAllFlashcards: () => Promise<Flashcard[]>;
};

const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

export function FlashcardProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loadingDecks, setLoadingDecks] = useState(true);
  const [loadingFlashcards, setLoadingFlashcards] = useState(true);
  const [currentDeckId, setCurrentDeckId] = useState<string | null>(null);

  // Get the flashcard service from the ServiceFactory
  const flashcardService: IFlashcardService = ServiceFactory.getInstance().getFlashcardService();

  // Fetch user's decks on mount
  useEffect(() => {
    const fetchDecks = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await flashcardService.getDecks();

        if (error) throw error;
        setDecks(data || []);
      } catch (error) {
        console.error('Error fetching decks:', error);
      } finally {
        setLoadingDecks(false);
      }
    };

    fetchDecks();
  }, [user]);

  // Fetch flashcards when currentDeckId changes
  useEffect(() => {
    const fetchFlashcards = async () => {
      if (!currentDeckId) {
        setFlashcards([]);
        setLoadingFlashcards(false);
        return;
      }

      setLoadingFlashcards(true);
      try {
        const { data, error } = await flashcardService.getFlashcards(currentDeckId);

        if (error) throw error;
        setFlashcards(data || []);
      } catch (error) {
        console.error('Error fetching flashcards:', error);
      } finally {
        setLoadingFlashcards(false);
      }
    };

    fetchFlashcards();
  }, [currentDeckId]);

  // Deck CRUD operations
  const createDeck = async (name: string, description: string): Promise<Deck | null> => {
    try {
      const { data, error } = await flashcardService.createDeck(name, description);

      if (error) throw error;
      
      // Update local state
      if (data) {
        setDecks((prevDecks) => [data, ...prevDecks]);
      }
      return data;
    } catch (error) {
      console.error('Error creating deck:', error);
      return null;
    }
  };

  const updateDeck = async (id: string, name: string, description: string): Promise<Deck | null> => {
    try {
      const { data, error } = await flashcardService.updateDeck(id, name, description);

      if (error) throw error;
      
      // Update local state
      if (data) {
        setDecks((prevDecks) =>
          prevDecks.map((deck) => (deck.id === id ? data : deck))
        );
      }
      
      return data;
    } catch (error) {
      console.error('Error updating deck:', error);
      return null;
    }
  };

  const deleteDeck = async (id: string): Promise<void> => {
    try {
      const { error } = await flashcardService.deleteDeck(id);
      if (error) throw error;
      
      // Update local state
      setDecks((prevDecks) => prevDecks.filter((deck) => deck.id !== id));
      
      // If the deleted deck was the current deck, reset currentDeckId
      if (currentDeckId === id) {
        setCurrentDeckId(null);
      }
    } catch (error) {
      console.error('Error deleting deck:', error);
    }
  };

  // Flashcard CRUD operations
  const createFlashcard = async (
    deckId: string,
    question: string,
    answer: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'audio' | 'video'
  ): Promise<Flashcard | null> => {
    try {
      const { data, error } = await flashcardService.createFlashcard(
        deckId,
        question,
        answer,
        mediaUrl,
        mediaType
      );

      if (error) throw error;
      
      // Update local state if the created flashcard belongs to the current deck
      if (data && deckId === currentDeckId) {
        setFlashcards((prevFlashcards) => [data, ...prevFlashcards]);
      }
      
      return data;
    } catch (error) {
      console.error('Error creating flashcard:', error);
      return null;
    }
  };

  const updateFlashcard = async (
    id: string,
    question: string,
    answer: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'audio' | 'video'
  ): Promise<Flashcard | null> => {
    try {
      const { data, error } = await flashcardService.updateFlashcard(
        id,
        question,
        answer,
        mediaUrl,
        mediaType
      );

      if (error) throw error;
      
      // Update local state
      if (data) {
        setFlashcards((prevFlashcards) =>
          prevFlashcards.map((flashcard) => (flashcard.id === id ? data : flashcard))
        );
      }
      
      return data;
    } catch (error) {
      console.error('Error updating flashcard:', error);
      return null;
    }
  };

  const deleteFlashcard = async (id: string): Promise<void> => {
    try {
      const { error } = await flashcardService.deleteFlashcard(id);
      if (error) throw error;
      
      // Update local state
      setFlashcards((prevFlashcards) => prevFlashcards.filter((flashcard) => flashcard.id !== id));
    } catch (error) {
      console.error('Error deleting flashcard:', error);
    }
  };

  // Study and Spaced Repetition functions
  const reviewFlashcard = async (id: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<void> => {
    try {
      const { data, error } = await flashcardService.reviewFlashcard(id, difficulty);

      if (error) throw error;
      
      // Update local state
      if (data) {
        setFlashcards((prevFlashcards) =>
          prevFlashcards.map((flashcard) => (flashcard.id === id ? data : flashcard))
        );
      }
    } catch (error) {
      console.error('Error reviewing flashcard:', error);
    }
  };

  const getDueFlashcards = async (deckId?: string): Promise<Flashcard[]> => {
    try {
      const { data, error } = await flashcardService.getDueFlashcards(deckId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching due flashcards:', error);
      return [];
    }
  };

  // Get all flashcards from all decks for arcade mode
  const getAllFlashcards = async (): Promise<Flashcard[]> => {
    try {
      const { data, error } = await flashcardService.getAllFlashcards();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all flashcards:', error);
      return [];
    }
  };

  return (
    <FlashcardContext.Provider
      value={{
        decks,
        loadingDecks,
        createDeck,
        updateDeck,
        deleteDeck,
        flashcards,
        loadingFlashcards,
        createFlashcard,
        updateFlashcard,
        deleteFlashcard,
        reviewFlashcard,
        getDueFlashcards,
        getCurrentDeckId: () => currentDeckId,
        setCurrentDeckId,
        getAllFlashcards,
      }}
    >
      {children}
    </FlashcardContext.Provider>
  );
}

export function useFlashcards() {
  const context = useContext(FlashcardContext);
  if (context === undefined) {
    throw new Error('useFlashcards must be used within a FlashcardProvider');
  }
  return context;
}