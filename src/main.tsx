import { createRoot } from 'react-dom/client';
import App from './app/App.tsx';
import { loadTheme, applyTheme } from './app/hooks/useAppTheme';
import './styles/index.css';

applyTheme(loadTheme());

createRoot(document.getElementById('root')!).render(<App />);