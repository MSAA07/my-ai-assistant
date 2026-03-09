<script>
  import { onDestroy } from "svelte";
  import { API_BASE } from "../config.js";
  import { t } from "../lib/i18n/t.js";
  import { language as languageStore } from "../lib/stores/language.js";
  import StatusBadge from "../lib/components/ui/StatusBadge.svelte";

  const POLL_INTERVAL_MS = 2000;
  const FEATURE_KEYS = ["summary", "flashcards", "exam"];

  export let documentId;
  export let documentSection = "summary";

  let docData = null;
  let loading = true;
  let errorKey = "";
  let errorArgs = {};
  let customError = "";
  let error = "";
  let processingStatus = "queued";
  let activeTab = "summary";
  let fetchedDocumentId = "";
  let pollTimeout = null;
  let pendingFeatureRequests = createFeatureMap(false);
  let featureRequestErrors = createFeatureMap("");
  let summaryLength = "medium";
  let flashcardsIncludeExplanations = false;
  let examQuestionCount = 10;

  const VALID_TABS = new Set(["summary", "flashcards", "exam", "notes", "activity"]);

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

  const statusMap = {
    queued: "processing",
    processing: "processing",
    complete: "ready",
    failed: "failed"
  };

  $: statusTone = statusMap[processingStatus] || "info";

  $: _lang = $languageStore;
  $: error = errorKey ? t(errorKey, errorArgs) : customError;
  $: safeFlashcards = Array.isArray(docData?.flashcards) ? docData.flashcards : [];
  $: safeExamQuestions = Array.isArray(docData?.examQuestions) ? docData.examQuestions : [];
  $: hasSummaryContent = hasText(docData?.summary);
  $: currentFlashcard = shuffledCards[currentCardIndex] ?? null;
  $: isProcessingActive = Boolean(docData) && isExtractionActiveStatus(processingStatus);
  $: isProcessingFailure = Boolean(docData) && processingStatus === "failed";
  $: processingTitle = t("document.extracting");
  $: processingNote = t("document.extractingNote");
  $: summaryFeature = createFeatureState("summary", docData, processingStatus, pendingFeatureRequests, featureRequestErrors, _lang);
  $: flashcardsFeature = createFeatureState("flashcards", docData, processingStatus, pendingFeatureRequests, featureRequestErrors, _lang);
  $: examFeature = createFeatureState("exam", docData, processingStatus, pendingFeatureRequests, featureRequestErrors, _lang);

  $: normalizedTab = VALID_TABS.has((documentSection || "").toLowerCase())
    ? (documentSection || "summary").toLowerCase()
    : "summary";

  $: if (activeTab !== normalizedTab) {
    activeTab = normalizedTab;
    onTabChanged(activeTab);
  }

  $: if (documentId && documentId !== fetchedDocumentId) {
    fetchedDocumentId = documentId;
    resetDocumentState();
    void fetchDocument();
  }

  onDestroy(() => {
    stopPolling();
  });

  function createFeatureMap(initialValue) {
    return {
      summary: initialValue,
      flashcards: initialValue,
      exam: initialValue
    };
  }

  function normalizeString(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function hasText(value) {
    return normalizeString(value).length > 0;
  }

  function clearPageError() {
    errorKey = "";
    errorArgs = {};
    customError = "";
  }

  function clearPollTimeout() {
    if (pollTimeout) {
      clearTimeout(pollTimeout);
      pollTimeout = null;
    }
  }

  function stopPolling() {
    clearPollTimeout();
  }

  function schedulePoll(callback, delay = POLL_INTERVAL_MS) {
    clearPollTimeout();
    pollTimeout = setTimeout(() => {
      void callback();
    }, delay);
  }

  function resetDocumentState() {
    stopPolling();
    docData = null;
    loading = true;
    processingStatus = "queued";
    clearPageError();
    pendingFeatureRequests = createFeatureMap(false);
    featureRequestErrors = createFeatureMap("");
    summaryLength = "medium";
    flashcardsIncludeExplanations = false;
    examQuestionCount = 10;
    currentCardIndex = 0;
    showAnswer = false;
    shuffledCards = [];
    resetExam();
  }

  function normalizeDocumentStatus(status) {
    const normalizedStatus = typeof status === "string" ? status.toLowerCase() : "";

    if (normalizedStatus === "queued" || normalizedStatus === "processing" || normalizedStatus === "complete" || normalizedStatus === "failed") {
      return normalizedStatus;
    }

    return "failed";
  }

  function normalizeGenerationStatus(status) {
    const normalizedStatus = normalizeString(status).toLowerCase();

    if (normalizedStatus === "not_requested" || normalizedStatus === "queued" || normalizedStatus === "running" || normalizedStatus === "complete" || normalizedStatus === "failed") {
      return normalizedStatus;
    }

    return "not_requested";
  }

  function isExtractionActiveStatus(status) {
    return status === "queued" || status === "processing";
  }

  function isGenerationActiveStatus(status) {
    return status === "queued" || status === "running";
  }

  function getFeatureContentState(featureKey, document = docData) {
    if (featureKey === "summary") {
      return {
        hasMirrorContent: hasText(document?.summary)
      };
    }

    if (featureKey === "flashcards") {
      return {
        hasMirrorContent: Array.isArray(document?.flashcards) && document.flashcards.length > 0
      };
    }

    return {
      hasMirrorContent: Array.isArray(document?.examQuestions) && document.examQuestions.length > 0
    };
  }

  function createFeatureState(featureKey, document, extractionStatus, pendingRequests, requestErrors, _langSignal) {
    void _langSignal;

    const generation = document?.generationState?.[featureKey] ?? {};
    const status = normalizeGenerationStatus(generation?.status);
    const { hasMirrorContent } = getFeatureContentState(featureKey, document);
    const isBusy = Boolean(pendingRequests?.[featureKey]) || isGenerationActiveStatus(status);
    const errorMessage = normalizeString(requestErrors?.[featureKey]) || normalizeString(generation?.errorMessage);
    const shouldUseRegenerate = hasMirrorContent || status === "complete";

    return {
      status,
      errorMessage,
      hasMirrorContent,
      isBusy,
      canSubmit: extractionStatus === "complete" && !isBusy,
      shouldUseRegenerate
    };
  }

  function getFeatureActionLabelKey(feature) {
    if (feature.isBusy) {
      return "document.actions.generating";
    }

    if (feature.status === "failed") {
      return "document.actions.retry";
    }

    return feature.shouldUseRegenerate
      ? "document.actions.regenerate"
      : "document.actions.generate";
  }

  function getFeaturePromptKey(featureKey) {
    if (featureKey === "summary") {
      return "document.summary.generatePrompt";
    }

    if (featureKey === "flashcards") {
      return "document.flashcards.generatePrompt";
    }

    return "document.exam.generatePrompt";
  }

  function getFeatureEmptyMessage(featureKey, feature, _langSignal) {
    void _langSignal;

    if (feature.isBusy) {
      return t(feature.status === "queued"
        ? "document.generation.queuedNoContent"
        : "document.generation.runningNoContent");
    }

    if (feature.status === "failed") {
      return feature.errorMessage || t("document.generation.failedNoContent");
    }

    if (feature.status === "complete") {
      return t("document.generation.missingContent");
    }

    return t(getFeaturePromptKey(featureKey));
  }

  function getFeatureBannerMessage(feature, _langSignal) {
    void _langSignal;

    if (feature.isBusy) {
      return t("document.generation.regenerating");
    }

    if (feature.status === "failed") {
      return feature.errorMessage || t("document.generation.failedWithContent");
    }

    return "";
  }

  function hasActiveGeneration(document) {
    return FEATURE_KEYS.some((featureKey) => {
      const status = normalizeGenerationStatus(document?.generationState?.[featureKey]?.status);
      return isGenerationActiveStatus(status);
    });
  }

  function shouldPollDocument(document) {
    const nextProcessingStatus = normalizeDocumentStatus(document?.processingStatus);
    return isExtractionActiveStatus(nextProcessingStatus)
      || hasActiveGeneration(document)
      || FEATURE_KEYS.some((featureKey) => pendingFeatureRequests[featureKey]);
  }

  function syncFeatureRequestState(nextDocument) {
    const nextPendingState = { ...pendingFeatureRequests };
    const nextErrorState = { ...featureRequestErrors };

    for (const featureKey of FEATURE_KEYS) {
      const serverStatus = normalizeGenerationStatus(nextDocument?.generationState?.[featureKey]?.status);
      const { hasMirrorContent } = getFeatureContentState(featureKey, nextDocument);

      if (nextPendingState[featureKey] && (serverStatus !== "not_requested" || hasMirrorContent)) {
        nextPendingState[featureKey] = false;
        nextErrorState[featureKey] = "";
      }
    }

    pendingFeatureRequests = nextPendingState;
    featureRequestErrors = nextErrorState;
  }

  function setDocument(nextDocument) {
    const previousFlashcards = Array.isArray(docData?.flashcards) ? docData.flashcards : [];
    const previousExamQuestions = Array.isArray(docData?.examQuestions) ? docData.examQuestions : [];
    const nextFlashcards = Array.isArray(nextDocument?.flashcards) ? nextDocument.flashcards : [];
    const nextExamQuestions = Array.isArray(nextDocument?.examQuestions) ? nextDocument.examQuestions : [];
    const flashcardsChanged = JSON.stringify(previousFlashcards) !== JSON.stringify(nextFlashcards);
    const examQuestionsChanged = JSON.stringify(previousExamQuestions) !== JSON.stringify(nextExamQuestions);

    docData = nextDocument;
    processingStatus = normalizeDocumentStatus(nextDocument?.processingStatus);
    syncFeatureRequestState(nextDocument);

    if (nextFlashcards.length === 0) {
      shuffledCards = [];
      currentCardIndex = 0;
      showAnswer = false;
    } else if (flashcardsChanged || shuffledCards.length === 0) {
      shuffledCards = [...nextFlashcards];
      currentCardIndex = 0;
      showAnswer = false;
    } else if (currentCardIndex > shuffledCards.length - 1) {
      currentCardIndex = Math.max(shuffledCards.length - 1, 0);
      showAnswer = false;
    }

    if (examQuestionsChanged) {
      resetExam();
    }
  }

  async function fetchDocument({ background = false } = {}) {
    if (!background) {
      loading = true;
      clearPageError();
    }

    clearPollTimeout();

    try {
      const response = await fetch(
        `${API_BASE}/api/document/${documentId}`,
        { credentials: "include" }
      );
      const data = await response.json().catch(() => null);

      if (fetchedDocumentId !== documentId) {
        return false;
      }

      if (response.ok && data?.document) {
        const nextDocument = data.document;
        clearPageError();
        setDocument(nextDocument);

        if (processingStatus === "failed") {
          customError = nextDocument?.processingError || t("document.processingFailed");
          return true;
        }

        if (shouldPollDocument(nextDocument)) {
          schedulePoll(() => fetchDocument({ background: true }));
        }

        return true;
      }

      if (background && docData) {
        schedulePoll(() => fetchDocument({ background: true }));
        return false;
      }

      processingStatus = "failed";
      if (data?.error) {
        customError = data.error;
      } else {
        errorKey = "document.notFound";
      }
      return false;
    } catch (err) {
      if (fetchedDocumentId !== documentId) {
        return false;
      }

      if (background && docData) {
        schedulePoll(() => fetchDocument({ background: true }));
        return false;
      }

      processingStatus = "failed";
      errorKey = "document.loadingError";
      errorArgs = {};
      customError = "";
      return false;
    } finally {
      if (!background) {
        loading = false;
      }
    }
  }

  function onTabChanged(tab) {
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

  function setTab(tab) {
    const nextTab = VALID_TABS.has(tab) ? tab : "summary";
    window.location.hash = `/documents/${documentId}/${nextTab}`;
  }

  function setFeaturePending(featureKey, value) {
    pendingFeatureRequests = {
      ...pendingFeatureRequests,
      [featureKey]: value
    };
  }

  function setFeatureError(featureKey, message = "") {
    featureRequestErrors = {
      ...featureRequestErrors,
      [featureKey]: message
    };
  }

  function getGenerationOptions(featureKey) {
    if (featureKey === "summary") {
      return { length: summaryLength };
    }

    if (featureKey === "flashcards") {
      return { includeExplanations: flashcardsIncludeExplanations };
    }

    return { questionCount: Number(examQuestionCount) };
  }

  async function triggerGeneration(featureKey) {
    const feature = createFeatureState(
      featureKey,
      docData,
      processingStatus,
      pendingFeatureRequests,
      featureRequestErrors,
      _lang
    );
    if (!documentId || !feature.canSubmit) {
      return;
    }

    setFeatureError(featureKey, "");
    setFeaturePending(featureKey, true);

    let generationQueued = false;

    try {
      const response = await fetch(`${API_BASE}/api/document/${documentId}/generations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          type: featureKey,
          options: getGenerationOptions(featureKey),
          regenerate: feature.shouldUseRegenerate
        })
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || t("document.generation.requestFailed"));
      }

      generationQueued = true;
      await fetchDocument({ background: true });
    } catch (err) {
      setFeaturePending(featureKey, false);
      setFeatureError(featureKey, normalizeString(err?.message) || t("document.generation.requestFailed"));
    } finally {
      if (!generationQueued) {
        setFeaturePending(featureKey, false);
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
    if (safeExamQuestions.length === 0) {
      return;
    }

    examStarted = true;
    currentQuestionIndex = 0;
    userAnswers = new Array(safeExamQuestions.length).fill(null);
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
    if (currentQuestionIndex < safeExamQuestions.length - 1) {
      currentQuestionIndex++;
    }
  }

  function previousQuestion() {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
    }
  }

  function submitExam() {
    let correct = 0;
    safeExamQuestions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    score = correct;
    examComplete = true;

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    window.location.hash = "/documents";
  }

  function goToDashboard() {
    window.location.hash = "/dashboard";
  }
</script>

{#if loading && !docData}
  <div class="loading-container">
    <div class="loading-spinner"></div>
    <p>{t('document.loading')}</p>
  </div>
{:else if error}
  <div class="error-container">
    <h2>{isProcessingFailure ? t('document.processingFailedTitle') : t('status.failed')}</h2>
    <p>{error}</p>
    {#if isProcessingFailure}
      <p class="error-note">{t('document.processingFailedHelp')}</p>
      <div class="error-actions">
        <button class="secondary-action" on:click={goBack}>{t('document.backToDocuments')}</button>
        <button class="primary-action" on:click={goToDashboard}>{t('document.uploadAgain')}</button>
      </div>
    {:else}
      <button on:click={goBack}>{t('document.backToDocuments')}</button>
    {/if}
  </div>
{:else if isProcessingActive}
  <div class="loading-container">
    <div class="loading-spinner"></div>
    <p>{processingTitle}</p>
    <p class="processing-note">{processingNote}</p>
  </div>
{:else if docData}
  <div class="document-view">
    <div class="document-header">
      <div class="header-line">
        <button class="back-btn" on:click={goBack}>{t('document.back')}</button>
        <StatusBadge status={statusTone} />
      </div>
      <h1>{docData.originalName}</h1>
      <p class="doc-meta">
        {t('document.uploaded')}: {new Date(docData.uploadDate).toLocaleDateString()} · {t('document.language')}: {docData.language === "arabic" ? t('home.documents.languageArabic') : t('home.documents.languageEnglish')}
      </p>
    </div>

    <div class="tabs">
      <button
        class="tab"
        class:active={activeTab === "summary"}
        on:click={() => setTab("summary")}
      >
        {t('document.tabs.summary')}
      </button>
      <button
        class="tab"
        class:active={activeTab === "flashcards"}
        on:click={() => setTab("flashcards")}
      >
        {t('document.tabs.flashcards', { count: docData.flashcardCount ?? safeFlashcards.length })}
      </button>
      <button
        class="tab"
        class:active={activeTab === "exam"}
        on:click={() => setTab("exam")}
      >
        {t('document.tabs.exam', { count: docData.questionCount ?? safeExamQuestions.length })}
      </button>
    </div>

    <div class="tab-content">
      {#if activeTab === "summary"}
        <div class="feature-stack">
          <div class="feature-panel">
            <div class="feature-panel-header">
              <h2>{t("document.tabs.summary")}</h2>
            </div>
            <div class="feature-controls">
              <label class="feature-field">
                <span class="feature-field-label">{t("document.options.summaryLength")}</span>
                <select bind:value={summaryLength} disabled={summaryFeature.isBusy}>
                  <option value="short">{t("document.options.short")}</option>
                  <option value="medium">{t("document.options.medium")}</option>
                  <option value="long">{t("document.options.long")}</option>
                </select>
              </label>
              <button
                class="feature-action-btn"
                on:click={() => triggerGeneration("summary")}
                disabled={!summaryFeature.canSubmit}
              >
                {t(getFeatureActionLabelKey(summaryFeature))}
              </button>
            </div>
            {#if summaryFeature.hasMirrorContent && (summaryFeature.isBusy || summaryFeature.status === "failed")}
              <div
                class="feature-banner"
                class:feature-banner--error={summaryFeature.status === "failed"}
              >
                {getFeatureBannerMessage(summaryFeature, _lang)}
              </div>
            {/if}
          </div>

          <div class="summary-section">
            {#if hasSummaryContent}
              <div class="summary-text">
                {docData.summary}
              </div>
            {:else}
              <div class="feature-empty-state">
                <p class="summary-text">{getFeatureEmptyMessage("summary", summaryFeature, _lang)}</p>
              </div>
            {/if}
          </div>
        </div>
      {:else if activeTab === "flashcards"}
        <div class="feature-stack flashcards-section">
          <div class="feature-panel">
            <div class="feature-panel-header">
              <h2>{t("document.tabs.flashcards", { count: docData.flashcardCount ?? safeFlashcards.length })}</h2>
            </div>
            <div class="feature-controls">
              <label class="feature-checkbox">
                <input
                  type="checkbox"
                  bind:checked={flashcardsIncludeExplanations}
                  disabled={flashcardsFeature.isBusy}
                />
                <span>{t("document.options.includeExplanations")}</span>
              </label>
              <button
                class="feature-action-btn"
                on:click={() => triggerGeneration("flashcards")}
                disabled={!flashcardsFeature.canSubmit}
              >
                {t(getFeatureActionLabelKey(flashcardsFeature))}
              </button>
            </div>
            {#if flashcardsFeature.hasMirrorContent && (flashcardsFeature.isBusy || flashcardsFeature.status === "failed")}
              <div
                class="feature-banner"
                class:feature-banner--error={flashcardsFeature.status === "failed"}
              >
                {getFeatureBannerMessage(flashcardsFeature, _lang)}
              </div>
            {/if}
          </div>

          {#if !currentFlashcard}
            <div class="summary-section">
              <div class="feature-empty-state">
                <div class="summary-text">{getFeatureEmptyMessage("flashcards", flashcardsFeature, _lang)}</div>
              </div>
            </div>
          {:else}
            <div class="flashcard-controls">
              <button class="shuffle-btn" on:click={shuffleCards}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
                {t("document.flashcards.shuffle")}
              </button>
              <span class="card-counter">
                {t("document.flashcards.cardCounter", { current: currentCardIndex + 1, total: shuffledCards.length })}
              </span>
            </div>

            <div class="flashcard" class:flipped={showAnswer} on:click={flipCard} on:keydown={(e) => e.key === "Enter" && flipCard()} role="button" tabindex="0">
              <div class="flashcard-inner">
                <div class="flashcard-front">
                  <div class="card-label">{t("document.flashcards.question")}</div>
                  <div class="card-text">
                    {currentFlashcard.question}
                  </div>
                  <div class="flip-hint">{t("document.flashcards.flipHint")}</div>
                </div>
                <div class="flashcard-back">
                  <div class="card-label">{t("document.flashcards.answer")}</div>
                  <div class="card-text">
                    {currentFlashcard.answer}
                  </div>
                  {#if currentFlashcard.explanation}
                    <div class="flashcard-explanation">
                      <strong>{t("document.flashcards.explanation")}</strong>
                      <p>{currentFlashcard.explanation}</p>
                    </div>
                  {/if}
                </div>
              </div>
            </div>

            <div class="flashcard-nav">
              <button on:click={previousCard} disabled={currentCardIndex === 0}>
                {t("document.flashcards.previous")}
              </button>
              <button
                on:click={nextCard}
                disabled={currentCardIndex === shuffledCards.length - 1}
              >
                {t("document.flashcards.next")}
              </button>
            </div>
          {/if}
        </div>
      {:else if activeTab === "exam"}
        <div class="feature-stack exam-section">
          <div class="feature-panel">
            <div class="feature-panel-header">
              <h2>{t("document.tabs.exam", { count: docData.questionCount ?? safeExamQuestions.length })}</h2>
            </div>
            <div class="feature-controls">
              <label class="feature-field">
                <span class="feature-field-label">{t("document.options.questionCount")}</span>
                <select bind:value={examQuestionCount} disabled={examFeature.isBusy}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                </select>
              </label>
              <button
                class="feature-action-btn"
                on:click={() => triggerGeneration("exam")}
                disabled={!examFeature.canSubmit}
              >
                {t(getFeatureActionLabelKey(examFeature))}
              </button>
            </div>
            {#if examFeature.hasMirrorContent && (examFeature.isBusy || examFeature.status === "failed")}
              <div
                class="feature-banner"
                class:feature-banner--error={examFeature.status === "failed"}
              >
                {getFeatureBannerMessage(examFeature, _lang)}
              </div>
            {/if}
          </div>

          {#if safeExamQuestions.length === 0}
            <div class="summary-section">
              <div class="feature-empty-state">
                <div class="summary-text">{getFeatureEmptyMessage("exam", examFeature, _lang)}</div>
              </div>
            </div>
          {:else if !examStarted}
            <div class="exam-intro">
              <h2>{t("document.exam.readyTitle")}</h2>
              <p>
                {t("document.exam.questionCount", { count: safeExamQuestions.length })}
              </p>

              <div class="exam-options">
                <p><strong>{t("document.exam.feedbackPrompt")}</strong></p>
                <label class="radio-option" class:radio-selected={showAnswersMode === "instant"}>
                  <input
                    type="radio"
                    bind:group={showAnswersMode}
                    value="instant"
                  />
                  <span class="radio-dot"></span>
                  <span class="radio-content">
                    <span class="radio-title">{t("document.exam.instantTitle")}</span>
                    <span class="radio-desc">{t("document.exam.instantDescription")}</span>
                  </span>
                </label>
                <label class="radio-option" class:radio-selected={showAnswersMode === "end"}>
                  <input
                    type="radio"
                    bind:group={showAnswersMode}
                    value="end"
                  />
                  <span class="radio-dot"></span>
                  <span class="radio-content">
                    <span class="radio-title">{t("document.exam.endTitle")}</span>
                    <span class="radio-desc">{t("document.exam.endDescription")}</span>
                  </span>
                </label>
              </div>

              <button class="start-exam-btn" on:click={startExam}>
                {t("document.exam.start")}
              </button>
            </div>
          {:else if !examComplete}
            <div class="exam-progress">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  style="width: {((currentQuestionIndex + 1) /
                    safeExamQuestions.length) *
                    100}%"
                ></div>
              </div>
              <p>
                {t("document.exam.progress", { current: currentQuestionIndex + 1, total: safeExamQuestions.length })}
              </p>
            </div>

            {#each safeExamQuestions as question, i}
              {#if i === currentQuestionIndex}
                <div class="question-card">
                  <h3>{t("document.exam.questionNumber", { index: i + 1 })}</h3>
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
                        placeholder={t("document.exam.inputPlaceholder")}
                        value={userAnswers[i] || ""}
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
                            ? t("document.exam.instantCorrect")
                            : t("document.exam.instantIncorrect")}
                        </strong>
                      </p>
                      {#if userAnswers[i] !== question.correctAnswer}
                        <p>{t("document.exam.instantAnswer", { answer: question.correctAnswer })}</p>
                      {/if}
                      <p class="explanation">{t("document.exam.instantExplanation", { explanation: question.explanation })}</p>
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
                {t("document.exam.previous")}
              </button>

              {#if currentQuestionIndex < safeExamQuestions.length - 1}
                <button on:click={nextQuestion}>{t("document.exam.next")}</button>
              {:else}
                <button
                  class="submit-btn"
                  on:click={submitExam}
                  disabled={userAnswers.some((answer) => answer === null || answer === "")}
                >
                  {t("document.exam.submit")}
                </button>
              {/if}
            </div>
          {:else}
            <div class="exam-results">
              <h2>{t("document.exam.completeTitle")}</h2>
              <div class="score-display">
                <div class="score-circle">
                  <span class="score-value"
                    >{Math.round(
                      (score / safeExamQuestions.length) * 100,
                    )}%</span
                  >
                </div>
                <p class="score-text">
                  {t("document.exam.score", { score, total: safeExamQuestions.length })}
                </p>
              </div>

              <h3>{t("document.exam.reviewTitle")}</h3>
              {#each safeExamQuestions as question, i}
                <div
                  class="review-question"
                  class:correct={userAnswers[i] === question.correctAnswer}
                >
                  <div class="review-header">
                    <span class="question-number">{t("document.exam.reviewQuestion", { index: i + 1 })}</span>
                    <span class="result-badge">
                      {userAnswers[i] === question.correctAnswer
                        ? t("document.exam.reviewCorrect")
                        : t("document.exam.reviewIncorrect")}
                    </span>
                  </div>
                  <p class="review-question-text">{question.question}</p>
                  <p class="review-answer">
                    {t("document.exam.reviewYourAnswer", { answer: userAnswers[i] || t("document.exam.reviewNotAnswered") })}
                  </p>
                  {#if userAnswers[i] !== question.correctAnswer}
                    <p class="review-answer correct-answer">
                      {t("document.exam.reviewCorrectAnswer", { answer: question.correctAnswer })}
                    </p>
                  {/if}
                  <p class="review-explanation">{question.explanation}</p>
                </div>
              {/each}

              <button class="retake-btn" on:click={resetExam}>
                {t("document.exam.retake")}
              </button>
            </div>
          {/if}
        </div>
      {:else if activeTab === "notes"}
        <div class="summary-section">
          <h2>Notes</h2>
          <div class="summary-text">{t('common.comingSoon')}</div>
        </div>
      {:else if activeTab === "activity"}
        <div class="summary-section">
          <h2>Activity</h2>
          <div class="summary-text">{t('common.comingSoon')}</div>
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

  .processing-note {
    color: var(--color-text-secondary);
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }

  .error-note {
    color: var(--color-text-secondary);
    margin-top: 0.5rem;
  }

  .error-actions {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-top: 1.5rem;
  }

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid var(--color-border);
    border-top-color: var(--color-accent-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  .error-container button {
    padding: 0.75rem 1.5rem;
    background: var(--color-surface-2);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-1);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--motion-fast) var(--ease-standard);
  }

  .error-container button:hover {
    background: var(--color-surface-1);
    border-color: var(--color-accent-primary);
  }

  .error-container .primary-action {
    background: var(--gradient-accent-strong);
    color: var(--color-bg);
    border: none;
  }

  .error-container .primary-action:hover {
    background: var(--gradient-accent-strong);
    box-shadow: 0 6px 24px var(--color-glow);
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
    display: grid;
    gap: var(--space-2);
  }

  .header-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
  }

  .document-header h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    color: var(--color-text-primary);
  }

  .doc-meta {
    color: var(--color-text-secondary);
    font-size: 0.9rem;
  }

  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.6rem 1.25rem;
    background: var(--color-surface-2);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-1);
    cursor: pointer;
    margin-bottom: 1rem;
    font-weight: 500;
    font-size: 0.95rem;
    transition: all var(--motion-fast) var(--ease-standard);
  }

  .back-btn:hover {
    background: var(--color-surface-1);
    border-color: var(--color-accent-primary);
  }

  .tabs {
    display: flex;
    gap: 0.25rem;
    border-bottom: 2px solid var(--color-border);
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
    color: var(--color-text-muted);
    transition: all var(--motion-fast) var(--ease-standard);
  }

  .tab:hover {
    color: var(--color-text-primary);
    background: var(--color-surface-2);
  }

  .tab.active {
    border-bottom-color: var(--color-accent-primary);
    color: var(--color-accent-primary);
  }

  .summary-section {
    background: var(--color-surface-1);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-2);
    padding: var(--space-6);
  }

  .summary-section h2 {
    color: var(--color-text-primary);
    margin-top: 0;
  }

  .summary-text {
    line-height: 1.8;
    white-space: pre-wrap;
    color: var(--color-text-secondary);
  }

  .feature-stack {
    display: grid;
    gap: var(--space-4);
  }

  .feature-panel {
    background: var(--color-surface-1);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-2);
    padding: var(--space-5);
    display: grid;
    gap: var(--space-4);
  }

  .feature-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
  }

  .feature-panel-header h2 {
    margin: 0;
    color: var(--color-text-primary);
  }

  .feature-controls {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .feature-field {
    display: grid;
    gap: var(--space-2);
    min-width: min(100%, 220px);
  }

  .feature-field-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--color-text-secondary);
  }

  .feature-field select {
    min-height: 44px;
    padding: 0.75rem 1rem;
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-1);
    color: var(--color-text-primary);
    font: inherit;
  }

  .feature-checkbox {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    min-height: 44px;
    padding: 0.75rem 1rem;
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-1);
    color: var(--color-text-primary);
  }

  .feature-checkbox input {
    width: 16px;
    height: 16px;
    accent-color: var(--color-accent-primary);
  }

  .feature-action-btn {
    min-height: 44px;
    padding: 0.875rem 1.5rem;
    background: var(--gradient-accent-strong);
    color: var(--color-bg);
    border: none;
    border-radius: var(--radius-1);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--motion-fast) var(--ease-standard);
  }

  .feature-action-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 24px var(--color-glow);
  }

  .feature-action-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .feature-banner {
    padding: 0.875rem 1rem;
    border-radius: var(--radius-1);
    background: color-mix(in srgb, var(--color-info) 14%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-info) 35%, transparent);
    color: color-mix(in srgb, var(--color-info) 82%, white 18%);
    line-height: 1.6;
  }

  .feature-banner--error {
    background: var(--color-danger-surface);
    border-color: color-mix(in srgb, var(--color-danger) 35%, transparent);
    color: var(--color-danger);
  }

  .feature-empty-state {
    min-height: 120px;
    display: flex;
    align-items: center;
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
    color: var(--color-text-secondary);
  }

  .shuffle-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: 0.6rem 1.25rem;
    background: transparent;
    color: var(--color-accent-primary);
    border: 1px solid var(--color-accent-primary);
    border-radius: var(--radius-1);
    font-weight: 600;
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition: all var(--motion-fast) var(--ease-standard);
  }

  .shuffle-btn:hover {
    background: var(--color-accent-surface);
    box-shadow: 0 0 16px var(--color-glow);
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
    background: var(--gradient-accent-strong);
    color: var(--color-bg);
    border-color: var(--color-accent-primary);
  }

  .card-label {
    font-size: var(--font-size-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-muted);
    margin-bottom: var(--space-3);
  }

  .flashcard-back .card-label {
    color: var(--color-text-soft);
  }

  .card-text {
    font-size: 1.4rem;
    line-height: 1.6;
    color: var(--color-text-primary);
  }

  .flashcard-back .card-text {
    color: var(--color-bg);
  }

  .flashcard-explanation {
    margin-top: var(--space-4);
    padding-top: var(--space-4);
    border-top: 1px solid color-mix(in srgb, var(--color-text-soft) 35%, transparent);
    text-align: start;
    width: 100%;
    color: var(--color-bg);
  }

  .flashcard-explanation strong {
    display: block;
    margin-bottom: 0.35rem;
  }

  .flashcard-explanation p {
    margin: 0;
    color: inherit;
    line-height: 1.6;
  }

  .flip-hint {
    margin-top: var(--space-4);
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
  }

  .flashcard-nav {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }

  .flashcard-nav button {
    flex: 1;
    padding: 0.875rem 1rem;
    background: var(--color-surface-2);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-1);
    cursor: pointer;
    font-weight: 600;
    font-size: 0.95rem;
    transition: all var(--motion-fast) var(--ease-standard);
  }

  .flashcard-nav button:hover:not(:disabled) {
    background: var(--color-surface-1);
    border-color: var(--color-accent-primary);
    color: var(--color-text-primary);
  }

  .flashcard-nav button:disabled {
    opacity: 0.25;
    cursor: not-allowed;
    color: var(--color-text-muted);
  }

  .exam-intro {
    text-align: center;
    padding: 3rem 2rem;
    background: var(--color-surface-1);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-2);
  }

  .exam-intro h2 {
    color: var(--color-text-primary);
  }

  .exam-intro p {
    color: var(--color-text-secondary);
  }

  .exam-options {
    margin: 2rem 0;
    text-align: start;
    max-width: 500px;
    margin-inline-start: auto;
    margin-inline-end: auto;
  }

  .exam-options > p {
    text-align: center;
    margin-bottom: 1rem;
    color: var(--color-text-secondary);
  }

  .radio-option {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 1.125rem 1.25rem;
    margin: 0.625rem 0;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-2);
    cursor: pointer;
    background: var(--color-surface-1);
    transition: all var(--motion-fast) var(--ease-standard);
  }

  .radio-option:hover {
    border-color: var(--color-border-light);
    background: var(--color-surface-2);
  }

  .radio-option.radio-selected {
    border-color: var(--color-accent-primary);
    background: var(--color-accent-surface);
  }

  .radio-option input[type="radio"] {
    display: none;
  }

  .radio-dot {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid var(--color-border-light);
    position: relative;
    transition: all var(--motion-fast) var(--ease-standard);
  }

  .radio-selected .radio-dot {
    border-color: var(--color-accent-primary);
  }

  .radio-selected .radio-dot::after {
    content: '';
    position: absolute;
    top: 3px;
    inset-inline-start: 3px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--color-accent-primary);
  }

  .radio-content {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .radio-title {
    font-weight: 600;
    color: var(--color-text-primary);
    font-size: 0.95rem;
  }

  .radio-desc {
    font-size: 0.825rem;
    color: var(--color-text-muted);
  }

  .radio-selected .radio-title {
    color: var(--color-accent-primary);
  }

  .start-exam-btn,
  .submit-btn,
  .retake-btn {
    padding: 1rem 2rem;
    background: var(--gradient-accent-strong);
    color: var(--color-bg);
    border: none;
    border-radius: var(--radius-1);
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 1rem;
    transition: all var(--motion-fast) var(--ease-standard);
  }

  .start-exam-btn:hover,
  .submit-btn:hover:not(:disabled),
  .retake-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px var(--color-glow);
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
    color: var(--color-text-secondary);
    font-size: 0.9rem;
  }

  .progress-bar {
    height: 8px;
    background: var(--color-border);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  .progress-fill {
    height: 100%;
    background: var(--gradient-accent-strong);
    transition: width 0.3s ease;
    border-radius: 4px;
  }

  .question-card {
    background: var(--color-surface-1);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-2);
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .question-card h3 {
    color: var(--color-text-muted);
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0;
  }

  .question-text {
    font-size: 1.2rem;
    line-height: 1.6;
    margin: 1rem 0 2rem;
    color: var(--color-text-primary);
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
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-2);
    text-align: start;
    cursor: pointer;
    transition: all var(--motion-fast) var(--ease-standard);
    color: var(--color-text-primary);
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .option-btn:hover {
    border-color: var(--color-border-light);
    background: var(--color-surface-1);
  }

  .option-btn.selected {
    border-color: var(--color-accent-primary);
    background: var(--color-accent-surface);
    box-shadow: 0 0 0 1px var(--color-accent-surface);
  }

  .option-letter {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--color-surface-2);
    color: var(--color-text-secondary);
    font-weight: 700;
    font-size: 0.85rem;
    border: 1px solid var(--color-border);
    transition: all var(--motion-fast) var(--ease-standard);
  }

  .option-btn:hover .option-letter {
    border-color: var(--color-border-light);
    color: var(--color-text-primary);
  }

  .option-btn.selected .option-letter {
    background: var(--color-accent-primary);
    color: var(--color-bg);
    border-color: var(--color-accent-primary);
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
    background: var(--color-surface-2);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-2);
    font-size: 1rem;
    font-family: inherit;
    transition: border-color var(--motion-fast) var(--ease-standard);
  }

  .short-answer-input:focus {
    outline: none;
    border-color: var(--color-accent-primary);
    box-shadow: 0 0 0 3px var(--color-accent-surface);
  }

  .short-answer-input::placeholder {
    color: var(--color-text-muted);
  }

  .instant-feedback {
    margin-top: 1.5rem;
    padding: 1rem 1.25rem;
    border-radius: var(--radius-1);
    background: var(--color-danger-surface);
    border-inline-start: 4px solid var(--color-danger);
    color: var(--color-danger);
  }

  .instant-feedback.correct {
    background: var(--color-success-surface);
    border-inline-start-color: var(--color-success);
    color: var(--color-success);
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
    background: var(--color-surface-2);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-1);
    cursor: pointer;
    font-weight: 600;
    font-size: 0.95rem;
    transition: all var(--motion-fast) var(--ease-standard);
  }

  .exam-navigation button:hover:not(:disabled) {
    background: var(--color-surface-1);
    border-color: var(--color-accent-primary);
    color: var(--color-text-primary);
  }

  .exam-navigation button:disabled {
    opacity: 0.25;
    cursor: not-allowed;
    color: var(--color-text-muted);
  }

  .exam-navigation .submit-btn {
    background: var(--gradient-accent-strong);
    color: var(--color-bg);
    border: none;
    margin-top: 0;
  }

  .exam-results {
    background: var(--color-surface-1);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-2);
    padding: 2rem;
  }

  .exam-results h2,
  .exam-results h3 {
    color: var(--color-text-primary);
  }

  .score-display {
    text-align: center;
    margin: 2rem 0;
  }

  .score-circle {
    width: 180px;
    height: 180px;
    border-radius: 50%;
    background: var(--gradient-accent-strong);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    box-shadow: 0 8px 32px var(--color-glow);
  }

  .score-value {
    font-size: 3rem;
    font-weight: 800;
    color: var(--color-bg);
  }

  .score-text {
    color: var(--color-text-secondary);
    font-size: 1.1rem;
  }

  .review-question {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-inline-start: 4px solid var(--color-danger);
    border-radius: var(--radius-1);
    padding: 1.5rem;
    margin: 1rem 0;
  }

  .review-question.correct {
    border-inline-start-color: var(--color-success);
  }

  .review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .question-number {
    font-weight: 600;
    color: var(--color-text-secondary);
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
    color: var(--color-text-primary);
  }

  .review-answer {
    margin: 0.5rem 0;
    color: var(--color-text-secondary);
  }

  .correct-answer {
    color: var(--color-success);
  }

  .review-explanation {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--color-border);
    font-style: italic;
    color: var(--color-text-muted);
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
      border-inline-start: 3px solid transparent;
      text-align: start;
    }

    .tab.active {
      border-inline-start-color: var(--color-accent-primary);
      border-bottom-color: transparent;
    }

    .feature-controls {
      flex-direction: column;
      align-items: stretch;
    }

    .feature-field {
      min-width: 100%;
    }

    .feature-action-btn {
      width: 100%;
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
