import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, Deck, Flashcard } from '../lib/supabase';

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

// Helper function to calculate next review date based on difficulty
const calculateNextReviewDate = (difficulty: 'easy' | 'medium' | 'hard'): string => {
  const now = new Date();
  let daysToAdd = 1; // Default (hard)
  
  if (difficulty === 'medium') {
    daysToAdd = 3;
  } else if (difficulty === 'easy') {
    daysToAdd = 7;
  }
  
  now.setDate(now.getDate() + daysToAdd);
  return now.toISOString();
};

export function FlashcardProvider({ children }: { children: ReactNode }) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loadingDecks, setLoadingDecks] = useState(true);
  const [loadingFlashcards, setLoadingFlashcards] = useState(true);
  const [currentDeckId, setCurrentDeckId] = useState<string | null>(null);

  // Fetch user's decks on mount
  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session?.user) return;

        const { data, error } = await supabase
          .from('decks')
          .select('*')
          .eq('user_id', session.session.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDecks(data || []);
      } catch (error) {
        console.error('Error fetching decks:', error);
      } finally {
        setLoadingDecks(false);
      }
    };

    fetchDecks();
  }, []);

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
        const { data, error } = await supabase
          .from('flashcards')
          .select('*')
          .eq('deck_id', currentDeckId)
          .order('created_at', { ascending: false });

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
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) return null;

      const { data, error } = await supabase
        .from('decks')
        .insert([
          {
            name,
            description,
            user_id: session.session.user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setDecks((prevDecks) => [data, ...prevDecks]);
      return data;
    } catch (error) {
      console.error('Error creating deck:', error);
      return null;
    }
  };

  const updateDeck = async (id: string, name: string, description: string): Promise<Deck | null> => {
    try {
      const { data, error } = await supabase
        .from('decks')
        .update({ name, description })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setDecks((prevDecks) =>
        prevDecks.map((deck) => (deck.id === id ? data : deck))
      );
      
      return data;
    } catch (error) {
      console.error('Error updating deck:', error);
      return null;
    }
  };

  const deleteDeck = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase.from('decks').delete().eq('id', id);
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
      const hasMedia = !!mediaUrl;
      
      const { data, error } = await supabase
        .from('flashcards')
        .insert([
          {
            deck_id: deckId,
            question,
            answer,
            review_count: 0,
            success_rate: 0,
            difficulty: 'medium',
            has_media: hasMedia,
            media_url: mediaUrl,
            media_type: mediaType,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      
      // Update local state if the created flashcard belongs to the current deck
      if (deckId === currentDeckId) {
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
      const hasMedia = !!mediaUrl;
      
      const { data, error } = await supabase
        .from('flashcards')
        .update({
          question,
          answer,
          has_media: hasMedia,
          media_url: mediaUrl,
          media_type: mediaType,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setFlashcards((prevFlashcards) =>
        prevFlashcards.map((flashcard) => (flashcard.id === id ? data : flashcard))
      );
      
      return data;
    } catch (error) {
      console.error('Error updating flashcard:', error);
      return null;
    }
  };

  const deleteFlashcard = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase.from('flashcards').delete().eq('id', id);
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
      // Get the current flashcard to update its review stats
      const flashcard = flashcards.find((f) => f.id === id);
      if (!flashcard) return;

      const now = new Date().toISOString();
      const nextReviewDate = calculateNextReviewDate(difficulty);
      const newReviewCount = (flashcard.review_count || 0) + 1;
      
      // Calculate new success rate based on difficulty
      // Easy and Medium are considered successful reviews
      const isSuccessful = difficulty === 'easy' || difficulty === 'medium';
      const successCount = isSuccessful ? 1 : 0;
      const newSuccessRate = ((flashcard.success_rate || 0) * (newReviewCount - 1) + successCount) / newReviewCount;

      const { data, error } = await supabase
        .from('flashcards')
        .update({
          last_reviewed_at: now,
          next_review_date: nextReviewDate,
          review_count: newReviewCount,
          success_rate: newSuccessRate,
          difficulty,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setFlashcards((prevFlashcards) =>
        prevFlashcards.map((flashcard) => (flashcard.id === id ? data : flashcard))
      );
    } catch (error) {
      console.error('Error reviewing flashcard:', error);
    }
  };

  const getDueFlashcards = async (deckId?: string): Promise<Flashcard[]> => {
    try {
      const today = new Date().toISOString();
      let query = supabase
        .from('flashcards')
        .select('*')
        .or(`next_review_date.lte.${today},next_review_date.is.null`);

      // Filter by deck if deckId is provided
      if (deckId) {
        query = query.eq('deck_id', deckId);
      }

      const { data, error } = await query;

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
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) return [];

      const { data, error } = await supabase
        .from('flashcards')
        .select('*, decks!inner(*)')
        .eq('decks.user_id', session.session.user.id);

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
        getAllFlashcards, // Add the new function to the context
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