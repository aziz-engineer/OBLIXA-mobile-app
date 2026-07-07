import { useColorScheme } from 'react-native';
import { COLORS } from '../constants/colors';

export function useTheme() {
  const scheme = useColorScheme();
  const key = scheme === 'dark' ? 'dark' : 'light';
  return [key];
}

export default useTheme;
