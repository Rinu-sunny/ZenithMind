# ZenithMind

A modern journaling application that helps users understand their emotions and track personal insights through intelligent **local emotion analysis** - no external APIs required.

## Team Members
- Rinu Sunny Mathew
- Daya Manoj
- Devavrath M periyal

##  Features

- **Journal Entries** - Write and organize your thoughts with automatic timestamp tracking (5000 character limit)
- **Local AI Analysis** - Emotion detection using advanced keyword matching with contextual awareness (Happy, Sad, Anxious, Stressed, Angry)
- **Sentiment Scoring** - Numeric sentiment analysis with intensity modifiers and negation handling
- **Dashboard Analytics** - Visual breakdown of emotional patterns using interactive charts (line charts, pie charts)
- **AI-Generated Insights** - Get reflective questions and suggested actions based on journal entries
- **Secure Authentication** - Email/password auth with password reset via Supabase
- **User Database** - Persistent storage of entries and insights with user isolation

##  Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 16.1.1 (App Router)
- **UI Library**: [React](https://react.dev/) 19.2.1 with React DOM 19.2.1
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL) v2.89.0
- **AI Analysis**: Local keyword-based sentiment analysis (No external API required)
- **Visualization**: [Recharts](https://recharts.org/) v3.6.0 (LineChart, PieChart)
- **Styling**: CSS Modules
- **Linting**: ESLint v9 with Next.js config

##  Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account and project

##  Getting Started

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/Rinu-sunny/ZenithMind.git
cd ZenithMind
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Environment Variable Details:**
- `NEXT_PUBLIC_*` variables are exposed to the browser
- `SUPABASE_*` variables are server-only
### 3. Set Up Database

The application uses two PostgreSQL tables managed with SQL migrations:

```bash
# Apply migrations using Supabase Dashboard:
# 1. Go to SQL Editor in Supabase Console
# 2. Run migrations/001_create_journal_insights.sql
# 3. Run migrations/002_create_journal_entries.sql

# Or use Supabase CLI:
supabase migration up
```

**What gets created:**
- `journal_insights` - Stores AI-generated insights (emotion analysis, reflective questions)
- `journal_entries` - Stores user journal entries with emotion and sentiment data
- Both tables are automatically cascaded to delete when user is deleted

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app will auto-reload as you edit.


