export default {
  app: {
    name: 'AI Study Assistant',
    shortName: 'AI',
    wordmark: 'Study',
    loadingSession: 'Loading session...'
  },
  access: {
    deniedTitle: 'Access Denied',
    deniedMessage: 'You do not have permission to view this page.',
    backToDashboard: 'Back to dashboard'
  },
  errors: {
    notFoundTitle: 'Page not found',
    notFoundCta: 'Back to home'
  },
  language: {
    english: 'English',
    arabic: 'العربية',
    toggleLabel: 'Switch language',
    sidebarLabel: 'Interface language',
    sidebarDescription: 'Applies instantly across the workspace.'
  },
  common: {
    loading: 'Loading...',
    comingSoon: 'Coming soon',
    comingSoonBadge: 'Soon',
    comingSoonDetail: 'We are putting the finishing touches on this experience.'
  },
  nav: {
    dashboard: 'Dashboard',
    documents: 'My Documents',
    upload: 'Upload',
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
    defaultTitle: 'Dashboard',
    notifications: 'Notifications',
    notificationsComingSoon: 'Notifications (coming soon)',
    profile: 'Profile',
    logout: 'Log out'
  },
  status: {
    processing: 'Processing',
    ready: 'Ready',
    failed: 'Failed',
    info: 'Info'
  },
  emptyState: {
    title: 'No items yet',
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
    heroTitle: 'AI Study Assistant',
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
    uploadSection: {
      title: 'Upload New Document',
      languageLabel: 'AI Response Language',
      englishOption: 'English',
      arabicOption: 'Arabic',
      filePlaceholder: 'Click to select a file (PDF, DOCX, PPTX)',
      dragActive: 'Release to drop file',
      fileSelected: 'File selected — ready to generate',
      constraints: 'PDF, DOCX, PPTX (Max 25MB)',
      selectedFileLabel: '{name}',
      fileInfo: 'Maximum file size: 25MB',
      submit: 'Upload & Generate Study Materials',
      submitProcessing: 'Processing... (this may take 20-30 seconds)',
      errors: {
        selectFile: 'Please select a file first',
        invalidType: 'Invalid file type. Please upload PDF, DOCX, or PPTX.',
        fileTooLarge: 'File is too large. Maximum size is 25MB.',
        limitReached: 'You have reached your monthly upload limit',
        uploadFailed: 'Failed to upload document. Please try again.',
        network: 'Network error. Please try again.'
      },
      success: 'Document processed successfully! Generated {flashcards} flashcards and {questions} exam questions.'
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
    processingFailedHelp: 'Go back to your documents or upload the file again from the dashboard.',
    aiGenerating: 'AI is generating study materials...',
    aiGeneratingNote: 'This usually takes about 20 seconds.',
    finalizing: 'Finalizing your document...',
    finalizingNote: 'Your study materials are ready. Loading the full document view now.',
    processingProgress: 'Progress {progress}%',
    jobStatusError: 'Unable to check processing status. Please try again.',
    back: 'Back',
    backToDocuments: 'Back to Documents',
    backToDashboard: 'Back to Dashboard',
    uploadAgain: 'Upload Again',
    uploaded: 'Uploaded',
    language: 'Language',
    tabs: {
      summary: 'Summary',
      flashcards: 'Flashcards ({count})',
      exam: 'Mock Exam ({count})'
    },
    flashcards: {
      shuffle: 'Shuffle',
      cardCounter: 'Card {current} of {total}',
      question: 'Question',
      answer: 'Answer',
      empty: 'No flashcards are available for this document.',
      flipHint: 'Click to flip',
      previous: 'Previous',
      next: 'Next'
    },
    exam: {
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
    }
  },
  documentsPage: {
    eyebrow: 'Workspace',
    title: 'Documents',
    description: 'Every processed upload lives here. Open, review, or clean up entries anytime.',
    emptyTitle: 'No documents yet',
    emptyDescription: 'Upload your first document from the dashboard to start generating study materials.',
    labels: {
      uploaded: 'Uploaded',
      language: 'Language'
    },
    columns: {
      flashcards: 'Flashcards',
      exams: 'Exam questions'
    },
    statuses: {
      queued: 'Queued',
      processing: 'Processing',
      running: 'Processing',
      complete: 'Ready',
      failed: 'Failed',
      unknown: 'Unknown'
    },
    actions: {
      refresh: 'Refresh list',
      uploadCta: 'Upload from dashboard',
      view: 'Open',
      delete: 'Delete',
      deleting: 'Deleting...'
    },
    errors: {
      load: 'Unable to load your documents right now.',
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
    language: {
      title: 'Language',
      description: 'Switch between English and Arabic at any time.'
    },
    theme: {
      title: 'Theme',
      description: 'Dark mode is available today.',
      current: 'Dark mode',
      helper: 'Additional themes are on the roadmap.'
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
  }
};
