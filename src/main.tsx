import { createRoot } from 'react-dom/client';
import './styles.css';
import './lib/image-slot.js';
import App from './App';

createRoot(document.getElementById('root')!).render(<App />);
