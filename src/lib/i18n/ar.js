import en from './en.js';

function mergeDictionaries(base, overrides) {
  if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) {
    return overrides ?? base;
  }

  const next = { ...(base ?? {}) };

  for (const [key, value] of Object.entries(overrides)) {
    const current = base?.[key];
    next[key] = value && typeof value === 'object' && !Array.isArray(value)
      ? mergeDictionaries(current ?? {}, value)
      : value;
  }

  return next;
}

const ar = {
  app: {
    name: 'مساعد الدراسة بالذكاء الاصطناعي',
    wordmark: 'Study AI',
    loadingSession: 'جارٍ تحميل الجلسة...'
  },
  access: {
    deniedTitle: 'تم رفض الوصول',
    deniedMessage: 'ليس لديك صلاحية لعرض هذه الصفحة.',
    backToDashboard: 'العودة إلى الرئيسية'
  },
  errors: {
    notFoundTitle: 'الصفحة غير موجودة',
    notFoundCta: 'العودة إلى الرئيسية'
  },
  language: {
    english: 'الإنجليزية',
    arabic: 'العربية',
    toggleLabel: 'تغيير اللغة',
    sidebarLabel: 'لغة الواجهة',
    sidebarDescription: 'يتم تطبيق التغيير فورًا على كامل مساحة العمل.'
  },
  common: {
    loading: 'جارٍ التحميل...',
    close: 'إغلاق',
    comingSoon: 'قريبًا',
    comingSoonBadge: 'قريبًا',
    comingSoonDetail: 'نعمل حاليًا على إكمال هذه التجربة.'
  },
  nav: {
    home: 'الرئيسية',
    dashboard: 'الرئيسية',
    study: 'مكتبة مركز الدراسة',
    studyDetail: 'الدراسة',
    documents: 'المكتبة',
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
    defaultTitle: 'الرئيسية',
    notifications: 'الإشعارات',
    notificationsComingSoon: 'الإشعارات (قريبًا)',
    collapseSidebar: 'طي الشريط الجانبي',
    expandSidebar: 'توسيع الشريط الجانبي',
    profile: 'الملف الشخصي',
    logout: 'تسجيل الخروج'
  },
  status: {
    notStarted: 'لم يبدأ',
    queued: 'في الانتظار',
    processing: 'قيد المعالجة',
    running: 'قيد الإنشاء',
    complete: 'مكتمل',
    failed: 'فشل',
    info: 'معلومة',
    ready: 'مكتمل',
  },
  emptyState: {
    title: 'لا توجد عناصر بعد',
    subtitle: 'عند إضافة محتوى جديد سيظهر هنا.',
    description: 'عند إضافة محتوى جديد سيظهر هنا.'
  },
  confirmModal: {
    title: 'هل أنت متأكد؟',
    description: 'لا يمكن التراجع عن هذا الإجراء.',
    confirm: 'تأكيد',
    cancel: 'إلغاء'
  },
  drawer: {
    close: 'إغلاق'
  },
  landing: {
    title: 'مساعد الدراسة بالذكاء الاصطناعي',
    subtitle: 'رفيقك الذكي للتعلّم والبحث',
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
    enterCta: 'دخول',
    heroBadge: 'وصول مبكر — مجاني',
    heroHeadline1: 'مستندك.',
    heroHeadline2: 'ملخصات، بطاقات تعليمية،',
    heroHeadline3: 'واختبار تدريبي.',
    heroSub: 'ارفع أي ملف دراسي. احصل على ثلاث أدوات مراجعة في أقل من دقيقة.',
    heroCta: 'ابدأ مجاناً',
    heroTrust: 'بدون بطاقة ائتمان · PDF و DOCX و PPTX · عربي وإنجليزي',
    credibilityStrip: 'PDF · DOCX · PPTX · عربي · إنجليزي · مجاني في الوصول المبكر',
    problemEyebrow: 'المشكلة',
    problemHeadline1: 'لديك 80 صفحة للمراجعة.',
    problemHeadline2: 'امتحانك بعد يومين.',
    problemBody: 'القراءة مرة واحدة لا تكفي للحفظ. إعداد الملاحظات يستغرق ساعات. StudyMaxing يقرأ مستندك ويبني لك أدوات المراجعة الثلاث التي تحتاجها فعلاً — في الوقت الذي تستغرقه لتحضير كوب قهوة.',
    featuresEyebrow: 'ماذا ستحصل',
    featuresHeadline: 'ثلاث أدوات دراسية. رفع واحد.',
    feature1Eyebrow: 'الملخص',
    feature1Title: 'مستندك، منظماً.',
    feature1Body: 'المفاهيم الأساسية، الحجج الرئيسية، المصطلحات المهمة — مستخرجة ومنظمة. ليس ملخصاً عاماً. مبني من ما رفعته أنت.',
    feature2Eyebrow: 'البطاقات التعليمية',
    feature2Title: 'سؤال وجواب، جاهز للدراسة.',
    feature2Body: 'بطاقات مستخرجة مباشرة من محتواك. ادرسها في التطبيق، أو أرسلها إلى تيليغرام وادرس من هاتفك.',
    feature3Eyebrow: 'الاختبار التدريبي',
    feature3Title: 'اختبر نفسك قبل الحقيقي.',
    feature3Body: '10 أسئلة مولّدة من مستندك. أجب على الاختبار، اعرف نتيجتك، اكتشف ما يحتاج مزيداً من العمل.',
    howEyebrow: 'كيف يعمل',
    howHeadline: 'من المستند إلى الاستعداد للامتحان في ثلاث خطوات.',
    step1Title: 'ارفع ملفك',
    step1Body: 'PDF أو DOCX أو PPTX. عربي أو إنجليزي، مطبوع أو ممسوح ضوئياً. حتى 200 صفحة.',
    step2Title: 'اختر المخرجات',
    step2Body: 'ملخص، بطاقات، اختبار — أو الثلاثة معاً دفعة واحدة.',
    step3Title: 'ادرس من مكان واحد',
    step3Body: 'كل ما تم توليده يعيش معاً في مركز الدراسة الخاص بك.',
    faqEyebrow: 'أسئلة',
    faqHeadline: 'إجابات على الأسئلة الشائعة.',
    faq1Q: 'هل يعمل مع المستندات العربية؟',
    faq1A: 'نعم. اللغة العربية مدعومة بالكامل — بما في ذلك ملفات PDF العربية الممسوحة ضوئياً باستخدام تقنية OCR. يتم توليد الملخصات والبطاقات والاختبارات بلغة مستندك.',
    faq2Q: 'ما أنواع الملفات المدعومة؟',
    faq2A: 'ملفات PDF و DOCX و PPTX حتى 25 ميغابايت و 200 صفحة أو شريحة. تعمل المستندات المطبوعة والممسوحة ضوئياً.',
    faq3Q: 'كم يستغرق التوليد؟',
    faq3A: 'معظم المستندات تُعالج بالكامل — الأدوات الثلاث — في أقل من 60 ثانية. الملفات الأكبر قد تستغرق وقتاً أطول قليلاً.',
    faq4Q: 'هل مستندي خاص؟',
    faq4A: 'ملفاتك مخزنة بأمان ولا يمكن لأحد غيرك الاطلاع عليها. لا نشارك محتواك مع أي جهة.',
    faq5Q: 'هل أحتاج بطاقة ائتمان؟',
    faq5A: 'لا. StudyMaxing مجاني خلال فترة الوصول المبكر. بدون بطاقة، بدون التزام.',
    faq6Q: 'هل يمكنني تصدير موادي الدراسية؟',
    faq6A: 'نعم. صدّر كـ PDF، أو استقبل بطاقاتك التعليمية مباشرة عبر تيليغرام.',
    ctaHeadline: 'ابدأ الدراسة بذكاء.',
    ctaSub: 'مجاني خلال الوصول المبكر. لا حاجة لبطاقة ائتمان.',
    ctaButton: 'أنشئ حسابك المجاني'
  },
  home: {
    heroTitle: 'StudyMaxing',
    heroSubtitle: 'ارفع موادك الدراسية واحصل على ملخصات وبطاقات تعليمية واختبارات تدريبية مدعومة بالذكاء الاصطناعي',
    stats: {
      documentsRemaining: 'المستندات المتبقية',
      usedThisMonth: 'المستخدم هذا الشهر',
      totalDocuments: 'إجمالي المستندات',
      unlimited: 'غير محدود'
    },
    alerts: {
      error: 'تعذر تحميل بيانات المستخدم. يرجى إعادة المحاولة.'
    },
    quotaReached: {
      title: 'تم الوصول إلى حد الرفع الشهري',
      body: 'لقد استخدمت جميع عمليات الرفع المتاحة ضمن خطتك الشهرية الحالية. يمكنك رفع المزيد عند إعادة تعيين حصتك في الشهر القادم.',
      upgradeHint: 'قم بترقية خطتك إذا كنت تريد حدًا شهريًا أعلى لرفع المستندات.'
    },
    uploadSection: {
      title: 'رفع مستند جديد',
      modalTitle: 'رفع الملفات',
      modalDescription: 'أضف مستندك هنا',
      modalDescriptionSingle: 'ارفع مستندًا واحدًا ثم اختر ما تريد إنشاءه بعد ذلك.',
      compactTitle: 'ارفع مستندك الأول',
      compactSubtitle: 'أنشئ الملخصات والبطاقات التعليمية والاختبارات',
      compactSupport: 'PDF وDOCX وPPTX',
      browseFile: 'استعرض ملفًا',
      heroEyebrow: 'أول رفع',
      heroTitle: 'ابدأ مكتبتك الدراسية بمستند واحد',
      heroDescription: 'ارفع ملف PDF أو DOCX أو PPTX لبدء تجربة دراسة أكثر ترتيبًا، مع الملخصات والبطاقات التعليمية وأسئلة الاختبار من نفس المساحة.',
      heroSupport: 'سيكون رفعك الأول نقطة البداية لكل ما ستراجعه بعد ذلك.',
      heroBenefitsLabel: 'ما يمكنك إنشاؤه',
      heroBenefits: {
        summary: 'ملخص',
        flashcards: 'بطاقات تعليمية',
        exams: 'أسئلة الاختبار'
      },
      surfaceTitle: 'ارفع موادك الدراسية',
      surfaceSubtitle: 'اسحب وأفلت أو انقر للاستعراض',
      surfaceMeta: 'PDF، DOCX، PPTX • الحد الأقصى 25MB',
      dropzoneTitle: 'أفلت مستندك هنا أو استعرض الملفات للبدء',
      dropzoneDescription: 'ما زال السحب والإفلات مدعومًا، لكن أسرع طريق هو اختيار ملف واحد ثم المتابعة.',
      dropzoneOr: 'أو',
      browse: 'استعرض الملفات',
      supportedFiles: 'يدعم PDF وDOCX وPPTX',
      supportedFilesSingle: 'يدعم PDF وDOCX وPPTX. مستند واحد في كل مرة.',
      openModalCta: 'رفع الملفات',
      cancel: 'إلغاء',
      next: 'التالي',
      submitUpload: 'رفع المستند',
      submitUploading: 'جارٍ رفع المستند...',
      removeFile: 'حذف الملف',
      languageLabel: 'لغة استجابة الذكاء الاصطناعي',
      englishOption: 'الإنجليزية',
      arabicOption: 'العربية',
      filePlaceholder: 'انقر لاختيار ملف (PDF أو DOCX أو PPTX)',
      dragActive: 'أفلت الملف هنا',
      fileSelected: 'تم اختيار الملف وهو جاهز للإنشاء',
      constraints: 'PDF وDOCX وPPTX (الحد الأقصى 25MB)',
      selectedFileLabel: '{name}',
      fileInfo: 'الحد الأقصى لحجم الملف: 25 ميجابايت',
      submit: 'رفع وإنشاء مواد دراسية',
      submitProcessing: 'جارٍ المعالجة... (قد يستغرق ذلك 20 إلى 30 ثانية)',
      errors: {
        selectFile: 'يرجى اختيار ملف أولًا',
        invalidType: 'نوع الملف غير صالح. يرجى رفع ملف PDF أو DOCX أو PPTX.',
        fileTooLarge: 'حجم الملف كبير جدًا. الحد الأقصى هو 25 ميجابايت.',
        maxFiles: 'يمكنك رفع حتى {max} ملفات في المرة الواحدة.',
        limitReached: 'لقد وصلت إلى حد الرفع الشهري',
        uploadFailed: 'فشل رفع المستند. حاول مرة أخرى.',
        network: 'خطأ في الشبكة. حاول مرة أخرى.'
      },
      success: 'تمت معالجة المستند بنجاح. تم إنشاء {flashcards} بطاقة تعليمية و{questions} سؤالًا.'
    },
    guided: {
      eyebrow: 'اكتمل الرفع',
      title: 'اختر ما تريد إنشاءه',
      subtitle: 'ملفك جاهز للخطوة التالية.',
      fileLabel: 'الملف المرفوع',
      processingHint: 'ملفك لا يزال قيد التجهيز. يمكنك الاختيار الآن وسنبدأ فور اكتماله.',
      readyHint: 'اختر صيغة دراسية واحدة أو أكثر لإنشائها من هذا الملف.',
      statusPreparing: 'جارٍ تجهيز الملف',
      statusReady: 'جاهز',
      statusFailed: 'يحتاج إلى مراجعة',
      featureSelected: 'محدد',
      featureOptional: 'اضغط للتحديد',
      selectedTitle: 'إنشاء المواد المحددة',
      selectedBody: 'سنجهز الملف عند الحاجة، ثم نبدأ كل صيغة محددة قبل فتح مركز الدراسة.',
      emptyTitle: 'لم يتم اختيار أي صيغة',
      emptyBody: 'اختر صيغة واحدة على الأقل للبدء الآن، أو تخطَ للمتابعة إلى مركز الدراسة.',
      selectionCount: '{count} تم اختيارها',
      skip: 'تخطي الآن',
      generateSelected: 'إنشاء المحدد',
      supportLabels: {
        summary: 'مراجعة سريعة',
        flashcards: 'استرجاع نشط',
        exam: 'قياس الجاهزية'
      },
      features: {
        summary: 'نظرة واضحة ومختصرة لأهم نقاط الملف.',
        flashcards: 'مجموعة مركزة للتكرار وتثبيت المعلومات.',
        exam: 'اختبار تدريبي لمعرفة مدى جاهزيتك.'
      },
      errors: {
        generationRequest: 'تعذر بدء كل عمليات الإنشاء المحددة. راجع اختياراتك وحاول مرة أخرى.',
        progress: 'تعذر إكمال إعداد ما بعد الرفع. حاول مرة أخرى.',
        progressTitle: 'حدثت مشكلة أثناء تجهيز مسار الدراسة.'
      },
      progress: {
        title: 'جارٍ تجهيز مسار الدراسة',
        eyebrow: 'الإنشاء قيد التنفيذ',
        ariaLabel: 'تقدم إنشاء ما بعد الرفع',
        preparingTitle: 'جارٍ تجهيز المستند',
        preparingBody: 'نستخرج محتوى المستند حتى تبدأ المواد الدراسية المحددة بشكل واضح وصحيح.',
        generatingTitle: 'جارٍ إنشاء المواد المحددة',
        generatingBody: 'يتم الآن بدء المواد الدراسية التي طلبتها.',
        finishingTitle: 'اللمسات الأخيرة',
        finishingBody: 'أصبح مستندك جاهزًا في مركز الدراسة. جارٍ نقلك الآن.',
        activeFeatureTitle: {
          summary: 'جارٍ إنشاء الملخص',
          flashcards: 'جارٍ إنشاء البطاقات التعليمية',
          exam: 'جارٍ إنشاء الاختبار التجريبي'
        },
        steps: {
          uploadComplete: 'اكتمل الرفع',
          preparingDocument: 'جارٍ تجهيز المستند',
          summary: 'جارٍ إنشاء الملخص',
          flashcards: 'جارٍ إنشاء البطاقات التعليمية',
          exam: 'جارٍ إنشاء الاختبار التجريبي',
          finishing: 'اللمسات الأخيرة'
        }
      }
    },
    documents: {
      title: 'مستنداتي ({count})',
      viewCta: 'عرض ودراسة',
      deleteCta: 'حذف',
      languageEnglish: 'الإنجليزية',
      languageArabic: 'العربية',
      flashcardCount: '{count} بطاقة تعليمية',
      questionCount: '{count} سؤالًا',
      deleteConfirm: 'هل أنت متأكد من أنك تريد حذف هذا المستند؟',
      deleteSuccess: 'تم حذف المستند بنجاح',
      deleteError: 'فشل حذف المستند'
    }
  },
  document: {
    loading: 'جارٍ تحميل المستند...',
    loadingError: 'تعذر تحميل المستند',
    notFound: 'المستند غير موجود',
    processingFailedTitle: 'تعذر إكمال معالجة هذا المستند.',
    processingFailed: 'فشلت معالجة المستند. يرجى المحاولة مرة أخرى.',
    processingFailedHelp: 'يمكنك العودة إلى المكتبة أو رفع الملف مرة أخرى من الصفحة الرئيسية.',
    extracting: 'جارٍ استخراج نص المستند...',
    extractingNote: 'يستغرق ذلك عادة بضع ثوانٍ قبل أن تصبح أدوات الدراسة جاهزة للإنشاء عند الطلب.',
    aiGenerating: 'يقوم الذكاء الاصطناعي بإنشاء المواد الدراسية...',
    aiGeneratingNote: 'يستغرق ذلك عادة حوالي 20 ثانية.',
    finalizing: 'جارٍ إنهاء تجهيز المستند...',
    finalizingNote: 'أصبحت المواد الدراسية جاهزة. جارٍ تحميل عرض المستند الكامل الآن.',
    processingProgress: 'التقدم {progress}%',
    jobStatusError: 'تعذر التحقق من حالة المعالجة. يرجى المحاولة مرة أخرى.',
    back: 'رجوع',
    backToDocuments: 'العودة إلى المستندات',
    backToDashboard: 'العودة إلى الرئيسية',
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
      queuedNoContent: 'تم طلب الإنشاء لهذه الأداة الدراسية.',
      runningNoContent: 'الإنشاء قيد التنفيذ الآن. أعد المحاولة بعد قليل.',
      regenerating: 'جارٍ إعادة الإنشاء. سيبقى المحتوى الحالي متاحًا حتى تكتمل النسخة الجديدة.',
      failedNoContent: 'فشل الإنشاء. حاول مرة أخرى.',
      failedWithContent: 'فشلت آخر عملية إنشاء. يتم عرض المحتوى السابق.',
      missingContent: 'اكتمل الإنشاء لكن لا يوجد محتوى متاح بعد. حاول مرة أخرى.',
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
      backToStudyHub: 'العودة إلى مركز الدراسة',
      untitled: 'مستند بدون عنوان',
      featuresTitle: 'مواد الدراسة',
      readyHint: 'تم الإنشاء وأصبح جاهزًا للفتح.',
      readyToGenerateHint: 'لم يتم طلب أي مواد دراسية بعد. اختر ما تريد إنشاءه عندما تكون جاهزًا.',
      featureDescriptions: {
        summary: 'احصل على ملخص شامل يولده الذكاء الاصطناعي لأهم المفاهيم والنقاط الرئيسية في مستندك.',
        flashcards: 'راجع باستخدام بطاقات تعليمية مولدة بالذكاء الاصطناعي تساعدك على حفظ المصطلحات والمفاهيم المهمة.',
        exam: 'اختبر فهمك من خلال اختبار تدريبي يضم أسئلة اختيار من متعدد وصواب وخطأ مبنية على المحتوى.'
      },
      features: {
        summary: 'الملخص',
        flashcards: 'البطاقات التعليمية',
        exam: 'الاختبار التجريبي'
      },
      states: {
        notGenerated: 'غير مُنشأ',
        notRequested: 'لم يُطلب بعد',
        readyToGenerate: 'جاهز للإنشاء',
        preparing: 'جارٍ تجهيز المستند',
        generating: 'جارٍ الإنشاء',
        waitingForExtraction: 'بانتظار اكتمال معالجة المستند قبل أن يبدأ الإنشاء.'
      },
      loading: {
        preparing: 'جارٍ التجهيز',
        preparingDocument: 'جارٍ تجهيز المستند',
        preparingDocumentHint: 'نجهز هذا المستند حتى يبدأ الإنشاء بشكل واضح ونظيف.',
        preparingFeature: 'جارٍ تجهيز {feature}',
        preparingFeatureHint: 'هذه الأداة التعليمية في قائمة البدء وستبدأ بعد قليل.',
        extractingDocument: 'جارٍ استخراج المستند',
        generatingSelected: 'جارٍ إنشاء المواد المحددة',
        generatingFeature: 'جارٍ إنشاء {feature}',
        generatingHint: 'الإنشاء قيد التنفيذ الآن.',
        finalizing: 'جارٍ الإنهاء',
        finalizingFeature: 'جارٍ إنهاء {feature}',
        selectedFeatures: 'المحدد: {features}'
      },
      actions: {
        open: 'فتح',
        startSummary: 'بدء الملخص',
        startFlashcards: 'بدء البطاقات التعليمية',
        startMockExam: 'بدء الاختبار التجريبي'
      },
      meta: {
        fileType: 'نوع الملف'
      },
      processing: {
        extractingTitle: 'المستند ما زال قيد المعالجة',
        extractingBody: 'نقوم باستخراج محتوى المستند حتى تصبح ميزات الدراسة قابلة للإنشاء.',
        generatingTitle: 'إنشاء مواد الدراسة قيد التنفيذ',
        generatingBody: 'ميزة أو أكثر من ميزات الدراسة قيد الإنشاء الآن.',
        continues: 'يستمر الإنشاء في الخلفية حتى إذا غادرت هذه الصفحة.'
      }
    },
    source: {
      title: 'المحتوى المصدر',
      description: 'مقاطع مستخرجة من المستند تُستخدم في إنشاء مواد الدراسة. يمكنك المتابعة في القراءة أثناء توليد المواد.',
      count: '{count} مقطع',
      loading: 'جارٍ تحميل المقاطع المستخرجة...',
      loadError: 'تعذر تحميل المقاطع المستخرجة.',
      retry: 'إعادة المحاولة',
      empty: 'لا توجد مقاطع قابلة للقراءة لهذا المستند بعد.',
      page: 'الصفحة/الشريحة {page}',
      loadMore: 'تحميل المزيد من المقاطع',
      loadingMore: 'جارٍ تحميل المزيد...',
      slideText: 'نص الشريحة',
      speakerNote: 'ملاحظة المتحدث',
      excerpt: 'مقتطف'
    },
    summary: {
      generatePrompt: 'أنشئ ملخصًا عندما تكون مستعدًا لدراسة هذا المستند.'
    },
    flashcards: {
      shuffle: 'إعادة الترتيب',
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
      questionCount: 'يحتوي هذا الاختبار على {count} سؤالًا',
      feedbackPrompt: 'كيف تفضل مراجعة الإجابات؟',
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
      instantCorrect: 'إجابة صحيحة',
      instantIncorrect: 'إجابة غير صحيحة',
      instantAnswer: 'الإجابة الصحيحة: {answer}',
      instantExplanation: '{explanation}',
      progress: 'السؤال {current} من {total}',
      completeTitle: 'اكتمل الاختبار',
      score: 'حصلت على {score} من {total}',
      reviewTitle: 'راجع إجاباتك',
      reviewQuestion: 'السؤال {index}',
      reviewYourAnswer: 'إجابتك: {answer}',
      reviewCorrectAnswer: 'الإجابة الصحيحة: {answer}',
      reviewNotAnswered: 'لم تتم الإجابة',
      reviewCorrect: 'صحيح',
      reviewIncorrect: 'غير صحيح',
      empty: 'لا توجد أسئلة اختبار متاحة لهذا المستند.',
      retake: 'إعادة الاختبار'
    },
    activity: {
      backToHub: 'العودة إلى مركز المستند',
      section: {
        summary: 'وضع الملخص',
        flashcards: 'وضع البطاقات التعليمية',
        exam: 'وضع الاختبار'
      },
      subtitle: {
        summary: 'عرض قراءة مركّز للملخص المُنشأ.',
        flashcards: 'ادرس بطاقة واحدة في كل مرة مع تتبع سريع للثقة.',
        exam: 'قدّم الاختبار ضمن تدفق أسئلة واضح ونظيف.'
      },
      states: {
        extractionProcessing: 'استخراج المستند ما زال قيد التشغيل',
        generationProcessing: 'الإنشاء قيد التنفيذ',
        processingContinues: 'تستمر المعالجة في الخلفية إذا غادرت هذا العرض.'
      },
      errors: {
        exportPdfFailed: 'تعذر تصدير ملف PDF هذا. حاول مرة أخرى.'
      },
      actions: {
        generateSummary: 'إنشاء ملخص',
        generateFlashcards: 'إنشاء بطاقات تعليمية',
        generateExam: 'إنشاء اختبار',
        exportPdf: 'تصدير PDF',
        exportingPdf: 'جارٍ التصدير...',
        startFlashcards: 'بدء البطاقات التعليمية',
        revealAnswer: 'إظهار الإجابة',
        hideAnswer: 'إخفاء الإجابة',
        markCorrect: 'تحديد كصحيح',
        markIncorrect: 'تحديد كغير صحيح',
        previous: 'السابق',
        next: 'التالي',
        startExam: 'بدء الاختبار',
        submitExam: 'إرسال الاختبار',
        retakeExam: 'إعادة الاختبار',
        sendFlashcardsToTelegram: 'إرسال البطاقات إلى Telegram',
        sendExamToTelegram: 'إرسال الاختبار كاملًا إلى Telegram',
        sendingToTelegram: 'جارٍ الإرسال إلى Telegram...',
        connectTelegram: 'ربط Telegram',
        refreshTelegram: 'تحديث الحالة',
        openTelegram: 'فتح Telegram'
      },
      telegram: {
        notConnected: 'اربط Telegram أولًا، ثم حدّث الحالة بعد الضغط على Start في Telegram.',
        connected: 'Telegram متصل.',
        linkCreated: 'افتح Telegram واضغط Start لإكمال الربط.',
        refreshAfterStart: 'بعد الضغط على Start في Telegram، حدّث الحالة هنا.',
        flashcardsSent: 'تم إرسال البطاقات التعليمية إلى Telegram.',
        examSent: 'تم إرسال الاختبار كاملًا إلى Telegram.',
        statusError: 'تعذر التحقق من حالة Telegram.',
        linkError: 'تعذر إنشاء رابط Telegram.',
        sendError: 'تعذر إرسال هذه المادة الدراسية إلى Telegram.'
      },
      summary: {
        title: 'الملخص',
        regenerating: 'تتم إعادة الإنشاء في الخلفية. سيبقى الملخص الحالي ظاهرًا.'
      },
      flashcards: {
        cardCount: '{count} بطاقة تعليمية',
        progressLabel: 'البطاقة {current}/{total} · صحيح {correct} · غير صحيح {incorrect}',
        questionLabel: 'السؤال',
        answerLabel: 'الإجابة',
        progressSaveError: 'تعذر حفظ تقدم البطاقات التعليمية. حاول مرة أخرى.',
        resultsTitle: 'نتائج البطاقات التعليمية',
        resultsMeta: '{incorrect} غير صحيح · {unanswered} بدون إجابة',
        resultLabel: 'النتيجة:',
        restart: 'إعادة البطاقات التعليمية',
        viewResults: 'عرض النتائج'
      },
      exam: {
        introTitle: 'هل أنت مستعد لبدء الاختبار؟',
        introDescription: 'يحتوي هذا الاختبار على {count} أسئلة.',
        questionLabel: 'السؤال {index}',
        currentLabel: 'السؤال {current} / {total}',
        answeredCount: '{answered} تمت الإجابة من أصل {total}',
        answeredInline: '{answered} تمت الإجابة',
        submittingTitle: 'جارٍ إنهاء الاختبار',
        submittingBody: 'يتم الآن تصحيح المحاولة وحفظ التقدم.',
        resultsTitle: 'نتائج الاختبار',
        scoreLabel: 'النتيجة: {score}/{total}',
        reviewTitle: 'المراجعة',
        yourAnswer: 'إجابتك: {answer}',
        correctAnswer: 'الإجابة الصحيحة: {answer}',
        notAnswered: 'لم تتم الإجابة',
        saveAttemptError: 'تعذر حفظ هذه المحاولة.',
        boolean: {
          true: 'صح',
          false: 'خطأ'
        }
      },
      regenerate: {
        title: 'إعادة الإنشاء مع توجيه',
        description: 'أخبر المساعد بما يجب تحسينه قبل إعادة الإنشاء.',
        reasonLabel: 'السبب الرئيسي',
        customLabel: 'تعليمات إضافية',
        customPlaceholder: 'مثال: ركز أكثر على القوانين والأمثلة المحلولة.',
        confirm: 'إعادة الإنشاء',
        cancel: 'إلغاء',
        running: 'جارٍ إعادة الإنشاء...',
        reasons: {
          missingParts: 'أجزاء مفقودة',
          notComprehensiveEnough: 'غير شامل بما يكفي',
          tooShort: 'قصير جدًا',
          tooGeneric: 'عام جدًا'
        }
      }
    }
  },
  documentsPage: {
    eyebrow: 'مركز الدراسة',
    title: 'المكتبة',
    description: 'تصفح المواد المرفوعة وافتح أي مستند لمتابعة الدراسة.',
    emptyTitle: 'لا توجد مستندات بعد',
    emptyDescription: 'ارفع أول مستند من الصفحة الرئيسية لبدء مكتبتك.',
    libraryEmptyEyebrow: 'أول رفع',
    libraryEmptyTitle: 'تبدأ مكتبة Study Hub هنا',
    libraryEmptyDescription: 'ارفع مستندًا واحدًا واحتفظ بكل ما تدرسه في مكان واحد، جاهزًا للملخصات والبطاقات التعليمية وأسئلة الاختبار.',
    libraryEmptySupport: 'بعد الرفع، افتح المستند هنا لإنشاء المواد الدراسية عند الحاجة.',
    libraryEmptyBenefitsLabel: 'أدوات الدراسة المتاحة',
    libraryEmptySummary: 'ملخص',
    libraryEmptyFlashcards: 'بطاقات تعليمية',
    libraryEmptyExams: 'أسئلة الاختبار',
    libraryEmptyUploadCta: 'ارفع مستندك الأول',
    labels: {
      uploaded: 'تاريخ الرفع',
      language: 'اللغة'
    },
    columns: {
      flashcards: 'البطاقات التعليمية',
      exams: 'أسئلة الاختبار'
    },
    statuses: {
      queued: 'جارٍ تجهيز الرفع',
      processingUpload: 'جارٍ تجهيز الرفع',
      processing: 'قيد المعالجة',
      running: 'قيد المعالجة',
      generatingSelected: 'جارٍ إنشاء المحدد',
      readyToGenerate: 'جاهز للإنشاء',
      complete: 'جاهز',
      failed: 'فشل',
      unknown: 'غير معروف'
    },
    statusMessages: {
      processingUpload: 'استخراج محتوى المستند ما زال قيد التشغيل.',
      readyToGenerate: 'لم يتم طلب أي مواد دراسية بعد.',
      generatingSelected: 'هناك مادة دراسية واحدة أو أكثر قيد الإنشاء الآن.',
      ready: 'المواد الدراسية جاهزة للفتح.',
      generationFailed: 'فشل إنشاء مادة دراسية مطلوبة وقد تحتاج إلى إعادة المحاولة.',
      processingFailed: 'تعذر إنهاء تجهيز هذا المستند.',
      unknown: 'افتح المستند للاطلاع على أحدث حالة.'
    },
    actions: {
      refresh: 'تحديث القائمة',
      uploadCta: 'رفع',
      view: 'فتح',
      rename: 'إعادة التسمية',
      more: 'إجراءات إضافية',
      renamePrompt: 'أعد تسمية هذا المستند',
      delete: 'حذف',
      deleting: 'جارٍ الحذف...'
    },
    errors: {
      load: 'تعذر تحميل مستنداتك الآن.',
      rename: 'فشلت إعادة تسمية المستند. حاول مرة أخرى.',
      delete: 'فشل حذف المستند. حاول مرة أخرى.'
    },
    deleteConfirmTitle: 'حذف المستند؟',
    deleteConfirmDescription: 'سيتم حذف {name} وكل المواد الدراسية التي أُنشئت له نهائيًا.',
    deleteUnknown: 'هذا المستند'
  },
  examsPage: {
    title: 'اختبارات تدريبية',
    description: 'قريبًا ستتمكن من إنشاء اختبارات تكيفية من أي مستند ترفعه.',
    features: {
      builder: {
        title: 'منشئ تكيفي',
        description: 'اختر الموضوع والصعوبة والوقت لإنشاء الاختبار الأنسب لك.'
      }
    },
    actions: {
      primary: 'ترقب'
    }
  },
  flashcardsPage: {
    title: 'مساحة البطاقات التعليمية',
    description: 'نظّم البطاقات وأعد تركيبها وجدول جلسات التكرار المتباعد لكل مادة.',
    features: {
      generator: {
        title: 'منشئ البطاقات',
        description: 'اختر أقسامًا من المستند لإنشاء بطاقات مركزة فورًا.'
      },
      practice: {
        title: 'مراجعة موجهة',
        description: 'أوضاع دراسة مع مؤقتات وسلاسل وتذكيرات للتكرار المتباعد.'
      }
    },
    actions: {
      primary: 'ابدأ التدريب'
    }
  },
  settings: {
    eyebrow: 'التفضيلات',
    title: 'الإعدادات',
    subtitle: 'خصص التجربة بما يناسب طريقة دراستك.',
    tabs: {
      systems: 'الأنظمة',
      account: 'الحساب'
    },
    language: {
      title: 'اللغة',
      description: 'بدّل بين الإنجليزية والعربية في أي وقت.',
      helper: 'يتم حفظ اللغة المختارة على هذا الجهاز وتُطبّق فورًا عبر الواجهة.',
      disabled: 'دعم العربية غير متاح حاليًا.'
    },
    theme: {
      title: 'السمة',
      description: 'اختر بين المظهر الفاتح والداكن.',
      current: 'السمة الحالية: {theme}',
      helper: 'تُطبّق تغييرات السمة فورًا عبر التطبيق وتُحفظ على هذا المتصفح.',
      ariaLabel: 'نمط السمة',
      dark: 'داكن',
      light: 'فاتح'
    },
    security: {
      title: 'الأمان',
      description: 'حدّث كلمة المرور مع الإبقاء على جلستك الحالية فعالة.'
    },
    account: {
      title: 'الحساب',
      description: 'أدر هويتك وجلسة تسجيل الدخول.',
      anonymous: 'مستخدم بدون اسم',
      noEmail: 'البريد غير متوفر',
      actions: {
        profile: 'الملف الشخصي',
        logout: 'تسجيل الخروج',
        loggingOut: 'جارٍ تسجيل الخروج...'
      }
    },
    dataExport: {
      title: 'بياناتك',
      description: 'نزّل نسخة من بيانات حسابك تشمل المستندات وتقدم الدراسة وسجل الاستخدام.',
      download: 'تنزيل بياناتي',
      downloading: 'جارٍ تجهيز الملف...',
      successNote: 'بدأ تنزيل ملف البيانات.',
      clarification: 'تنزيل بياناتك لا يحذف حسابك.',
      errors: {
        failed: 'تعذّر إنشاء ملف التصدير. يرجى المحاولة مرة أخرى.'
      }
    },
    sessions: {
      title: 'الجلسات النشطة',
      description: 'الأجهزة المسجّلة دخولها حاليًا في حسابك.',
      current: 'هذا الجهاز',
      signedIn: 'تسجيل الدخول',
      revokeOthers: 'تسجيل الخروج من جميع الأجهزة الأخرى',
      revokeOthersLoading: 'جارٍ تسجيل الخروج...',
      revokeOthersSuccess: 'تم تسجيل الخروج من جميع الجلسات الأخرى.',
      revoke: 'إلغاء',
      revoking: 'جارٍ الإلغاء...',
      unknownDevice: 'جهاز غير معروف',
      noOtherSessions: 'لا توجد جلسات نشطة أخرى.',
      errors: {
        load: 'تعذّر تحميل الجلسات.',
        revoke: 'تعذّر إلغاء هذه الجلسة.',
        revokeOthers: 'تعذّر تسجيل الخروج من الجلسات الأخرى.'
      }
    },
    telegram: {
      title: 'Telegram',
      description: 'اربط حسابك في Telegram لاستلام البطاقات التعليمية والاختبارات الكاملة من مركز الدراسة.',
      loading: 'جارٍ التحقق من اتصال Telegram...',
      connected: 'متصل',
      disconnectedStatus: 'غير متصل',
      connectedMeta: 'تم الربط في {date}.',
      connectHelper: 'استخدم {bot} لربط حسابك في Telegram. لا يستطيع البوت مراسلتك إلا بعد الضغط على Start.',
      lastSend: 'آخر إرسال: {date}',
      connect: 'ربط Telegram',
      creatingLink: 'جارٍ إنشاء الرابط...',
      disconnect: 'قطع الربط',
      disconnecting: 'جارٍ قطع الربط...',
      refresh: 'تحديث الحالة',
      openTelegram: 'فتح Telegram',
      afterStart: 'اضغط Start في Telegram، ثم عُد إلى هنا وحدّث الحالة.',
      linkCreated: 'تم إنشاء رابط Telegram. اضغط Start في Telegram لإكمال الربط.',
      disconnected: 'تم قطع ربط Telegram.',
      errors: {
        status: 'تعذر تحميل حالة Telegram.',
        link: 'تعذر إنشاء رابط Telegram.',
        disconnect: 'تعذر قطع ربط Telegram.'
      }
    }
  },
  auth: {
    fields: {
      name: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور'
    },
    actions: {
      showPassword: 'إظهار',
      hidePassword: 'إخفاء'
    },
    notices: {
      signedOut: 'تم تسجيل خروجك.',
      sessionExpired: 'انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى.',
      verificationRequired: 'تحقق من بريدك الإلكتروني لإكمال إعداد الحساب.',
      passwordReset: 'تمت إعادة تعيين كلمة المرور. سجّل الدخول باستخدام كلمة المرور الجديدة.'
    },
    validation: {
      nameRequired: 'أدخل اسمك الكامل.',
      emailRequired: 'أدخل بريدك الإلكتروني.',
      emailInvalid: 'أدخل بريدًا إلكترونيًا صالحًا.',
      passwordRequired: 'أدخل كلمة المرور.',
      currentPasswordRequired: 'أدخل كلمة المرور الحالية.',
      passwordMin: 'استخدم {count} أحرف على الأقل.',
      passwordHint: 'استخدم 8 أحرف على الأقل.',
      confirmPasswordRequired: 'أكّد كلمة المرور.',
      confirmPasswordMismatch: 'كلمتا المرور غير متطابقتين.'
    },
    errors: {
      invalidCredentials: 'تحقق من البريد الإلكتروني وكلمة المرور ثم حاول مرة أخرى.',
      duplicateEmail: 'يوجد حساب مسجل بهذا البريد الإلكتروني بالفعل.',
      weakPassword: 'اختر كلمة مرور أقوى مكونة من 8 أحرف على الأقل.',
      networkTimeout: 'استغرق الطلب وقتًا طويلًا. حاول مرة أخرى.',
      networkFailure: 'حدث خطأ في الشبكة. تحقق من الاتصال ثم حاول مرة أخرى.',
      serverFailure: 'حدث خطأ في الخادم. حاول مرة أخرى بعد قليل.',
      sessionExpired: 'انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى.',
      sessionRestoreFailed: 'اكتمل تسجيل الدخول، لكن تعذر استعادة الجلسة. حاول مرة أخرى.',
      blockedAccess: 'لا يمكن لهذا الحساب الوصول إلى التطبيق حاليًا.',
      accountSuspended: 'لا يمكن لهذا الحساب تسجيل الدخول الآن. تواصل مع {email} للمساعدة.',
      rateLimited: 'هناك عدد كبير جدًا من المحاولات. انتظر قليلًا ثم حاول مرة أخرى.',
      rateLimitedRetry: 'هناك عدد كبير جدًا من المحاولات. انتظر حوالي {seconds} ثانية ثم حاول مرة أخرى.',
      challengeRequired: 'أكمل فحص الأمان ثم حاول مرة أخرى.',
      challengeFailed: 'تعذر التحقق من فحص الأمان. حاول مرة أخرى.',
      emailVerificationRequired: 'تحقق من بريدك الإلكتروني قبل تسجيل الدخول.',
      passwordResetRequestFailed: 'تعذر إرسال رسالة إعادة التعيين الآن. حاول مرة أخرى.',
      resetTokenInvalid: 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية أو تم استخدامه بالفعل.',
      currentPasswordInvalid: 'كلمة المرور الحالية غير صحيحة.',
      malformedResponse: 'تعذر إكمال المصادقة. حاول مرة أخرى.',
      genericFailure: 'تعذر إكمال الطلب. حاول مرة أخرى.'
    },
    signIn: {
      eyebrow: 'تسجيل الدخول',
      title: 'مرحبًا بعودتك',
      subtitle: 'سجّل الدخول لمتابعة سير دراستك.',
      placeholders: {
        email: 'أدخل بريدك الإلكتروني',
        password: 'أدخل كلمة المرور'
      },
      actions: {
        submit: 'تسجيل الدخول',
        loading: 'جارٍ تسجيل الدخول...',
        forgotPassword: 'هل نسيت كلمة المرور؟'
      },
      switch: {
        prompt: 'ليس لديك حساب؟',
        action: 'إنشاء حساب'
      },
      errors: {
        failed: 'فشل تسجيل الدخول'
      }
    },
    signUp: {
      eyebrow: 'إنشاء حساب',
      title: 'إنشاء حساب',
      subtitle: 'أنشئ ملفك الشخصي لبدء توليد المواد الدراسية.',
      placeholders: {
        name: 'أدخل اسمك',
        email: 'أدخل بريدك الإلكتروني',
        password: 'اختر كلمة مرور (8 أحرف على الأقل)',
        confirmPassword: 'أكّد كلمة المرور'
      },
      actions: {
        submit: 'إنشاء حساب',
        loading: 'جارٍ إنشاء الحساب...'
      },
      switch: {
        prompt: 'لديك حساب بالفعل؟',
        action: 'تسجيل الدخول'
      },
      errors: {
        failed: 'فشل إنشاء الحساب'
      }
    },
    verify: {
      eyebrow: 'التحقق من البريد الإلكتروني',
      pending: {
        title: 'تحقق من بريدك الوارد',
        subtitleSignup: 'أرسلنا رابط تحقق لإكمال إعداد حسابك.',
        subtitleSignin: 'هذا الحساب ما يزال بحاجة إلى التحقق من البريد الإلكتروني. أرسلنا رابط تحقق جديدًا.',
        sentTo: 'تم إرسال رسالة التحقق إلى {email}.',
        resend: 'إعادة إرسال رسالة التحقق',
        resending: 'جارٍ إرسال رسالة التحقق...',
        resendSuccess: 'تم إرسال رسالة تحقق جديدة.',
        resendError: 'تعذر إعادة إرسال رسالة التحقق الآن.',
        resendCooldown: 'إعادة الإرسال خلال {seconds}ث',
        backToSignIn: 'العودة إلى تسجيل الدخول'
      },
      success: {
        title: 'تم التحقق من البريد الإلكتروني',
        subtitle: 'تم التحقق من بريدك الإلكتروني بنجاح. يمكنك متابعة الدخول إلى التطبيق.',
        signIn: 'تسجيل الدخول',
        continue: 'المتابعة إلى التطبيق'
      },
      error: {
        title: 'رابط التحقق غير متاح',
        subtitle: 'تعذر إكمال التحقق من البريد الإلكتروني. {error}',
        invalidToken: 'الرابط غير صالح أو منتهي الصلاحية أو تم استخدامه بالفعل.',
        alreadyVerified: 'تم التحقق من هذا البريد الإلكتروني بالفعل.',
        generic: 'اطلب رسالة تحقق جديدة ثم حاول مرة أخرى.',
        backToSignIn: 'العودة إلى تسجيل الدخول'
      }
    },
    forgotPassword: {
      eyebrow: 'استعادة كلمة المرور',
      title: 'هل نسيت كلمة المرور؟',
      subtitle: 'أدخل بريدك الإلكتروني وسنرسل تعليمات إعادة التعيين إذا كان الحساب موجودًا.',
      placeholders: {
        email: 'أدخل بريدك الإلكتروني'
      },
      actions: {
        submit: 'إرسال رسالة إعادة التعيين',
        loading: 'جارٍ إرسال رسالة إعادة التعيين...',
        backToSignIn: 'العودة إلى تسجيل الدخول'
      },
      success: {
        subtitle: 'تحقق من بريدك الوارد',
        body: 'إذا كان هناك حساب مرتبط بهذا البريد الإلكتروني، فسيصل رابط إعادة تعيين كلمة المرور قريبًا.'
      },
      errors: {
        failed: 'تعذر تنفيذ طلب إعادة التعيين الآن.'
      }
    },
    resetPassword: {
      eyebrow: 'إعادة تعيين كلمة المرور',
      title: 'اختر كلمة مرور جديدة',
      subtitle: 'أنشئ كلمة مرور جديدة لحسابك.',
      placeholders: {
        password: 'اختر كلمة مرور جديدة',
        confirmPassword: 'أكّد كلمة المرور الجديدة'
      },
      actions: {
        submit: 'إعادة تعيين كلمة المرور',
        loading: 'جارٍ إعادة تعيين كلمة المرور...',
        backToSignIn: 'العودة إلى تسجيل الدخول'
      },
      success: {
        title: 'اكتملت إعادة تعيين كلمة المرور',
        subtitle: 'تم تحديث كلمة المرور بنجاح.',
        body: 'يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.'
      },
      error: {
        subtitle: 'تعذر إكمال إعادة تعيين كلمة المرور. {error}',
        invalidToken: 'رابط إعادة التعيين غير صالح.',
        expiredToken: 'انتهت صلاحية رابط إعادة التعيين.',
        alreadyUsed: 'تم استخدام رابط إعادة التعيين هذا بالفعل.',
        generic: 'اطلب رسالة إعادة تعيين جديدة ثم حاول مرة أخرى.'
      }
    },
    changePassword: {
      fields: {
        currentPassword: 'كلمة المرور الحالية',
        newPassword: 'كلمة المرور الجديدة'
      },
      placeholders: {
        currentPassword: 'أدخل كلمة المرور الحالية',
        newPassword: 'اختر كلمة مرور جديدة',
        confirmPassword: 'أكّد كلمة المرور الجديدة'
      },
      actions: {
        submit: 'تحديث كلمة المرور',
        loading: 'جارٍ تحديث كلمة المرور...'
      },
      success: 'تم تحديث كلمة المرور بنجاح.',
      sessionNote: 'ستبقى جلستك الحالية فعالة. لا يتم إلغاء الجلسات الأخرى في هذا المسار.',
      errors: {
        failed: 'تعذر تحديث كلمة المرور الآن.'
      }
    },
    challenge: {
      loading: 'جارٍ تحميل فحص الأمان...',
      unavailable: 'فحص الأمان غير متاح الآن. حدّث الصفحة ثم حاول مرة أخرى.'
    }
  }
};

