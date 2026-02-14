<script>
  import { currentPath } from "../stores/router.js";
</script>

<header class="app-header">
  <div class="header-content">
    <a href="#/" class="logo">AI Study Assistant</a>
  </div>
</header>

<style>
  .app-header {
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    padding: 1rem 0;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .logo {
    font-size: 1.5rem;
    font-weight: 800;
    text-decoration: none;
    color: var(--color-text);
  }

  @media (max-width: 640px) {
    .header-content {
      padding: 0 1rem;
    }

    .logo {
      font-size: 1.25rem;
    }
  }
</style>
