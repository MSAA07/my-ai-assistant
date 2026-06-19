/**
 * Legal document content for StudyMaxing public pages.
 * Public identity details use only the non-sensitive fields from the Saudi freelance document.
 * Arabic translations are draft copy and require user review before publication.
 *
 * Each section body is an array of blocks:
 *   { type: 'p', text: string }
 *   { type: 'ul', items: string[] }   — items may contain safe HTML for <strong> tags
 */

export const LEGAL_TRANSLATION_STATUS = Object.freeze({
  ar: 'draft-user-review-needed',
});

export const LEGAL_PAGES = [
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    effectiveDate: 'June 2026',
    appliesTo: 'studymaxing.com, the StudyMaxing web app, and related services',
    governingLaw: 'Personal Data Protection Law of Saudi Arabia (PDPL), Royal Decree M/19 as amended by M/148, its Implementing Regulations, and the Regulation on Personal Data Transfer Outside the Kingdom',
    description: 'How we collect, use, and protect your personal data.',
    sections: [
      {
        heading: '1. Who we are',
        body: [
          { type: 'p', text: 'StudyMaxing operates studymaxing.com and provides an AI-powered study platform for students. For data protection enquiries, contact us at contact@studymaxing.com.' },
          { type: 'p', text: 'StudyMaxing is operated by Mohammed Saud Eissa Abu Shayiqah, registered as a freelancer with the Saudi Ministry of Human Resources and Social Development for Websites Programming and Developing. Freelance registration code: FL-930031977. The registration is valid until 16 April 2027.' },
        ],
      },
      {
        heading: '2. What data we collect',
        body: [
          { type: 'p', text: 'We collect the following categories of personal data:' },
          { type: 'ul', items: [
            '<strong>Account data:</strong> name, email address, password authentication data, email verification status, plan/usage limits, and account settings',
            '<strong>Uploaded documents:</strong> PDF, DOCX, and PPTX files you upload, including extracted text, OCR output, excerpts, file names, file size, and processing status (up to 25 MB and 200 pages or slides per document)',
            '<strong>Generated study data:</strong> AI-produced summaries, flashcards, exam questions, exam attempts, study progress, source references, and PDF/export artifacts saved to your Study Hub',
            '<strong>Telegram data:</strong> if you connect Telegram, your Telegram username, user ID, chat ID, link tokens, delivery logs, and the study materials you choose to send through Telegram',
            '<strong>Technical and security data:</strong> IP address, browser and device information, session tokens, rate-limit data, admin audit logs, model usage/cost telemetry, and data collected by Cloudflare Turnstile or Sentry if enabled',
          ]},
        ],
      },
      {
        heading: '3. Legal basis for processing',
        body: [
          { type: 'p', text: 'We process your data under the following lawful bases as required by the PDPL:' },
          { type: 'ul', items: [
            '<strong>Consent:</strong> for optional features such as connecting Telegram, receiving non-essential communications, or enabling any non-essential cookies or analytics if introduced later',
            '<strong>Contract performance:</strong> to deliver the study platform service you signed up for',
            '<strong>Legal obligation:</strong> to comply with applicable Saudi laws and regulations',
            '<strong>Legitimate interest:</strong> for platform security, fraud prevention, abuse prevention, service reliability, support, cost control, and service improvement',
          ]},
        ],
      },
      {
        heading: '4. How we use your data',
        body: [
          { type: 'ul', items: [
            'To create and manage your account',
            'To extract text from uploaded documents, run OCR where needed, and generate summaries, flashcards, and exam questions',
            'To store your Study Hub content, study progress, and export artifacts for future access',
            'To send study materials to Telegram when you choose to connect and use Telegram delivery',
            'To send transactional emails (account confirmation, password reset) via Resend',
            'To monitor platform errors, abuse, usage limits, model costs, and security incidents',
          ]},
          { type: 'p', text: 'StudyMaxing does not use your uploaded documents to train its own AI models. Third-party AI and OCR providers process document content only to provide enabled service features under their applicable service terms and paid account settings. We do not intentionally submit your documents for model training.' },
          { type: 'p', text: 'We do not sell your data to third parties.' },
        ],
      },
      {
        heading: '5. Third-party processors',
        body: [
          { type: 'p', text: 'We share data only with processors needed to operate enabled product features:' },
          { type: 'ul', items: [
            '<strong>OpenAI:</strong> processes extracted document text and study prompts to generate summaries, flashcards, and exam questions',
            '<strong>Mistral AI:</strong> processes scanned or image-based PDFs for OCR. Files may be uploaded to Mistral for OCR processing and are deleted from Mistral storage after processing where the API supports deletion.',
            '<strong>Vercel:</strong> hosts the frontend application',
            '<strong>Railway:</strong> hosts the backend application',
            '<strong>Cloudflare R2:</strong> stores uploaded files and export artifacts',
            '<strong>Resend:</strong> sends transactional emails',
            '<strong>Sentry:</strong> collects error logs if enabled',
            '<strong>Cloudflare Turnstile:</strong> provides bot protection if enabled',
            '<strong>Telegram:</strong> delivers study materials only if you connect Telegram and choose to send flashcards or exams through Telegram',
          ]},
        ],
      },
      {
        heading: '6. Cross-border data transfers',
        body: [
          { type: 'p', text: 'Your data may be processed outside the Kingdom of Saudi Arabia by cloud hosting, storage, email, security, AI, OCR, and Telegram providers in regions that may include the European Union, the United States, and other global locations depending on the provider.' },
          { type: 'p', text: 'We transfer personal data only where needed to provide, secure, support, and improve StudyMaxing. We apply data minimization, access controls, security measures, processor terms, and appropriate contractual safeguards where required under the PDPL and the Regulation on Personal Data Transfer Outside the Kingdom.' },
        ],
      },
      {
        heading: '7. Data retention',
        body: [
          { type: 'ul', items: [
            '<strong>Account data:</strong> retained while your account is active and deleted or anonymized within 30 days after a verified account closure request, unless we must retain limited records for legal, security, or dispute purposes',
            '<strong>Uploaded documents and extracted text:</strong> stored until you delete the document or close your account',
            '<strong>Generated study materials and progress:</strong> stored until deleted by you or upon account closure',
            '<strong>Export artifacts:</strong> stored until they expire, are deleted, or your account is closed',
            '<strong>Telegram connection data:</strong> retained while Telegram is connected and deleted or disconnected when you disconnect Telegram or close your account',
            '<strong>Technical, model usage, audit, and security logs:</strong> retained for as long as needed for security, reliability, abuse prevention, cost control, and legal compliance. Routine technical logs are generally retained for up to 90 days unless a longer period is required.',
          ]},
        ],
      },
      {
        heading: '8. Your rights under the PDPL',
        body: [
          { type: 'p', text: 'As a data subject in Saudi Arabia, you have the right to:' },
          { type: 'ul', items: [
            'Be informed about how and why your personal data is processed',
            'Access the personal data we hold about you',
            'Correct inaccurate or incomplete data',
            'Request deletion of your data',
            'Request a copy of your personal data in a readable format where applicable',
            'Withdraw consent at any time without affecting prior processing',
            'Object to direct marketing or request that we stop processing where applicable under the PDPL',
          ]},
          { type: 'p', text: 'To exercise any of these rights, contact us at contact@studymaxing.com. We will respond within the period required by the PDPL and its Implementing Regulations, generally no later than 30 days where applicable.' },
        ],
      },
      {
        heading: '9. Data breach notification',
        body: [
          { type: 'p', text: 'In the event of a personal data breach that poses a risk to your rights, we will notify you and the Saudi Data and Artificial Intelligence Authority (SDAIA) in accordance with the timelines set out in the PDPL Implementing Regulations.' },
        ],
      },
      {
        heading: '10. Minors',
        body: [
          { type: 'p', text: 'StudyMaxing is intended only for users aged 18 and above. You must be at least 18 years old to create an account or use the platform. We do not knowingly collect data from anyone under 18.' },
        ],
      },
      {
        heading: '11. Changes to this policy',
        body: [
          { type: 'p', text: 'We may update this Privacy Policy from time to time. We will notify you of material changes by email or by displaying a prominent notice on the platform before the changes take effect.' },
        ],
      },
      {
        heading: '12. Contact and complaints',
        body: [
          { type: 'p', text: 'For any privacy-related questions, contact us at contact@studymaxing.com. If you are not satisfied with our response, you have the right to escalate your complaint to SDAIA at sdaia.gov.sa.' },
        ],
      },
    ],
  },

  {
    slug: 'terms-of-service',
    title: 'Terms of Service',
    effectiveDate: 'June 2026',
    governingLaw: 'Kingdom of Saudi Arabia',
    description: 'Rules and responsibilities for using StudyMaxing.',
    sections: [
      {
        heading: '1. Acceptance of terms',
        body: [
          { type: 'p', text: 'By accessing or using StudyMaxing, you agree to be bound by these Terms of Service. If you do not agree, you must not use the platform. You must be at least 18 years old to use StudyMaxing.' },
        ],
      },
      {
        heading: '2. Account registration',
        body: [
          { type: 'p', text: 'You must provide accurate and complete information when creating an account. You are responsible for maintaining the security of your account credentials and for all activity that occurs under your account. Each person may hold one account only.' },
        ],
      },
      {
        heading: '3. Free access',
        body: [
          { type: 'p', text: 'StudyMaxing is currently available free of charge. No credit card or payment is required, and there are no paid plans available to users at this time. If we introduce paid features in the future, we will publish clear pricing, billing, cancellation, VAT, and refund terms before any charge is made.' },
        ],
      },
      {
        heading: '4. Your content and documents',
        body: [
          { type: 'ul', items: [
            'You retain full ownership of all documents you upload',
            'By uploading a document, you grant StudyMaxing a limited licence to process it, including through our hosting, storage, OCR, AI, and security providers, for the purpose of providing the platform and generating your study materials',
            'StudyMaxing does not use your documents to train its own AI models and does not intentionally submit your documents for model training by third-party AI or OCR providers',
            'You are responsible for ensuring you have the right to upload any document (e.g. no copyrighted material you do not own)',
            'Uploaded documents and generated materials are stored until you delete them or close your account',
            'If you connect Telegram, you authorise StudyMaxing to send the selected flashcards or exams to your connected Telegram chat',
          ]},
        ],
      },
      {
        heading: '5. Intellectual property',
        body: [
          { type: 'p', text: 'The StudyMaxing platform, its design, code, and branding are owned by StudyMaxing. Study materials generated by the AI on your behalf are provided for your personal academic use. You may not reproduce or distribute them commercially.' },
        ],
      },
      {
        heading: '6. Prohibited conduct',
        body: [
          { type: 'p', text: 'You must not:' },
          { type: 'ul', items: [
            'Share, sell, or transfer your account to another person',
            'Attempt to reverse engineer, scrape, or copy the platform',
            "Submit AI-generated study materials as your own original work in violation of your institution's academic integrity policy",
            'Upload content that violates Saudi law or applicable regulations',
            'Use the platform for any commercial, automated, or bulk purpose',
          ]},
        ],
      },
      {
        heading: '7. Service availability',
        body: [
          { type: 'p', text: 'We aim to provide a reliable service but do not guarantee uninterrupted uptime. We may carry out maintenance that temporarily affects availability and will provide reasonable notice where possible.' },
        ],
      },
      {
        heading: '8. Termination',
        body: [
          { type: 'p', text: 'We may suspend or terminate your account if you breach these terms. You may close your account at any time by contacting us at contact@studymaxing.com. Upon verified closure, your data will be deleted or anonymized within 30 days in accordance with our Privacy Policy, subject to any legal, security, or dispute-related retention requirements.' },
        ],
      },
      {
        heading: '9. Disclaimer of warranties',
        body: [
          { type: 'p', text: 'StudyMaxing is provided on an as-is basis. AI-generated content may contain errors. You are responsible for verifying any information before relying on it academically. We make no guarantee of academic results from using the platform.' },
        ],
      },
      {
        heading: '10. Limitation of liability',
        body: [
          { type: 'p', text: 'To the maximum extent permitted by Saudi law, StudyMaxing shall not be liable for indirect, incidental, or consequential damages arising from your use of the platform.' },
        ],
      },
      {
        heading: '11. Governing law and disputes',
        body: [
          { type: 'p', text: 'These terms are governed by the laws of the Kingdom of Saudi Arabia. Any disputes shall be resolved through the competent courts of Saudi Arabia, or through arbitration as agreed between the parties.' },
        ],
      },
      {
        heading: '12. Changes to terms',
        body: [
          { type: 'p', text: 'We may update these Terms of Service and will notify you at least 14 days before material changes take effect. Continued use of the platform after that date constitutes acceptance of the updated terms.' },
        ],
      },
    ],
  },

  {
    slug: 'cookie-policy',
    title: 'Cookie Policy',
    effectiveDate: 'June 2026',
    description: 'What cookies we use and how to manage them.',
    sections: [
      {
        heading: '1. What are cookies',
        body: [
          { type: 'p', text: 'Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and keep you signed in between visits.' },
        ],
      },
      {
        heading: '2. Cookies we use',
        body: [
          { type: 'p', text: 'We use only the following categories of cookies:' },
          { type: 'ul', items: [
            '<strong>Essential cookies:</strong> authentication tokens and session cookies required for the platform to function. These cannot be disabled.',
            '<strong>Browser storage:</strong> local or session storage used to remember interface settings, language, theme, authentication sync state, sidebar state, and Study Hub generation state.',
            '<strong>Security cookies:</strong> Cloudflare Turnstile may set cookies for bot detection purposes if the feature is enabled.',
            '<strong>Error monitoring:</strong> Sentry may collect technical session data for error reporting if enabled.',
          ]},
          { type: 'p', text: 'We do not use advertising cookies, tracking pixels, or third-party analytics cookies such as Google Analytics or Meta Pixel.' },
        ],
      },
      {
        heading: '3. Your consent and control',
        body: [
          { type: 'p', text: 'Essential cookies and strictly necessary browser storage are required for authentication, security, and core platform functionality. They cannot be disabled from within the app.' },
          { type: 'p', text: 'We do not currently set non-essential advertising or analytics cookies. If we introduce non-essential cookies or analytics later, we will request consent and provide a way to change that consent before using them.' },
          { type: 'p', text: 'You can also control cookies and browser storage through your browser settings. Clearing them may sign you out or reset interface preferences.' },
        ],
      },
      {
        heading: '4. Third-party cookies',
        body: [
          { type: 'p', text: 'If Cloudflare Turnstile or Sentry are enabled, these third parties may set their own cookies or collect technical data. Please refer to their respective privacy policies for details.' },
        ],
      },
      {
        heading: '5. Retention periods',
        body: [
          { type: 'ul', items: [
            '<strong>Authentication/session cookies:</strong> persist until their configured expiry, sign-out, revocation, or browser deletion',
            '<strong>Browser storage:</strong> persists until you clear your browser data, sign out where applicable, or the app overwrites it',
            '<strong>Security/error data:</strong> retained according to the relevant provider settings and our Privacy Policy',
          ]},
        ],
      },
      {
        heading: '6. Managing cookies in your browser',
        body: [
          { type: 'p', text: 'You can control and delete cookies through your browser settings. Note that disabling essential cookies will prevent you from signing in and using the platform. Refer to your browser\'s help documentation for instructions.' },
        ],
      },
    ],
  },

  {
    slug: 'refund-policy',
    title: 'Refund Policy',
    effectiveDate: 'June 2026',
    description: 'Current free access and future billing notice.',
    sections: [
      {
        heading: '1. Current free access',
        body: [
          { type: 'p', text: 'StudyMaxing is currently free to use. We do not charge users, do not require a credit card, and do not currently offer paid subscriptions, institutional billing, or paid add-ons.' },
          { type: 'p', text: 'Because no payment is collected from users, refunds do not apply at this time.' },
        ],
      },
      {
        heading: '2. Future paid features',
        body: [
          { type: 'p', text: 'If StudyMaxing introduces paid features in the future, we will publish clear pricing, VAT treatment, cancellation rights, and refund terms before any charge is made. Future paid terms will not apply retroactively to free use before those terms are published.' },
        ],
      },
      {
        heading: '3. Contact',
        body: [
          { type: 'p', text: 'For any billing or refund questions, contact us at contact@studymaxing.com.' },
        ],
      },
    ],
  },

  {
    slug: 'disclaimer',
    title: 'Disclaimer',
    effectiveDate: 'June 2026',
    description: 'Limitations on AI-generated content and our liability.',
    sections: [
      {
        heading: '1. Educational use only',
        body: [
          { type: 'p', text: 'StudyMaxing is a study aid designed to help students understand and review their own learning materials. It is not a substitute for formal education, qualified tutoring, or official academic guidance. Use of the platform does not guarantee any particular academic result.' },
        ],
      },
      {
        heading: '2. AI accuracy',
        body: [
          { type: 'p', text: 'Study materials, summaries, flashcards, and practice questions are generated by artificial intelligence. AI-generated content may contain errors, omissions, or inaccuracies. You are solely responsible for verifying any information before relying on it in an academic or professional context.' },
        ],
      },
      {
        heading: '3. Academic integrity',
        body: [
          { type: 'p', text: "StudyMaxing is intended to support your own learning process. Submitting AI-generated content as your own original work in a way that violates your institution's academic integrity policy is strictly prohibited and is your sole responsibility. StudyMaxing accepts no liability for academic misconduct by users." },
        ],
      },
      {
        heading: '4. Document content',
        body: [
          { type: 'p', text: 'You are responsible for the content of documents you upload. Do not upload documents containing sensitive personal data, classified information, or content you do not have the right to share. StudyMaxing is not responsible for the content of user-uploaded materials.' },
        ],
      },
      {
        heading: '5. Limitation of liability',
        body: [
          { type: 'p', text: 'To the maximum extent permitted by applicable law, StudyMaxing shall not be liable for any indirect, incidental, special, or consequential damages, including loss of data, academic penalties, or loss of opportunity, arising out of or in connection with your use of the platform.' },
        ],
      },
      {
        heading: '6. Service availability',
        body: [
          { type: 'p', text: 'We do not guarantee uninterrupted or error-free operation of the platform. We shall not be liable for any losses caused by temporary unavailability of the service.' },
        ],
      },
    ],
  },

  {
    slug: 'acceptable-use',
    title: 'Acceptable Use Policy',
    effectiveDate: 'June 2026',
    description: 'What you may and may not do on the platform.',
    sections: [
      {
        heading: '1. Purpose',
        body: [
          { type: 'p', text: 'This policy sets out what you may and may not do when using StudyMaxing. It applies to all users of the platform.' },
        ],
      },
      {
        heading: '2. Permitted uses',
        body: [
          { type: 'ul', items: [
            'Uploading your own academic documents for personal study',
            'Generating summaries, flashcards, and practice questions from your own materials',
            'Using study materials for personal academic preparation',
            'Sharing feedback or reporting issues to our team',
          ]},
        ],
      },
      {
        heading: '3. Prohibited uses',
        body: [
          { type: 'p', text: 'You must not use StudyMaxing to:' },
          { type: 'ul', items: [
            'Upload documents you do not own or have the right to process',
            'Attempt to reverse engineer, copy, or scrape any part of the platform',
            'Automate use of the platform without our written permission',
            'Share your account credentials with another person',
            'Generate or distribute harmful, defamatory, or illegal content',
            'Circumvent any security or access control measures',
            'Use the platform for any commercial purpose without authorisation',
          ]},
        ],
      },
      {
        heading: '4. Content standards (Saudi Arabia)',
        body: [
          { type: 'p', text: 'All content uploaded to StudyMaxing must comply with the laws of the Kingdom of Saudi Arabia. You must not upload content that:' },
          { type: 'ul', items: [
            'Violates public order, public morals, or Saudi regulations',
            'Infringes the rights of third parties including copyright or privacy rights',
            'Contains defamatory, hateful, or discriminatory material',
          ]},
          { type: 'p', text: 'StudyMaxing reserves the right to remove any content that violates these standards and to report it to relevant authorities where required by law.' },
        ],
      },
      {
        heading: '5. Reporting violations',
        body: [
          { type: 'p', text: 'If you become aware of content or behaviour on the platform that violates this policy, please report it to contact@studymaxing.com. We take all reports seriously and will investigate promptly.' },
        ],
      },
      {
        heading: '6. Enforcement',
        body: [
          { type: 'p', text: 'Violations of this policy may result in:' },
          { type: 'ul', items: [
            'A formal warning issued to your account',
            'Temporary suspension of your account',
            'Permanent termination of your account',
            'Reporting to relevant authorities where required by Saudi law',
          ]},
          { type: 'p', text: 'We will exercise these measures at our discretion based on the severity and nature of the violation.' },
        ],
      },
      {
        heading: '7. Changes to this policy',
        body: [
          { type: 'p', text: 'We may update this Acceptable Use Policy from time to time. Continued use of StudyMaxing after changes take effect constitutes your acceptance of the updated policy.' },
        ],
      },
    ],
  },
];

