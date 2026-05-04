/**
 * Legal document content extracted verbatim from StudyMaxing_Legal_Pages.docx.
 * "Note to team" placeholders have been replaced with final values.
 *
 * Each section body is an array of blocks:
 *   { type: 'p', text: string }
 *   { type: 'ul', items: string[] }   — items may contain safe HTML for <strong> tags
 */

export const LEGAL_PAGES = [
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    effectiveDate: 'May 2026',
    appliesTo: 'studymaxing.com and all related services',
    governingLaw: 'Personal Data Protection Law of Saudi Arabia (PDPL), Royal Decree M/19 as amended by M/148',
    description: 'How we collect, use, and protect your personal data.',
    sections: [
      {
        heading: '1. Who we are',
        body: [
          { type: 'p', text: 'StudyMaxing operates the website studymaxing.com and provides an AI-powered study platform for students. For data protection enquiries, contact us at contact@studymaxing.com.' },
          { type: 'p', text: 'Company registration: Registration pending. Registered address to be confirmed.' },
        ],
      },
      {
        heading: '2. What data we collect',
        body: [
          { type: 'p', text: 'We collect the following categories of personal data:' },
          { type: 'ul', items: [
            '<strong>Account data:</strong> name and email address provided at registration',
            '<strong>Uploaded documents:</strong> PDF, DOCX, and PPTX files you upload (up to 25 MB each)',
            '<strong>Generated content:</strong> AI-produced study materials, flashcards, summaries, and exam questions saved to your Study Hub',
            '<strong>Technical data:</strong> IP address, browser type, device information, and session tokens',
            '<strong>Security data:</strong> data collected by Cloudflare Turnstile (bot protection) and Sentry (error monitoring), if enabled',
          ]},
        ],
      },
      {
        heading: '3. Legal basis for processing',
        body: [
          { type: 'p', text: 'We process your data under the following lawful bases as required by the PDPL:' },
          { type: 'ul', items: [
            '<strong>Consent:</strong> for marketing communications and optional analytics features',
            '<strong>Contract performance:</strong> to deliver the study platform service you signed up for',
            '<strong>Legal obligation:</strong> to comply with applicable Saudi laws and regulations',
            '<strong>Legitimate interest:</strong> for platform security, fraud prevention, and service improvement',
          ]},
        ],
      },
      {
        heading: '4. How we use your data',
        body: [
          { type: 'ul', items: [
            'To create and manage your account',
            'To process uploaded documents and generate study materials',
            'To store your Study Hub content for future access',
            'To send transactional emails (account confirmation, password reset) via Resend',
            'To monitor platform errors and security incidents',
          ]},
          { type: 'p', text: 'We do not use your documents to train AI models.' },
          { type: 'p', text: 'We do not sell your data to third parties.' },
        ],
      },
      {
        heading: '5. Third-party processors',
        body: [
          { type: 'p', text: 'We share data only with the following processors under appropriate agreements:' },
          { type: 'ul', items: [
            '<strong>OpenAI:</strong> processes document content to generate study materials (data sent to OpenAI servers)',
            '<strong>Vercel:</strong> hosts the frontend application',
            '<strong>Railway:</strong> hosts the backend application',
            '<strong>Cloudflare R2:</strong> stores uploaded files',
            '<strong>Resend:</strong> sends transactional emails',
            '<strong>Sentry:</strong> collects error logs if enabled',
            '<strong>Cloudflare Turnstile:</strong> provides bot protection if enabled',
          ]},
        ],
      },
      {
        heading: '6. Cross-border data transfers',
        body: [
          { type: 'p', text: 'Your data may be processed outside the Kingdom of Saudi Arabia. Our infrastructure is hosted on Vercel edge (global CDN) and Railway EU West (Amsterdam, Netherlands). OpenAI processes document content on servers located in the United States.' },
          { type: 'p', text: 'These transfers are conducted with appropriate safeguards in accordance with the PDPL Data Transfer Regulations issued by SDAIA. By using StudyMaxing, you consent to these transfers.' },
        ],
      },
      {
        heading: '7. Data retention',
        body: [
          { type: 'ul', items: [
            '<strong>Account data:</strong> retained for the duration of your account, deleted within 30 days of account closure',
            '<strong>Uploaded documents:</strong> stored in Cloudflare R2 until you delete them or close your account',
            '<strong>Generated study materials:</strong> stored in the database until deleted by you or upon account closure',
            '<strong>Technical and security logs:</strong> retained for up to 90 days',
          ]},
        ],
      },
      {
        heading: '8. Your rights under the PDPL',
        body: [
          { type: 'p', text: 'As a data subject in Saudi Arabia, you have the right to:' },
          { type: 'ul', items: [
            'Access the personal data we hold about you',
            'Correct inaccurate or incomplete data',
            'Request deletion of your data',
            'Withdraw consent at any time without affecting prior processing',
            'Object to direct marketing',
          ]},
          { type: 'p', text: 'To exercise any of these rights, contact us at contact@studymaxing.com. We will respond within 30 days as required by the PDPL.' },
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
          { type: 'p', text: 'StudyMaxing is intended for users aged 18 and above. Users under 18 require verifiable consent from a parent or guardian before creating an account. We do not knowingly collect data from minors without such consent.' },
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
    effectiveDate: 'May 2026',
    governingLaw: 'Kingdom of Saudi Arabia',
    description: 'Rules and responsibilities for using StudyMaxing.',
    sections: [
      {
        heading: '1. Acceptance of terms',
        body: [
          { type: 'p', text: 'By accessing or using StudyMaxing, you agree to be bound by these Terms of Service. If you do not agree, you must not use the platform. Users under 18 must have parent or guardian approval.' },
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
          { type: 'p', text: 'StudyMaxing is currently available free of charge during its early access period. No credit card or payment is required. We reserve the right to introduce paid plans in the future and will provide advance notice before doing so.' },
        ],
      },
      {
        heading: '4. Your content and documents',
        body: [
          { type: 'ul', items: [
            'You retain full ownership of all documents you upload',
            'By uploading a document, you grant StudyMaxing a limited licence to process it for the purpose of generating your study materials',
            'We do not use your documents to train AI models',
            'You are responsible for ensuring you have the right to upload any document (e.g. no copyrighted material you do not own)',
            'Uploaded documents and generated materials are stored until you delete them or close your account',
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
          { type: 'p', text: 'We may suspend or terminate your account if you breach these terms. You may close your account at any time by contacting us at contact@studymaxing.com. Upon closure, your data will be deleted within 30 days in accordance with our Privacy Policy.' },
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
    effectiveDate: 'May 2026',
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
            '<strong>Preference cookies:</strong> browser storage used to remember your settings and Study Hub state across sessions.',
            '<strong>Security cookies:</strong> Cloudflare Turnstile may set cookies for bot detection purposes if the feature is enabled.',
            '<strong>Error monitoring:</strong> Sentry may collect technical session data for error reporting if enabled.',
          ]},
          { type: 'p', text: 'We do not use advertising cookies, tracking pixels, or third-party analytics cookies such as Google Analytics or Meta Pixel.' },
        ],
      },
      {
        heading: '3. Your consent and control',
        body: [
          { type: 'p', text: 'Essential cookies do not require your consent as they are strictly necessary for the service. For any non-essential cookies, we will ask for your consent before setting them, in line with the PDPL requirement for explicit opt-in consent.' },
          { type: 'p', text: 'You may withdraw consent at any time by adjusting your cookie preferences in your account settings or by clearing your browser cookies.' },
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
            '<strong>Session cookies:</strong> deleted when you close your browser',
            '<strong>Authentication tokens:</strong> persist for the duration of your logged-in session',
            '<strong>Preference storage:</strong> persists until you clear your browser data or uninstall the app',
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
    effectiveDate: 'May 2026',
    description: 'Billing and refund terms for paid plans.',
    sections: [
      {
        heading: '1. Current free access period',
        body: [
          { type: 'p', text: 'StudyMaxing is currently free to use during its early access period. No payment is required and therefore no refund policy applies at this time.' },
          { type: 'p', text: 'This section will be updated when paid subscription plans are introduced.' },
        ],
      },
      {
        heading: '2. Future paid plans — planned terms',
        body: [
          { type: 'p', text: 'When paid plans are launched, the following refund framework is intended to apply:' },
          { type: 'ul', items: [
            '<strong>Cancellation:</strong> you may cancel your subscription at any time from your account settings',
            '<strong>Access after cancellation:</strong> you will retain access until the end of your current billing period',
            '<strong>Refund eligibility:</strong> refunds may be requested within 7 days of an initial charge if the platform was not usable due to a technical fault on our side',
            '<strong>Non-refundable situations:</strong> voluntary cancellation after use, partial billing periods, and promotional pricing',
            '<strong>How to request:</strong> email contact@studymaxing.com with your account email and a description of the issue',
          ]},
        ],
      },
      {
        heading: '3. VAT',
        body: [
          { type: 'p', text: 'All future prices will be inclusive of Value Added Tax (VAT) at the applicable rate of 15% as required under the laws of the Kingdom of Saudi Arabia.' },
        ],
      },
      {
        heading: '4. Institutional billing',
        body: [
          { type: 'p', text: 'School and institutional plans, when available, will be subject to separate billing agreements including VAT invoicing as required by the Zakat, Tax and Customs Authority (ZATCA).' },
        ],
      },
      {
        heading: '5. Contact',
        body: [
          { type: 'p', text: 'For any billing questions, contact us at contact@studymaxing.com.' },
        ],
      },
    ],
  },

  {
    slug: 'disclaimer',
    title: 'Disclaimer',
    effectiveDate: 'May 2026',
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
    effectiveDate: 'May 2026',
    description: 'What you may and may not do on the platform.',
    sections: [
      {
        heading: '1. Purpose',
        body: [
          { type: 'p', text: 'This policy sets out what you may and may not do when using StudyMaxing. It applies to all users of the platform, including free and paid accounts.' },
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
            'Permanent termination of your account without refund',
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

export const LEGAL_PAGE_MAP = Object.fromEntries(LEGAL_PAGES.map((p) => [p.slug, p]));

export const LEGAL_HUB_META = [
  { slug: 'privacy-policy',    title: 'Privacy Policy',         description: 'How we collect, use, and protect your personal data.',    effectiveDate: 'May 2026' },
  { slug: 'terms-of-service',  title: 'Terms of Service',        description: 'Rules and responsibilities for using StudyMaxing.',        effectiveDate: 'May 2026' },
  { slug: 'cookie-policy',     title: 'Cookie Policy',           description: 'What cookies we use and how to manage them.',             effectiveDate: 'May 2026' },
  { slug: 'refund-policy',     title: 'Refund Policy',           description: 'Billing and refund terms for paid plans.',               effectiveDate: 'May 2026' },
  { slug: 'disclaimer',        title: 'Disclaimer',              description: 'Limitations on AI-generated content and our liability.',  effectiveDate: 'May 2026' },
  { slug: 'acceptable-use',    title: 'Acceptable Use Policy',   description: 'What you may and may not do on the platform.',           effectiveDate: 'May 2026' },
];