ar.publicHeader = {
  brandName: 'StudyMaxing',
  brandHome: 'العودة إلى الصفحة الرئيسية لـ StudyMaxing',
  brandSubtitle: 'مسار سريع من المستند إلى الدراسة',
  navLabel: 'عام',
  languageLabel: 'اللغة',
  links: {
    features: 'المزايا',
    howItWorks: 'طريقة العمل'
  },
  actions: {
    backToLanding: 'العودة إلى الصفحة الرئيسية',
    getStarted: 'ابدأ مجانًا',
    signIn: 'تسجيل الدخول'
  }
};

ar.landing = {
  ...(ar.landing ?? {}),
  mockup: {
    url: 'studymaxing.com/study/biology-midterm',
    navStudyHub: 'مركز الدراسة',
    navSettings: 'الإعدادات',
    documentTitle: 'حزمة اختبار الأحياء',
    complete: 'مكتمل',
    tabSummary: 'الملخص',
    tabFlashcards: 'البطاقات',
    tabExam: 'الاختبار التجريبي',
    keyConcepts: 'المفاهيم الأساسية',
    mainArguments: 'الأفكار الرئيسية',
    summaryLine1: 'التنفس الخلوي يحول الجلوكوز إلى ATP عبر مراحل أيضية متتابعة.',
    summaryLine2: 'الميتوكوندريا هي موقع الفسفرة التأكسدية.',
    summaryLine3: 'المسارات اللاهوائية تنتج اللاكتات عند نقص الأكسجين.',
    argumentLine1: 'التنفس الهوائي ينتج ATP أكثر بكثير من المسارات اللاهوائية.',
    argumentLine2: 'توفر الأكسجين يحدد المسار الذي يهيمن داخل الخلية.',
    flashcardCount: '24',
    flashcardLabel: 'بطاقة',
    questionCount: '10',
    questionLabel: 'أسئلة',
    buildTime: '~45ث',
    buildLabel: 'إنشاء',
    flashcardProgress: 'بطاقة · 7 من 24',
    flashcardQuestion: 'ما وظيفة الميتوكوندريا؟',
    flashcardAnswer: 'تنتج ATP من خلال التنفس الخلوي، وهو مصدر الطاقة الأساسي للخلية.',
    examProgress: 'السؤال 4 من 10',
    examQuestion: 'أي عملية تنتج أكبر كمية ATP من جزيء جلوكوز واحد؟',
    optionA: 'التحلل السكري',
    optionB: 'الفسفرة التأكسدية',
    optionC: 'تخمر حمض اللاكتيك',
    optionD: 'دورة حمض الستريك وحدها'
  }
};

