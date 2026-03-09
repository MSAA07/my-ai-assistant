
<script>
  import { onDestroy } from 'svelte';
  import { API_BASE } from '../config.js';
  import {
    createExamAttempt,
    createExamExport,
    getCurrentAttempt,
    getDocument,
    getExam,
    getExportDownloadUrl,
    getFlashcardSet,
    getIncorrectSession,
    listExams,
    listExportArtifacts,
    listFlashcardSets,
    patchFlashcardCardState,
    requestGeneration,
    restartExamAttempt,
    reviewExamAttempt,
    saveExamAttempt,
    submitExamAttempt
  } from '../lib/api/studyHub.js';

  export let documentId = '';
  export let studyTab = 'summary';

  const VALID_TABS = new Set(['summary', 'flashcards', 'exams', 'exports']);
  const POLL_INTERVAL_MS = 2500;

  let docsForSwitcher = [];
  let currentDocumentId = '';
  let documentData = null;
  let loadingDocument = true;
  let documentError = '';
  let pollTimer = null;
  let activeTab = 'summary';
  let summaryLength = 'medium';
  let summaryRequestInFlight = false;
  let generationError = '';

  let flashcardLoading = false;
  let flashcardError = '';
  let flashcardSets = [];
  let selectedSetId = '';
  let flashcardSet = null;
  let flashcardCardIndex = 0;
  let flashcardShowAnswer = false;
  let incorrectSessionCards = [];
  let incorrectSessionEnabled = false;
  let patchingCardId = '';

  let examsLoading = false;
  let examsError = '';
  let examRecords = [];
  let selectedExamId = '';
  let examDetail = null;
  let currentAttempt = null;
  let reviewPayload = null;
  let examAnswers = {};
  let examQuestionIndex = 0;
  let examFeedbackMode = 'end';
  let examActionBusy = false;

  let exportsLoading = false;
  let exportsError = '';
  let exportArtifacts = [];
  let exportActionBusy = false;
  let selectedExportExamId = '';

  $: normalizedRequestedTab = VALID_TABS.has((studyTab || '').toLowerCase()) ? studyTab.toLowerCase() : 'summary';
  $: if (activeTab !== normalizedRequestedTab) {
    activeTab = normalizedRequestedTab;
    void loadTabData(activeTab);
  }

  $: if (documentId && documentId !== currentDocumentId) {
    currentDocumentId = documentId;
    resetStateForDocument();
    void fetchDocumentState();
    void fetchDocumentOptions();
  }

  $: summaryStatus = normalizeGenerationStatus(documentData?.generationState?.summary?.status);
  $: extractionStatus = normalizeDocumentStatus(documentData?.processingStatus);
  $: summaryCanGenerate = extractionStatus === 'complete' && !summaryRequestInFlight;
  $: summaryHasContent = typeof documentData?.summary === 'string' && documentData.summary.trim().length > 0;
  $: summaryBanner = getSummaryBanner(summaryStatus, summaryHasContent);
  $: structuredSummarySections = splitSummarySections(documentData?.summary ?? '');

  $: flashcardCards = Array.isArray(flashcardSet?.cards) ? flashcardSet.cards : [];
  $: visibleFlashcards = flashcardCards.filter((card) =>
    !card?.isDeleted && !card?.state?.isDeletedForUser && !card?.state?.isHidden
  );
  $: studyCards = incorrectSessionEnabled ? incorrectSessionCards : visibleFlashcards;
  $: currentStudyCard = studyCards[flashcardCardIndex] ?? null;

  $: examQuestions = Array.isArray(examDetail?.questions) ? examDetail.questions : [];
  $: examQuestion = examQuestions[examQuestionIndex] ?? null;
  $: hasInProgressAttempt = currentAttempt?.status === 'in_progress';
  $: isExamFinished = currentAttempt?.status === 'submitted';

  onDestroy(() => {
    clearPollTimer();
  });

  function resetStateForDocument() {
    clearPollTimer();
    documentData = null;
    loadingDocument = true;
    documentError = '';
    generationError = '';
    flashcardError = '';
    flashcardSets = [];
    selectedSetId = '';
    flashcardSet = null;
    flashcardCardIndex = 0;
    flashcardShowAnswer = false;
    incorrectSessionCards = [];
    incorrectSessionEnabled = false;
    examsError = '';
    examRecords = [];
    selectedExamId = '';
    examDetail = null;
    currentAttempt = null;
    reviewPayload = null;
    examAnswers = {};
    examQuestionIndex = 0;
    examFeedbackMode = 'end';
    exportsError = '';
    exportArtifacts = [];
    selectedExportExamId = '';
  }

  function normalizeDocumentStatus(status) {
    const value = typeof status === 'string' ? status.toLowerCase() : '';
    return value === 'queued' || value === 'processing' || value === 'complete' || value === 'failed'
      ? value
      : 'failed';
  }

  function normalizeGenerationStatus(status) {
    const value = typeof status === 'string' ? status.toLowerCase() : '';
    return value === 'queued' || value === 'running' || value === 'complete' || value === 'failed' || value === 'not_requested'
      ? value
      : 'not_requested';
  }

  function shouldPollDocument(document) {
    const extraction = normalizeDocumentStatus(document?.processingStatus);
    if (extraction === 'queued' || extraction === 'processing') {
      return true;
    }

    const statuses = ['summary', 'flashcards', 'exam']
      .map((feature) => normalizeGenerationStatus(document?.generationState?.[feature]?.status));

    return statuses.includes('queued') || statuses.includes('running');
  }

  function schedulePoll() {
    clearPollTimer();
    pollTimer = setTimeout(() => {
      void fetchDocumentState({ background: true });
    }, POLL_INTERVAL_MS);
  }

  function clearPollTimer() {
    if (pollTimer) {
      clearTimeout(pollTimer);
      pollTimer = null;
    }
  }

  async function fetchDocumentOptions() {
    try {
      const response = await fetch(`${API_BASE}/api/user/me`, { credentials: 'include' });
      if (!response.ok) {
        return;
      }
      const data = await response.json().catch(() => null);
      docsForSwitcher = Array.isArray(data?.documents) ? data.documents : [];
    } catch {
      docsForSwitcher = [];
    }
  }

  async function fetchDocumentState({ background = false } = {}) {
    if (!background) {
      loadingDocument = true;
      documentError = '';
    }

    clearPollTimer();

    try {
      const data = await getDocument(currentDocumentId);
      if (currentDocumentId !== documentId) {
        return;
      }
      documentData = data?.document ?? null;

      if (!documentData) {
        documentError = 'Document not found';
      }

      if (shouldPollDocument(documentData)) {
        schedulePoll();
      }
    } catch (err) {
      if (!background) {
        documentError = err?.message || 'Failed to load document';
      } else {
        schedulePoll();
      }
    } finally {
      if (!background) {
        loadingDocument = false;
      }
    }
  }

  function setTab(nextTab) {
    const safeTab = VALID_TABS.has(nextTab) ? nextTab : 'summary';
    window.location.hash = `/study/${currentDocumentId}/${safeTab}`;
  }

  function switchDocument(nextId) {
    if (!nextId || nextId === currentDocumentId) {
      return;
    }
    window.location.hash = `/study/${nextId}/${activeTab}`;
  }

  function openLegacyDocumentView() {
    window.location.hash = `/legacy/documents/${currentDocumentId}/summary`;
  }

  async function regenerateSummary() {
    if (!summaryCanGenerate) {
      return;
    }

    summaryRequestInFlight = true;
    generationError = '';

    try {
      await requestGeneration(currentDocumentId, {
        type: 'summary',
        options: { length: summaryLength },
        regenerate: summaryHasContent || summaryStatus === 'complete'
      });
      await fetchDocumentState({ background: true });
    } catch (err) {
      generationError = err?.message || 'Failed to start summary generation';
    } finally {
      summaryRequestInFlight = false;
    }
  }

  async function loadTabData(tabId) {
    if (!currentDocumentId) {
      return;
    }

    if (tabId === 'flashcards') {
      await loadFlashcardSets();
      return;
    }

    if (tabId === 'exams') {
      await loadExamRecords();
      return;
    }

    if (tabId === 'exports') {
      await Promise.all([loadExportArtifacts(), loadExamRecords()]);
    }
  }
  async function loadFlashcardSets() {
    flashcardLoading = true;
    flashcardError = '';

    try {
      const data = await listFlashcardSets(currentDocumentId, { page: 1, limit: 50 });
      flashcardSets = Array.isArray(data?.flashcardSets) ? data.flashcardSets : [];

      if (!selectedSetId && flashcardSets.length > 0) {
        selectedSetId = flashcardSets[0].id;
      }

      if (selectedSetId) {
        await openFlashcardSet(selectedSetId);
      }
    } catch (err) {
      flashcardError = err?.message || 'Failed to load flashcard sets';
    } finally {
      flashcardLoading = false;
    }
  }

  async function openFlashcardSet(setId) {
    selectedSetId = setId;
    flashcardCardIndex = 0;
    flashcardShowAnswer = false;
    incorrectSessionEnabled = false;
    incorrectSessionCards = [];

    try {
      const data = await getFlashcardSet(setId);
      flashcardSet = data?.flashcardSet ?? null;
    } catch (err) {
      flashcardError = err?.message || 'Failed to open flashcard set';
      flashcardSet = null;
    }
  }

  async function startIncorrectSession() {
    if (!selectedSetId) {
      return;
    }

    flashcardError = '';
    flashcardCardIndex = 0;
    flashcardShowAnswer = false;

    try {
      const data = await getIncorrectSession(selectedSetId);
      incorrectSessionCards = Array.isArray(data?.cards) ? data.cards : [];
      incorrectSessionEnabled = true;
    } catch (err) {
      flashcardError = err?.message || 'Failed to load incorrect-card session';
    }
  }

  function stopIncorrectSession() {
    incorrectSessionEnabled = false;
    incorrectSessionCards = [];
    flashcardCardIndex = 0;
    flashcardShowAnswer = false;
  }

  async function markCardResult(card, result) {
    if (!card?.id || !selectedSetId || patchingCardId) {
      return;
    }

    patchingCardId = card.id;
    flashcardError = '';

    try {
      await patchFlashcardCardState(selectedSetId, card.id, {
        lastResult: result,
        mastered: result === 'correct'
      });

      if (incorrectSessionEnabled) {
        incorrectSessionCards = incorrectSessionCards.filter((item) => item.id !== card.id);
        if (flashcardCardIndex >= incorrectSessionCards.length) {
          flashcardCardIndex = Math.max(incorrectSessionCards.length - 1, 0);
        }
      } else {
        await openFlashcardSet(selectedSetId);
      }
    } catch (err) {
      flashcardError = err?.message || 'Failed to update card state';
    } finally {
      patchingCardId = '';
    }
  }

  async function loadExamRecords() {
    examsLoading = true;
    examsError = '';

    try {
      const data = await listExams(currentDocumentId, { page: 1, limit: 50 });
      examRecords = Array.isArray(data?.exams) ? data.exams : [];
      if (!selectedExamId && examRecords.length > 0) {
        selectedExamId = examRecords[0].id;
      }
      selectedExportExamId = selectedExportExamId || selectedExamId || examRecords[0]?.id || '';

      if (selectedExamId) {
        await openExam(selectedExamId);
      }
    } catch (err) {
      examsError = err?.message || 'Failed to load exams';
    } finally {
      examsLoading = false;
    }
  }

  async function openExam(examId) {
    selectedExamId = examId;
    examsError = '';
    reviewPayload = null;
    examQuestionIndex = 0;

    try {
      const [examData, currentAttemptData] = await Promise.all([
        getExam(examId),
        getCurrentAttempt(examId)
      ]);
      examDetail = examData?.exam ?? null;
      currentAttempt = currentAttemptData?.attempt ?? null;
      examAnswers = normalizeAnswers(currentAttempt?.answers, examDetail?.questions ?? []);
    } catch (err) {
      examsError = err?.message || 'Failed to open exam';
    }
  }

  function normalizeAnswers(rawAnswers, questions) {
    if (Array.isArray(rawAnswers)) {
      const byId = {};
      for (const entry of rawAnswers) {
        const key = typeof entry?.questionId === 'string' ? entry.questionId : null;
        const value = typeof entry?.answer === 'string' ? entry.answer : entry?.value;
        if (key && typeof value === 'string') {
          byId[key] = value;
        }
      }
      return byId;
    }

    if (rawAnswers && typeof rawAnswers === 'object') {
      return { ...rawAnswers };
    }

    const empty = {};
    for (const question of questions) {
      empty[question.id] = '';
    }
    return empty;
  }

  function answersToPayload() {
    return examQuestions.map((question) => ({
      questionId: question.id,
      position: question.position,
      answer: examAnswers[question.id] ?? ''
    }));
  }

  function setExamAnswer(questionId, value) {
    examAnswers = {
      ...examAnswers,
      [questionId]: value
    };
  }

  async function startNewAttempt() {
    if (!selectedExamId || examActionBusy) {
      return;
    }

    examActionBusy = true;
    examsError = '';

    try {
      const data = await createExamAttempt(selectedExamId, { feedbackMode: examFeedbackMode });
      currentAttempt = data?.attempt ?? null;
      reviewPayload = null;
      examAnswers = normalizeAnswers(currentAttempt?.answers, examQuestions);
      examQuestionIndex = 0;
    } catch (err) {
      examsError = err?.message || 'Failed to create attempt';
    } finally {
      examActionBusy = false;
    }
  }

  async function saveAttempt() {
    if (!hasInProgressAttempt || examActionBusy) {
      return;
    }

    examActionBusy = true;
    examsError = '';

    try {
      const data = await saveExamAttempt(currentAttempt.id, answersToPayload());
      currentAttempt = data?.attempt ?? currentAttempt;
    } catch (err) {
      examsError = err?.message || 'Failed to save attempt';
    } finally {
      examActionBusy = false;
    }
  }
  async function submitAttempt() {
    if (!hasInProgressAttempt || examActionBusy) {
      return;
    }

    examActionBusy = true;
    examsError = '';

    try {
      const data = await submitExamAttempt(currentAttempt.id, answersToPayload());
      currentAttempt = data?.attempt ?? currentAttempt;
      const reviewData = await reviewExamAttempt(currentAttempt.id);
      reviewPayload = reviewData?.review ?? null;
    } catch (err) {
      examsError = err?.message || 'Failed to submit attempt';
    } finally {
      examActionBusy = false;
    }
  }

  async function loadReview() {
    if (!currentAttempt?.id || examActionBusy) {
      return;
    }

    examActionBusy = true;
    examsError = '';

    try {
      const data = await reviewExamAttempt(currentAttempt.id);
      reviewPayload = data?.review ?? null;
    } catch (err) {
      examsError = err?.message || 'Failed to load review';
    } finally {
      examActionBusy = false;
    }
  }

  async function restartAttempt() {
    if (!currentAttempt?.id || examActionBusy) {
      return;
    }

    examActionBusy = true;
    examsError = '';

    try {
      const data = await restartExamAttempt(currentAttempt.id);
      currentAttempt = data?.attempt ?? null;
      reviewPayload = null;
      examAnswers = normalizeAnswers(currentAttempt?.answers, examQuestions);
      examQuestionIndex = 0;
    } catch (err) {
      examsError = err?.message || 'Failed to restart attempt';
    } finally {
      examActionBusy = false;
    }
  }

  async function loadExportArtifacts() {
    exportsLoading = true;
    exportsError = '';

    try {
      const data = await listExportArtifacts({ page: 1, limit: 100 });
      const artifacts = Array.isArray(data?.artifacts) ? data.artifacts : [];
      exportArtifacts = artifacts.filter((artifact) => artifact.documentId === currentDocumentId);
    } catch (err) {
      exportsError = err?.message || 'Failed to load exports';
    } finally {
      exportsLoading = false;
    }
  }

  async function requestExamExport() {
    if (!selectedExportExamId || exportActionBusy) {
      return;
    }

    exportActionBusy = true;
    exportsError = '';

    try {
      await createExamExport({
        examId: selectedExportExamId,
        format: 'pdf'
      });
      await loadExportArtifacts();
    } catch (err) {
      exportsError = err?.message || 'Failed to queue export';
    } finally {
      exportActionBusy = false;
    }
  }

  function getSummaryBanner(status, hasContent) {
    if ((status === 'queued' || status === 'running') && hasContent) {
      return 'Summary regeneration is running. Current summary remains visible.';
    }
    if (status === 'failed' && hasContent) {
      return 'Latest summary generation failed. Showing last available summary.';
    }
    if (status === 'failed' && !hasContent) {
      return 'Summary generation failed. Retry when ready.';
    }
    return '';
  }

  function splitSummarySections(rawSummary) {
    if (typeof rawSummary !== 'string' || !rawSummary.trim()) {
      return [];
    }

    const sections = [];
    const lines = rawSummary.split('\n');
    let current = { title: '', lines: [] };

    for (const line of lines) {
      const trimmed = line.trim();
      const heading = trimmed.replace(/^#+\s*/, '');
      const isHeading = /^#+\s+/.test(trimmed) || /^[A-Za-z][A-Za-z0-9\s]{2,60}:$/.test(trimmed);

      if (isHeading) {
        if (current.title || current.lines.length > 0) {
          sections.push(current);
        }
        current = { title: heading.replace(/:$/, ''), lines: [] };
      } else {
        current.lines.push(line);
      }
    }

    if (current.title || current.lines.length > 0) {
      sections.push(current);
    }

    return sections;
  }

  function exportStatusTone(status) {
    if (status === 'complete') return 'ready';
    if (status === 'failed') return 'failed';
    if (status === 'queued' || status === 'running') return 'processing';
    return 'info';
  }
</script>

<div class="study-workspace">
  {#if loadingDocument && !documentData}
    <section class="panel"><p>Loading study workspace...</p></section>
  {:else if documentError}
    <section class="panel error"><p>{documentError}</p></section>
  {:else if documentData}
    <header class="workspace-header">
      <div>
        <p class="eyebrow">Study Hub</p>
        <h1>{documentData.originalName}</h1>
        <p class="meta">Status: {documentData.processingStatus} | Language: {documentData.language}</p>
      </div>
      <div class="header-actions">
        <label class="switcher">
          <span>Switch document</span>
          <select on:change={(event) => switchDocument(event.currentTarget.value)} value={currentDocumentId}>
            {#each docsForSwitcher as doc}
              <option value={doc.id}>{doc.originalName}</option>
            {/each}
          </select>
        </label>
        <button type="button" class="secondary-btn" on:click={openLegacyDocumentView}>Open legacy view</button>
      </div>
    </header>

    <nav class="tabs">
      <button type="button" class:active={activeTab === 'summary'} on:click={() => setTab('summary')}>Summary</button>
      <button type="button" class:active={activeTab === 'flashcards'} on:click={() => setTab('flashcards')}>Flashcards</button>
      <button type="button" class:active={activeTab === 'exams'} on:click={() => setTab('exams')}>Exams</button>
      <button type="button" class:active={activeTab === 'exports'} on:click={() => setTab('exports')}>Exports</button>
    </nav>

    {#if activeTab === 'summary'}
      <section class="panel">
        <div class="row">
          <h2>Summary</h2>
          <div class="summary-actions">
            <select bind:value={summaryLength}>
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
            <button type="button" on:click={regenerateSummary} disabled={!summaryCanGenerate}>
              {summaryRequestInFlight ? 'Queuing...' : summaryHasContent ? 'Regenerate summary' : 'Generate summary'}
            </button>
          </div>
        </div>

        {#if summaryBanner}
          <p class="inline-banner">{summaryBanner}</p>
        {/if}
        {#if generationError}
          <p class="inline-error">{generationError}</p>
        {/if}

        {#if summaryHasContent}
          <div class="summary-output">
            {#if structuredSummarySections.length > 1}
              {#each structuredSummarySections as section}
                <article class="summary-section">
                  {#if section.title}
                    <h3>{section.title}</h3>
                  {/if}
                  <p>{section.lines.join('\n').trim()}</p>
                </article>
              {/each}
            {:else}
              <p>{documentData.summary}</p>
            {/if}
          </div>
        {:else}
          <p>No summary is available yet.</p>
        {/if}
      </section>
    {/if}

    {#if activeTab === 'flashcards'}
      <section class="panel">
        <div class="row">
          <h2>Flashcards</h2>
          <button type="button" class="secondary-btn" on:click={loadFlashcardSets} disabled={flashcardLoading}>
            {flashcardLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {#if flashcardError}
          <p class="inline-error">{flashcardError}</p>
        {/if}

        {#if flashcardSets.length === 0}
          <p>No canonical flashcard sets found for this document yet.</p>
        {:else}
          <div class="row">
            <label>
              Set
              <select bind:value={selectedSetId} on:change={(event) => openFlashcardSet(event.currentTarget.value)}>
                {#each flashcardSets as set}
                  <option value={set.id}>{set.title || 'Untitled set'} ({set.cardCount})</option>
                {/each}
              </select>
            </label>
            <button type="button" class="secondary-btn" on:click={startIncorrectSession} disabled={!selectedSetId}>
              Start incorrect-card session
            </button>
            {#if incorrectSessionEnabled}
              <button type="button" class="secondary-btn" on:click={stopIncorrectSession}>Back to full set</button>
            {/if}
          </div>
          {#if flashcardSet}
            <p class="meta">
              Total cards: {flashcardSet.cardCount} | Visible cards: {visibleFlashcards.length}
              {#if incorrectSessionEnabled}
                | Incorrect session: {incorrectSessionCards.length}
              {/if}
            </p>
          {/if}

          {#if currentStudyCard}
            <article class="flashcard">
              <h3>{currentStudyCard.question}</h3>
              {#if flashcardShowAnswer}
                <p class="answer">{currentStudyCard.answer}</p>
                {#if currentStudyCard.explanation}
                  <p>{currentStudyCard.explanation}</p>
                {/if}
              {/if}
              <div class="row">
                <button type="button" on:click={() => (flashcardShowAnswer = !flashcardShowAnswer)}>
                  {flashcardShowAnswer ? 'Hide answer' : 'Show answer'}
                </button>
                <button type="button" on:click={() => markCardResult(currentStudyCard, 'correct')} disabled={patchingCardId === currentStudyCard.id}>
                  Mark correct
                </button>
                <button type="button" on:click={() => markCardResult(currentStudyCard, 'incorrect')} disabled={patchingCardId === currentStudyCard.id}>
                  Mark incorrect
                </button>
              </div>
              <div class="row">
                <button type="button" on:click={() => { flashcardCardIndex = Math.max(flashcardCardIndex - 1, 0); flashcardShowAnswer = false; }} disabled={flashcardCardIndex === 0}>
                  Previous
                </button>
                <span>{flashcardCardIndex + 1} / {studyCards.length}</span>
                <button type="button" on:click={() => { flashcardCardIndex = Math.min(flashcardCardIndex + 1, studyCards.length - 1); flashcardShowAnswer = false; }} disabled={flashcardCardIndex >= studyCards.length - 1}>
                  Next
                </button>
              </div>
            </article>
          {:else}
            <p>No visible cards for this selection.</p>
          {/if}
        {/if}
      </section>
    {/if}

    {#if activeTab === 'exams'}
      <section class="panel">
        <div class="row">
          <h2>Exams</h2>
          <button type="button" class="secondary-btn" on:click={loadExamRecords} disabled={examsLoading}>
            {examsLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {#if examsError}
          <p class="inline-error">{examsError}</p>
        {/if}

        {#if examRecords.length === 0}
          <p>No canonical exams found for this document yet.</p>
        {:else}
          <div class="row">
            <label>
              Exam record
              <select bind:value={selectedExamId} on:change={(event) => openExam(event.currentTarget.value)}>
                {#each examRecords as exam}
                  <option value={exam.id}>{exam.title || 'Untitled exam'} ({exam.questionCount} questions)</option>
                {/each}
              </select>
            </label>
            <label>
              Feedback mode
              <select bind:value={examFeedbackMode}>
                <option value="end">Show answers at end</option>
                <option value="instant">Instant feedback</option>
              </select>
            </label>
            <button type="button" on:click={startNewAttempt} disabled={!selectedExamId || examActionBusy}>
              {examActionBusy ? 'Working...' : 'Create attempt'}
            </button>
            {#if hasInProgressAttempt}
              <button type="button" class="secondary-btn" on:click={saveAttempt} disabled={examActionBusy}>Save</button>
            {/if}
            {#if currentAttempt}
              <button type="button" class="secondary-btn" on:click={restartAttempt} disabled={examActionBusy}>Restart</button>
            {/if}
          </div>

          {#if hasInProgressAttempt}
            <p class="inline-banner">In-progress attempt found. You can resume, save, submit, or restart.</p>
          {/if}

          {#if examDetail && examQuestions.length > 0}
            <article class="exam-box">
              <h3>Question {examQuestionIndex + 1} of {examQuestions.length}</h3>
              <p>{examQuestion.question}</p>

              {#if Array.isArray(examQuestion.options) && examQuestion.options.length > 0}
                <div class="options">
                  {#each examQuestion.options as option}
                    <button
                      type="button"
                      class:selected={examAnswers[examQuestion.id] === option}
                      on:click={() => setExamAnswer(examQuestion.id, option)}
                    >
                      {option}
                    </button>
                  {/each}
                </div>
              {:else}
                <input
                  type="text"
                  value={examAnswers[examQuestion.id] ?? ''}
                  on:input={(event) => setExamAnswer(examQuestion.id, event.currentTarget.value)}
                  placeholder="Type your answer"
                />
              {/if}

              <div class="row">
                <button type="button" on:click={() => (examQuestionIndex = Math.max(examQuestionIndex - 1, 0))} disabled={examQuestionIndex === 0}>
                  Previous
                </button>
                <button type="button" on:click={() => (examQuestionIndex = Math.min(examQuestionIndex + 1, examQuestions.length - 1))} disabled={examQuestionIndex >= examQuestions.length - 1}>
                  Next
                </button>
                {#if hasInProgressAttempt}
                  <button type="button" on:click={submitAttempt} disabled={examActionBusy}>Submit</button>
                {/if}
              </div>
            </article>
          {/if}

          {#if isExamFinished}
            <article class="exam-box">
              <h3>Attempt submitted</h3>
              <p>Score: {currentAttempt.score} / {currentAttempt.totalQuestions}</p>
              <button type="button" class="secondary-btn" on:click={loadReview} disabled={examActionBusy}>
                Load review
              </button>
            </article>
          {/if}

          {#if reviewPayload}
            <article class="exam-box">
              <h3>Review</h3>
              {#each reviewPayload.questions as question}
                <div class="review-item">
                  <p><strong>Q{question.position + 1}:</strong> {question.question}</p>
                  <p>Your answer: {examAnswers[question.id] || 'Not answered'}</p>
                  <p>Correct answer: {question.correctAnswer}</p>
                  {#if question.explanation}
                    <p>{question.explanation}</p>
                  {/if}
                </div>
              {/each}
            </article>
          {/if}
        {/if}
      </section>
    {/if}

    {#if activeTab === 'exports'}
      <section class="panel">
        <div class="row">
          <h2>Exports</h2>
          <button type="button" class="secondary-btn" on:click={loadExportArtifacts} disabled={exportsLoading}>
            {exportsLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {#if exportsError}
          <p class="inline-error">{exportsError}</p>
        {/if}

        <div class="row">
          <label>
            Exam record
            <select bind:value={selectedExportExamId} disabled={examRecords.length === 0}>
              <option value="">Select exam</option>
              {#each examRecords as exam}
                <option value={exam.id}>{exam.title || 'Untitled exam'}</option>
              {/each}
            </select>
          </label>
          <button type="button" on:click={requestExamExport} disabled={!selectedExportExamId || exportActionBusy}>
            {exportActionBusy ? 'Queuing export...' : 'Request export'}
          </button>
        </div>

        {#if exportArtifacts.length === 0}
          <p>No export artifacts for this document yet.</p>
        {:else}
          <div class="export-list">
            {#each exportArtifacts as artifact}
              <article class="export-item">
                <p><strong>{artifact.fileName || artifact.id}</strong></p>
                <p>Status: <span class={`status-${exportStatusTone(artifact.status)}`}>{artifact.status}</span></p>
                <p>Created: {artifact.createdAt ? new Date(artifact.createdAt).toLocaleString() : 'Unknown'}</p>
                {#if artifact.errorMessage}
                  <p class="inline-error">{artifact.errorMessage}</p>
                {/if}
                {#if artifact.status === 'complete'}
                  <a href={getExportDownloadUrl(artifact.id)}>Download</a>
                {:else}
                  <p>Download available when status is complete.</p>
                {/if}
              </article>
            {/each}
          </div>
        {/if}
      </section>
    {/if}
  {/if}
</div>

<style>
  .study-workspace { display: grid; gap: var(--space-4); }
  .workspace-header { display: flex; justify-content: space-between; align-items: flex-end; gap: var(--space-3); flex-wrap: wrap; }
  .eyebrow { margin: 0; text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.75rem; color: var(--color-text-muted); }
  h1 { margin: 0.25rem 0; color: var(--color-text-primary); font-size: 1.6rem; }
  h2, h3 { margin: 0; color: var(--color-text-primary); }
  .meta { margin: 0; color: var(--color-text-secondary); }
  .header-actions { display: flex; gap: var(--space-2); flex-wrap: wrap; }
  .switcher { display: grid; gap: 0.35rem; color: var(--color-text-secondary); font-size: 0.85rem; }
  select, input, button { min-height: 40px; border-radius: var(--radius-1); border: 1px solid var(--color-border); background: var(--color-surface-2); color: var(--color-text-primary); padding: 0.5rem 0.75rem; font: inherit; }
  button { cursor: pointer; font-weight: 600; }
  .secondary-btn { background: var(--color-surface-1); }
  .tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .tabs button.active { border-color: var(--color-accent-primary); background: var(--color-accent-surface); }
  .panel { border: 1px solid var(--color-border); border-radius: var(--radius-2); padding: var(--space-4); background: var(--color-surface-1); display: grid; gap: var(--space-3); }
  .panel.error, .inline-error { color: var(--color-danger); }
  .inline-banner { margin: 0; padding: 0.75rem; border-radius: var(--radius-1); border: 1px solid var(--color-border); background: color-mix(in srgb, var(--color-info) 14%, transparent); color: var(--color-text-primary); }
  .summary-actions { display: flex; gap: var(--space-2); flex-wrap: wrap; }
  .summary-output { display: grid; gap: var(--space-3); }
  .summary-section p { white-space: pre-wrap; line-height: 1.6; }
  .row { display: flex; gap: var(--space-2); flex-wrap: wrap; align-items: center; justify-content: space-between; }
  .flashcard, .exam-box, .export-item { border: 1px solid var(--color-border); border-radius: var(--radius-1); background: var(--color-surface-2); padding: var(--space-3); display: grid; gap: var(--space-2); }
  .answer { font-weight: 700; color: var(--color-text-primary); }
  .options { display: grid; gap: 0.5rem; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .options button.selected { border-color: var(--color-accent-primary); background: var(--color-accent-surface); }
  .review-item { border-top: 1px solid var(--color-border); padding-top: var(--space-2); }
  .review-item p { margin: 0; color: var(--color-text-secondary); }
  .status-ready { color: var(--color-success); }
  .status-failed { color: var(--color-danger); }
  .status-processing { color: var(--color-info); }
  .export-list { display: grid; gap: var(--space-2); }
  @media (max-width: 640px) {
    .row { align-items: stretch; justify-content: flex-start; }
    .options { grid-template-columns: 1fr; }
  }
</style>
