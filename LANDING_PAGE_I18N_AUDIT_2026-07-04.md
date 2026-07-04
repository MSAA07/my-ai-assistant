# Landing Page I18n Audit - 2026-07-04

Audit-only pass. No source code was modified.

## Scope

- Frontend repo: `my-ai-assistant/`
- Public landing route: `/`
- Route/rendering path:
  - `src/routes.js` defines `LANDING_PATH = '/'`.
  - `src/App.svelte:200` wraps the app in `{#key $language}`.
  - `src/App.svelte:209-211` renders `<PublicHeader />`, `<Landing />`, and `<PublicFooter />` for unauthenticated visits to `/`.
- Landing page file: `src/pages/Landing.svelte`
- Card-style landing content found:
  - Difference feature cards: `src/pages/Landing.svelte`
  - Product-tour step cards and embedded mockup cards: `src/pages/Landing.svelte`
  - FAQ accordion rows: `src/pages/Landing.svelte`
- No pricing cards, testimonial cards, plan cards, or comparison cards are rendered on the current public landing page.

## Staging Verification

Verified on `https://stage.studymaxing.com` on 2026-07-04.

The in-app browser was already authenticated as `admin@ai.com`, so I did not sign it out. I used a temporary clean Chrome profile to verify the unauthenticated public landing page. Backend health endpoint returned `status: ok`.

Live steps performed:

1. Opened `https://stage.studymaxing.com` in a clean visitor session.
2. Opened display preferences from the public header.
3. Clicked the actual `aria-label="Arabic"` language control.
4. Confirmed the live DOM changed to `html lang="ar"` and `dir="rtl"`.
5. Captured DOM text and visual screenshot for the Arabic state.

Summary of live behavior:

- Header, hero, problem statement, difference cards, product-tour section headings, tour step text, FAQ rows, CTA, and footer switched to Arabic.
- Embedded product-tour mockup card text stayed in English.
- No horizontal overflow was detected at 1280x900 in the audited card containers. RTL ordering/alignment appeared acceptable in the main Arabic landing screenshot, except the embedded mockup cards remain English inside RTL containers.

## Finding 1 - Difference Feature Cards

- File path: `src/pages/Landing.svelte`
- Root cause category: no bug found for this card group; translation wiring is correct.
- Card selector/classes: `.difference-card`
- Rendered count: 5 cards

Relevant code:

```svelte
// src/pages/Landing.svelte:14-20
const differenceCards = [
  { icon: 'languages', title: 'landing.difference.cards.language.title', body: 'landing.difference.cards.language.body' },
  { icon: 'scan', title: 'landing.difference.cards.scanned.title', body: 'landing.difference.cards.scanned.body' },
  { icon: 'download', title: 'landing.difference.cards.export.title', body: 'landing.difference.cards.export.body' },
  { icon: 'send', title: 'landing.difference.cards.telegram.title', body: 'landing.difference.cards.telegram.body' },
  { icon: 'folder', title: 'landing.difference.cards.together.title', body: 'landing.difference.cards.together.body' }
];

// src/pages/Landing.svelte:101-124
{#each differenceCards as card}
  <article class="difference-card">
    ...
    <h3>{t(card.title)}</h3>
    <p>{t(card.body)}</p>
  </article>
{/each}
```

Arabic keys:

- Present in `src/lib/i18n/ar.js:124-149`.

Reactivity check:

- `differenceCards` is a module-level `const`, but it stores translation key names, not translated strings.
- The actual lookup happens in markup through `t(card.title)` and `t(card.body)`.
- `t()` itself reads the language store once with `get(language)` in `src/lib/i18n/t.js:37-39`, so it is not independently reactive.
- The current page still updates because `src/App.svelte:200` remounts the rendered app subtree with `{#key $language}`.

Live staging observation:

- After switching to Arabic, all five difference cards rendered Arabic text.
- Expected: Arabic card titles/bodies.
- Actual: matches expected.

