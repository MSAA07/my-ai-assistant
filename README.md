# AI Study Assistant

Upload your study materials and get AI-powered summaries, flashcards, and practice exams instantly.

## Features

- **Document Upload**: Support for PDF, DOCX, and PPTX files (up to 25MB)
- **AI Summaries**: Automatically generated summaries using GPT-4o-mini
- **Flashcards**: Interactive flashcards with flip animation and shuffle
- **Practice Exams**: Multiple choice, true/false, and short answer questions
- **Multi-language Support**: Generate content in English or Arabic
- **Progress Tracking**: Track your exam scores and flashcard mastery

## Tech Stack

- **Frontend**: Svelte + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL + Prisma ORM
- **AI**: OpenAI GPT-4o-mini
- **File Processing**: pdf-parse, mammoth

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your:
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: Your OpenAI API key

### 3. Setup Database

```bash
npx prisma db push
```

### 4. Run the Application

**Development Mode:**
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run dev:server
```

Or run both with:
```bash
npm run dev:all
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Project Structure

```
my-ai-assistant/
├── src/
│   ├── pages/           # Svelte pages
│   ├── components/      # Reusable components
│   ├── stores/          # Svelte stores
│   └── styles/          # Global styles
├── prisma/
│   └── schema.prisma    # Database schema
├── server.js            # Express API server
└── package.json
```

## Usage

1. Open the app in your browser
2. Select your preferred language (English or Arabic)
3. Upload a PDF, DOCX, or PPTX file
4. Wait for AI processing (20-30 seconds)
5. Study using the generated:
   - Summary
   - Flashcards
   - Practice exam

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/user/:clerkId` - Get user info and documents
- `POST /api/upload` - Upload and process document
- `GET /api/document/:id` - Get document by ID
- `DELETE /api/document/:id` - Delete document
- `POST /api/exam/attempt` - Save exam attempt
- `POST /api/flashcard/progress` - Save flashcard progress

## License

MIT

## Branches

- `main` - Development/Live
- `stage` - Testing/Integration
- `production` - Stable releases
