import themeData from './theme.json';

// TypeScript types for the theme structure
type ColorShade = {
  main: string;
  light: string;
  dark: string;
  contrastText: string;
};

type BackgroundColors = {
  default: string;
  paper: string;
  card: string;
  gradient: string;
};

type TextColors = {
  primary: string;
  secondary: string;
  disabled: string;
  hint: string;
};

type ActionColors = {
  active: string;
  hover: string;
  selected: string;
  disabled: string;
};

type StatusColors = {
  success: string;
  info: string;
  warning: string;
  error: string;
};

type CommonColors = {
  black: string;
  white: string;
  transparent: string;
};

type EffectsStyles = {
  shadow: string;
  blur: string;
};

type GradientStyles = {
  primary: string;
  rainbow: string;
};

type ThemeColors = {
  primary: ColorShade;
  secondary: ColorShade;
  tertiary: ColorShade;
  background: BackgroundColors;
  text: TextColors;
  action: ActionColors;
  status: StatusColors;
  common: CommonColors;
  effects: EffectsStyles;
  gradients: GradientStyles;
};

type Theme = {
  colors: ThemeColors;
};

// Cast the imported JSON to our type
const theme = themeData as Theme;

/**
 * Get a color from the theme
 * @param path Path to the color in dot notation (e.g., 'primary.main', 'text.primary')
 * @returns The color value
 */
export const getColor = (path: string): string => {
  const keys = path.split('.');
  let result: any = theme.colors;
  
  for (const key of keys) {
    if (result && result[key] !== undefined) {
      result = result[key];
    } else {
      console.warn(`Color path "${path}" not found in theme`);
      return '';
    }
  }
  
  return result;
};

/**
 * Get a primary color shade
 * @param shade The shade of primary color ('main', 'light', 'dark', or 'contrastText')
 * @returns The primary color value
 */
export const getPrimaryColor = (shade: keyof ColorShade = 'main'): string => {
  return theme.colors.primary[shade];
};

/**
 * Get a secondary color shade
 * @param shade The shade of secondary color ('main', 'light', 'dark', or 'contrastText')
 * @returns The secondary color value
 */
export const getSecondaryColor = (shade: keyof ColorShade = 'main'): string => {
  return theme.colors.secondary[shade];
};

/**
 * Get a tertiary color shade
 * @param shade The shade of tertiary color ('main', 'light', 'dark', or 'contrastText')
 * @returns The tertiary color value
 */
export const getTertiaryColor = (shade: keyof ColorShade = 'main'): string => {
  return theme.colors.tertiary[shade];
};

/**
 * Get a background color
 * @param type The type of background ('default', 'paper', 'card', or 'gradient')
 * @returns The background color value
 */
export const getBackgroundColor = (type: keyof BackgroundColors = 'default'): string => {
  return theme.colors.background[type];
};

/**
 * Get a text color
 * @param type The type of text color ('primary', 'secondary', 'disabled', or 'hint')
 * @returns The text color value
 */
export const getTextColor = (type: keyof TextColors = 'primary'): string => {
  return theme.colors.text[type];
};

/**
 * Get a status color
 * @param status The status type ('success', 'info', 'warning', or 'error')
 * @returns The status color value
 */
export const getStatusColor = (status: keyof StatusColors): string => {
  return theme.colors.status[status];
};

/**
 * Get a gradient style
 * @param type The gradient type ('primary' or 'rainbow')
 * @returns The gradient CSS value
 */
export const getGradient = (type: keyof GradientStyles = 'primary'): string => {
  return theme.colors.gradients[type];
};

/**
 * Get an effect style
 * @param type The effect type ('shadow' or 'blur')
 * @returns The effect CSS value
 */
export const getEffect = (type: keyof EffectsStyles): string => {
  return theme.colors.effects[type];
};

// Export the entire theme object for direct access if needed
export default theme;