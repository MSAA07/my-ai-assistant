<script>
  import { onMount } from "svelte";

  export let documentId;

  let docData = null;
  let loading = true;
  let error = "";
  let activeTab = "summary";

  // Flashcard state
  let currentCardIndex = 0;
  let showAnswer = false;
  let shuffledCards = [];

  // Exam state
  let examStarted = false;
  let currentQuestionIndex = 0;
  let userAnswers = [];
  let examComplete = false;
  let score = 0;
  let showAnswersMode = "end"; // 'instant' or 'end'

  // API Base URL (Dynamic for production, localhost fallback)
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  onMount(async () => {
    await fetchDocument();
  });

  async function fetchDocument() {
    try {
      const response = await fetch(
        `${API_BASE}/api/document/${documentId}`,
      );
      const data = await response.json();

      if (response.ok) {
        docData = data.document;
        shuffledCards = [...docData.flashcards];
      } else {
        error = data.error || "Document not found";
      }
    } catch (err) {
      error = "Failed to load document";
    } finally {
      loading = false;
    }
  }

  function setTab(tab) {
    activeTab = tab;
    if (tab === "flashcards") {
      if (shuffledCards.length > 0) {
        currentCardIndex = 0;
        showAnswer = false;
      }
    } else if (tab === "exam") {
      if (!examComplete) {
        resetExam();
      }
    }
  }

  // Flashcard functions
  function flipCard() {
    showAnswer = !showAnswer;
  }

  function nextCard() {
    if (currentCardIndex < shuffledCards.length - 1) {
      currentCardIndex++;
      showAnswer = false;
    }
  }

  function previousCard() {
    if (currentCardIndex > 0) {
      currentCardIndex--;
      showAnswer = false;
    }
  }

  function shuffleCards() {
    shuffledCards = [...shuffledCards].sort(() => Math.random() - 0.5);
    currentCardIndex = 0;
    showAnswer = false;
  }

  // Exam functions
  function startExam() {
    examStarted = true;
    currentQuestionIndex = 0;
    userAnswers = new Array(docData.examQuestions.length).fill(null);
    examComplete = false;
  }

  function resetExam() {
    examStarted = false;
    currentQuestionIndex = 0;
    userAnswers = [];
    examComplete = false;
    score = 0;
  }

  function selectAnswer(answer) {
    userAnswers[currentQuestionIndex] = answer;
    userAnswers = [...userAnswers]; // Trigger reactivity
  }

  function nextQuestion() {
    if (currentQuestionIndex < docData.examQuestions.length - 1) {
      currentQuestionIndex++;
    }
  }

  function previousQuestion() {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
    }
  }

  function submitExam() {
    // Calculate score
    let correct = 0;
    docData.examQuestions.forEach((q, i) => {
      if (userAnswers[i] === q.correctAnswer) {
        correct++;
      }
    });
    score = correct;
    examComplete = true;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    window.location.hash = "/";
  }
</script>

