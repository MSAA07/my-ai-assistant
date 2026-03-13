import App from './App.svelte';
import { theme } from './stores/theme.js';

theme.initializeTheme();

const app = new App({
  target: document.getElementById('app')
});

export default app;
