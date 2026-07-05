# Frontend Cleanup Audit - 2026-07-05

Scope: `my-ai-assistant/`. Searches excluded `.git/`, `node_modules/`, `dist/`, and generated audit screenshot folders. No source files were modified.

## 1. Console Log Statements

- `src/App.svelte:53` - `console.log(\`[auth] ${message}\`);`

## 2. TODO/FIXME/HACK/XXX Comments

No issues found

## 3. 3+ Consecutive Commented-Out Code Lines

No issues found

## 4. Unreferenced `.svelte` or `.js` Files in `src/`

- `src/lib/components/ui/DrawerShell.svelte:1` - `<script>`
- `src/lib/components/ui/UploadModal.svelte:1` - `<script>`
- `src/lib/components/ui/UploadPanel.svelte:1` - `<script>`
- `src/pages/Exams.svelte:1` - `<script>`
- `src/pages/Flashcards.svelte:1` - `<script>`
Excluded as requested: `src/lib/components/ui/MetaPill.svelte`, `src/lib/components/ui/SourceRefsCompact.svelte`.

## 5. Package Dependencies With No Apparent Usage

- `package.json:1` - `marked - no JS/TS import and no CSS/index.html reference found`
- `package.json:1` - `postcss - no JS/TS import and no CSS/index.html reference found`

## 6. Hardcoded Staging or Production URLs Outside `src/config.js`

- `src/components/auth/AuthChallenge.svelte:65` - `script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';`
- `src/components/Footer.svelte:29` - `<a href="mailto:contact@studymaxing.com">contact@studymaxing.com</a>`
- `src/lib/i18n/ar.js:1088` - `url: 'studymaxing.com/study/biology-midterm',`
- `src/lib/i18n/ar.js:1125` - `url: 'studymaxing.com/home',`
- `src/lib/i18n/ar.js:1198` - `email: 'contact@studymaxing.com',`
- `src/lib/i18n/en.js:189` - `url: 'studymaxing.com/home',`
- `src/lib/i18n/en.js:1321` - `email: 'contact@studymaxing.com',`
- `src/lib/legal/content.js:20` - `appliesTo: 'studymaxing.com, the StudyMaxing web app, and related services',`
- `src/lib/legal/content.js:27` - `{ type: 'p', text: 'StudyMaxing operates studymaxing.com and provides an AI-powered study platform for students. For data protection enquiries, contact us at contact@studymaxing.com.' },`
- `src/lib/legal/content.js:121` - `{ type: 'p', text: 'To exercise any of these rights, contact us at contact@studymaxing.com. We will respond within the period required by the PDPL and its Implementing Regulations, generally no later than 30 days where applicable.' },`
- `src/lib/legal/content.js:145` - `{ type: 'p', text: 'For any privacy-related questions, contact us at contact@studymaxing.com. If you are not satisfied with our response, you have the right to escalate your complaint to SDAIA at sdaia.gov.sa.' },`
- `src/lib/legal/content.js:217` - `{ type: 'p', text: 'We may suspend or terminate your account if you breach these terms. You may close your account at any time by contacting us at contact@studymaxing.com. Upon verified closure, your data will be deleted or anonymized within 30 days in accordance with our Privacy Policy, subject to any legal, security, or dispute-related retention requirements.' },`
- `src/lib/legal/content.js:327` - `{ type: 'p', text: 'For any billing or refund questions, contact us at contact@studymaxing.com.' },`
- `src/lib/legal/content.js:431` - `{ type: 'p', text: 'If you become aware of content or behaviour on the platform that violates this policy, please report it to contact@studymaxing.com. We take all reports seriously and will investigate promptly.' },`
- `src/lib/legal/content.js:462` - `appliesTo: 'studymaxing.com وتطبيق StudyMaxing والخدمات ذات الصلة',`
- `src/lib/legal/content.js:469` - `{ type: 'p', text: 'تشغل StudyMaxing موقع studymaxing.com وتوفر منصة دراسة مدعومة بالذكاء الاصطناعي للطلاب. للاستفسارات المتعلقة بحماية البيانات، تواصل معنا عبر contact@studymaxing.com.' },`
- `src/lib/legal/content.js:563` - `{ type: 'p', text: 'لممارسة أي من هذه الحقوق، تواصل معنا عبر contact@studymaxing.com. سنرد خلال المدة المطلوبة بموجب نظام حماية البيانات الشخصية ولائحته التنفيذية، وبشكل عام خلال مدة لا تتجاوز 30 يومًا حيثما ينطبق ذلك.' },`
- `src/lib/legal/content.js:587` - `{ type: 'p', text: 'لأي أسئلة متعلقة بالخصوصية، تواصل معنا عبر contact@studymaxing.com. إذا لم تكن راضيًا عن ردنا، فلديك الحق في تصعيد شكواك إلى سدايا عبر sdaia.gov.sa.' },`
- `src/lib/legal/content.js:658` - `{ type: 'p', text: 'يجوز لنا تعليق حسابك أو إنهاؤه إذا خالفت هذه الشروط. يمكنك إغلاق حسابك في أي وقت بالتواصل معنا عبر contact@studymaxing.com. بعد الإغلاق الموثق، سيتم حذف بياناتك أو تحويلها إلى بيانات مجهولة خلال 30 يومًا وفقًا لسياسة الخصوصية، مع مراعاة أي متطلبات احتفاظ نظامية أو أمنية أو متعلقة بالنزاعات.' },`
- `src/lib/legal/content.js:766` - `{ type: 'p', text: 'لأي أسئلة متعلقة بالفوترة أو الاسترداد، تواصل معنا عبر contact@studymaxing.com.' },`
- `src/lib/legal/content.js:868` - `{ type: 'p', text: 'إذا علمت بمحتوى أو سلوك على المنصة يخالف هذه السياسة، يرجى الإبلاغ عنه عبر contact@studymaxing.com. نتعامل مع جميع البلاغات بجدية وسنحقق فيها على وجه السرعة.' },`
