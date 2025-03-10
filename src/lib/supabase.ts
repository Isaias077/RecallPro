import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = 'https://mnbguwsquhvdqbcqbbqm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uYmd1d3NxdWh2ZHFiY3FiYnFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODQyNzcsImV4cCI6MjA1NzA2MDI3N30.D4GUoRZOcA3PMBJFrXvn47kwSGBXoXaVElHJEvUpx9Y';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export type User = {
  id: string;
  email: string;
  created_at: string;
};

export type Deck = {
  id: string;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
};

export type Flashcard = {
  id: string;
  deck_id: string;
  question: string;
  answer: string;
  created_at: string;
  last_reviewed_at: string | null;
  next_review_date: string | null;
  review_count: number;
  success_rate: number;
  difficulty: 'easy' | 'medium' | 'hard';
  has_media: boolean;
  media_url?: string;
  media_type?: 'image' | 'audio' | 'video';
};

export type StudySession = {
  id: string;
  user_id: string;
  deck_id: string;
  start_time: string;
  end_time: string | null;
  cards_studied: number;
  correct_answers: number;
};