ar.landing = {
  ...(ar.landing ?? {}),
  mockup: {
    ...(ar.landing?.mockup ?? {}),
    url: 'studymaxing.com/home',
    navHome: 'الرئيسية',
    navStudyHub: 'مركز الدراسة',
    navSettings: 'الإعدادات',
    dashboardEyebrow: 'أول رفع',
    dashboardTitle: 'ارفع موادك الدراسية',
    dashboardSubtitle: 'أضف ملف PDF أو DOCX أو PPTX، ثم اختر ما تريد من StudyMaxing إنشاؤه.',
    uploadTitle: 'اختبار الأحياء.pdf',
    uploadMeta: 'PDF · 18 صفحة · جاهز',
    chooseTitle: 'اختر ما تريد إنشاءه',
    chooseSubtitle: 'حدد صيغ الدراسة التي تريدها قبل فتح مركز الدراسة.',
    summaryTitle: 'ملخص',
    summaryText: 'نقاط رئيسية واضحة من الملف المرفوع.',
    flashcardsTitle: 'بطاقات تعليمية',
    flashcardsText: 'بطاقات استرجاع نشط من المصدر نفسه.',
    examTitle: 'اختبار تجريبي',
    examText: '10 أسئلة تدريبية مبنية على المستند.',
    selected: 'محدد',
    generateSelected: 'إنشاء المحدد',
    progressTitle: 'جارٍ تجهيز مسار الدراسة',
    progressMeta: 'ملخص · بطاقات تعليمية · اختبار تجريبي',
    progressValue: '72%',
    hubTitle: 'مركز الدراسة',
    hubSubtitle: 'كل ما يخص هذا المستند يبقى في مكان واحد.',
    documentTitle: 'حزمة اختبار الأحياء',
    ready: 'جاهز',
    summaryReady: 'الملخص جاهز',
    flashcardsReady: '24 بطاقة تعليمية',
    examReady: '10 أسئلة',
    open: 'فتح',
    featureSummaryEyebrow: 'ملخص منشأ',
    featureFlashcardEyebrow: 'بطاقة · 7 من 24',
    featureExamEyebrow: 'السؤال 4 من 10'
  }
};