const LEGAL_PAGES_AR = [
  {
    slug: 'privacy-policy',
    title: 'سياسة الخصوصية',
    effectiveDate: 'يونيو 2026',
    appliesTo: 'studymaxing.com وتطبيق StudyMaxing والخدمات ذات الصلة',
    governingLaw: 'نظام حماية البيانات الشخصية في المملكة العربية السعودية (PDPL)، المرسوم الملكي م/19 كما تم تعديله بالمرسوم م/148، ولائحته التنفيذية، ولائحة نقل البيانات الشخصية خارج المملكة',
    description: 'كيف نجمع بياناتك الشخصية ونستخدمها ونحميها.',
    sections: [
      {
        heading: '١. من نحن',
        body: [
          { type: 'p', text: 'تشغل StudyMaxing موقع studymaxing.com وتوفر منصة دراسة مدعومة بالذكاء الاصطناعي للطلاب. للاستفسارات المتعلقة بحماية البيانات، تواصل معنا عبر contact@studymaxing.com.' },
          { type: 'p', text: 'يشغل StudyMaxing محمد سعود عيسى ابوشايقه، وهو مسجل كمستقل لدى وزارة الموارد البشرية والتنمية الاجتماعية لنشاط برمجة وتطوير المواقع الإلكترونية. رمز وثيقة العمل الحر: FL-930031977. الوثيقة صالحة حتى 16 أبريل 2027.' },
        ],
      },
      {
        heading: '٢. البيانات التي نجمعها',
        body: [
          { type: 'p', text: 'نجمع الفئات التالية من البيانات الشخصية:' },
          { type: 'ul', items: [
            '<strong>بيانات الحساب:</strong> الاسم وعنوان البريد الإلكتروني وبيانات مصادقة كلمة المرور وحالة التحقق من البريد وخطة الاستخدام وحدود الاستخدام وإعدادات الحساب',
            '<strong>المستندات المرفوعة:</strong> ملفات PDF وDOCX وPPTX التي ترفعها، بما في ذلك النص المستخرج ونتائج OCR والمقتطفات وأسماء الملفات وحجم الملف وحالة المعالجة (حتى 25 ميجابايت و200 صفحة أو شريحة لكل مستند)',
            '<strong>بيانات الدراسة المنشأة:</strong> الملخصات والبطاقات التعليمية وأسئلة الاختبارات ومحاولات الاختبار وتقدم الدراسة ومراجع المصادر وملفات PDF أو ملفات التصدير المحفوظة في مركز الدراسة',
            '<strong>بيانات Telegram:</strong> إذا ربطت Telegram، فقد نعالج اسم مستخدم Telegram ومعرف المستخدم ومعرف المحادثة ورموز الربط وسجلات الإرسال والمواد الدراسية التي تختار إرسالها عبر Telegram',
            '<strong>البيانات التقنية وبيانات الأمان:</strong> عنوان IP ومعلومات المتصفح والجهاز ورموز الجلسة وبيانات تحديد المعدل وسجلات تدقيق الإدارة وبيانات استخدام النماذج والتكلفة والبيانات التي تجمعها Cloudflare Turnstile أو Sentry إذا كانت مفعلة',
          ]},
        ],
      },
      {
        heading: '٣. الأساس النظامي للمعالجة',
        body: [
          { type: 'p', text: 'نعالج بياناتك وفق الأسس النظامية التالية كما يتطلب نظام حماية البيانات الشخصية:' },
          { type: 'ul', items: [
            '<strong>الموافقة:</strong> للميزات الاختيارية مثل ربط Telegram أو تلقي مراسلات غير ضرورية أو تفعيل أي ملفات تعريف ارتباط أو تحليلات غير ضرورية إذا تم تقديمها لاحقًا',
            '<strong>تنفيذ العقد:</strong> لتقديم خدمة منصة الدراسة التي سجلت لاستخدامها',
            '<strong>الالتزام النظامي:</strong> للامتثال للأنظمة واللوائح السعودية المعمول بها',
            '<strong>المصلحة المشروعة:</strong> لأمن المنصة ومنع الاحتيال وإساءة الاستخدام وموثوقية الخدمة والدعم وضبط التكلفة وتحسين الخدمة',
          ]},
        ],
      },
      {
        heading: '٤. كيف نستخدم بياناتك',
        body: [
          { type: 'ul', items: [
            'لإنشاء حسابك وإدارته',
            'لاستخراج النص من المستندات المرفوعة وتشغيل OCR عند الحاجة وإنشاء الملخصات والبطاقات التعليمية وأسئلة الاختبارات',
            'لتخزين محتوى مركز الدراسة وتقدم الدراسة وملفات التصدير للوصول إليها لاحقًا',
            'لإرسال المواد الدراسية إلى Telegram عندما تختار ربط Telegram واستخدام ميزة الإرسال إليه',
            'لإرسال رسائل البريد الإلكتروني المتعلقة بالمعاملات (تأكيد الحساب، إعادة تعيين كلمة المرور) عبر Resend',
            'لمراقبة أخطاء المنصة وإساءة الاستخدام وحدود الاستخدام وتكاليف النماذج والحوادث الأمنية',
          ]},
          { type: 'p', text: 'لا تستخدم StudyMaxing مستنداتك المرفوعة لتدريب نماذج ذكاء اصطناعي خاصة بها. يعالج مزودو الذكاء الاصطناعي وOCR من الأطراف الثالثة محتوى المستندات فقط لتقديم ميزات الخدمة المفعلة وفق شروط الخدمة وإعدادات الحساب المدفوعة لديهم. لا نرسل مستنداتك عمدًا لأغراض تدريب النماذج.' },
          { type: 'p', text: 'لا نبيع بياناتك لأي أطراف ثالثة.' },
        ],
      },
      {
        heading: '٥. معالجو البيانات من الأطراف الثالثة',
        body: [
          { type: 'p', text: 'لا نشارك البيانات إلا مع المعالجين اللازمين لتشغيل ميزات المنتج المفعلة:' },
          { type: 'ul', items: [
            '<strong>OpenAI:</strong> يعالج النص المستخرج من المستندات ومطالبات الدراسة لإنشاء الملخصات والبطاقات التعليمية وأسئلة الاختبارات',
            '<strong>Mistral AI:</strong> يعالج ملفات PDF الممسوحة أو المعتمدة على الصور لأغراض OCR. قد يتم رفع الملفات إلى Mistral لمعالجة OCR ويتم حذفها من تخزين Mistral بعد المعالجة حيث تدعم واجهة API الحذف.',
            '<strong>Vercel:</strong> يستضيف تطبيق الواجهة الأمامية',
            '<strong>Railway:</strong> يستضيف تطبيق الواجهة الخلفية',
            '<strong>Cloudflare R2:</strong> يخزن الملفات المرفوعة وملفات التصدير',
            '<strong>Resend:</strong> يرسل رسائل البريد الإلكتروني المتعلقة بالمعاملات',
            '<strong>Sentry:</strong> يجمع سجلات الأخطاء إذا كان مفعلاً',
            '<strong>Cloudflare Turnstile:</strong> يوفر الحماية من البوتات إذا كان مفعلاً',
            '<strong>Telegram:</strong> يرسل المواد الدراسية فقط إذا ربطت Telegram واخترت إرسال البطاقات أو الاختبارات عبر Telegram',
          ]},
        ],
      },
      {
        heading: '٦. نقل البيانات عبر الحدود',
        body: [
          { type: 'p', text: 'قد تتم معالجة بياناتك خارج المملكة العربية السعودية بواسطة مزودي الاستضافة والتخزين والبريد الإلكتروني والأمان والذكاء الاصطناعي وOCR وTelegram في مناطق قد تشمل الاتحاد الأوروبي والولايات المتحدة ومواقع عالمية أخرى حسب المزود.' },
          { type: 'p', text: 'ننقل البيانات الشخصية فقط عند الحاجة لتقديم StudyMaxing وتأمينه ودعمه وتحسينه. نطبق تقليل البيانات وضوابط الوصول وتدابير الأمان وشروط المعالجين والضمانات التعاقدية المناسبة عند تطلب نظام حماية البيانات الشخصية ولائحة نقل البيانات الشخصية خارج المملكة ذلك.' },
        ],
      },
      {
        heading: '٧. الاحتفاظ بالبيانات',
        body: [
          { type: 'ul', items: [
            '<strong>بيانات الحساب:</strong> يتم الاحتفاظ بها أثناء نشاط حسابك، ثم تحذف أو تحول إلى بيانات مجهولة خلال 30 يومًا بعد طلب إغلاق حساب موثق، ما لم نحتج إلى الاحتفاظ بسجلات محدودة لأغراض نظامية أو أمنية أو متعلقة بالنزاعات',
            '<strong>المستندات المرفوعة والنص المستخرج:</strong> تخزن حتى تحذف المستند أو تغلق حسابك',
            '<strong>المواد الدراسية المنشأة وتقدم الدراسة:</strong> تخزن حتى تحذفها أو عند إغلاق الحساب',
            '<strong>ملفات التصدير:</strong> تخزن حتى انتهاء صلاحيتها أو حذفها أو إغلاق حسابك',
            '<strong>بيانات ربط Telegram:</strong> يتم الاحتفاظ بها أثناء اتصال Telegram وتحذف أو تفصل عند فصل Telegram أو إغلاق حسابك',
            '<strong>السجلات التقنية وسجلات استخدام النماذج والتدقيق والأمان:</strong> يحتفظ بها للمدة اللازمة للأمان والموثوقية ومنع إساءة الاستخدام وضبط التكلفة والامتثال النظامي. عادة يتم الاحتفاظ بالسجلات التقنية الروتينية لمدة تصل إلى 90 يومًا ما لم تكن هناك حاجة لمدة أطول.',
          ]},
        ],
      },
      {
        heading: '٨. حقوقك بموجب نظام حماية البيانات الشخصية',
        body: [
          { type: 'p', text: 'بصفتك صاحب بيانات في المملكة العربية السعودية، لديك الحق في:' },
          { type: 'ul', items: [
            'معرفة كيفية معالجة بياناتك الشخصية وأسبابها',
            'الوصول إلى البيانات الشخصية التي نحتفظ بها عنك',
            'تصحيح البيانات غير الدقيقة أو غير المكتملة',
            'طلب حذف بياناتك',
            'طلب نسخة من بياناتك الشخصية بصيغة قابلة للقراءة حيثما ينطبق ذلك',
            'سحب الموافقة في أي وقت دون التأثير في المعالجة السابقة',
            'الاعتراض على التسويق المباشر أو طلب إيقاف المعالجة حيثما ينطبق ذلك بموجب نظام حماية البيانات الشخصية',
          ]},
          { type: 'p', text: 'لممارسة أي من هذه الحقوق، تواصل معنا عبر contact@studymaxing.com. سنرد خلال المدة المطلوبة بموجب نظام حماية البيانات الشخصية ولائحته التنفيذية، وبشكل عام خلال مدة لا تتجاوز 30 يومًا حيثما ينطبق ذلك.' },
        ],
      },
      {
        heading: '٩. الإخطار بخرق البيانات',
        body: [
          { type: 'p', text: 'في حال وقوع خرق للبيانات الشخصية يشكل خطرًا على حقوقك، سنخطرك ونخطر الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا) وفق الجداول الزمنية المحددة في اللائحة التنفيذية لنظام حماية البيانات الشخصية.' },
        ],
      },
      {
        heading: '١٠. القاصرون',
        body: [
          { type: 'p', text: 'StudyMaxing مخصص فقط للمستخدمين الذين تبلغ أعمارهم 18 عامًا أو أكثر. يجب أن يكون عمرك 18 عامًا على الأقل لإنشاء حساب أو استخدام المنصة. لا نجمع عن علم بيانات من أي شخص يقل عمره عن 18 عامًا.' },
        ],
      },
      {
        heading: '١١. التغييرات على هذه السياسة',
        body: [
          { type: 'p', text: 'قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنخطرك بالتغييرات الجوهرية عبر البريد الإلكتروني أو من خلال عرض إشعار بارز على المنصة قبل سريان التغييرات.' },
        ],
      },
      {
        heading: '١٢. التواصل والشكاوى',
        body: [
          { type: 'p', text: 'لأي أسئلة متعلقة بالخصوصية، تواصل معنا عبر contact@studymaxing.com. إذا لم تكن راضيًا عن ردنا، فلديك الحق في تصعيد شكواك إلى سدايا عبر sdaia.gov.sa.' },
        ],
      },
    ],
  },
  {
    slug: 'terms-of-service',
    title: 'شروط الخدمة',
    effectiveDate: 'يونيو 2026',
    governingLaw: 'المملكة العربية السعودية',
    description: 'القواعد والمسؤوليات المتعلقة باستخدام StudyMaxing.',
    sections: [
      {
        heading: '١. قبول الشروط',
        body: [
          { type: 'p', text: 'من خلال الوصول إلى StudyMaxing أو استخدامها، فإنك توافق على الالتزام بشروط الخدمة هذه. إذا كنت لا توافق، يجب ألا تستخدم المنصة. يجب أن يكون عمرك 18 عامًا على الأقل لاستخدام StudyMaxing.' },
        ],
      },
      {
        heading: '٢. تسجيل الحساب',
        body: [
          { type: 'p', text: 'يجب أن تقدم معلومات دقيقة وكاملة عند إنشاء حساب. أنت مسؤول عن الحفاظ على أمان بيانات اعتماد حسابك وعن جميع الأنشطة التي تتم ضمن حسابك. لا يجوز لكل شخص إلا امتلاك حساب واحد.' },
        ],
      },
      {
        heading: '٣. الوصول المجاني',
        body: [
          { type: 'p', text: 'StudyMaxing متاح حاليًا مجانًا. لا يلزم تقديم بطاقة ائتمان أو دفع أي مبلغ، ولا توجد خطط مدفوعة متاحة للمستخدمين في الوقت الحالي. إذا قدمنا ميزات مدفوعة مستقبلًا، فسننشر شروط الأسعار والفوترة والإلغاء وضريبة القيمة المضافة والاسترداد بوضوح قبل إجراء أي خصم.' },
        ],
      },
      {
        heading: '٤. محتواك ومستنداتك',
        body: [
          { type: 'ul', items: [
            'تحتفظ بالملكية الكاملة لجميع المستندات التي ترفعها',
            'برفع مستند، تمنح StudyMaxing ترخيصًا محدودًا لمعالجته، بما في ذلك من خلال مزودي الاستضافة والتخزين وOCR والذكاء الاصطناعي والأمان، بغرض تقديم المنصة وإنشاء موادك الدراسية',
            'لا تستخدم StudyMaxing مستنداتك لتدريب نماذج ذكاء اصطناعي خاصة بها ولا ترسل مستنداتك عمدًا لتدريب نماذج مزودي الذكاء الاصطناعي أو OCR من الأطراف الثالثة',
            'أنت مسؤول عن التأكد من أن لديك الحق في رفع أي مستند (مثل عدم رفع مواد محمية بحقوق نشر لا تملكها)',
            'يتم تخزين المستندات المرفوعة والمواد المنشأة حتى تحذفها أو تغلق حسابك',
            'إذا ربطت Telegram، فإنك تفوض StudyMaxing بإرسال البطاقات أو الاختبارات التي تختارها إلى محادثة Telegram المرتبطة بك',
          ]},
        ],
      },
      {
        heading: '٥. الملكية الفكرية',
        body: [
          { type: 'p', text: 'منصة StudyMaxing وتصميمها ورمزها وعلامتها التجارية مملوكة لـ StudyMaxing. يتم توفير المواد الدراسية التي ينشئها الذكاء الاصطناعي نيابة عنك لاستخدامك الأكاديمي الشخصي. لا يجوز لك إعادة إنتاجها أو توزيعها تجاريًا.' },
        ],
      },
      {
        heading: '٦. السلوك المحظور',
        body: [
          { type: 'p', text: 'يجب ألا تقوم بما يلي:' },
          { type: 'ul', items: [
            'مشاركة حسابك أو بيعه أو نقله إلى شخص آخر',
            'محاولة إجراء هندسة عكسية للمنصة أو كشطها أو نسخها',
            'تقديم مواد دراسية منشأة بالذكاء الاصطناعي على أنها عملك الأصلي بما يخالف سياسة النزاهة الأكاديمية في مؤسستك',
            'رفع محتوى يخالف النظام السعودي أو اللوائح المعمول بها',
            'استخدام المنصة لأي غرض تجاري أو آلي أو واسع النطاق',
          ]},
        ],
      },
      {
        heading: '٧. توفر الخدمة',
        body: [
          { type: 'p', text: 'نسعى إلى تقديم خدمة موثوقة، لكننا لا نضمن توفرها دون انقطاع. قد نجري أعمال صيانة تؤثر مؤقتًا في التوفر وسنقدم إشعارًا معقولًا عندما يكون ذلك ممكنًا.' },
        ],
      },
      {
        heading: '٨. الإنهاء',
        body: [
          { type: 'p', text: 'يجوز لنا تعليق حسابك أو إنهاؤه إذا خالفت هذه الشروط. يمكنك إغلاق حسابك في أي وقت بالتواصل معنا عبر contact@studymaxing.com. بعد الإغلاق الموثق، سيتم حذف بياناتك أو تحويلها إلى بيانات مجهولة خلال 30 يومًا وفقًا لسياسة الخصوصية، مع مراعاة أي متطلبات احتفاظ نظامية أو أمنية أو متعلقة بالنزاعات.' },
        ],
      },
      {
        heading: '٩. إخلاء المسؤولية عن الضمانات',
        body: [
          { type: 'p', text: 'تقدم StudyMaxing كما هي. قد يحتوي المحتوى المنشأ بالذكاء الاصطناعي على أخطاء. أنت مسؤول عن التحقق من أي معلومات قبل الاعتماد عليها أكاديميًا. لا نقدم أي ضمان بتحقيق نتائج أكاديمية من استخدام المنصة.' },
        ],
      },
      {
        heading: '١٠. تحديد المسؤولية',
        body: [
          { type: 'p', text: 'إلى أقصى حد يسمح به النظام السعودي، لا تكون StudyMaxing مسؤولة عن أي أضرار غير مباشرة أو عرضية أو تبعية تنشأ عن استخدامك للمنصة.' },
        ],
      },
      {
        heading: '١١. القانون الحاكم والنزاعات',
        body: [
          { type: 'p', text: 'تخضع هذه الشروط لأنظمة المملكة العربية السعودية. يتم حل أي نزاعات من خلال المحاكم المختصة في المملكة العربية السعودية، أو من خلال التحكيم كما يتفق الطرفان.' },
        ],
      },
      {
        heading: '١٢. التغييرات على الشروط',
        body: [
          { type: 'p', text: 'قد نقوم بتحديث شروط الخدمة هذه وسنخطرك قبل 14 يومًا على الأقل من سريان أي تغييرات جوهرية. استمرار استخدام المنصة بعد ذلك التاريخ يعد قبولًا للشروط المحدثة.' },
        ],
      },
    ],
  },
  {
    slug: 'cookie-policy',
    title: 'سياسة ملفات تعريف الارتباط',
    effectiveDate: 'يونيو 2026',
    description: 'ما ملفات تعريف الارتباط التي نستخدمها وكيف يمكنك إدارتها.',
    sections: [
      {
        heading: '١. ما ملفات تعريف الارتباط',
        body: [
          { type: 'p', text: 'ملفات تعريف الارتباط هي ملفات نصية صغيرة تخزن على جهازك عند زيارة موقع إلكتروني. تساعد الموقع على تذكر تفضيلاتك وإبقائك مسجل الدخول بين الزيارات.' },
        ],
      },
      {
        heading: '٢. ملفات تعريف الارتباط التي نستخدمها',
        body: [
          { type: 'p', text: 'نستخدم فقط الفئات التالية من ملفات تعريف الارتباط:' },
          { type: 'ul', items: [
            '<strong>ملفات تعريف الارتباط الأساسية:</strong> رموز المصادقة وملفات الجلسة المطلوبة لعمل المنصة. لا يمكن تعطيلها.',
            '<strong>تخزين المتصفح:</strong> تخزين محلي أو تخزين جلسة يستخدم لتذكر إعدادات الواجهة واللغة والسمة وحالة مزامنة المصادقة وحالة الشريط الجانبي وحالة إنشاء مواد مركز الدراسة.',
            '<strong>ملفات الأمان:</strong> قد تضبط Cloudflare Turnstile ملفات تعريف ارتباط لأغراض اكتشاف البوتات إذا كانت الميزة مفعلة.',
            '<strong>مراقبة الأخطاء:</strong> قد تجمع Sentry بيانات جلسة تقنية للإبلاغ عن الأخطاء إذا كانت مفعلة.',
          ]},
          { type: 'p', text: 'لا نستخدم ملفات تعريف ارتباط إعلانية أو وحدات بكسل للتتبع أو ملفات تعريف ارتباط تحليلات من أطراف ثالثة مثل Google Analytics أو Meta Pixel.' },
        ],
      },
      {
        heading: '٣. موافقتك وتحكمك',
        body: [
          { type: 'p', text: 'ملفات تعريف الارتباط الأساسية وتخزين المتصفح الضروري مطلوبة للمصادقة والأمان ووظائف المنصة الأساسية. لا يمكن تعطيلها من داخل التطبيق.' },
          { type: 'p', text: 'لا نضبط حاليًا ملفات تعريف ارتباط إعلانية أو ملفات تحليلات غير ضرورية. إذا قدمنا لاحقًا ملفات تعريف ارتباط أو تحليلات غير ضرورية، فسنطلب الموافقة ونوفر طريقة لتغييرها قبل استخدامها.' },
          { type: 'p', text: 'يمكنك أيضًا التحكم في ملفات تعريف الارتباط وتخزين المتصفح من إعدادات متصفحك. قد يؤدي مسحها إلى تسجيل خروجك أو إعادة ضبط تفضيلات الواجهة.' },
        ],
      },
      {
        heading: '٤. ملفات تعريف ارتباط الأطراف الثالثة',
        body: [
          { type: 'p', text: 'إذا كانت Cloudflare Turnstile أو Sentry مفعلة، فقد تضبط هذه الأطراف ملفات تعريف الارتباط الخاصة بها أو تجمع بيانات تقنية. يرجى الرجوع إلى سياسات الخصوصية الخاصة بها لمزيد من التفاصيل.' },
        ],
      },
      {
        heading: '٥. مدد الاحتفاظ',
        body: [
          { type: 'ul', items: [
            '<strong>ملفات المصادقة والجلسة:</strong> تستمر حتى انتهاء صلاحيتها المحددة أو تسجيل الخروج أو الإلغاء أو حذفها من المتصفح',
            '<strong>تخزين المتصفح:</strong> يستمر حتى تمسح بيانات المتصفح أو تسجل الخروج حيثما ينطبق ذلك أو يستبدله التطبيق',
            '<strong>بيانات الأمان والأخطاء:</strong> يحتفظ بها وفق إعدادات المزود المعني وسياسة الخصوصية لدينا',
          ]},
        ],
      },
      {
        heading: '٦. إدارة ملفات تعريف الارتباط في متصفحك',
        body: [
          { type: 'p', text: 'يمكنك التحكم في ملفات تعريف الارتباط وحذفها من إعدادات متصفحك. لاحظ أن تعطيل ملفات تعريف الارتباط الأساسية سيمنعك من تسجيل الدخول واستخدام المنصة. راجع وثائق المساعدة الخاصة بمتصفحك للحصول على التعليمات.' },
        ],
      },
    ],
  },
  {
    slug: 'refund-policy',
    title: 'سياسة الاسترداد',
    effectiveDate: 'يونيو 2026',
    description: 'الوصول المجاني الحالي وإشعار الفوترة المستقبلية.',
    sections: [
      {
        heading: '١. الوصول المجاني الحالي',
        body: [
          { type: 'p', text: 'StudyMaxing متاح حاليًا للاستخدام مجانًا. لا نفرض رسومًا على المستخدمين، ولا نطلب بطاقة ائتمان، ولا نقدم حاليًا اشتراكات مدفوعة أو فوترة مؤسسات أو إضافات مدفوعة.' },
          { type: 'p', text: 'بما أنه لا يتم تحصيل أي مدفوعات من المستخدمين، فلا تنطبق الاستردادات في الوقت الحالي.' },
        ],
      },
      {
        heading: '٢. الميزات المدفوعة المستقبلية',
        body: [
          { type: 'p', text: 'إذا قدمت StudyMaxing ميزات مدفوعة مستقبلًا، فسننشر الأسعار ومعاملة ضريبة القيمة المضافة وحقوق الإلغاء وشروط الاسترداد بوضوح قبل إجراء أي خصم. لن تطبق أي شروط مدفوعة مستقبلية بأثر رجعي على الاستخدام المجاني قبل نشر تلك الشروط.' },
        ],
      },
      {
        heading: '٣. التواصل',
        body: [
          { type: 'p', text: 'لأي أسئلة متعلقة بالفوترة أو الاسترداد، تواصل معنا عبر contact@studymaxing.com.' },
        ],
      },
    ],
  },
  {
    slug: 'disclaimer',
    title: 'إخلاء المسؤولية',
    effectiveDate: 'يونيو 2026',
    description: 'حدود المحتوى المنشأ بالذكاء الاصطناعي ومسؤوليتنا.',
    sections: [
      {
        heading: '١. للاستخدام التعليمي فقط',
        body: [
          { type: 'p', text: 'StudyMaxing أداة مساعدة للدراسة مصممة لمساعدة الطلاب على فهم ومراجعة موادهم التعليمية. وهي ليست بديلًا عن التعليم الرسمي أو التدريس المؤهل أو الإرشاد الأكاديمي الرسمي. لا يضمن استخدام المنصة تحقيق أي نتيجة أكاديمية معينة.' },
        ],
      },
      {
        heading: '٢. دقة الذكاء الاصطناعي',
        body: [
          { type: 'p', text: 'تُنشأ المواد الدراسية والملخصات والبطاقات التعليمية وأسئلة التدريب بواسطة الذكاء الاصطناعي. قد يحتوي المحتوى المنشأ بالذكاء الاصطناعي على أخطاء أو إغفالات أو معلومات غير دقيقة. أنت وحدك مسؤول عن التحقق من أي معلومات قبل الاعتماد عليها في سياق أكاديمي أو مهني.' },
        ],
      },
      {
        heading: '٣. النزاهة الأكاديمية',
        body: [
          { type: 'p', text: 'تهدف StudyMaxing إلى دعم عملية تعلمك الخاصة. إن تقديم محتوى منشأ بالذكاء الاصطناعي على أنه عملك الأصلي بطريقة تخالف سياسة النزاهة الأكاديمية في مؤسستك محظور تمامًا ويقع ضمن مسؤوليتك وحدك. لا تتحمل StudyMaxing أي مسؤولية عن سوء السلوك الأكاديمي من جانب المستخدمين.' },
        ],
      },
      {
        heading: '٤. محتوى المستندات',
        body: [
          { type: 'p', text: 'أنت مسؤول عن محتوى المستندات التي ترفعها. لا ترفع مستندات تحتوي على بيانات شخصية حساسة أو معلومات سرية أو محتوى لا تملك الحق في مشاركته. StudyMaxing ليست مسؤولة عن محتوى المواد التي يرفعها المستخدمون.' },
        ],
      },
      {
        heading: '٥. تحديد المسؤولية',
        body: [
          { type: 'p', text: 'إلى أقصى حد يسمح به النظام المعمول به، لا تكون StudyMaxing مسؤولة عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية، بما في ذلك فقدان البيانات أو العقوبات الأكاديمية أو فقدان الفرص، الناشئة عن استخدامك للمنصة أو المتعلقة به.' },
        ],
      },
      {
        heading: '٦. توفر الخدمة',
        body: [
          { type: 'p', text: 'لا نضمن تشغيل المنصة دون انقطاع أو أخطاء. ولا نكون مسؤولين عن أي خسائر ناتجة عن عدم توفر الخدمة مؤقتًا.' },
        ],
      },
    ],
  },
  {
    slug: 'acceptable-use',
    title: 'سياسة الاستخدام المقبول',
    effectiveDate: 'يونيو 2026',
    description: 'ما يمكنك فعله وما لا يمكنك فعله على المنصة.',
    sections: [
      {
        heading: '١. الغرض',
        body: [
          { type: 'p', text: 'تحدد هذه السياسة ما يجوز لك وما لا يجوز لك فعله عند استخدام StudyMaxing. تنطبق على جميع مستخدمي المنصة.' },
        ],
      },
      {
        heading: '٢. الاستخدامات المسموح بها',
        body: [
          { type: 'ul', items: [
            'رفع مستنداتك الأكاديمية الخاصة للدراسة الشخصية',
            'إنشاء ملخصات وبطاقات تعليمية وأسئلة تدريبية من موادك الخاصة',
            'استخدام المواد الدراسية للتحضير الأكاديمي الشخصي',
            'مشاركة الملاحظات أو الإبلاغ عن المشكلات لفريقنا',
          ]},
        ],
      },
      {
        heading: '٣. الاستخدامات المحظورة',
        body: [
          { type: 'p', text: 'يجب ألا تستخدم StudyMaxing من أجل:' },
          { type: 'ul', items: [
            'رفع مستندات لا تملكها أو لا تملك الحق في معالجتها',
            'محاولة إجراء هندسة عكسية لأي جزء من المنصة أو نسخه أو كشطه',
            'أتمتة استخدام المنصة دون إذن كتابي منا',
            'مشاركة بيانات اعتماد حسابك مع شخص آخر',
            'إنشاء أو توزيع محتوى ضار أو تشهيري أو غير نظامي',
            'تجاوز أي تدابير أمنية أو ضوابط وصول',
            'استخدام المنصة لأي غرض تجاري دون تصريح',
          ]},
        ],
      },
      {
        heading: '٤. معايير المحتوى (المملكة العربية السعودية)',
        body: [
          { type: 'p', text: 'يجب أن يلتزم كل محتوى يتم رفعه إلى StudyMaxing بأنظمة المملكة العربية السعودية. يجب ألا ترفع محتوى:' },
          { type: 'ul', items: [
            'يخالف النظام العام أو الآداب العامة أو اللوائح السعودية',
            'ينتهك حقوق أطراف ثالثة بما في ذلك حقوق النشر أو حقوق الخصوصية',
            'يحتوي على مواد تشهيرية أو كراهية أو تمييزية',
          ]},
          { type: 'p', text: 'تحتفظ StudyMaxing بالحق في إزالة أي محتوى يخالف هذه المعايير وإبلاغ الجهات المختصة عندما يتطلب النظام ذلك.' },
        ],
      },
      {
        heading: '٥. الإبلاغ عن المخالفات',
        body: [
          { type: 'p', text: 'إذا علمت بمحتوى أو سلوك على المنصة يخالف هذه السياسة، يرجى الإبلاغ عنه عبر contact@studymaxing.com. نتعامل مع جميع البلاغات بجدية وسنحقق فيها على وجه السرعة.' },
        ],
      },
      {
        heading: '٦. الإنفاذ',
        body: [
          { type: 'p', text: 'قد تؤدي مخالفات هذه السياسة إلى:' },
          { type: 'ul', items: [
            'إصدار تحذير رسمي لحسابك',
            'تعليق حسابك مؤقتًا',
            'إنهاء حسابك نهائيًا',
            'الإبلاغ إلى الجهات المختصة عندما يتطلب النظام السعودي ذلك',
          ]},
          { type: 'p', text: 'سنمارس هذه التدابير وفق تقديرنا بناءً على جسامة المخالفة وطبيعتها.' },
        ],
      },
      {
        heading: '٧. التغييرات على هذه السياسة',
        body: [
          { type: 'p', text: 'قد نقوم بتحديث سياسة الاستخدام المقبول هذه من وقت لآخر. استمرار استخدام StudyMaxing بعد سريان التغييرات يعد قبولًا منك للسياسة المحدثة.' },
        ],
      },
    ],
  },
];

const LEGAL_PAGES_BY_LANGUAGE = Object.freeze({
  en: LEGAL_PAGES,
  ar: LEGAL_PAGES_AR,
});

export const LEGAL_PAGE_MAP = Object.fromEntries(LEGAL_PAGES.map((p) => [p.slug, p]));

export function getLegalPages(language = 'en') {
  return LEGAL_PAGES_BY_LANGUAGE[language] ?? LEGAL_PAGES;
}

export function getLegalPageMap(language = 'en') {
  return Object.fromEntries(getLegalPages(language).map((page) => [page.slug, page]));
}
