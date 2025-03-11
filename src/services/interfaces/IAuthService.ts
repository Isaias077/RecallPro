/**
 * Interface for Authentication Service
 * Following the Interface Segregation Principle (ISP) and Dependency Inversion Principle (DIP)
 */
export interface IAuthService {
  /**
   * Get the current user session
   */
  getSession(): Promise<any>;

  /**
   * Sign up a new user
   * @param email User email
   * @param password User password
   */
  signUp(email: string, password: string): Promise<{
    error: Error | null;
    data: any | null;
  }>;

  /**
   * Sign in an existing user
   * @param email User email
   * @param password User password
   */
  signIn(email: string, password: string): Promise<{
    error: Error | null;
    data: any | null;
  }>;

  /**
   * Sign out the current user
   */
  signOut(): Promise<void>;

  /**
   * Subscribe to auth state changes
   * @param callback Function to call when auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void): { subscription: { unsubscribe: () => void } };
}