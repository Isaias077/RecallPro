import { supabase } from '../../lib/supabase';
import { IStreakService, Achievement } from '../interfaces/IStreakService';

/**
 * Supabase implementation of the Streak Service
 * Following the Single Responsibility Principle (SRP) by handling only streak operations
 */
export class SupabaseStreakService implements IStreakService {
  // Predefined achievements
  private readonly ACHIEVEMENTS: Achievement[] = [
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
    // Streak Achievements 🔥
    {
      id: 'first-streak',
      name: 'Primera Racha 🔥',
      description: 'Mantén una racha de 3 días.',
      unlocked: false,
      milestone: 3,
      category: 'streak',
      condition: 'consecutive_days',
    },
    {
      id: 'weekly-warrior',
      name: 'Guerrero Semanal 📅',
      description: 'Mantén una racha de 7 días.',
      unlocked: false,
      milestone: 7,
      category: 'streak',
      condition: 'consecutive_days',
    },
    {
      id: 'monthly-master',
      name: 'Maestro Mensual 📆',
      description: 'Mantén una racha de 30 días.',
      unlocked: false,
      milestone: 30,
      category: 'streak',
      condition: 'consecutive_days',
    },
    // More achievements can be added here
  ];

  /**
   * Helper method to check if a date is today
   * @param date Date string to check
   */
  private isToday(date: string): boolean {
    const today = new Date();
    const compareDate = new Date(date);
    return (
      compareDate.getDate() === today.getDate() &&
      compareDate.getMonth() === today.getMonth() &&
      compareDate.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Helper method to check if a date is yesterday
   * @param date Date string to check
   */
  private isYesterday(date: string): boolean {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const compareDate = new Date(date);
    return (
      compareDate.getDate() === yesterday.getDate() &&
      compareDate.getMonth() === yesterday.getMonth() &&
      compareDate.getFullYear() === yesterday.getFullYear()
    );
  }

  /**
   * Get the current user's streak data
   */
  async getStreakData(): Promise<{
    data: {
      currentStreak: number;
      longestStreak: number;
      lastStudyDate: string | null;
      streakFreezes: number;
      achievements: Achievement[];
    } | null;
    error: Error | null;
  }> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        return { data: null, error: new Error('User not authenticated') };
      }

      // Get user streak data
      const { data: streakData, error: streakError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', session.session.user.id)
        .single();

      if (streakError && streakError.code !== 'PGRST116') {
        // PGRST116 is the error code for no rows returned
        return { data: null, error: streakError };
      }

      // Get user achievements
      const { data: achievementData, error: achievementError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', session.session.user.id);

      if (achievementError) {
        return { data: null, error: achievementError };
      }

      // Map achievements
      const unlockedAchievementIds = achievementData?.map(a => a.achievement_id) || [];
      const achievements = this.ACHIEVEMENTS.map(achievement => ({
        ...achievement,
        unlocked: unlockedAchievementIds.includes(achievement.id),
      }));

      // If no streak data exists yet, create default
      if (!streakData) {
        return {
          data: {
            currentStreak: 0,
            longestStreak: 0,
            lastStudyDate: null,
            streakFreezes: 0,
            achievements,
          },
          error: null,
        };
      }

      return {
        data: {
          currentStreak: streakData.current_streak || 0,
          longestStreak: streakData.longest_streak || 0,
          lastStudyDate: streakData.last_study_date,
          streakFreezes: streakData.streak_freezes || 0,
          achievements,
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Update the user's streak after a study session
   */
  async updateStreak(): Promise<{
    data: {
      currentStreak: number;
      streakMaintained: boolean;
      newAchievements: Achievement[];
    } | null;
    error: Error | null;
  }> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        return { data: null, error: new Error('User not authenticated') };
      }

      // Get current streak data
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', session.session.user.id)
        .single();

      const today = new Date().toISOString();
      let currentStreak = 1; // Default to 1 for first day
      let streakMaintained = false;
      let longestStreak = 1;

      // If user has existing streak data
      if (streakData) {
        const lastStudyDate = streakData.last_study_date;
        
        // If already studied today, don't increment streak
        if (lastStudyDate && this.isToday(lastStudyDate)) {
          currentStreak = streakData.current_streak || 1;
          streakMaintained = true;
        }
        // If studied yesterday, increment streak
        else if (lastStudyDate && this.isYesterday(lastStudyDate)) {
          currentStreak = (streakData.current_streak || 0) + 1;
          streakMaintained = true;
        }
        // Otherwise, streak is broken
        else {
          currentStreak = 1;
          streakMaintained = false;
        }

        // Update longest streak if needed
        longestStreak = Math.max(currentStreak, streakData.longest_streak || 0);
      }

      // Update or create streak record
      const { error: updateError } = await supabase
        .from('user_streaks')
        .upsert({
          user_id: session.session.user.id,
          current_streak: currentStreak,
          longest_streak: longestStreak,
          last_study_date: today,
          streak_freezes: streakData?.streak_freezes || 0,
        });

      if (updateError) {
        return { data: null, error: updateError };
      }

      // Check for new achievements
      const { data: achievementData } = await this.checkAchievements();
      
      return {
        data: {
          currentStreak,
          streakMaintained,
          newAchievements: achievementData?.newAchievements || [],
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Use a streak freeze to maintain streak despite missing a day
   */
  async useStreakFreeze(): Promise<{
    data: {
      success: boolean;
      remainingFreezes: number;
    } | null;
    error: Error | null;
  }> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        return { data: null, error: new Error('User not authenticated') };
      }

      // Get current streak data
      const { data: streakData, error: streakError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', session.session.user.id)
        .single();

      if (streakError) {
        return { data: null, error: streakError };
      }

      // Check if user has freezes available
      if (!streakData || streakData.streak_freezes <= 0) {
        return {
          data: {
            success: false,
            remainingFreezes: streakData?.streak_freezes || 0,
          },
          error: null,
        };
      }

      // Use a freeze
      const remainingFreezes = streakData.streak_freezes - 1;
      const { error: updateError } = await supabase
        .from('user_streaks')
        .update({
          streak_freezes: remainingFreezes,
          last_study_date: new Date().toISOString(), // Set last study date to today
        })
        .eq('user_id', session.session.user.id);

      if (updateError) {
        return { data: null, error: updateError };
      }

      return {
        data: {
          success: true,
          remainingFreezes,
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Earn a streak freeze (e.g., by completing challenges)
   */
  async earnStreakFreeze(): Promise<{
    data: {
      success: boolean;
      totalFreezes: number;
    } | null;
    error: Error | null;
  }> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        return { data: null, error: new Error('User not authenticated') };
      }

      // Get current streak data
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', session.session.user.id)
        .single();

      // Calculate new total
      const currentFreezes = streakData?.streak_freezes || 0;
      const totalFreezes = currentFreezes + 1;

      // Update or create streak record
      const { error: updateError } = await supabase
        .from('user_streaks')
        .upsert({
          user_id: session.session.user.id,
          current_streak: streakData?.current_streak || 0,
          longest_streak: streakData?.longest_streak || 0,
          last_study_date: streakData?.last_study_date || null,
          streak_freezes: totalFreezes,
        });

      if (updateError) {
        return { data: null, error: updateError };
      }

      return {
        data: {
          success: true,
          totalFreezes,
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get all achievements for the current user
   */
  async getAchievements(): Promise<{
    data: Achievement[] | null;
    error: Error | null;
  }> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        return { data: null, error: new Error('User not authenticated') };
      }

      // Get user achievements
      const { data: achievementData, error: achievementError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', session.session.user.id);

      if (achievementError) {
        return { data: null, error: achievementError };
      }

      // Map achievements
      const unlockedAchievementIds = achievementData?.map(a => a.achievement_id) || [];
      const achievements = this.ACHIEVEMENTS.map(achievement => ({
        ...achievement,
        unlocked: unlockedAchievementIds.includes(achievement.id),
      }));

      return { data: achievements, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Check for newly unlocked achievements
   */
  async checkAchievements(): Promise<{
    data: {
      newAchievements: Achievement[];
    } | null;
    error: Error | null;
  }> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        return { data: null, error: new Error('User not authenticated') };
      }

      // Get user streak data
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', session.session.user.id)
        .single();

      // Get user achievements
      const { data: achievementData } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', session.session.user.id);

      const unlockedAchievementIds = achievementData?.map(a => a.achievement_id) || [];
      
      // Get user stats for achievement checks
      const { data: userStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', session.session.user.id)
        .single();

      // Check for new achievements
      const newAchievements: Achievement[] = [];
      
      for (const achievement of this.ACHIEVEMENTS) {
        // Skip already unlocked achievements
        if (unlockedAchievementIds.includes(achievement.id)) {
          continue;
        }

        let unlocked = false;

        // Check achievement conditions
        switch (achievement.condition) {
          case 'sessions':
            unlocked = (userStats?.total_sessions || 0) >= achievement.milestone;
            break;
          case 'cards_per_day':
            unlocked = (userStats?.max_cards_per_day || 0) >= achievement.milestone;
            break;
          case 'total_cards':
            unlocked = (userStats?.total_cards_reviewed || 0) >= achievement.milestone;
            break;
          case 'consecutive_days':
            unlocked = (streakData?.current_streak || 0) >= achievement.milestone;
            break;
          // Add more conditions as needed
        }

        // If achievement unlocked, add to database and return list
        if (unlocked) {
          await supabase
            .from('user_achievements')
            .insert({
              user_id: session.session.user.id,
              achievement_id: achievement.id,
              unlocked_at: new Date().toISOString(),
            });

          newAchievements.push({
            ...achievement,
            unlocked: true,
          });
        }
      }

      return {
        data: {
          newAchievements,
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}