/**
 * Service Factory
 * Following the Factory Pattern to create service instances
 * This helps with dependency injection and makes it easier to switch implementations
 */
import { IAuthService } from './interfaces/IAuthService';
import { IFlashcardService } from './interfaces/IFlashcardService';
import { IMindMapService } from './interfaces/IMindMapService';
import { IStreakService } from './interfaces/IStreakService';

import { SupabaseAuthService } from './implementations/SupabaseAuthService';
import { SupabaseFlashcardService } from './implementations/SupabaseFlashcardService';
import { SupabaseMindMapService } from './implementations/SupabaseMindMapService';
import { SupabaseStreakService } from './implementations/SupabaseStreakService';

/**
 * Service Factory class
 * Follows the Singleton pattern to ensure only one instance exists
 */
export class ServiceFactory {
  private static instance: ServiceFactory;
  
  private authService: IAuthService;
  private flashcardService: any;
  private mindMapService: IMindMapService;
  private streakService: IStreakService;

  private constructor() {
    // Initialize services with their default implementations
    this.authService = new SupabaseAuthService();
    this.flashcardService = new SupabaseFlashcardService();
    this.mindMapService = new SupabaseMindMapService();
    this.streakService = new SupabaseStreakService();
  }

  /**
   * Get the singleton instance of the ServiceFactory
   */
  public static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  /**
   * Get the auth service implementation
   */
  public getAuthService(): IAuthService {
    return this.authService;
  }

  /**
   * Set a custom auth service implementation
   * Useful for testing or switching implementations
   */
  public setAuthService(service: IAuthService): void {
    this.authService = service;
  }

  /**
   * Get the flashcard service implementation
   */
  public getFlashcardService(): IFlashcardService {
    return this.flashcardService;
  }

  /**
   * Set a custom flashcard service implementation
   * Useful for testing or switching implementations
   */
  public setFlashcardService(service: IFlashcardService): void {
    this.flashcardService = service;
  }

  /**
   * Get the mind map service implementation
   */
  public getMindMapService(): IMindMapService {
    return this.mindMapService;
  }

  /**
   * Set a custom mind map service implementation
   * Useful for testing or switching implementations
   */
  public setMindMapService(service: IMindMapService): void {
    this.mindMapService = service;
  }

  /**
   * Get the streak service implementation
   */
  public getStreakService(): IStreakService {
    return this.streakService;
  }

  /**
   * Set a custom streak service implementation
   * Useful for testing or switching implementations
   */
  public setStreakService(service: IStreakService): void {
    this.streakService = service;
  }
}