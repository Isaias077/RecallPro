/**
 * Interface for Streak Service
 * Following the Interface Segregation Principle (ISP) and Dependency Inversion Principle (DIP)
 */

export type Achievement = {
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

export interface IStreakService {
  /**
   * Get the current user's streak data
   */
  getStreakData(): Promise<{
    data: {
      currentStreak: number;
      longestStreak: number;
      lastStudyDate: string | null;
      streakFreezes: number;
      achievements: Achievement[];
    } | null;
    error: Error | null;
  }>;

  /**
   * Update the user's streak after a study session
   */
  updateStreak(): Promise<{
    data: {
      currentStreak: number;
      streakMaintained: boolean;
      newAchievements: Achievement[];
    } | null;
    error: Error | null;
  }>;

  /**
   * Use a streak freeze to maintain streak despite missing a day
   */
  useStreakFreeze(): Promise<{
    data: {
      success: boolean;
      remainingFreezes: number;
    } | null;
    error: Error | null;
  }>;

  /**
   * Earn a streak freeze (e.g., by completing challenges)
   */
  earnStreakFreeze(): Promise<{
    data: {
      success: boolean;
      totalFreezes: number;
    } | null;
    error: Error | null;
  }>;

  /**
   * Get all achievements for the current user
   */
  getAchievements(): Promise<{
    data: Achievement[] | null;
    error: Error | null;
  }>;

  /**
   * Check for newly unlocked achievements
   */
  checkAchievements(): Promise<{
    data: {
      newAchievements: Achievement[];
    } | null;
    error: Error | null;
  }>;
}