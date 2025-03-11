import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { IAuthService } from '../interfaces/IAuthService';

/**
 * Supabase implementation of the Auth Service
 * Following the Single Responsibility Principle (SRP) by handling only authentication
 */
export class SupabaseAuthService implements IAuthService {
  /**
   * Get the current user session
   */
  async getSession(): Promise<{ data: { session: Session | null } }> {
    return await supabase.auth.getSession();
  }

  /**
   * Sign up a new user
   * @param email User email
   * @param password User password
   */
  async signUp(email: string, password: string): Promise<{
    error: Error | null;
    data: any | null;
  }> {
    return await supabase.auth.signUp({
      email,
      password,
    });
  }

  /**
   * Sign in an existing user
   * @param email User email
   * @param password User password
   */
  async signIn(email: string, password: string): Promise<{
    error: Error | null;
    data: any | null;
  }> {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  /**
   * Subscribe to auth state changes
   * @param callback Function to call when auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void): { subscription: { unsubscribe: () => void } } {
    const { data } = supabase.auth.onAuthStateChange(callback);
    return { subscription: data.subscription };
  }
}