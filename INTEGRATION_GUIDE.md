# Backend & Frontend Integration Guide

## Project Structure

This project has a **unified Next.js monorepo** structure with:
- **Backend API Routes**: `/app/api/*` - Server-side API endpoints
- **Frontend App**: `/frontend/app/*` - Client-side React components
- **Shared Libraries**: `/lib` - Shared utilities and configurations

## Setup Instructions

### 1. Install Dependencies

```bash
# Backend dependencies
npm install

# Frontend dependencies (if separate)
cd frontend
npm install
cd ..
```

### 2. Environment Variables

#### Backend (.env.local in root)
Create `.env.local` with:
```
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: OpenAI for AI features
OPENAI_API_KEY=your_openai_api_key
```

#### Frontend (frontend/.env.local)
Create `frontend/.env.local` with:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Running the Application

**Option A: Run Backend + Frontend together (recommended for development)**
```bash
# From root directory
npm run dev
```
This runs the backend on `http://localhost:3000`

**Option B: Run them separately**
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```
Backend runs on `http://localhost:3000`, Frontend on `http://localhost:3001`

## API Connection Details

### How the Frontend Connects to the Backend

The frontend uses a centralized API client (`frontend/lib/api.js`) that:
- Reads `NEXT_PUBLIC_API_URL` from environment variables
- Makes requests to `/api/*` endpoints
- Handles CORS headers automatically
- Provides typed API calls with error handling

### Example API Usage

```javascript
import { journalAPI, insightsAPI } from '@/lib/api';

// Get user entries
const { entries } = await journalAPI.getEntries(userId);

// Get insights
const insights = await insightsAPI.getInsights(userId);

// Add a new entry
await journalAPI.addEntry({
  user_id: userId,
  content: "Today was a good day...",
  emotion: "happy",
  sentiment: 0.8
});
```

## CORS Configuration

All API routes include CORS headers to allow cross-origin requests. The CORS utility (`/lib/cors.js`) handles:
- `Access-Control-Allow-Origin`
- `Access-Control-Allow-Methods`
- `Access-Control-Allow-Headers`
- OPTIONS preflight requests

## Available API Endpoints

### Journal Entries
- `POST /api/addEntry` - Create a new journal entry
- `GET /api/getEntries?user_id={id}` - Fetch user's entries

### Insights
- `GET /api/getInsights?user_id={id}` - Get mood analytics and insights

### AI Features
- `POST /api/analyzeEntries` - AI analysis of journal entries
- `GET /api/aiStatus` - Check if AI features are available

## Database Setup

Run the migrations in your Supabase SQL editor:

1. **Create Tables**:
   ```sql
   -- See migrations/002_create_journal_entries.sql
   -- See migrations/001_create_journal_insights.sql
   ```

2. **Enable Authentication** in Supabase dashboard

## Troubleshooting

### API Requests Failing
- Check that backend is running on the correct port
- Verify `NEXT_PUBLIC_API_URL` matches your backend URL
- Check browser console for CORS errors

### Supabase Connection Issues
- Verify credentials in `.env.local`
- Check that tables exist (run migrations)
- Ensure service role key has proper permissions

### Environment Variables Not Loading
- Restart the dev server after changing `.env.local`
- In frontend, use `NEXT_PUBLIC_` prefix for variables accessible in browser
- For backend-only variables, no prefix needed

## Development Tips

- The API client (`frontend/lib/api.js`) provides consistent error handling
- Use the CORS helper in new API routes: `import { corsHeaders } from '@/lib/cors'`
- Environment variables are validated on server startup
- Mock data is provided when OpenAI key is not configured

## Production Deployment

1. Set environment variables in your hosting platform (Vercel, etc.)
2. Update `NEXT_PUBLIC_API_URL` to your production backend URL
3. Ensure CORS origins are updated for your production domain
4. Run `npm run build` to optimize for production
