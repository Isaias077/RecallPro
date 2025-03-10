import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

type StreakContextType = {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  streakFreezes: number;
  achievements: Achievement[];
  updateStreak: () => Promise<void>;
  useStreakFreeze: () => Promise<boolean>;
  earnStreakFreeze: () => Promise<void>;
};

type Achievement = {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  milestone: number;
  category: 'progress' | 'streak' | 'knowledge' | 'precision' | 'study_time' | 'consistency';
  condition: 'sessions' | 'cards_per_day' | 'total_cards' | 'consecutive_days' | 'streak_days' | 
            'decks_created' | 'cards_created' | 'session_accuracy' | 'monthly_accuracy' | 
            'session_minutes' | 'daily_minutes' | 'total_minutes' | 'on_time_reviews' | 
            'all_daily_reviews' | 'days_without_overdue';
};

type UserStreak = {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null;
  streak_freezes: number;
  created_at: string;
};

const StreakContext = createContext<StreakContextType | undefined>(undefined);

// Helper function to check if a date is today
const isToday = (date: string) => {
  const today = new Date();
  const compareDate = new Date(date);
  return (
    compareDate.getDate() === today.getDate() &&
    compareDate.getMonth() === today.getMonth() &&
    compareDate.getFullYear() === today.getFullYear()
  );
};

// Helper function to check if a date is yesterday
const isYesterday = (date: string) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const compareDate = new Date(date);
  return (
    compareDate.getDate() === yesterday.getDate() &&
    compareDate.getMonth() === yesterday.getMonth() &&
    compareDate.getFullYear() === yesterday.getFullYear()
  );
};

