import { extendTheme } from 'native-base';
import tokens from './tokens.json';

const nativebaseTheme = extendTheme({
  colors: {
    primary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: tokens.colors.primary,
      600: tokens.colors.primaryDark,
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
    },
    secondary: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: tokens.colors.secondary,
      600: tokens.colors.secondaryDark,
      700: '#047857',
      800: '#065F46',
      900: '#064E3B',
    },
    background: tokens.colors.background,
    card: tokens.colors.card,
    text: tokens.colors.text,
    muted: tokens.colors.muted,
  },
  fontConfig: {
    Inter: {
      400: { normal: 'Inter_400Regular' },
      500: { normal: 'Inter_500Medium' },
      600: { normal: 'Inter_600SemiBold' },
      700: { normal: 'Inter_700Bold' },
    },
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
    mono: 'Inter',
  },
  components: {
    Button: {
      baseStyle: {
        rounded: 'lg',
      },
      defaultProps: {
        colorScheme: 'primary',
      },
    },
    Card: {
      baseStyle: {
        rounded: 'lg',
        shadow: '3',
        p: '4',
        bg: 'card',
      },
    },
    Input: {
      baseStyle: {
        rounded: 'lg',
        borderColor: 'border',
      },
    },
  },
});

export default nativebaseTheme;