ar.publicFooter = {
  copyright: '© 2025 Studymaxing. All rights reserved.',
  sections: {
    product: 'المنتج',
    company: 'الشركة',
    legal: 'القانوني',
    support: 'الدعم',
    social: 'التواصل'
  },
  aria: {
    productLinks: 'روابط المنتج في التذييل',
    legalLinks: 'روابط قانونية في التذييل',
    supportLinks: 'روابط الدعم في التذييل'
  },
  productLinks: {
    features: 'المزايا',
    howItWorks: 'طريقة العمل',
    signIn: 'تسجيل الدخول',
    getStarted: 'ابدأ الآن'
  },
  legalLinks: {
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    cookiePolicy: 'Cookie Policy',
    refundPolicy: 'Refund Policy',
    disclaimer: 'إخلاء المسؤولية',
    acceptableUse: 'الاستخدام المقبول'
  },
  supportItems: {
    email: 'support@studymaxing.com',
    detail: 'استخدم هذا البريد للدعم والملاحظات وأسئلة الحساب'
  },
  socialItems: {
    comingSoon: 'روابط التواصل قريبًا'
  }
};

ar.publicLegal = {
  eyebrow: 'StudyMaxing',
  breadcrumbLabel: 'مسار التنقل',
  backToLanding: 'العودة إلى الصفحة الرئيسية',
  meta: {
    effectiveDate: 'تاريخ السريان',
    appliesTo: 'ينطبق على',
    governingLaw: 'القانون الحاكم'
  },
  outline: {
    title: 'الأقسام',
    ariaLabel: 'أقسام المستند القانوني'
  },
  documents: {
    title: 'القانوني',
    ariaLabel: 'المستندات القانونية'
  },
  notFound: {
    title: 'المستند القانوني غير موجود',
    body: 'المستند القانوني الذي طلبته غير متاح. استخدم روابط التذييل لعرض السياسات الحالية.',
    cta: 'العودة إلى الصفحة الرئيسية'
  }
};