// Predefined achievements
const ACHIEVEMENTS = [
  // Progress Achievements 🎯
  {
    id: 'first-step',
    name: 'Primer Paso 🏁',
    description: 'Completa tu primera sesión de estudio.',
    unlocked: false,
    milestone: 1,
    category: 'progress',
    condition: 'sessions',
  },
  {
    id: 'getting-started',
    name: 'En Marcha 🚀',
    description: 'Estudia 10 tarjetas en un día.',
    unlocked: false,
    milestone: 10,
    category: 'progress',
    condition: 'cards_per_day',
  },
  {
    id: 'review-master',
    name: 'Maestro del Repaso 📖',
    description: 'Revisa 100 tarjetas en total.',
    unlocked: false,
    milestone: 100,
    category: 'progress',
    condition: 'total_cards',
  },
  {
    id: 'repetition-expert',
    name: 'Experto en Repetición 🔄',
    description: 'Supera las 1,000 tarjetas repasadas.',
    unlocked: false,
    milestone: 1000,
    category: 'progress',
    condition: 'total_cards',
  },
  {
    id: 'study-marathon',
    name: 'Maratón de Estudio 🔥',
    description: 'Estudia por 7 días seguidos.',
    unlocked: false,
    milestone: 7,
    category: 'progress',
    condition: 'consecutive_days',
  },
  
  // Streak Achievements ⏳
  {
    id: 'day-1',
    name: 'Día 1 📆',
    description: 'Completa una sesión dos días seguidos.',
    unlocked: false,
    milestone: 2,
    category: 'streak',
    condition: 'streak_days',
  },
  {
    id: 'weekly-commitment',
    name: 'Compromiso Semanal 📅',
    description: 'Mantén una racha de 7 días.',
    unlocked: false,
    milestone: 7,
    category: 'streak',
    condition: 'streak_days',
  },
  {
    id: 'monthly-dedication',
    name: 'Dedicación Mensual 🏅',
    description: 'Mantén una racha de 30 días.',
    unlocked: false,
    milestone: 30,
    category: 'streak',
    condition: 'streak_days',
  },
  {
    id: 'never-fails',
    name: 'Nunca Falla 💎',
    description: 'Mantén una racha de 100 días.',
    unlocked: false,
    milestone: 100,
    category: 'streak',
    condition: 'streak_days',
  },
  
  // Knowledge Achievements 📚
  {
    id: 'first-deck',
    name: 'Primer Mazo 🃏',
    description: 'Crea tu primer mazo de tarjetas.',
    unlocked: false,
    milestone: 1,
    category: 'knowledge',
    condition: 'decks_created',
  },
  {
    id: 'knowledge-architect',
    name: 'Arquitecto del Conocimiento 🏗',
    description: 'Crea 10 mazos.',
    unlocked: false,
    milestone: 10,
    category: 'knowledge',
    condition: 'decks_created',
  },
  {
    id: 'knowledge-bank',
    name: 'Banco de Conocimiento 🎓',
    description: 'Crea 100 tarjetas en total.',
    unlocked: false,
    milestone: 100,
    category: 'knowledge',
    condition: 'cards_created',
  },
  {
    id: 'card-king',
    name: 'Rey de las Tarjetas 👑',
    description: 'Crea 1,000 tarjetas.',
    unlocked: false,
    milestone: 1000,
    category: 'knowledge',
    condition: 'cards_created',
  },
  
  // Precision Achievements 🎯
  {
    id: 'good-memory',
    name: 'Buena Memoria 🧠',
    description: 'Responde correctamente el 70% de las tarjetas en una sesión.',
    unlocked: false,
    milestone: 70,
    category: 'precision',
    condition: 'session_accuracy',
  },
  {
    id: 'elephant-memory',
    name: 'Memoria de Elefante 🏆',
    description: 'Responde correctamente el 90% en una sesión.',
    unlocked: false,
    milestone: 90,
    category: 'precision',
    condition: 'session_accuracy',
  },
  {
    id: 'memory-genius',
    name: 'Genio del Recuerdo 🌟',
    description: 'Mantén un promedio del 95% en 30 días.',
    unlocked: false,
    milestone: 95,
    category: 'precision',
    condition: 'monthly_accuracy',
  },
  
  // Study Time Achievements ⏱
  {
    id: 'mini-session',
    name: 'Mini sesión ⏳',
    description: 'Estudia al menos 5 minutos en una sesión.',
    unlocked: false,
    milestone: 5,
    category: 'study_time',
    condition: 'session_minutes',
  },
  {
    id: 'total-focus',
    name: 'Foco Total ⏰',
    description: 'Estudia 25 minutos seguidos (Pomodoro).',
    unlocked: false,
    milestone: 25,
    category: 'study_time',
    condition: 'session_minutes',
  },
  {
    id: 'intense-mode',
    name: 'Modo Intenso 🔥',
    description: 'Estudia 1 hora en un solo día.',
    unlocked: false,
    milestone: 60,
    category: 'study_time',
    condition: 'daily_minutes',
  },
  {
    id: 'study-marathon-time',
    name: 'Maratón de Estudio 💪',
    description: 'Acumula 10 horas totales de estudio.',
    unlocked: false,
    milestone: 600,
    category: 'study_time',
    condition: 'total_minutes',
  },
  
  // Consistency Achievements 🔔
  {
    id: 'just-in-time',
    name: 'Revisión Justo a Tiempo ⏲',
    description: 'Revisa una tarjeta justo cuando estaba programada.',
    unlocked: false,
    milestone: 1,
    category: 'consistency',
    condition: 'on_time_reviews',
  },
  {
    id: 'always-on-time',
    name: 'Siempre a Tiempo ⏳',
    description: 'Revisa todas las tarjetas pendientes en el día.',
    unlocked: false,
    milestone: 1,
    category: 'consistency',
    condition: 'all_daily_reviews',
  },
  {
    id: 'no-debts',
    name: 'Sin Deudas ✅',
    description: 'Mantén 0 tarjetas atrasadas por una semana.',
    unlocked: false,
    milestone: 7,
    category: 'consistency',
    condition: 'days_without_overdue',
  },
];

