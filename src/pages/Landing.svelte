<script>
  import { router } from '../stores/router.js';

  function enterApp() {
    router.navigate('/app');
  }
</script>

<div class="landing-container">
  <div class="landing-content">
    <h1 class="title">AI Study Assistant</h1>
    <p class="subtitle">Your intelligent companion for learning and research</p>
    
    <div class="features">
      <div class="feature-card">
        <div class="feature-icon">📚</div>
        <h3>Upload Documents</h3>
        <p>Import PDFs, Word docs, and presentations to analyze and study</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">🤖</div>
        <h3>AI-Powered Analysis</h3>
        <p>Get summaries, explanations, and insights from your study materials</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">📝</div>
        <h3>Smart Organization</h3>
        <p>Keep all your study materials organized in one place</p>
      </div>
    </div>
    
    <button class="enter-btn" on:click={enterApp}>
      Enter
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    </button>
  </div>
</div>

<style>
  .landing-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: var(--color-bg);
    background-image: var(--gradient-bg-radial);
  }

  .landing-content {
    text-align: center;
    max-width: 800px;
    width: 100%;
  }

  .title {
    font-size: 3.5rem;
    font-weight: 800;
    margin: 0 0 1rem;
    background: var(--gradient-accent);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
  }

  .subtitle {
    font-size: 1.25rem;
    color: var(--color-text-secondary);
    margin: 0 0 3rem;
    font-weight: 400;
  }

  .features {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    margin-bottom: 3rem;
  }

  .feature-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 1rem;
    padding: 2rem 1.5rem;
    transition: all 0.3s ease;
  }

  .feature-card:hover {
    transform: translateY(-4px);
    border-color: var(--color-accent);
    box-shadow: 0 8px 32px var(--color-glow);
  }

  .feature-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .feature-card h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 0.5rem;
    color: var(--color-text);
  }

  .feature-card p {
    font-size: 0.9rem;
    color: var(--color-text-tertiary);
    margin: 0;
    line-height: 1.5;
  }

  .enter-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--gradient-accent);
    color: var(--color-bg);
    border: none;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 16px rgba(96, 165, 250, 0.3);
  }

  .enter-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(96, 165, 250, 0.4);
  }

  .enter-btn:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    .title {
      font-size: 2.5rem;
    }

    .features {
      grid-template-columns: 1fr;
    }

    .feature-card {
      padding: 1.5rem;
    }
  }
</style>