ar.status = {
  ...(ar.status ?? {}),
};

ar.document = {
  ...(ar.document ?? {}),
  hub: {
    ...(ar.document?.hub ?? {}),
    states: {
      ...(ar.document?.hub?.states ?? {}),
      notRequested: 'لم يُطلب بعد',
    },
    progress: {
      ...(ar.document?.hub?.progress ?? {}),
      extraction: 'استخراج المستند',
      inProgress: 'جارٍ العمل',
      featureQueued: 'تمت إضافته إلى الطابور وبانتظار بدء العمل.',
      featureGenerating: 'الإنشاء قيد التنفيذ الآن.',
    },
  },
};

ar.adminQA = {
  tab: 'ضمان الجودة',
  title: 'مشغل ضمان الجودة',
  subtitle: 'شغّل اختبارات آلية على بيئتك قبل النشر',
  targetLabel: 'الهدف',
  targets: {
    staging: 'المرحلة التجريبية',
    production: 'الإنتاج'
  },
  liveEnvironment: 'بيئة مباشرة',
  run: 'تشغيل QA',
  running: 'جارٍ تشغيل QA',
  loading: 'جارٍ تشغيل اختبارات QA... قد يستغرق ذلك حتى 3 دقائق',
  resultsTitle: 'نتائج QA',
  ranAt: 'وقت التشغيل: {time}',
  summary: {
    passed: 'نجح',
    failed: 'فشل',
    totalTime: 'الوقت الإجمالي',
    estimatedCost: 'التكلفة التقديرية',
    fileTypesTested: 'أنواع الملفات المختبرة',
    edgeCases: 'الحالات الحدية',
    edgeCasesValue: '{passed}/{total}'
  },
  allSystemsGo: 'كل الأنظمة جاهزة',
  issuesDetected: 'تم اكتشاف مشاكل: {count}',
  status: {
    pass: 'نجاح',
    fail: 'فشل',
    skip: 'تخطي'
  },
  durationMs: '{duration} مللي ثانية',
  rateLimit: 'تم تشغيل QA مؤخرًا. يرجى الانتظار {minutes} دقائق قبل التشغيل مرة أخرى.',
  progress: {
    label: 'تقدم تشغيل QA',
    running: 'قيد التشغيل: {test}',
    testCounter: 'الاختبار {current} من {total}',
    elapsed: 'المنقضي: {time}',
    remaining: 'المتبقي التقديري: {time}'
  },
  history: {
    title: 'سجل التشغيل',
    description: 'فحوص QA السابقة مرتبة من الأحدث إلى الأقدم',
    loading: 'جارٍ تحميل سجل تشغيل QA...',
    empty: 'لا توجد تشغيلات QA بعد. شغّل أول فحص QA أعلاه.',
    expand: 'توسيع تفاصيل تشغيل QA',
    collapse: 'طي تفاصيل تشغيل QA',
    breakdown: 'تفاصيل كل اختبار',
    columns: {
      dateTime: 'التاريخ والوقت',
      target: 'الهدف',
      passed: 'نجح',
      failed: 'فشل',
      duration: 'المدة',
      cost: 'التكلفة',
      triggeredBy: 'شغّله'
    }
  },
  tags: {
    pdf: 'PDF',
    docx: 'DOCX',
    pptx: 'PPTX',
    arabic: 'عربي',
    ocr: 'OCR',
    edgeCase: 'حالة حدية',
    pdfExport: 'تصدير PDF',
    system: 'النظام'
  },
  errors: {
    failed: 'تعذر تشغيل QA.',
    historyFailed: 'تعذر تحميل سجل تشغيل QA.'
  }
};

