import { createRoot } from 'react-dom/client';
import './styles.css';
import './lib/image-slot.js';
import App from './App';
import Privacy from './screens/Privacy';

// Páginas públicas (sin sesión). El resto de rutas carga la app.
const path = location.pathname.replace(/\/+$/, '');
createRoot(document.getElementById('root')!).render(path === '/privacidad' ? <Privacy /> : <App />);
