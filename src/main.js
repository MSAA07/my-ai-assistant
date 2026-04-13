import App from './App.svelte';
import { initializeLanguage } from './lib/stores/language.js';
import { theme } from './stores/theme.js';

initializeLanguage();
theme.initializeTheme();

const app = new App({
  target: document.getElementById('app')
});

export default app;
