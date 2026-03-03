import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  compilerOptions: {
    compatibility: {
      componentApi: 4
    }
  },
  preprocess: vitePreprocess()
};

export default config;
