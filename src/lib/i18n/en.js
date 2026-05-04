export default {
  app: {
    name: 'AI Study Assistant',
    shortName: 'AI',
    wordmark: 'Study AI',
    loadingSession: 'Loading session...'
  },
  access: {
    deniedTitle: 'Access Denied',
    deniedMessage: 'You do not have permission to view this page.',
    backToDashboard: 'Back to home'
  },
  errors: {
    notFoundTitle: 'Page not found',
    notFoundCta: 'Back to home'
  },
  language: {
    english: 'English',
    arabic: 'Arabic',
    toggleLabel: 'Switch language',
    sidebarLabel: 'Interface language',
    sidebarDescription: 'Applies instantly across the workspace.'
  },
  common: {
    loading: 'Loading...',
    close: 'Close',
    comingSoon: 'Coming soon',
    comingSoonBadge: 'Soon',
    comingSoonDetail: 'We are putting the finishing touches on this experience.'
  },
  nav: {
    home: 'Home',
    dashboard: 'Home',
    study: 'Study Hub Library',
    studyDetail: 'Study',
    documents: 'Library',
    exams: 'Exams',
    flashcards: 'Flashcards',
    adminPanel: 'Admin Panel',
    settings: 'Settings',
    plan: 'My Plan',
    freeBadge: 'Free',
    proBadge: 'Pro',
    mobileLabel: 'Primary navigation'
  },
  topbar: {
    defaultTitle: 'Home',
    notifications: 'Notifications',
    notificationsComingSoon: 'Notifications (coming soon)',
    collapseSidebar: 'Collapse sidebar',
    expandSidebar: 'Expand sidebar',
    profile: 'Profile',
    logout: 'Log out'
  },
  status: {
    notStarted: 'Not started',
    queued: 'Queued',
    processing: 'Processing',
    running: 'Generating',
    complete: 'Complete',
    failed: 'Failed',
    info: 'Info',
    ready: 'Complete',
  },
  emptyState: {
    title: 'No items yet',
    subtitle: 'When you add new content it will appear here.',
    description: 'When you add new content it will appear here.'
  },
  confirmModal: {
    title: 'Are you sure?',
    description: 'This action cannot be undone.',
    confirm: 'Confirm',
    cancel: 'Cancel'
  },
  drawer: {
    close: 'Close'
  },
  landing: {
    title: 'AI Study Assistant',
    subtitle: 'Your intelligent companion for learning and research',
    features: {
      upload: {
        title: 'Upload Documents',
        description: 'Import PDFs, Word docs, and presentations to analyze and study'
      },
      analysis: {
        title: 'AI-Powered Analysis',
        description: 'Get summaries, explanations, and insights from your materials'
      },
      organize: {
        title: 'Smart Organization',
        description: 'Keep all your study materials organized in one place'
      }
    },
    enterCta: 'Enter'
  },
  home: {
    heroTitle: 'StudyMaxing',
    heroSubtitle: 'Upload your study materials and get AI-powered summaries, flashcards, and practice exams',
    stats: {
      documentsRemaining: 'Documents Remaining',
      usedThisMonth: 'Used This Month',
      totalDocuments: 'Total Documents',
      unlimited: 'Unlimited'
    },
    alerts: {
      error: 'Failed to load user data. Please refresh.'
    },
    quotaReached: {
      title: 'Monthly upload limit reached',
      body: 'You have used all uploads available in your current monthly plan. You can upload more documents when your quota resets next month.',
      upgradeHint: 'Upgrade your plan if you want a higher monthly upload limit.'
    },
    uploadSection: {
      title: 'Upload New Document',
      modalTitle: 'Media Upload',
      modalDescription: 'Add your document here',
      modalDescriptionSingle: 'Upload one document, then choose what you want to generate next.',
      compactTitle: 'Upload your first document',
      compactSubtitle: 'Generate summaries, flashcards, and exams',
      compactSupport: 'PDF, DOCX, PPTX',
      browseFile: 'Browse file',
      heroEyebrow: 'First upload',
      heroTitle: 'Start your study library with one document',
      heroDescription: 'Upload a PDF, DOCX, or PPTX to begin a cleaner study flow with summaries, flashcards, and exam questions ready from the same workspace.',
      heroSupport: 'Your first upload becomes the starting point for everything you review next.',
      heroBenefitsLabel: 'What you can generate',
      heroBenefits: {
        summary: 'Summary',
        flashcards: 'Flashcards',
        exams: 'Exam questions'
      },
      surfaceTitle: 'Upload your study materials',
      surfaceSubtitle: 'Drag & drop or click to browse',
      surfaceMeta: 'PDF, DOCX, PPTX • Max 25MB',
      dropzoneTitle: 'Drop your document here or browse to get started',
      dropzoneDescription: 'Drag and drop still works, but the fastest path is to choose one file and continue.',
      dropzoneOr: 'OR',
      browse: 'Browse files',
      supportedFiles: 'Supports PDF, DOCX, and PPTX',
      supportedFilesSingle: 'Supports PDF, DOCX, and PPTX. One document at a time.',
      openModalCta: 'Upload Documents',
      cancel: 'Cancel',
      next: 'Next',
      submitUpload: 'Upload document',
      submitUploading: 'Uploading document...',
      removeFile: 'Remove file',
      languageLabel: 'AI Response Language',
      englishOption: 'English',
      arabicOption: 'Arabic',
      filePlaceholder: 'Click to select a file (PDF, DOCX, PPTX)',
      dragActive: 'Release to drop file',
      fileSelected: 'File selected - ready to generate',
      constraints: 'PDF, DOCX, PPTX (Max 25MB)',
      selectedFileLabel: '{name}',
      fileInfo: 'Maximum file size: 25MB',
      submit: 'Upload & Generate Study Materials',
      submitProcessing: 'Processing... (this may take 20-30 seconds)',
      errors: {
        selectFile: 'Please select a file first',
        invalidType: 'Invalid file type. Please upload PDF, DOCX, or PPTX.',
        fileTooLarge: 'File is too large. Maximum size is 25MB.',
        maxFiles: 'You can upload up to {max} files at once.',
        limitReached: 'You have reached your monthly upload limit',
        uploadFailed: 'Failed to upload document. Please try again.',
        network: 'Network error. Please try again.'
      },
      success: 'Document processed successfully! Generated {flashcards} flashcards and {questions} exam questions.'
    },
    guided: {
      eyebrow: 'Upload complete',
      title: 'Choose what to generate',
      subtitle: 'Your file is ready for the next step.',
      fileLabel: 'Uploaded file',
      processingHint: 'Your file is still being prepared. You can choose now and we will start as soon as it is ready.',
      readyHint: 'Select one or more study formats to generate from this file.',
      statusPreparing: 'Preparing file',
      statusReady: 'Ready',
      statusFailed: 'Needs attention',
      featureSelected: 'Selected',
      featureOptional: 'Tap to select',
      selectedTitle: 'Generate selected materials',
      selectedBody: 'We will prepare the file if needed, then start each selected format before opening Study Hub.',
      emptyTitle: 'No formats selected',
      emptyBody: 'Choose at least one format to start now, or skip and continue to Study Hub.',
      selectionCount: '{count} selected',
      skip: 'Skip for now',
      generateSelected: 'Generate selected',
      supportLabels: {
        summary: 'Quick review',
        flashcards: 'Active recall',
        exam: 'Test readiness'
      },
      features: {
        summary: 'A clear overview of the key points from your document.',
        flashcards: 'A focused deck for repetition and recall.',
        exam: 'A practice test to check how ready you are.'
      },
      errors: {
        generationRequest: 'We could not start every selected generation. Review your selections and try again.',
        progress: 'We could not finish the post-upload setup. Please try again.',
        progressTitle: 'We hit a problem while preparing your study flow.'
      },
      progress: {
        title: 'Preparing your study flow',
        eyebrow: 'Generation in progress',
        ariaLabel: 'Post-upload generation progress',
        preparingTitle: 'Preparing document',
        preparingBody: 'We are extracting your upload so the selected study materials can start honestly and cleanly.',
        generatingTitle: 'Generating selected materials',
        generatingBody: 'Your requested study materials are being started now.',
        finishingTitle: 'Finishing up',
        finishingBody: 'Your document is ready in Study Hub. Taking you there now.',
        activeFeatureTitle: {
          summary: 'Generating summary',
          flashcards: 'Generating flashcards',
          exam: 'Generating mock exam'
        },
        steps: {
          uploadComplete: 'Upload complete',
          preparingDocument: 'Preparing document',
          summary: 'Generating summary',
          flashcards: 'Generating flashcards',
          exam: 'Generating mock exam',
          finishing: 'Finishing up'
        }
      }
    },
    documents: {
      title: 'My Documents ({count})',
      viewCta: 'View & Study',
      deleteCta: 'Delete',
      languageEnglish: 'English',
      languageArabic: 'Arabic',
      flashcardCount: '{count} flashcards',
      questionCount: '{count} questions',
      deleteConfirm: 'Are you sure you want to delete this document?',
      deleteSuccess: 'Document deleted successfully',
      deleteError: 'Failed to delete document'
    },
    processing: {
      title: 'Processing Your Document',
      stages: {
        upload: 'Upload file',
        extract: 'Extract text',
        generate: 'Generate AI content',
        save: 'Save results'
      },
      complete: 'Complete!'
    }
  },
  document: {
    loading: 'Loading document...',
    loadingError: 'Failed to load document',
    notFound: 'Document not found',
    processingFailedTitle: 'We could not finish processing this document.',
    processingFailed: 'Document processing failed. Please try again.',
    processingFailedHelp: 'Go back to your library or upload the file again from home.',
    extracting: 'Extracting document text...',
    extractingNote: 'This usually takes a few seconds before study tools can be generated on demand.',
    aiGenerating: 'AI is generating study materials...',
    aiGeneratingNote: 'This usually takes about 20 seconds.',
    finalizing: 'Finalizing your document...',
    finalizingNote: 'Your study materials are ready. Loading the full document view now.',
    processingProgress: 'Progress {progress}%',
    jobStatusError: 'Unable to check processing status. Please try again.',
    back: 'Back',
    backToDocuments: 'Back to Documents',
    backToDashboard: 'Back to Home',
    uploadAgain: 'Upload Again',
    actions: {
      generate: 'Generate',
      regenerate: 'Regenerate',
      retry: 'Retry',
      generating: 'Generating...'
    },
    options: {
      summaryLength: 'Summary length',
      short: 'Short',
      medium: 'Medium',
      long: 'Long',
      includeExplanations: 'Include explanations',
      questionCount: 'Question count'
    },
    generation: {
      queuedNoContent: 'Generation has been requested for this study tool.',
      runningNoContent: 'Generation is in progress. Check back in a moment.',
      regenerating: 'Regenerating. Your current content stays available until the new version finishes.',
      failedNoContent: 'Generation failed. Try again.',
      failedWithContent: 'The latest generation failed. Showing your previous content.',
      missingContent: 'Generation completed, but no content is available yet. Try again.',
      requestFailed: 'Failed to start generation. Please try again.'
    },
    uploaded: 'Uploaded',
    language: 'Language',
    tabs: {
      summary: 'Summary',
      flashcards: 'Flashcards ({count})',
      exam: 'Mock Exam ({count})'
    },
    hub: {
      backToStudyHub: 'Back to Study Hub',
      untitled: 'Untitled document',
      featuresTitle: 'Study features',
      readyHint: 'Generated and ready to open.',
      readyToGenerateHint: 'No study materials requested yet. Choose what you want to generate when you are ready.',
      featureDescriptions: {
        summary: 'Get a comprehensive AI-generated summary of the key concepts and main points from your document.',
        flashcards: 'Study with AI-generated flashcards that help you memorize important terms and concepts.',
        exam: 'Test your knowledge with a practice exam featuring multiple-choice and true/false questions based on the content.'
      },
      features: {
        summary: 'Summary',
        flashcards: 'Flashcards',
        exam: 'Mock Exam'
      },
      states: {
        notGenerated: 'Not generated',
        notRequested: 'Not requested',
        readyToGenerate: 'Ready to generate',
        preparing: 'Preparing document',
        generating: 'Generating',
        waitingForExtraction: 'Waiting for document processing to finish before generation can start.'
      },
      loading: {
        preparing: 'Preparing',
        preparingDocument: 'Preparing document',
        preparingDocumentHint: 'Preparing this document so generation can start cleanly.',
        preparingFeature: 'Preparing {feature}',
        preparingFeatureHint: 'This study tool is queued and about to start.',
        extractingDocument: 'Extracting document',
        generatingSelected: 'Generating selected materials',
        generatingFeature: 'Generating {feature}',
        generatingHint: 'Generation is running now.',
        finalizing: 'Finalizing',
        finalizingFeature: 'Finalizing {feature}',
        selectedFeatures: 'Selected: {features}'
      },
      actions: {
        open: 'Open',
        startSummary: 'Start Summary',
        startFlashcards: 'Start Flashcards',
        startMockExam: 'Start Mock Exam'
      },
      meta: {
        fileType: 'File type'
      },
      processing: {
        extractingTitle: 'Document is still processing',
        extractingBody: 'We are extracting this document so study features can be generated.',
        generatingTitle: 'Study generation in progress',
        generatingBody: 'One or more study features are currently generating.',
        continues: 'Generation continues in the background even if you leave this page.'
      },
      progress: {
        extraction: 'Document extraction',
        inProgress: 'In progress',
        featureQueued: 'Queued and waiting for a worker to start.',
        featureGenerating: 'Generation is actively running.'
      },
      statusTitle: 'Document lifecycle',
      statusSubtitle: 'Extraction status comes from the document lifecycle and generation runs per study tool.',
      generationRunning: 'A study-material generation is in progress. Existing content remains available.',
      generationFailed: 'A recent generation failed. You can retry from the relevant study tool.',
      actionsTitle: 'Generation actions',
      actionsSubtitleEmpty: 'No generated study materials yet. Start by generating one or more study tools.',
      actionsSubtitleExisting: 'Generate more or regenerate any study tool without leaving this workspace.',
      materialsTitle: 'Study materials'
    },
    source: {
      title: 'Source content',
      description: 'Extracted document excerpts used for generation. Keep reading while study tools generate.',
      count: '{count} excerpts',
      loading: 'Loading extracted source content...',
      loadError: 'Failed to load source content.',
      retry: 'Retry loading source',
      empty: 'No readable source excerpts are available for this document yet.',
      page: 'Page/Slide {page}',
      loadMore: 'Load more excerpts',
      loadingMore: 'Loading more...',
      slideText: 'Slide text',
      speakerNote: 'Speaker note',
      excerpt: 'Excerpt'
    },
    summary: {
      generatePrompt: 'Generate a summary when you are ready to study this document.'
    },
    flashcards: {
      shuffle: 'Shuffle',
      cardCounter: 'Card {current} of {total}',
      question: 'Question',
      answer: 'Answer',
      explanation: 'Explanation',
      empty: 'No flashcards are available for this document.',
      generatePrompt: 'Generate flashcards to start reviewing this document.',
      flipHint: 'Click to flip',
      previous: 'Previous',
      next: 'Next'
    },
    exam: {
      generatePrompt: 'Generate a mock exam when you are ready to test yourself.',
      readyTitle: 'Ready for the Mock Exam?',
      questionCount: 'This exam contains {count} questions',
      feedbackPrompt: 'How would you like to review answers?',
      instantTitle: 'Instant Feedback',
      instantDescription: 'Show correct answer after each question',
      endTitle: 'Exam Simulation',
      endDescription: 'Show all answers at the end',
      start: 'Start Exam',
      questionNumber: 'Question {index}',
      inputPlaceholder: 'Type your answer...',
      previous: 'Previous',
      next: 'Next',
      submit: 'Submit Exam',
      instantCorrect: 'Correct!',
      instantIncorrect: 'Incorrect',
      instantAnswer: 'Correct answer: {answer}',
      instantExplanation: '{explanation}',
      progress: 'Question {current} of {total}',
      completeTitle: 'Exam Complete!',
      score: 'You scored {score} out of {total}',
      reviewTitle: 'Review Your Answers',
      reviewQuestion: 'Question {index}',
      reviewYourAnswer: 'Your answer: {answer}',
      reviewCorrectAnswer: 'Correct answer: {answer}',
      reviewNotAnswered: 'Not answered',
      reviewCorrect: 'Correct',
      reviewIncorrect: 'Incorrect',
      empty: 'No exam questions are available for this document.',
      retake: 'Retake Exam'
    },
    activity: {
      backToHub: 'Back to document hub',
      section: {
        summary: 'Summary mode',
        flashcards: 'Flashcards mode',
        exam: 'Exam mode'
      },
      subtitle: {
        summary: 'Focused reading view for the generated summary.',
        flashcards: 'Study one card at a time with quick confidence tracking.',
        exam: 'Take the exam in a clean question flow.'
      },
      states: {
        extractionProcessing: 'Document extraction is still running',
        generationProcessing: 'Generation is in progress',
        processingContinues: 'Processing continues in the background if you leave this view.'
      },
      errors: {
        exportPdfFailed: 'Could not export this PDF. Try again.'
      },
      actions: {
        generateSummary: 'Generate summary',
        generateFlashcards: 'Generate flashcards',
        generateExam: 'Generate exam',
        exportPdf: 'Export PDF',
        exportingPdf: 'Exporting PDF...',
        startFlashcards: 'Start flashcards',
        revealAnswer: 'Reveal answer',
        hideAnswer: 'Hide answer',
        markCorrect: 'Mark correct',
        markIncorrect: 'Mark incorrect',
        previous: 'Previous',
        next: 'Next',
        startExam: 'Start exam',
        submitExam: 'Submit exam',
        retakeExam: 'Retake exam'
      },
      summary: {
        title: 'Summary',
        regenerating: 'Regenerating in the background. Your current summary remains visible.'
      },
      flashcards: {
        cardCount: '{count} flashcards',
        progressLabel: 'Card {current}/{total} · Correct {correct} · Incorrect {incorrect}',
        questionLabel: 'Question',
        answerLabel: 'Answer',
        progressSaveError: 'Could not save flashcard progress. Try again.',
        resultsTitle: 'Flashcard results',
        resultsMeta: '{incorrect} incorrect · {unanswered} unanswered',
        resultLabel: 'Result:',
        restart: 'Restart flashcards',
        viewResults: 'View results'
      },
      exam: {
        introTitle: 'Ready to start your exam?',
        introDescription: 'This exam has {count} questions.',
        questionLabel: 'Question {index}',
        currentLabel: 'Question {current} / {total}',
        answeredCount: '{answered} answered out of {total}',
        answeredInline: '{answered} answered',
        submittingTitle: 'Completing your exam',
        submittingBody: 'Scoring your attempt and saving progress.',
        resultsTitle: 'Exam results',
        scoreLabel: 'Score: {score}/{total}',
        reviewTitle: 'Review',
        yourAnswer: 'Your answer: {answer}',
        correctAnswer: 'Correct answer: {answer}',
        notAnswered: 'Not answered',
        saveAttemptError: 'Could not save this exam attempt.',
        boolean: {
          true: 'True',
          false: 'False'
        }
      },
      regenerate: {
        title: 'Regenerate with guidance',
        description: 'Tell the assistant what should improve before regenerating.',
        reasonLabel: 'Main reason',
        customLabel: 'Optional instruction',
        customPlaceholder: 'Example: focus more on formulas and worked examples.',
        confirm: 'Regenerate',
        cancel: 'Cancel',
        running: 'Regenerating...',
        reasons: {
          missingParts: 'Missing parts',
          notComprehensiveEnough: 'Not comprehensive enough',
          tooShort: 'Too short',
          tooGeneric: 'Too generic'
        }
      }
    }
  },
  documentsPage: {
    eyebrow: 'Study Hub',
    title: 'Library',
    description: 'Browse your uploaded materials and open one to continue studying.',
    emptyTitle: 'No documents yet',
    emptyDescription: 'Upload your first document from home to start your library.',
    libraryEmptyEyebrow: 'First upload',
    libraryEmptyTitle: 'Your Study Hub library starts here',
    libraryEmptyDescription: 'Upload one document and keep everything you study in one place, ready for summaries, flashcards, and exam questions.',
    libraryEmptySupport: 'After upload, open the document here to generate study materials when you need them.',
    libraryEmptyBenefitsLabel: 'Available study tools',
    libraryEmptySummary: 'Summary',
    libraryEmptyFlashcards: 'Flashcards',
    libraryEmptyExams: 'Exam questions',
    libraryEmptyUploadCta: 'Upload your first document',
    labels: {
      uploaded: 'Uploaded',
      language: 'Language'
    },
    columns: {
      flashcards: 'Flashcards',
      exams: 'Exam questions'
    },
    statuses: {
      queued: 'Processing upload',
      processingUpload: 'Processing upload',
      processing: 'Processing',
      running: 'Processing',
      generatingSelected: 'Generating selected',
      readyToGenerate: 'Ready to generate',
      complete: 'Ready',
      failed: 'Failed',
      unknown: 'Unknown'
    },
    statusMessages: {
      processingUpload: 'Document extraction is still running.',
      readyToGenerate: 'No study materials requested yet.',
      generatingSelected: 'One or more selected study materials are generating.',
      ready: 'Study materials are ready to open.',
      generationFailed: 'A requested study material failed and may need another try.',
      processingFailed: 'We could not finish preparing this document.',
      unknown: 'Open the document for the latest status.'
    },
    actions: {
      refresh: 'Refresh list',
      uploadCta: 'Upload',
      view: 'Open',
      rename: 'Rename',
      more: 'More actions',
      renamePrompt: 'Rename this document',
      delete: 'Delete',
      deleting: 'Deleting...'
    },
    errors: {
      load: 'Unable to load your documents right now.',
      rename: 'Failed to rename the document. Please try again.',
      delete: 'Failed to delete the document. Please try again.'
    },
    deleteConfirmTitle: 'Delete document?',
    deleteConfirmDescription: 'This will permanently remove {name} and its generated study materials.',
    deleteUnknown: 'this document'
  },
  examsPage: {
    title: 'Practice exams',
    description: 'Soon you can craft adaptive mock exams from any upload.',
    features: {
      builder: {
        title: 'Adaptive builder',
        description: 'Pick topics, difficulty, and timing to generate the perfect exam.'
      }
    },
    actions: {
      primary: 'Stay tuned'
    }
  },
  flashcardsPage: {
    title: 'Flashcards workspace',
    description: 'Organize, remix, and schedule spaced-repetition decks for every subject.',
    features: {
      generator: {
        title: 'Deck generator',
        description: 'Select sections of a document to instantly create focused flashcards.'
      },
      practice: {
        title: 'Guided practice',
        description: 'Study modes with timers, streaks, and spaced repetition reminders.'
      }
    },
    actions: {
      primary: 'Start practicing'
    }
  },
  settings: {
    eyebrow: 'Preferences',
    title: 'Settings',
    subtitle: 'Tune the experience for your study workflow.',
    tabs: {
      systems: 'Systems',
      account: 'Account'
    },
    language: {
      title: 'Language',
      description: 'Switch between English and Arabic at any time.',
      helper: 'Your selection is saved on this device and applied immediately across the interface.',
      disabled: 'Arabic interface support is currently unavailable.'
    },
    theme: {
      title: 'Theme',
      description: 'Choose between light and dark appearance.',
      current: 'Current theme: {theme}',
      helper: 'Theme changes apply instantly across the app and are saved on this browser.',
      ariaLabel: 'Theme mode',
      dark: 'Dark',
      light: 'Light'
    },
    security: {
      title: 'Security',
      description: 'Update your password while keeping your current session active.'
    },
    account: {
      title: 'Account',
      description: 'Manage your identity and session.',
      anonymous: 'Unnamed user',
      noEmail: 'Email unavailable',
      actions: {
        profile: 'Profile',
        logout: 'Sign out',
        loggingOut: 'Signing out...'
      }
    }
  },
  auth: {
    fields: {
      name: 'Full name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password'
    },
    actions: {
      showPassword: 'Show',
      hidePassword: 'Hide'
    },
    notices: {
      signedOut: 'You have been signed out.',
      sessionExpired: 'Your session expired. Please sign in again.',
      verificationRequired: 'Verify your email to finish setting up your account.',
      passwordReset: 'Your password was reset. Sign in with your new password.'
    },
    validation: {
      nameRequired: 'Enter your full name.',
      emailRequired: 'Enter your email address.',
      emailInvalid: 'Enter a valid email address.',
      passwordRequired: 'Enter your password.',
      currentPasswordRequired: 'Enter your current password.',
      passwordMin: 'Use at least {count} characters.',
      passwordHint: 'Use at least 8 characters.',
      confirmPasswordRequired: 'Confirm your password.',
      confirmPasswordMismatch: 'Passwords do not match.'
    },
    errors: {
      invalidCredentials: 'Check your email and password and try again.',
      duplicateEmail: 'An account with this email already exists.',
      weakPassword: 'Choose a stronger password with at least 8 characters.',
      networkTimeout: 'The request took too long. Please try again.',
      networkFailure: 'Network error. Check your connection and try again.',
      serverFailure: 'Server error. Please try again in a moment.',
      sessionExpired: 'Your session expired. Please sign in again.',
      sessionRestoreFailed: 'Sign-in completed, but we could not restore your session. Please try again.',
      blockedAccess: 'This account cannot access the app right now.',
      accountSuspended: 'This account cannot sign in right now. Contact {email} for help.',
      rateLimited: 'Too many attempts. Please wait a moment and try again.',
      rateLimitedRetry: 'Too many attempts. Please wait about {seconds} seconds and try again.',
      challengeRequired: 'Complete the security check and try again.',
      challengeFailed: 'We could not verify the security check. Please try again.',
      emailVerificationRequired: 'Verify your email address before signing in.',
      passwordResetRequestFailed: 'We could not send the reset email right now. Please try again.',
      resetTokenInvalid: 'This reset link is invalid, expired, or has already been used.',
      currentPasswordInvalid: 'Your current password is incorrect.',
      malformedResponse: 'We could not complete authentication. Please try again.',
      genericFailure: 'We could not complete that request. Please try again.'
    },
    signIn: {
      eyebrow: 'Sign in',
      title: 'Welcome back',
      subtitle: 'Sign in to continue your study workflow.',
      placeholders: {
        email: 'Enter your email',
        password: 'Enter your password'
      },
      actions: {
        submit: 'Login',
        loading: 'Logging in...',
        forgotPassword: 'Forgot password?'
      },
      switch: {
        prompt: "Don't have an account?",
        action: 'Sign up'
      },
      errors: {
        failed: 'Login failed'
      }
    },
    signUp: {
      eyebrow: 'Create account',
      title: 'Create account',
      subtitle: 'Set up your profile to start generating study materials.',
      placeholders: {
        name: 'Enter your name',
        email: 'Enter your email',
        password: 'Choose a password (min 8 chars)',
        confirmPassword: 'Confirm your password'
      },
      actions: {
        submit: 'Sign up',
        loading: 'Creating account...'
      },
      switch: {
        prompt: 'Already have an account?',
        action: 'Login'
      },
      errors: {
        failed: 'Signup failed'
      }
    },
    verify: {
      eyebrow: 'Email verification',
      pending: {
        title: 'Check your inbox',
        subtitleSignup: 'We sent a verification link to finish setting up your account.',
        subtitleSignin: 'This account still needs email verification. We sent a fresh verification link.',
        sentTo: 'Verification email sent to {email}.',
        resend: 'Resend verification email',
        resending: 'Sending verification email...',
        resendSuccess: 'A fresh verification email is on its way.',
        resendError: 'We could not resend the verification email right now.',
        resendCooldown: 'Resend in {seconds}s',
        backToSignIn: 'Back to sign in'
      },
      success: {
        title: 'Email verified',
        subtitle: 'Your email was verified successfully. You can continue to the app.',
        signIn: 'Sign in',
        continue: 'Continue to app'
      },
      error: {
        title: 'Verification link unavailable',
        subtitle: 'We could not complete email verification. {error}',
        invalidToken: 'The link is invalid, expired, or has already been used.',
        alreadyVerified: 'This email address is already verified.',
        generic: 'Please request a new verification email and try again.',
        backToSignIn: 'Back to sign in'
      }
    },
    forgotPassword: {
      eyebrow: 'Password recovery',
      title: 'Forgot your password?',
      subtitle: 'Enter your email and we will send reset instructions if an account exists.',
      placeholders: {
        email: 'Enter your email'
      },
      actions: {
        submit: 'Send reset email',
        loading: 'Sending reset email...',
        backToSignIn: 'Back to sign in'
      },
      success: {
        subtitle: 'Check your inbox',
        body: 'If an account exists for that email, a password reset link is on the way.'
      },
      errors: {
        failed: 'We could not process the reset request right now.'
      }
    },
    resetPassword: {
      eyebrow: 'Reset password',
      title: 'Choose a new password',
      subtitle: 'Create a new password for your account.',
      placeholders: {
        password: 'Choose a new password',
        confirmPassword: 'Confirm your new password'
      },
      actions: {
        submit: 'Reset password',
        loading: 'Resetting password...',
        backToSignIn: 'Back to sign in'
      },
      success: {
        title: 'Password reset complete',
        subtitle: 'Your password has been updated.',
        body: 'You can now sign in using your new password.'
      },
      error: {
        subtitle: 'We could not complete the password reset. {error}',
        invalidToken: 'The reset link is invalid.',
        expiredToken: 'The reset link has expired.',
        alreadyUsed: 'This reset link has already been used.',
        generic: 'Request a new reset email and try again.'
      }
    },
    changePassword: {
      fields: {
        currentPassword: 'Current password',
        newPassword: 'New password'
      },
      placeholders: {
        currentPassword: 'Enter your current password',
        newPassword: 'Choose a new password',
        confirmPassword: 'Confirm your new password'
      },
      actions: {
        submit: 'Update password',
        loading: 'Updating password...'
      },
      success: 'Your password was updated successfully.',
      sessionNote: 'Your current session stays active. Other sessions are not revoked in this flow.',
      errors: {
        failed: 'We could not update your password right now.'
      }
    },
    challenge: {
      loading: 'Loading security check...',
      unavailable: 'The security check is unavailable right now. Refresh and try again.'
    }
  }
};