export function StreakProvider({ children }: { children: ReactNode }) {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [lastStudyDate, setLastStudyDate] = useState<string | null>(null);
  const [streakFreezes, setStreakFreezes] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);

  // Initialize streak data
  useEffect(() => {
    const initializeStreak = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session?.user) return;

        // Check if user has streak data
        const { data: streakData, error } = await supabase
          .from('user_streaks')
          .select('*')
          .eq('user_id', session.session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching streak data:', error);
          return;
        }

        if (!streakData) {
          try {
            // Create initial streak data for new user
            const { data: newStreakData, error: createError } = await supabase
              .from('user_streaks')
              .insert([
                {
                  user_id: session.session.user.id,
                  current_streak: 0,
                  longest_streak: 0,
                  streak_freezes: 1, // Start with one free streak freeze
                },
              ])
              .select()
              .single();

            if (createError) throw createError;
            
            setCurrentStreak(0);
            setLongestStreak(0);
            setLastStudyDate(null);
            setStreakFreezes(1);
          } catch (insertError: any) {
            // If we get a duplicate key error, the record already exists
            // This can happen due to race conditions or multiple tabs
            if (insertError.code === '23505') {
              // Fetch the existing record
              const { data: existingData, error: fetchError } = await supabase
                .from('user_streaks')
                .select('*')
                .eq('user_id', session.session.user.id)
                .single();
              
              if (fetchError) throw fetchError;
              
              // Update state with existing data
              setCurrentStreak(existingData.current_streak);
              setLongestStreak(existingData.longest_streak);
              setLastStudyDate(existingData.last_study_date);
              setStreakFreezes(existingData.streak_freezes);
              
              // Update achievements based on longest streak
              setAchievements(prev =>
                prev.map(achievement => ({
                  ...achievement,
                  unlocked: existingData.longest_streak >= achievement.milestone,
                }))
              );
            } else {
              // If it's not a duplicate key error, rethrow
              throw insertError;
            }
          }
        } else {
          setCurrentStreak(streakData.current_streak);
          setLongestStreak(streakData.longest_streak);
          setLastStudyDate(streakData.last_study_date);
          setStreakFreezes(streakData.streak_freezes);

          // Update achievements based on longest streak
          setAchievements(prev =>
            prev.map(achievement => ({
              ...achievement,
              unlocked: streakData.longest_streak >= achievement.milestone,
            }))
          );
        }
      } catch (error) {
        console.error('Error initializing streak:', error);
      }
    };

    initializeStreak();
  }, []);

  // Update streak when user completes a study session
  const updateStreak = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) return;

      const now = new Date().toISOString();
      let newCurrentStreak = currentStreak;
      let newLongestStreak = longestStreak;

      if (lastStudyDate && isToday(lastStudyDate)) {
        // Already studied today, just update the last_study_date
        const { error } = await supabase
          .from('user_streaks')
          .update({
            last_study_date: now,
          })
          .eq('user_id', session.session.user.id);

        if (error) throw error;
        setLastStudyDate(now);
        return;
      } else if (!lastStudyDate || lastStudyDate === null) {
        // First time studying, set streak to 1
        newCurrentStreak = 1;
      } else if (isYesterday(lastStudyDate)) {
        // Studied yesterday, increment streak
        newCurrentStreak += 1;
      } else {
        // Streak broken, check if streak freeze is available
        if (streakFreezes > 0) {
          // Use streak freeze
          newCurrentStreak += 1;
          await useStreakFreeze();
        } else {
          // Reset streak
          newCurrentStreak = 1;
        }
      }

      // Update longest streak if current streak is longer
      if (newCurrentStreak > newLongestStreak) {
        newLongestStreak = newCurrentStreak;
      }

      // Update database
      const { error } = await supabase
        .from('user_streaks')
        .update({
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          last_study_date: now,
        })
        .eq('user_id', session.session.user.id);

      if (error) throw error;

      // Update local state
      setCurrentStreak(newCurrentStreak);
      setLongestStreak(newLongestStreak);
      setLastStudyDate(now);

      // Check for new achievements based on their category and condition
      setAchievements(prev =>
        prev.map(achievement => {
          let unlocked = achievement.unlocked;
          
          // Only process achievements that aren't already unlocked
          if (!unlocked) {
            switch (achievement.category) {
              case 'streak':
                if (achievement.condition === 'streak_days' && newCurrentStreak >= achievement.milestone) {
                  unlocked = true;
                }
                break;
              
              case 'progress':
                if (achievement.condition === 'sessions') {
                  // First session achievement
                  unlocked = true; // Unlock on first session
                }
                // Other progress achievements would need additional tracking
                break;
              
              // Other categories would need additional data tracking
              // This is a placeholder for future implementation
            }
          }
          
          return {
            ...achievement,
            unlocked,
          };
        })
      );

      // Award streak freeze at certain milestones
      if (newCurrentStreak === 7 || newCurrentStreak === 30) {
        await earnStreakFreeze();
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  // Use a streak freeze
  const useStreakFreeze = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) return false;

      if (streakFreezes <= 0) return false;

      const { error } = await supabase
        .from('user_streaks')
        .update({
          streak_freezes: streakFreezes - 1,
        })
        .eq('user_id', session.session.user.id);

      if (error) throw error;

      setStreakFreezes(prev => prev - 1);
      return true;
    } catch (error) {
      console.error('Error using streak freeze:', error);
      return false;
    }
  };

  // Earn a streak freeze
  const earnStreakFreeze = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) return;

      const { error } = await supabase
        .from('user_streaks')
        .update({
          streak_freezes: streakFreezes + 1,
        })
        .eq('user_id', session.session.user.id);

      if (error) throw error;

      setStreakFreezes(prev => prev + 1);
    } catch (error) {
      console.error('Error earning streak freeze:', error);
    }
  };

  const value = {
    currentStreak,
    longestStreak,
    lastStudyDate,
    streakFreezes,
    achievements,
    updateStreak,
    useStreakFreeze,
    earnStreakFreeze,
  };

  return <StreakContext.Provider value={value}>{children}</StreakContext.Provider>;
}

export function useStreak() {
  const context = useContext(StreakContext);
  if (context === undefined) {
    throw new Error('useStreak must be used within a StreakProvider');
  }
  return context;
}