## Finding 2 - Product-Tour Step Cards

- File path: `src/pages/Landing.svelte`
- Root cause category: no bug found for the step-copy card group; translation wiring is correct.
- Card selector/classes: `.tour-step`, with text in `.tour-step__copy`
- Rendered count: 3 steps

Relevant code:

```svelte
// src/pages/Landing.svelte:8-12
const tourSteps = [
  { num: '01', eyebrow: 'landing.tour.step1Eyebrow', title: 'landing.tour.step1Title', body: 'landing.tour.step1Body' },
  { num: '02', eyebrow: 'landing.tour.step2Eyebrow', title: 'landing.tour.step2Title', body: 'landing.tour.step2Body' },
  { num: '03', eyebrow: 'landing.tour.step3Eyebrow', title: 'landing.tour.step3Title', body: 'landing.tour.step3Body' }
];

// src/pages/Landing.svelte:142-149
{#each tourSteps as step, i}
  <article class="tour-step">
    <span class="tour-step__marker" aria-hidden="true">{step.num}</span>
    <div class="tour-step__copy">
      <p class="lp-eyebrow">{t(step.eyebrow)}</p>
      <h3>{t(step.title)}</h3>
      <p>{t(step.body)}</p>
    </div>
```

Arabic keys:

- Present in `src/lib/i18n/ar.js:1064-1086`.

Reactivity check:

- `tourSteps` is a module-level `const`, but it stores translation key names only.
- Text is looked up in markup through `t(...)`.
- The language switch updates due to the `{#key $language}` remount in `src/App.svelte:200`.

Live staging observation:

- After switching to Arabic, the three tour step text blocks switched to Arabic.
- Expected: Arabic step eyebrow/title/body text.
- Actual: matches expected for step-copy text.

## Finding 3 - Product-Tour Embedded Mockup Cards

- File path: `src/pages/Landing.svelte`
- Root cause category: (a) hardcoded string never wrapped in `t()`.
- Card selector/classes:
  - `.tour-mockup`
  - `.tour-choice-card`
  - `.tour-flashcard-card`
- Rendered count:
  - 3 mockup panels
  - 3 choice cards inside the second mockup
  - 2 flashcard cards inside the third mockup

Relevant code:

```svelte
// src/pages/Landing.svelte:153-165
<div class="tour-mockup tour-upload-mockup">
  ...
  <p>Drop your PDF, DOCX, or PPTX here</p>
  ...
  <p>Biology Midterm.pdf &middot; 4.2 MB &middot; Ready</p>
</div>

// src/pages/Landing.svelte:171-193
<div class="tour-choice-card">
  ...
  <strong>Summary</strong>
  <p>Condensed notes from the source file.</p>
</div>
...
<strong>Flashcards</strong>
<p>Question, answer, then mark correct or incorrect.</p>
...
<strong>Mock Exam</strong>
<p>Practice questions with answer checks.</p>
...
<button class="tour-generate-button" type="button" tabindex="-1">Generate</button>

// src/pages/Landing.svelte:196-213
<span class="tour-tab">Summary</span>
<span class="tour-tab tour-tab--active">Flashcards</span>
<span class="tour-tab">Exam</span>
...
<p class="tour-flashcard-side">Question</p>
<h4>What is the main function of the cell membrane?</h4>
...
<p class="tour-flashcard-side">Answer</p>
<p>It controls what enters and leaves the cell through a selectively permeable phospholipid bilayer.</p>
...
<span class="tour-flashcard-action tour-flashcard-action--incorrect">Mark incorrect</span>
<span class="tour-flashcard-action tour-flashcard-action--correct">Mark correct</span>
```

Arabic keys:

- Arabic mockup keys do exist in `src/lib/i18n/ar.js:1087-1118` and `src/lib/i18n/ar.js:1121-1163`.
- English source keys also exist in `src/lib/i18n/en.js:188-244`.
- The current `Landing.svelte` markup does not call those keys for the visible mockup cards.

