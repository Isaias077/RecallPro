import { supabase, Deck, Flashcard } from '../../lib/supabase';

/**
 * Supabase implementation of the Flashcard Service
 * Following the Single Responsibility Principle (SRP) by handling only flashcard operations
 */
export class SupabaseFlashcardService {
    /**
     * Get all decks for the current user
     */
    async getDecks(): Promise<{
        data: Deck[] | null;
        error: Error | null;
    }> {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session?.user) {
            return { data: null, error: new Error('User not authenticated') };
        }

        const { data, error } = await supabase
            .from('decks')
            .select('*')
            .eq('user_id', session.session.user.id)
            .order('created_at', { ascending: false });

        return { data: data as Deck[] || null, error: error };
    }

    /**
     * Create a new deck
     * @param name Deck name
     * @param description Deck description
     */
    async createDeck(name: string, description: string): Promise<{
        data: Deck | null;
        error: Error | null;
    }> {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session?.user) {
            return { data: null, error: new Error('User not authenticated') };
        }

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

        return { data: data as Deck || null, error: error };
    }

    /**
     * Update an existing deck
     * @param id Deck ID
     * @param name Deck name
     * @param description Deck description
     */
    async updateDeck(id: string, name: string, description: string): Promise<{
        data: Deck | null;
        error: Error | null;
    }> {
        const { data, error } = await supabase
            .from('decks')
            .update({ name, description })
            .eq('id', id)
            .select()
            .single();

        return { data: data as Deck || null, error: error };
    }

    /**
     * Delete a deck
     * @param id Deck ID
     */
    async deleteDeck(id: string): Promise<{
        error: Error | null;
    }> {
        const { error } = await supabase.from('decks').delete().eq('id', id);
        return { error };
    }

    /**
     * Get all flashcards for a deck
     * @param deckId Deck ID
     */
    async getFlashcards(deckId: string): Promise<{
        data: Flashcard[] | null;
        error: Error | null;
    }> {
        const { data, error } = await supabase
            .from('flashcards')
            .select('*')
            .eq('deck_id', deckId)
            .order('created_at', { ascending: false });

        return { data: data as Flashcard[] || null, error: error };
    }

    /**
     * Create a new flashcard
     * @param deckId Deck ID
     * @param question Flashcard question
     * @param answer Flashcard answer
     * @param mediaUrl Optional media URL
     * @param mediaType Optional media type
     */
    async createFlashcard(
        deckId: string,
        question: string,
        answer: string,
        mediaUrl?: string,
        mediaType?: 'image' | 'audio' | 'video'
    ): Promise<{
        data: Flashcard | null;
        error: Error | null;
    }> {
        const hasMedia = !!mediaUrl && !!mediaType;

        const { data, error } = await supabase
            .from('flashcards')
            .insert([
                {
                    deck_id: deckId,
                    question,
                    answer,
                    has_media: hasMedia,
                    media_url: mediaUrl,
                    media_type: mediaType,
                    next_review_date: new Date().toISOString(),
                },
            ])
            .select()
            .single();

        return { data: data as Flashcard || null, error: error };
    }

    /**
     * Update an existing flashcard
     * @param id Flashcard ID
     * @param question Flashcard question
     * @param answer Flashcard answer
     * @param mediaUrl Optional media URL
     * @param mediaType Optional media type
     */
    async updateFlashcard(
        id: string,
        question: string,
        answer: string,
        mediaUrl?: string,
        mediaType?: 'image' | 'audio' | 'video'
    ): Promise<{
        data: Flashcard | null;
        error: Error | null;
    }> {
        const hasMedia = !!mediaUrl && !!mediaType;

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

        return { data: data as Flashcard || null, error: error };
    }

    /**
     * Delete a flashcard
     * @param id Flashcard ID
     */
    async deleteFlashcard(id: string): Promise<{
        error: Error | null;
    }> {
        const { error } = await supabase.from('flashcards').delete().eq('id', id);
        return { error };
    }

    /**
     * Update flashcard review data
     * @param id Flashcard ID
     * @param difficulty Review difficulty
     */
    async reviewFlashcard(id: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<{
        error: Error | null;
    }> {
        // Calculate next review date based on difficulty
        const now = new Date();
        let daysToAdd = 1; // Default (hard)

        if (difficulty === 'medium') {
            daysToAdd = 3;
        } else if (difficulty === 'easy') {
            daysToAdd = 7;
        }

        now.setDate(now.getDate() + daysToAdd);
        const nextReviewDate = now.toISOString();

        // Get current flashcard data
        const { data: flashcard, error: fetchError } = await supabase
            .from('flashcards')
            .select('review_count, success_rate')
            .eq('id', id)
            .single();

        if (fetchError) {
            return { error: fetchError };
        }

        // Calculate new success rate
        const reviewCount = (flashcard?.review_count || 0) + 1;
        let successRate = flashcard?.success_rate || 0;

        if (difficulty === 'easy') {
            successRate = ((successRate * (reviewCount - 1)) + 1) / reviewCount;
        } else if (difficulty === 'medium') {
            successRate = ((successRate * (reviewCount - 1)) + 0.5) / reviewCount;
        } else {
            successRate = ((successRate * (reviewCount - 1)) + 0) / reviewCount;
        }

        // Update flashcard
        const { error } = await supabase
            .from('flashcards')
            .update({
                last_reviewed_at: new Date().toISOString(),
                next_review_date: nextReviewDate,
                review_count: reviewCount,
                success_rate: successRate,
                difficulty,
            })
            .eq('id', id);

        return { error };
    }

    /**
     * Get flashcards due for review
     * @param deckId Optional deck ID to filter by
     */
    async getDueFlashcards(deckId?: string): Promise<{
        data: Flashcard[] | null;
        error: Error | null;
    }> {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session?.user) {
            return { data: null, error: new Error('User not authenticated') };
        }

        let query = supabase
            .from('flashcards')
            .select('*, decks!inner(*)')
            .eq('decks.user_id', session.session.user.id)
            .lte('next_review_date', new Date().toISOString());

        if (deckId) {
            query = query.eq('deck_id', deckId);
        }

        const { data, error } = await query;

        return {
            data: data ? data.map(item => ({
                ...item,
                deck: undefined // Remove the joined deck data
            })) as Flashcard[] : null,
            error
        };
    }
}