{#if loading}
  <div class="loading-container">
    <div class="loading-spinner"></div>
    <p>Loading document...</p>
  </div>
{:else if error}
  <div class="error-container">
    <h2>Error</h2>
    <p>{error}</p>
    <button on:click={goBack}>Back to Dashboard</button>
  </div>
{:else if docData}
  <div class="document-view">
    <div class="document-header">
      <button class="back-btn" on:click={goBack}>Back</button>
      <h1>{docData.originalName}</h1>
      <p class="doc-meta">
        Uploaded: {new Date(docData.uploadDate).toLocaleDateString()} | Language:
        {docData.language === "arabic" ? "العربية" : "English"}
      </p>
    </div>

    <div class="tabs">
      <button
        class="tab"
        class:active={activeTab === "summary"}
        on:click={() => setTab("summary")}
      >
        Summary
      </button>
      <button
        class="tab"
        class:active={activeTab === "flashcards"}
        on:click={() => setTab("flashcards")}
      >
        Flashcards ({docData.flashcards.length})
      </button>
      <button
        class="tab"
        class:active={activeTab === "exam"}
        on:click={() => setTab("exam")}
      >
        Mock Exam ({docData.examQuestions.length})
      </button>
    </div>

    <div class="tab-content">
      {#if activeTab === "summary"}
        <div class="summary-section">
          <h2>Summary</h2>
          <div class="summary-text">
            {docData.summary}
          </div>
        </div>
      {:else if activeTab === "flashcards"}
        <div class="flashcards-section">
          <div class="flashcard-controls">
            <button class="shuffle-btn" on:click={shuffleCards}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
              Shuffle
            </button>
            <span class="card-counter">
              Card {currentCardIndex + 1} of {shuffledCards.length}
            </span>
          </div>

          <div class="flashcard" class:flipped={showAnswer} on:click={flipCard} on:keydown={(e) => e.key === 'Enter' && flipCard()} role="button" tabindex="0">
            <div class="flashcard-inner">
              <div class="flashcard-front">
                <div class="card-label">Question</div>
                <div class="card-text">
                  {shuffledCards[currentCardIndex].question}
                </div>
                <div class="flip-hint">Click to flip</div>
              </div>
              <div class="flashcard-back">
                <div class="card-label">Answer</div>
                <div class="card-text">
                  {shuffledCards[currentCardIndex].answer}
                </div>
              </div>
            </div>
          </div>

          <div class="flashcard-nav">
            <button on:click={previousCard} disabled={currentCardIndex === 0}>
              Previous
            </button>
            <button
              on:click={nextCard}
              disabled={currentCardIndex === shuffledCards.length - 1}
            >
              Next
            </button>
          </div>
        </div>
      {:else if activeTab === "exam"}
        <div class="exam-section">
          {#if !examStarted}
            <div class="exam-intro">
              <h2>Ready for the Mock Exam?</h2>
              <p>
                This exam contains {docData.examQuestions.length} questions
              </p>

              <div class="exam-options">
                <p><strong>How would you like to review answers?</strong></p>
                <label class="radio-option" class:radio-selected={showAnswersMode === 'instant'}>
                  <input
                    type="radio"
                    bind:group={showAnswersMode}
                    value="instant"
                  />
                  <span class="radio-dot"></span>
                  <span class="radio-content">
                    <span class="radio-title">Instant Feedback</span>
                    <span class="radio-desc">Show correct answer after each question</span>
                  </span>
                </label>
                <label class="radio-option" class:radio-selected={showAnswersMode === 'end'}>
                  <input
                    type="radio"
                    bind:group={showAnswersMode}
                    value="end"
                  />
                  <span class="radio-dot"></span>
                  <span class="radio-content">
                    <span class="radio-title">Exam Simulation</span>
                    <span class="radio-desc">Show all answers at the end</span>
                  </span>
                </label>
              </div>

              <button class="start-exam-btn" on:click={startExam}>
                Start Exam
              </button>
            </div>
          {:else if !examComplete}
            <div class="exam-progress">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  style="width: {((currentQuestionIndex + 1) /
                    docData.examQuestions.length) *
                    100}%"
                ></div>
              </div>
              <p>
                Question {currentQuestionIndex + 1} of {docData.examQuestions
                  .length}
              </p>
            </div>

            {#each docData.examQuestions as question, i}
              {#if i === currentQuestionIndex}
                <div class="question-card">
                  <h3>Question {i + 1}</h3>
                  <p class="question-text">{question.question}</p>

                  {#if question.options && question.options.length > 0}
                    <div class="options">
                      {#each question.options as option, optIdx}
                        <button
                          class="option-btn"
                          class:selected={userAnswers[i] === option}
                          on:click={() => selectAnswer(option)}
                        >
                          <span class="option-letter">{String.fromCharCode(65 + optIdx)}</span>
                          <span class="option-text">{option}</span>
                        </button>
                      {/each}
                    </div>
                  {:else}
                    <div class="short-answer-wrapper">
                      <input
                        type="text"
                        class="short-answer-input"
                        placeholder="Type your answer..."
                        value={userAnswers[i] || ''}
                        on:input={(e) => selectAnswer(e.target.value)}
                      />
                    </div>
                  {/if}

                  {#if showAnswersMode === "instant" && userAnswers[i]}
                    <div
                      class="instant-feedback"
                      class:correct={userAnswers[i] === question.correctAnswer}
                    >
                      <p>
                        <strong>
                          {userAnswers[i] === question.correctAnswer
                            ? "Correct!"
                            : "Incorrect"}
                        </strong>
                      </p>
                      {#if userAnswers[i] !== question.correctAnswer}
                        <p>Correct answer: {question.correctAnswer}</p>
                      {/if}
                      <p class="explanation">{question.explanation}</p>
                    </div>
                  {/if}
                </div>
              {/if}
            {/each}

            <div class="exam-navigation">
              <button
                on:click={previousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </button>

              {#if currentQuestionIndex < docData.examQuestions.length - 1}
                <button on:click={nextQuestion}>Next</button>
              {:else}
                <button
                  class="submit-btn"
                  on:click={submitExam}
                  disabled={userAnswers.some((a) => a === null || a === '')}
                >
                  Submit Exam
                </button>
              {/if}
            </div>
          {:else}
            <div class="exam-results">
              <h2>Exam Complete!</h2>
              <div class="score-display">
                <div class="score-circle">
                  <span class="score-value"
                    >{Math.round(
                      (score / docData.examQuestions.length) * 100,
                    )}%</span
                  >
                </div>
                <p class="score-text">
                  You scored {score} out of {docData.examQuestions.length}
                </p>
              </div>

              <h3>Review Your Answers</h3>
              {#each docData.examQuestions as question, i}
                <div
                  class="review-question"
                  class:correct={userAnswers[i] === question.correctAnswer}
                >
                  <div class="review-header">
                    <span class="question-number">Question {i + 1}</span>
                    <span class="result-badge">
                      {userAnswers[i] === question.correctAnswer
                        ? "Correct"
                        : "Incorrect"}
                    </span>
                  </div>
                  <p class="review-question-text">{question.question}</p>
                  <p class="review-answer">
                    <strong>Your answer:</strong>
                    {userAnswers[i] || "Not answered"}
                  </p>
                  {#if userAnswers[i] !== question.correctAnswer}
                    <p class="review-answer correct-answer">
                      <strong>Correct answer:</strong>
                      {question.correctAnswer}
                    </p>
                  {/if}
                  <p class="review-explanation">{question.explanation}</p>
                </div>
              {/each}

              <button class="retake-btn" on:click={resetExam}>
                Retake Exam
              </button>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .loading-container,
  .error-container {
    text-align: center;
    padding: 4rem 2rem;
  }

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid var(--color-border);
    border-top-color: #60a5fa;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  .error-container button {
    padding: 0.75rem 1.5rem;
    background: #1e293b;
    color: #f1f5f9;
    border: 1px solid #334155;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .error-container button:hover {
    background: #334155;
    border-color: #60a5fa;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .document-view {
    max-width: 100%;
    padding: 1rem;
  }

  .document-header {
    margin-bottom: 2rem;
  }

  .document-header h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    color: #f1f5f9;
  }

  .doc-meta {
    color: #94a3b8;
    font-size: 0.9rem;
  }

  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.6rem 1.25rem;
    background: #1e293b;
    color: #e2e8f0;
    border: 1px solid #334155;
    border-radius: 0.5rem;
    cursor: pointer;
    margin-bottom: 1rem;
    font-weight: 500;
    font-size: 0.95rem;
    transition: all 0.2s ease;
  }

  .back-btn:hover {
    background: #334155;
    border-color: #60a5fa;
    color: #ffffff;
  }

  .tabs {
    display: flex;
    gap: 0.25rem;
    border-bottom: 2px solid #1e2758;
    margin-bottom: 2rem;
  }

  .tab {
    padding: 0.875rem 1.5rem;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.95rem;
    color: #94a3b8;
    transition: all 0.2s ease;
  }

  .tab:hover {
    color: #cbd5e1;
    background: rgba(96, 165, 250, 0.06);
  }

  .tab.active {
    border-bottom-color: #60a5fa;
    color: #60a5fa;
  }

  .summary-section {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 1rem;
    padding: 2rem;
  }

  .summary-section h2 {
    color: #f1f5f9;
  }

  .summary-text {
    line-height: 1.8;
    white-space: pre-wrap;
    color: #e2e8f0;
  }

  .flashcards-section {
    max-width: 600px;
    margin: 0 auto;
  }

  .flashcard-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .card-counter {
    font-weight: 600;
    color: #cbd5e1;
  }

  .shuffle-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.25rem;
    background: transparent;
    color: #60a5fa;
    border: 1.5px solid #60a5fa;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.25s ease;
  }

  .shuffle-btn:hover {
    background: rgba(96, 165, 250, 0.12);
    box-shadow: 0 0 16px rgba(96, 165, 250, 0.15);
    transform: translateY(-1px);
  }

  .shuffle-btn:active {
    transform: translateY(0);
  }

  .shuffle-btn svg {
    flex-shrink: 0;
  }

  .flashcard {
    perspective: 1000px;
    height: 400px;
    cursor: pointer;
    margin-bottom: 2rem;
  }

  .flashcard-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.6s;
    transform-style: preserve-3d;
  }

  .flashcard.flipped .flashcard-inner {
    transform: rotateY(180deg);
  }

  .flashcard-front,
  .flashcard-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    background: var(--color-surface);
    border: 2px solid var(--color-border);
    border-radius: 1rem;
    padding: 3rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .flashcard-back {
    transform: rotateY(180deg);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: #667eea;
  }

  .card-label {
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #94a3b8;
    margin-bottom: 1rem;
  }

  .flashcard-back .card-label {
    color: rgba(255, 255, 255, 0.7);
  }

  .card-text {
    font-size: 1.4rem;
    line-height: 1.6;
    color: #f1f5f9;
  }

  .flashcard-back .card-text {
    color: #ffffff;
  }

  .flip-hint {
    margin-top: 2rem;
    font-size: 0.85rem;
    color: #64748b;
  }

  .flashcard-nav {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }

  .flashcard-nav button {
    flex: 1;
    padding: 0.875rem 1rem;
    background: #1e293b;
    color: #e2e8f0;
    border: 1px solid #334155;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.95rem;
    transition: all 0.2s ease;
  }

  .flashcard-nav button:hover:not(:disabled) {
    background: #334155;
    border-color: #60a5fa;
    color: #ffffff;
  }

  .flashcard-nav button:disabled {
    opacity: 0.25;
    cursor: not-allowed;
    color: #64748b;
  }

  .exam-intro {
    text-align: center;
    padding: 3rem 2rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 1rem;
  }

  .exam-intro h2 {
    color: #f1f5f9;
  }

  .exam-intro p {
    color: #cbd5e1;
  }

  .exam-options {
    margin: 2rem 0;
    text-align: left;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }

  .exam-options > p {
    text-align: center;
    margin-bottom: 1rem;
    color: #cbd5e1;
  }

  .radio-option {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 1.125rem 1.25rem;
    margin: 0.625rem 0;
    border: 2px solid #1e2758;
    border-radius: 0.75rem;
    cursor: pointer;
    background: var(--color-bg);
    transition: all 0.2s ease;
  }

  .radio-option:hover {
    border-color: #334155;
    background: #0f1435;
  }

  .radio-option.radio-selected {
    border-color: #60a5fa;
    background: rgba(96, 165, 250, 0.08);
  }

  .radio-option input[type="radio"] {
    display: none;
  }

  .radio-dot {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid #475569;
    position: relative;
    transition: all 0.2s ease;
  }

  .radio-selected .radio-dot {
    border-color: #60a5fa;
  }

  .radio-selected .radio-dot::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #60a5fa;
  }

  .radio-content {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .radio-title {
    font-weight: 600;
    color: #f1f5f9;
    font-size: 0.95rem;
  }

  .radio-desc {
    font-size: 0.825rem;
    color: #94a3b8;
  }

  .radio-selected .radio-title {
    color: #60a5fa;
  }

  .start-exam-btn,
  .submit-btn,
  .retake-btn {
    padding: 1rem 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
    border: none;
    border-radius: 0.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 1rem;
    transition: all 0.2s ease;
  }

  .start-exam-btn:hover,
  .submit-btn:hover:not(:disabled),
  .retake-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(102, 126, 234, 0.35);
  }

  .submit-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .exam-progress {
    margin-bottom: 2rem;
  }

  .exam-progress p {
    color: #cbd5e1;
    font-size: 0.9rem;
  }

  .progress-bar {
    height: 8px;
    background: #1e2758;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    transition: width 0.3s ease;
    border-radius: 4px;
  }

  .question-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 1rem;
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .question-card h3 {
    color: #94a3b8;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0;
  }

  .question-text {
    font-size: 1.2rem;
    line-height: 1.6;
    margin: 1rem 0 2rem;
    color: #f1f5f9;
  }

  .options {
    display: grid;
    gap: 0.75rem;
  }

  .option-btn {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    background: #0f172a;
    border: 2px solid #1e293b;
    border-radius: 0.75rem;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #e2e8f0;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .option-btn:hover {
    border-color: #475569;
    background: #1e293b;
  }

  .option-btn.selected {
    border-color: #60a5fa;
    background: rgba(96, 165, 250, 0.1);
    box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.2);
  }

  .option-letter {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: #1e293b;
    color: #94a3b8;
    font-weight: 700;
    font-size: 0.85rem;
    border: 1px solid #334155;
    transition: all 0.2s ease;
  }

  .option-btn:hover .option-letter {
    border-color: #475569;
    color: #cbd5e1;
  }

  .option-btn.selected .option-letter {
    background: #60a5fa;
    color: #ffffff;
    border-color: #60a5fa;
  }

  .option-text {
    flex: 1;
  }

  .short-answer-wrapper {
    margin-top: 0.5rem;
  }

  .short-answer-input {
    width: 100%;
    padding: 1rem 1.25rem;
    background: #0f172a;
    color: #f1f5f9;
    border: 2px solid #1e293b;
    border-radius: 0.75rem;
    font-size: 1rem;
    font-family: inherit;
    transition: border-color 0.2s ease;
  }

  .short-answer-input:focus {
    outline: none;
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
  }

  .short-answer-input::placeholder {
    color: #475569;
  }

  .instant-feedback {
    margin-top: 1.5rem;
    padding: 1rem 1.25rem;
    border-radius: 0.5rem;
    background: rgba(239, 68, 68, 0.1);
    border-left: 4px solid #ef4444;
    color: #fca5a5;
  }

  .instant-feedback.correct {
    background: rgba(34, 197, 94, 0.1);
    border-left-color: #22c55e;
    color: #86efac;
  }

  .instant-feedback p {
    color: inherit;
  }

  .instant-feedback strong {
    color: inherit;
  }

  .explanation {
    margin-top: 0.5rem;
    font-style: italic;
    opacity: 0.85;
  }

  .exam-navigation {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }

  .exam-navigation button {
    padding: 0.875rem 1.75rem;
    background: #1e293b;
    color: #e2e8f0;
    border: 1px solid #334155;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.95rem;
    transition: all 0.2s ease;
  }

  .exam-navigation button:hover:not(:disabled) {
    background: #334155;
    border-color: #60a5fa;
    color: #ffffff;
  }

  .exam-navigation button:disabled {
    opacity: 0.25;
    cursor: not-allowed;
    color: #64748b;
  }

  .exam-navigation .submit-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
    border: none;
    margin-top: 0;
  }

  .exam-results {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 1rem;
    padding: 2rem;
  }

  .exam-results h2,
  .exam-results h3 {
    color: #f1f5f9;
  }

  .score-display {
    text-align: center;
    margin: 2rem 0;
  }

  .score-circle {
    width: 180px;
    height: 180px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  }

  .score-value {
    font-size: 3rem;
    font-weight: 800;
    color: white;
  }

  .score-text {
    color: #cbd5e1;
    font-size: 1.1rem;
  }

  .review-question {
    background: #0f172a;
    border: 1px solid #1e2758;
    border-left: 4px solid #ef4444;
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin: 1rem 0;
  }

  .review-question.correct {
    border-left-color: #22c55e;
  }

  .review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .question-number {
    font-weight: 600;
    color: #cbd5e1;
  }

  .result-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .review-question-text {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    color: #f1f5f9;
  }

  .review-answer {
    margin: 0.5rem 0;
    color: #cbd5e1;
  }

  .review-answer strong {
    color: #e2e8f0;
  }

  .correct-answer {
    color: #86efac;
  }

  .correct-answer strong {
    color: #86efac;
  }

  .review-explanation {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid #1e2758;
    font-style: italic;
    color: #94a3b8;
  }

  @media (min-width: 768px) {
    .flashcard {
      height: 400px;
    }
  }

  @media (max-width: 640px) {
    .tabs {
      flex-direction: column;
      gap: 0;
    }

    .tab {
      border-bottom: none;
      border-left: 3px solid transparent;
      text-align: left;
    }

    .tab.active {
      border-left-color: #60a5fa;
      border-bottom-color: transparent;
    }

    .flashcard {
      height: 300px;
    }

    .card-text {
      font-size: 1.15rem;
    }

    .flashcard-front,
    .flashcard-back {
      padding: 1.5rem;
    }

    .option-btn {
      padding: 0.875rem 1rem;
    }

    .option-letter {
      width: 28px;
      height: 28px;
      font-size: 0.8rem;
    }

    .exam-navigation {
      flex-direction: column;
    }

    .exam-navigation button {
      width: 100%;
    }

    .review-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
  }
</style>
