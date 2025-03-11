import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ServiceFactory } from '../services/ServiceFactory';
import { IStreakService, Achievement } from '../services/interfaces/IStreakService';
import { useAuth } from './AuthContext';

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

const StreakContext = createContext<StreakContextType | undefined>(undefined);

// Helper function to check if a date is today
export const isToday = (date: string) => {
  const today = new Date();
  const compareDate = new Date(date);
  return (
    compareDate.getDate() === today.getDate() &&
    compareDate.getMonth() === today.getMonth() &&
    compareDate.getFullYear() === today.getFullYear()
  );
};

// Helper function to check if a date is yesterday
export const isYesterday = (date: string) => {
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
export const ACHIEVEMENTS = [
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
  const { user } = useAuth();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [lastStudyDate, setLastStudyDate] = useState<string | null>(null);
  const [streakFreezes, setStreakFreezes] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Get the streak service from the ServiceFactory
  const streakService: IStreakService = ServiceFactory.getInstance().getStreakService();

  // Initialize streak data
  useEffect(() => {
    const initializeStreak = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await streakService.getStreakData();

        if (error) throw error;
        if (data) {
          setCurrentStreak(data.currentStreak);
          setLongestStreak(data.longestStreak);
          setLastStudyDate(data.lastStudyDate);
          setStreakFreezes(data.streakFreezes);
          setAchievements(data.achievements);
        }
      } catch (error) {
        console.error('Error initializing streak:', error);
      }
    };

    initializeStreak();
  }, [user]);

  // Update streak when user completes a study session
  const updateStreak = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await streakService.updateStreak();

      if (error) throw error;
      if (data) {
        setCurrentStreak(data.currentStreak);
        // Update longest streak if needed
        if (data.currentStreak > longestStreak) {
          setLongestStreak(data.currentStreak);
        }
        setLastStudyDate(new Date().toISOString());
        
        // Check for new achievements
        if (data.newAchievements && data.newAchievements.length > 0) {
          setAchievements(prevAchievements => {
            // Update unlocked status for achievements
            return prevAchievements.map(achievement => {
              const newAchievement = data.newAchievements.find(a => a.id === achievement.id);
              if (newAchievement) {
                return { ...achievement, unlocked: true };
              }
              return achievement;
            });
          });
        }
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  // Use a streak freeze
  const useStreakFreeze = async () => {
    try {
      if (!user || streakFreezes <= 0) return false;

      const { data, error } = await streakService.useStreakFreeze();

      if (error) throw error;
      if (data && data.success) {
        setStreakFreezes(prev => prev - 1);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error using streak freeze:', error);
      return false;
    }
  };

  // Earn a streak freeze
  const earnStreakFreeze = async () => {
    try {
      if (!user) return;

      const { data, error } = await streakService.earnStreakFreeze();

      if (error) throw error;
      if (data && data.success) {
        setStreakFreezes(prev => prev + 1);
      }
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