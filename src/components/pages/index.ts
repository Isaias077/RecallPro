/**
 * Pages are specific instances of templates that show what a UI looks like with real representative content in place.
 * 
 * This directory contains page components that are:
 * - Composed of templates populated with real content
 * - Directly mapped to routes in the application
 * - Responsible for fetching data and passing it to templates
 * - Handle page-specific logic and state
 * 
 * Examples include:
 * - DashboardPage
 * - LoginPage
 * - SignupPage
 * - FlashcardManagerPage
 * - StudySessionPage
 */

// Export all page components here for easy imports
export { default as DashboardPage } from './DashboardPage';
export { default as LoginPage } from './LoginPage';
export { default as SignupPage } from './SignupPage';
export { default as FlashcardManagerPage } from './FlashcardManagerPage';
export { default as StudySessionPage } from './StudySessionPage';
export { default as PomodoroTimerPage } from './PomodoroTimerPage';
export { default as MindMapPage } from './MindMapPage';