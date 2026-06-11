import { useColorScheme } from 'react-native';

const sharedTheme = {
  spacing: (factor = 1) => factor * 8,
  radius: {
    xs: 10,
    sm: 14,
    md: 18,
    lg: 24,
    xl: 32,
    pill: 999,
  },
};

// Premium "Lord Imperial" luxury dark palette
// Deep navy-black + warm gold + electric sapphire
const imperialPalette = {
  background: '#0D1117',
  backgroundAlt: '#0D1117',
  surface: '#161B22',
  surfaceAlt: '#1C2128',
  surfaceMuted: '#21262D',
  card: '#161B22',
  primary: '#C9956B',
  primaryStrong: '#A87040',
  accent: '#E8C99A',
  secondary: '#4A9FE5',
  text: '#E6EDF3',
  textMuted: '#7D8590',
  textSoft: '#B0BEC5',
  danger: '#EF4444',
  success: '#37D67A',
  warning: '#F59E0B',
  border: '#30363D',
  borderStrong: '#3D444D',
  bubbleMine: '#C9956B',
  bubbleMineAlt: '#A87040',
  bubbleTheirs: '#161B22',
  input: '#1C2128',
  skeleton: '#21262D',
  overlay: 'rgba(13,17,23,0.72)',
  shadow: '#000000',
  onlineGlow: 'rgba(74,159,229,0.20)',
  chip: '#21262D',
  unread: '#C9956B',
};

const darkPalette = imperialPalette;
const lightPalette = { ...imperialPalette };

const buildShadow = (shadowColor) => ({
  soft: {
    shadowColor,
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  glow: {
    shadowColor,
    shadowOpacity: 0.30,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
});

export const getTheme = (scheme = 'dark') => {
  const isDark = scheme !== 'light';
  const colors = isDark ? darkPalette : lightPalette;

  return {
    ...sharedTheme,
    scheme: isDark ? 'dark' : 'light',
    isDark,
    colors,
    shadow: buildShadow(colors.shadow),
  };
};

export const appTheme = getTheme('dark');

export const useAppTheme = () => {
  const colorScheme = useColorScheme();
  return getTheme(colorScheme || 'dark');
};