Reactivity check:

- This is not a stale array/reactivity bug.
- The strings are literal English markup, so there is nothing for Svelte or `t()` to re-evaluate on language change.

Live staging observation:

- After switching to Arabic, the live page had `lang="ar"` and `dir="rtl"`.
- The surrounding tour section heading and step text switched to Arabic.
- These embedded mockup card strings stayed English:
  - `Drop your PDF, DOCX, or PPTX here`
  - `Biology Midterm.pdf`
  - `Summary`
  - `Flashcards`
  - `Mock Exam`
  - `Generate`
  - `Question`
  - `Mark incorrect`
  - `Mark correct`
- Expected: mockup card text should use Arabic `landing.mockup.*` or equivalent Arabic keys.
- Actual: embedded mockup cards remain English.

Secondary RTL/layout note:

- The English mockup cards are inside RTL containers after the toggle. No horizontal overflow was detected at 1280x900, but the mixed-language visual reads awkwardly because English tabs/cards are ordered and aligned in RTL context while still using English labels.

## Finding 4 - FAQ Accordion Card Rows

- File path: `src/pages/Landing.svelte`
- Root cause category: no bug found for this card group; translation wiring is correct.
- Card selector/classes: `.lp-faq__item`, `.lp-faq__q`, `.lp-faq__a`
- Rendered count: 5 FAQ rows

Relevant code:

```svelte
// src/pages/Landing.svelte:22-28
const faqs = [
  { q: 'landing.faq1Q', a: 'landing.faq1A' },
  { q: 'landing.faq2Q', a: 'landing.faq2A' },
  { q: 'landing.faq3Q', a: 'landing.faq3A' },
  { q: 'landing.faq4Q', a: 'landing.faq4A' },
  { q: 'landing.faq6Q', a: 'landing.faq6A' }
];

// src/pages/Landing.svelte:233-248
{#each faqs as faq, i}
  <div class="lp-faq__item" class:lp-faq__item--last={i === faqs.length - 1}>
    <button class="lp-faq__q" ...>
      <span>{t(faq.q)}</span>
      ...
    </button>
    {#if openFaq === i}
      <p class="lp-faq__a">{t(faq.a)}</p>
    {/if}
  </div>
{/each}
```

Arabic keys:

- Present in `src/lib/i18n/ar.js:170-181`.

Reactivity check:

- `faqs` is a module-level `const`, but it stores translation key names only.
- The actual question/answer text is rendered through `t(faq.q)` and `t(faq.a)`.
- The language switch updates through the `src/App.svelte:200` keyed remount.

Live staging observation:

- After switching to Arabic, all five FAQ questions rendered Arabic text.
- Expected: Arabic FAQ questions and answers.
- Actual: matches expected for collapsed FAQ rows. The answer text uses `t(faq.a)` too, so expanded answers should follow the same path.

## Overall Root Cause

The reported bug is real for the product-tour embedded mockup cards only. The main difference cards and FAQ rows do switch to Arabic on live staging.

The broken mockup cards are hardcoded English strings in `src/pages/Landing.svelte:153-213`. This is category (a): hardcoded string never wrapped in `t()`.

This is not primarily category (b) missing Arabic keys: Arabic `landing.mockup.*` keys exist.

This is not primarily category (c) non-reactive translated arrays: the broken strings are not translated at all. For the working arrays (`differenceCards`, `tourSteps`, `faqs`), the arrays contain key names, and the app-level `{#key $language}` remount causes the render tree to refresh on language changes.

## Suggested Fix Direction For Later

Do not change code in this audit pass. For the next implementation pass, wire the embedded mockup UI in `src/pages/Landing.svelte:153-213` to `t('landing.mockup.*')` and/or `t('landing.tour.*')` keys instead of literal English strings. The existing Arabic key coverage is close, but a few exact strings used by the current markup may need either key reuse or new keys.
