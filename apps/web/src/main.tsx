import { createRoot } from 'react-dom/client';

import App from './App';

import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import '@fontsource-variable/outfit';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
