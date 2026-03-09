export default {
  app: {
    name: 'مساعد الدراسة بالذكاء الاصطناعي',
    shortName: 'AI',
    wordmark: 'دراسة',
    loadingSession: 'جاري تحميل الجلسة...'
  },
  access: {
    deniedTitle: 'تم رفض الوصول',
    deniedMessage: 'ليس لديك صلاحية لعرض هذه الصفحة.',
    backToDashboard: 'العودة إلى لوحة التحكم'
  },
  errors: {
    notFoundTitle: 'الصفحة غير موجودة',
    notFoundCta: 'العودة إلى الصفحة الرئيسية'
  },
  language: {
    english: 'الإنجليزية',
    arabic: 'العربية',
    toggleLabel: 'تغيير اللغة',
    sidebarLabel: 'لغة الواجهة',
    sidebarDescription: 'يتم تطبيق التغيير فوراً على كامل الواجهة.'
  },
  common: {
    loading: 'جاري التحميل...',
    comingSoon: 'قريباً',
    comingSoonBadge: 'قريباً',
    comingSoonDetail: 'نعمل حالياً على إكمال هذه الميزة.'
  },
  nav: {
    dashboard: 'لوحة التحكم',
    documents: 'مستنداتي',
    exams: 'الاختبارات',
    flashcards: 'البطاقات التعليمية',
    adminPanel: 'لوحة الإدارة',
    settings: 'الإعدادات',
    plan: 'خطتي',
    freeBadge: 'مجاني',
    proBadge: 'احترافي',
    mobileLabel: 'التنقل الأساسي'
  },
  topbar: {
    defaultTitle: 'لوحة التحكم',
    notifications: 'الإشعارات',
    notificationsComingSoon: 'الإشعارات (قريباً)',
    profile: 'الملف الشخصي',
    logout: 'تسجيل الخروج'
  },
  status: {
    processing: 'قيد المعالجة',
    ready: 'جاهز',
    failed: 'فشل',
    info: 'معلومة'
  },
  emptyState: {
    title: 'لا يوجد عناصر بعد',
    description: 'عند إضافة محتوى جديد سيظهر هنا.'
  },
  confirmModal: {
    title: 'هل أنت متأكد؟',
    description: 'لا يمكن التراجع عن هذه العملية.',
    confirm: 'تأكيد',
    cancel: 'إلغاء'
  },
  drawer: {
    close: 'إغلاق'
  },
  landing: {
    title: 'مساعد الدراسة بالذكاء الاصطناعي',
    subtitle: 'رفيقك الذكي للتعلم والبحث',
    features: {
      upload: {
        title: 'ارفع المستندات',
        description: 'استورد ملفات PDF وWord والعروض التقديمية لتحليلها ودراستها'
      },
      analysis: {
        title: 'تحليل مدعوم بالذكاء الاصطناعي',
        description: 'احصل على ملخصات وشروحات ورؤى من موادك التعليمية'
      },
      organize: {
        title: 'تنظيم ذكي',
        description: 'حافظ على جميع موادك الدراسية في مكان واحد'
      }
    },
    enterCta: 'دخول'
  },
  home: {
    heroTitle: 'مساعد الدراسة بالذكاء الاصطناعي',
    heroSubtitle: 'ارفع موادك الدراسية واحصل على ملخصات وبطاقات تعليمية واختبارات تدريبية مدعومة بالذكاء الاصطناعي',
    stats: {
      documentsRemaining: 'المستندات المتبقية',
      usedThisMonth: 'المستخدم هذا الشهر',
      totalDocuments: 'إجمالي المستندات',
      unlimited: 'غير محدود'
    },
    alerts: {
      error: 'فشل تحميل بيانات المستخدم. يرجى التحديث.'
    },
    quotaReached: {
      title: 'تم الوصول إلى حد الرفع الشهري',
      body: 'لقد استخدمت جميع مرات الرفع المتاحة في خطتك الشهرية الحالية. يمكنك رفع المزيد من المستندات عند إعادة تعيين حصتك في الشهر القادم.',
      upgradeHint: 'قم بترقية خطتك إذا كنت تريد حدًا شهريًا أعلى لرفع المستندات.'
    },
    uploadSection: {
      title: 'رفع مستند جديد',
      languageLabel: 'لغة استجابة الذكاء الاصطناعي',
      englishOption: 'الإنجليزية',
      arabicOption: 'العربية',
      filePlaceholder: 'انقر لاختيار ملف (PDF, DOCX, PPTX)',
      dragActive: 'أفلت الملف هنا',
      fileSelected: 'تم اختيار الملف — جاهز للإنشاء',
      constraints: 'PDF, DOCX, PPTX (أقصى حجم 25MB)',
      selectedFileLabel: '{name}',
      fileInfo: 'الحد الأقصى لحجم الملف: 25 ميغابايت',
      submit: 'رفع وإنشاء مواد دراسية',
      submitProcessing: 'جاري المعالجة... (قد يستغرق 20-30 ثانية)',
      errors: {
        selectFile: 'يرجى اختيار ملف أولاً',
        invalidType: 'نوع الملف غير صالح. يرجى رفع ملف PDF أو DOCX أو PPTX.',
        fileTooLarge: 'حجم الملف كبير جداً. الحد الأقصى هو 25 ميغابايت.',
        limitReached: 'لقد وصلت إلى الحد الشهري للرفع',
        uploadFailed: 'فشل رفع المستند. حاول مرة أخرى.',
        network: 'خطأ في الشبكة. حاول مرة أخرى.'
      },
      success: 'تمت معالجة المستند بنجاح! تم إنشاء {flashcards} بطاقة تعليمية و{questions} سؤالاً للاختبار.'
    },
    documents: {
      title: 'مستنداتي ({count})',
      viewCta: 'عرض ودراسة',
      deleteCta: 'حذف',
      languageEnglish: 'الإنجليزية',
      languageArabic: 'العربية',
      flashcardCount: '{count} بطاقة تعليمية',
      questionCount: '{count} سؤالاً',
      deleteConfirm: 'هل أنت متأكد أنك تريد حذف هذا المستند؟',
      deleteSuccess: 'تم حذف المستند بنجاح',
      deleteError: 'فشل حذف المستند'
    },
    processing: {
      title: 'جاري معالجة المستند',
      stages: {
        upload: 'رفع الملف',
        extract: 'استخراج النص',
        generate: 'إنشاء المحتوى الذكي',
        save: 'حفظ النتائج'
      },
      complete: 'اكتمل!'
    }
  },
  document: {
    loading: 'جاري تحميل المستند...',
    loadingError: 'فشل تحميل المستند',
    notFound: 'المستند غير موجود',
    processingFailedTitle: 'تعذر إكمال معالجة هذا المستند.',
    processingFailed: 'فشلت معالجة المستند. يرجى المحاولة مرة أخرى.',
    processingFailedHelp: 'يمكنك العودة إلى المستندات أو رفع الملف مرة أخرى من لوحة التحكم.',
    extracting: 'جاري استخراج نص المستند...',
    extractingNote: 'يستغرق ذلك عادة بضع ثوانٍ قبل أن تصبح أدوات الدراسة جاهزة للإنشاء عند الطلب.',
    aiGenerating: 'الذكاء الاصطناعي يقوم بإنشاء المواد الدراسية...',
    aiGeneratingNote: 'يستغرق ذلك عادة حوالي 20 ثانية.',
    finalizing: 'جارٍ إنهاء تجهيز المستند...',
    finalizingNote: 'المواد الدراسية أصبحت جاهزة. جارٍ تحميل عرض المستند الكامل الآن.',
    processingProgress: 'التقدم {progress}%',
    jobStatusError: 'تعذر التحقق من حالة المعالجة. يرجى المحاولة مرة أخرى.',
    back: 'رجوع',
    backToDocuments: 'العودة إلى المستندات',
    backToDashboard: 'العودة إلى لوحة التحكم',
    uploadAgain: 'رفع ملف آخر',
    actions: {
      generate: 'إنشاء',
      regenerate: 'إعادة الإنشاء',
      retry: 'إعادة المحاولة',
      generating: 'جارٍ الإنشاء...'
    },
    options: {
      summaryLength: 'طول الملخص',
      short: 'قصير',
      medium: 'متوسط',
      long: 'طويل',
      includeExplanations: 'تضمين الشروحات',
      questionCount: 'عدد الأسئلة'
    },
    generation: {
      queuedNoContent: 'تمت إضافة عملية الإنشاء إلى قائمة الانتظار لهذه الأداة.',
      runningNoContent: 'جارٍ إنشاء المحتوى الآن. أعد المحاولة بعد قليل.',
      regenerating: 'جارٍ إعادة الإنشاء. سيبقى المحتوى الحالي متاحًا حتى تكتمل النسخة الجديدة.',
      failedNoContent: 'فشل الإنشاء. حاول مرة أخرى.',
      failedWithContent: 'فشلت آخر عملية إنشاء. يتم عرض المحتوى السابق.',
      missingContent: 'اكتملت عملية الإنشاء ولكن لا يوجد محتوى متاح بعد. حاول مرة أخرى.',
      requestFailed: 'تعذر بدء الإنشاء. يرجى المحاولة مرة أخرى.'
    },
    uploaded: 'تاريخ الرفع',
    language: 'اللغة',
    tabs: {
      summary: 'الملخص',
      flashcards: 'البطاقات التعليمية ({count})',
      exam: 'الاختبار التجريبي ({count})'
    },
    hub: {
      statusTitle: '???? ???????',
      statusSubtitle: '??? ???? ????????? ?? ???? ???????? ???? ?????? ????? ??????? ???? ????? ??? ???.',
      generationRunning: '???? ????? ????? ????? ????. ??????? ?????? ???? ?????? ???????.',
      generationFailed: '???? ??? ????? ?????. ????? ????? ???????? ?? ???? ??????? ???????.',
      actionsTitle: '??????? ???????',
      actionsSubtitleEmpty: '?? ???? ???? ?????? ????? ???. ???? ?????? ???? ?? ?????? ?? ??????.',
      actionsSubtitleExisting: '????? ????? ???? ?? ?????? ?? ????? ??????? ?????? ?? ??? ???????.',
      materialsTitle: '?????? ????????'
    },
    source: {
      title: '????? ??????',
      description: '????? ??????? ?? ??????? ???????? ?? ????? ?????? ????????.',
      count: '{count} ????',
      loading: '???? ????? ????? ??????...',
      loadError: '???? ????? ????? ??????.',
      retry: '????? ????????',
      empty: '?? ???? ????? ???? ????? ??????? ???? ??????? ???.',
      page: '??????/??????? {page}',
      loadMore: '????? ???? ?? ???????',
      loadingMore: '???? ???????...',
      slideText: '?? ???????',
      speakerNote: '?????? ???????',
      excerpt: '????'
    },
    summary: {
      generatePrompt: 'أنشئ ملخصًا عندما تكون مستعدًا لدراسة هذا المستند.'
    },
    flashcards: {
      shuffle: 'إعادة ترتيب',
      cardCounter: 'البطاقة {current} من {total}',
      question: 'السؤال',
      answer: 'الإجابة',
      explanation: 'الشرح',
      empty: 'لا توجد بطاقات تعليمية متاحة لهذا المستند.',
      generatePrompt: 'أنشئ بطاقات تعليمية لبدء مراجعة هذا المستند.',
      flipHint: 'انقر للقلب',
      previous: 'السابق',
      next: 'التالي'
    },
    exam: {
      generatePrompt: 'أنشئ اختبارًا تجريبيًا عندما تكون مستعدًا لاختبار نفسك.',
      readyTitle: 'هل أنت مستعد للاختبار التجريبي؟',
      questionCount: 'يحتوي هذا الاختبار على {count} سؤالاً',
      feedbackPrompt: 'كيف تفضل عرض الإجابات؟',
      instantTitle: 'تغذية راجعة فورية',
      instantDescription: 'عرض الإجابة الصحيحة بعد كل سؤال',
      endTitle: 'محاكاة الاختبار',
      endDescription: 'عرض جميع الإجابات في النهاية',
      start: 'ابدأ الاختبار',
      questionNumber: 'السؤال {index}',
      inputPlaceholder: 'اكتب إجابتك...',
      previous: 'السابق',
      next: 'التالي',
      submit: 'إرسال الاختبار',
      instantCorrect: 'إجابة صحيحة!',
      instantIncorrect: 'إجابة خاطئة',
      instantAnswer: 'الإجابة الصحيحة: {answer}',
      instantExplanation: '{explanation}',
      progress: 'السؤال {current} من {total}',
      completeTitle: 'اكتمل الاختبار!',
      score: 'حصلت على {score} من {total}',
      reviewTitle: 'مراجعة إجاباتك',
      reviewQuestion: 'السؤال {index}',
      reviewYourAnswer: 'إجابتك: {answer}',
      reviewCorrectAnswer: 'الإجابة الصحيحة: {answer}',
      reviewNotAnswered: 'لم تتم الإجابة',
      reviewCorrect: 'صحيح',
      reviewIncorrect: 'خاطئ',
      empty: 'لا توجد أسئلة اختبار متاحة لهذا المستند.',
      retake: 'إعادة الاختبار'
    }
  },
  documentsPage: {
    eyebrow: 'مساحة العمل',
    title: 'المستندات',
    description: 'كل عمليات الرفع المعالجة تظهر هنا. يمكنك فتحها أو مراجعتها أو حذفها في أي وقت.',
    emptyTitle: 'لا يوجد مستندات بعد',
    emptyDescription: 'ارفع أول مستند من لوحة التحكم لبدء إنشاء المواد الدراسية.',
    labels: {
      uploaded: 'تاريخ الرفع',
      language: 'اللغة'
    },
    columns: {
      flashcards: 'البطاقات التعليمية',
      exams: 'أسئلة الاختبار'
    },
    statuses: {
      queued: 'قيد الانتظار',
      processing: 'قيد المعالجة',
      running: 'قيد المعالجة',
      complete: 'جاهز',
      failed: 'فشل',
      unknown: 'غير معروف'
    },
    actions: {
      refresh: 'تحديث القائمة',
      uploadCta: 'رفع من لوحة التحكم',
      view: 'فتح',
      delete: 'حذف',
      deleting: 'جاري الحذف...'
    },
    errors: {
      load: 'تعذر تحميل المستندات حالياً.',
      delete: 'فشل حذف المستند. حاول مرة أخرى.'
    },
    deleteConfirmTitle: 'حذف المستند؟',
    deleteConfirmDescription: 'سيتم حذف {name} وكافة المواد المولدة نهائياً.',
    deleteUnknown: 'هذا المستند'
  },
  examsPage: {
    title: 'اختبارات تدريبية',
    description: 'قريباً ستتمكن من إنشاء اختبارات تكيفية لأي مستند.',
    features: {
      builder: {
        title: 'منشئ تكيفي',
        description: 'اختر الموضوع والصعوبة والزمن لإنشاء الاختبار المثالي.'
      }
    },
    actions: {
      primary: 'ترقبوا'
    }
  },
  flashcardsPage: {
    title: 'منطقة البطاقات التعليمية',
    description: 'نظم البطاقات وجدول جلسات المراجعة بالتكرار المتباعد.',
    features: {
      generator: {
        title: 'منشئ البطاقات',
        description: 'اختر مقاطع من المستند لإنشاء بطاقات مركزة فوراً.'
      },
      practice: {
        title: 'أوضاع المراجعة',
        description: 'أوضاع دراسة مع مؤقتات وتذكيرات للتكرار المتباعد.'
      }
    },
    actions: {
      primary: 'ابدأ التدريب'
    }
  },
  settings: {
    eyebrow: 'التفضيلات',
    title: 'الإعدادات',
    subtitle: 'خصص التجربة بما يناسب أسلوبك الدراسي.',
    language: {
      title: 'اللغة',
      description: 'بدّل بين الإنجليزية والعربية متى شئت.'
    },
    theme: {
      title: 'السمة',
      description: 'الوضع الداكن متاح حالياً.',
      current: 'الوضع الداكن',
      helper: 'سيتم إضافة سمات جديدة قريباً.'
    },
    account: {
      title: 'الحساب',
      description: 'أدر بياناتك وجلسة الدخول.',
      anonymous: 'مستخدم بدون اسم',
      noEmail: 'البريد غير متوفر',
      actions: {
        profile: 'الملف الشخصي',
        logout: 'تسجيل الخروج',
        loggingOut: 'جاري تسجيل الخروج...'
      }
    }
  }
};
