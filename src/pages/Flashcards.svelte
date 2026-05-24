<script>
  import { onMount } from 'svelte';
  import { router } from '../stores/router.js';

  onMount(() => {
    router.replace('/study');
  });
</script>
