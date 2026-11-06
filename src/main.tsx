import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import App from './App';
import './index.css';
import { theme } from './data/portfolio';
import { applyTheme } from './theme';

// Apply colours and fonts before the first paint so there is no flash of the default theme.
applyTheme(theme);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
);
