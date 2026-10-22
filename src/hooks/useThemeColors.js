import { useApp } from '../context/AppContext.jsx';

// Concrete colours for canvas/WebGL effects that cannot read CSS variables.
// Keep in sync with the tokens in src/index.css.
const COLORS = {
  vedic: { accent: '#a9440a', accentInk: '#fff8ee', gold: '#c99a2e', ink: '#2a1a10', muted: '#6b5443', panel: '#fbf5ea', bg: '#f4ebda' },
  cosmic: { accent: '#2ee6c5', accentInk: '#021418', gold: '#9bf2a1', ink: '#e6f6f4', muted: '#96b6ba', panel: '#0a1a28', bg: '#04101a' },
};

export default function useThemeColors() {
  const { theme } = useApp();
  const key = theme === 'cosmic' ? 'cosmic' : 'vedic';
  return { ...COLORS[key], mode: key === 'cosmic' ? 'dark' : 'light' };
}