ar.adminQA = {
  tab: 'ضمان الجودة',
  title: 'مشغل ضمان الجودة',
  subtitle: 'شغل اختبارات آلية على بيئتك قبل النشر',
  targetLabel: 'الهدف',
  targets: {
    staging: 'المرحلة التجريبية',
    production: 'الإنتاج'
  },
  liveEnvironment: 'بيئة مباشرة',
  loading: 'جار بدء تشغيل ضمان الجودة...',
  tiers: {
    health: 'الصحة',
    pipeline: 'المسار',
    optimized: 'محسن',
    full: 'كامل'
  },
  monitor: {
    title: 'مراقب الصحة التلقائي',
    on: 'تشغيل',
    off: 'إيقاف',
    frequencyLabel: 'التكرار',
    enabledStatus: 'المراقبة كل {frequency}',
    disabledStatus: 'المراقبة معطلة',
    saving: 'جار الحفظ...',
    noAutoRun: 'لا يوجد تشغيل تلقائي بعد',
    lastAutoRun: 'آخر تشغيل تلقائي: {time}',
    frequencies: {
      30: '30 دقيقة',
      60: 'ساعة واحدة',
      180: '3 ساعات',
      360: '6 ساعات',
      720: '12 ساعة',
      1440: '24 ساعة'
    },
    frequencyLabels: {
      30: '30 دقيقة',
      60: 'ساعة واحدة',
      180: '3 ساعات',
      360: '6 ساعات',
      720: '12 ساعة',
      1440: '24 ساعة'
    }
  },
  runSection: {
    title: 'تشغيل ضمان الجودة',
    subtitle: 'اختر البيئة مرة واحدة، ثم شغل المستوى المطلوب.'
  },
  cards: {
    health: {
      label: 'فحص الصحة',
      subtitle: 'مفاتيح API وقاعدة البيانات والتخزين - بدون استدعاءات ذكاء اصطناعي',
      cost: '$0.00',
      speed: '~10 ثوان',
      run: 'تشغيل فحص الصحة'
    },
    pipeline: {
      label: 'فحص المسار',
      subtitle: 'مسار الرفع ثم الإنشاء ثم التصدير بالكامل',
      cost: '~$0.05',
      speed: '~3 دقائق',
      run: 'تشغيل فحص المسار'
    },
    full: {
      label: 'فحص كامل',
      subtitle: 'كل أنواع الملفات وفحوص الجودة والحالات الحدية',
      runOptimized: 'تشغيل المحسن (~$0.30)',
      runFull: 'تشغيل الكامل (~$1.50)'
    }
  },
  confirm: {
    title: 'تشغيل الفحص الكامل؟',
    message: 'سيشغل هذا الفحص الكامل بتكلفة تقريبية {cost}. هل تريد المتابعة؟',
    cancel: 'إلغاء',
    confirm: 'تأكيد'
  },
  status: {
    pass: 'نجاح',
    fail: 'فشل',
    skip: 'تخطي'
  },
  speed: {
    fast: 'سريع',
    slow: 'بطيء',
    very_slow: 'بطيء جدا'
  },
  durationMs: '{duration} مللي ثانية',
  rateLimit: 'تم تشغيل ضمان الجودة مؤخرا. يرجى الانتظار {minutes} دقائق قبل التشغيل مرة أخرى.',
  progress: {
    label: 'تقدم تشغيل ضمان الجودة',
    runningTier: 'قيد التشغيل: {tier}',
    unknownTier: 'ضمان الجودة',
    testCounter: 'الاختبار {current} من {total}',
    elapsed: 'المنقضي: {time}',
    remaining: 'المتبقي التقديري: {time}'
  },
  history: {
    title: 'سجل التشغيل',
    description: 'فحوص ضمان الجودة السابقة مرتبة من الأحدث إلى الأقدم',
    loading: 'جار تحميل سجل تشغيل ضمان الجودة...',
    empty: 'لا توجد تشغيلات ضمان جودة بعد. شغل أول فحص أعلاه.',
    expand: 'توسيع تفاصيل تشغيل ضمان الجودة',
    collapse: 'طي تفاصيل تشغيل ضمان الجودة',
    breakdown: 'تفاصيل كل اختبار',
    columns: {
      dateTime: 'التاريخ والوقت',
      target: 'الهدف',
      tier: 'المستوى',
      passed: 'نجح',
      failed: 'فشل',
      duration: 'المدة',
      cost: 'التكلفة',
      triggeredBy: 'شغله',
      report: 'التقرير'
    }
  },
  report: {
    title: 'تقرير الفشل',
    view: 'عرض التقرير',
    copy: 'نسخ لـ Codex',
    copied: 'تم النسخ',
    copyFailed: 'فشل النسخ'
  },
  legend: {
    fast: 'سريع - ضمن الحد المتوقع',
    slow: 'بطيء - يستحق المراقبة',
    verySlow: 'بطيء جدا - غالبا عنق زجاجة'
  },
  tags: {
    pdf: 'PDF',
    docx: 'DOCX',
    pptx: 'PPTX',
    arabic: 'عربي',
    ocr: 'OCR',
    edgeCase: 'حالة حدية',
    pdfExport: 'تصدير PDF',
    system: 'النظام'
  },
  errors: {
    failed: 'تعذر تشغيل ضمان الجودة.',
    historyFailed: 'تعذر تحميل سجل تشغيل ضمان الجودة.',
    scheduleFailed: 'تعذر تحميل جدول ضمان الجودة.',
    scheduleSaveFailed: 'تعذر حفظ جدول ضمان الجودة.'
  }
};

export default mergeDictionaries(en, ar);
