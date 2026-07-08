# ResearchOS v2.0

**The AI Operating System for Scientific Discovery**

ResearchOS is a complete AI-native platform that transforms how researchers discover, understand, and connect scientific knowledge. Enter any research topic and ResearchOS automatically discovers papers, builds knowledge graphs, generates literature reviews, and creates a permanent interactive research workspace.

---

## Features

### 🔬 Research Discovery
- Search across **5+ scientific sources** simultaneously (Semantic Scholar, OpenAlex, CrossRef, arXiv, Papers With Code)
- Natural language query support
- Automatic query expansion for better recall
- Smart deduplication and ranking

### 🕸️ Interactive Knowledge Graphs
- **Citation graphs** - See how papers reference each other
- **Knowledge graphs** - Understand relationships between papers, authors, datasets, and methods
- **Concept graphs** - Visualize idea evolution
- **Author collaboration graphs** - Discover research communities
- Powered by **Cytoscape.js** and **NetworkX**

### 🧠 Mind Maps
- Concept-focused research visualization
- Auto-generated topic hierarchies
- Powered by **React Flow**

### 📈 Research Timeline
- Track field evolution from 2017 to present
- Interactive play mode shows research evolution
- Major breakthroughs and milestone detection

### 📚 Literature Review Generation
- AI-powered, citation-grounded reviews
- 8-section structure (Background → Future Directions)
- Every claim supported by evidence
- Export to Markdown, PDF, Word

### 💡 Research Gap Detection
- AI-identified opportunities for future work
- Opportunity scoring based on publication coverage
- Trend analysis (growing/stable/declining areas)

### 🗺️ Research Roadmaps
- Personalized 7-day learning journeys
- Covers: Survey → Foundational → Implementation → SOTA → Project
- Track completion progress

### 🤖 AI Assistant
- Workspace-aware chat
- Evidence chains with confidence scores
- Paper summarization and comparison
- Concept explanation

### 📊 Research Analytics
- Publication trends, citation growth
- Method and dataset popularity
- Venue and institution distribution
- Research health scores

### 📝 Notes & Bookmarks
- Markdown notes with LaTeX support
- Bookmark papers, authors, datasets, methods
- Tag-based organization

---

## Tech Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** (build tool)
- **TailwindCSS** + **shadcn/ui** (UI components)
- **Framer Motion** (animations)
- **React Router** (routing)
- **TanStack Query** (server state)
- **Cytoscape.js** (knowledge graphs)
- **React Flow** (mind maps)
- **Recharts** (analytics charts)
- **Lucide React** (icons)
- **Sonner** (toasts)
- **Zustand** (state management)

### Backend
- **Python 3.12** + **FastAPI**
- **MongoDB** + **Beanie ODM** (primary database)
- **ChromaDB** (vector embeddings)
- **NetworkX** (graph engine)
- **Sentence-Transformers** (embeddings)
- **OpenRouter** (LLM access)
- **AsyncIO** (async operations)
- **Tenacity** (retry logic)
- **Loguru** (structured logging)
- **Pydantic V2** (validation)

---

## Project Structure

```
researchos/
├── backend/
│   ├── app/
│   │   ├── api/            # 23 route modules
│   │   ├── services/       # 10 business logic services
│   │   ├── repositories/   # 5 data access repositories
│   │   ├── models/         # 14 Beanie ODM models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── database/       # MongoDB + ChromaDB setup
│   │   ├── middleware/     # Rate limiting, auth
│   │   ├── graph/          # NetworkX graph engine
│   │   ├── embeddings/     # Vector embedding pipeline
│   │   ├── retrieval/      # RAG pipeline
│   │   ├── ranking/        # Paper ranking engine
│   │   ├── analytics/      # Research analytics
│   │   ├── ai/             # AI integration layer
│   │   ├── workspace/      # Workspace orchestration
│   │   └── utils/          # Logger, helpers
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/          # 17 page components
│   │   ├── layouts/        # Dashboard layout
│   │   ├── components/
│   │   │   ├── ui/         # 17 shadcn/ui components
│   │   │   ├── layout/     # Sidebar, TopNav, RightPanel
│   │   │   ├── graph/      # Graph visualizations
│   │   │   └── chat/       # AI assistant
│   │   ├── hooks/          # 8 custom hooks
│   │   ├── contexts/       # 3 React contexts
│   │   ├── services/       # API client
│   │   └── types/          # TypeScript interfaces
│   └── package.json
└── README.md
```

---

## Installation

### Prerequisites
- Python 3.12+
- Node.js 20+
- MongoDB (local or Atlas)
- OpenRouter API key (free)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your MongoDB URI and OpenRouter API key
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Access

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017` |
| `MONGODB_DB_NAME` | Database name | `researchos` |
| `OPENROUTER_API_KEY` | OpenRouter API key | - |
| `OPENROUTER_MODEL` | LLM model for AI features | `qwen-2-72b-instruct` |
| `JWT_SECRET` | JWT signing secret | Change in production |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:5173` |

---

## Architecture

```
React + TypeScript (Frontend)
         │
         ▼
   FastAPI (Backend)
         │
   ┌─────┼─────┐
   ▼     ▼     ▼
MongoDB ChromaDB NetworkX
         │
         ▼
  External APIs:
  Semantic Scholar | OpenAlex | CrossRef | arXiv | Papers With Code
         │
         ▼
  OpenRouter (LLM)
```

---

## Key API Endpoints

- `POST /api/v1/workspaces` - Create research workspace
- `GET /api/v1/workspaces/{id}` - Get workspace details
- `POST /api/v1/discovery/search` - Full discovery search
- `GET /api/v1/graph/{id}/knowledge` - Knowledge graph data
- `GET /api/v1/timeline/{id}` - Research timeline
- `GET /api/v1/review/{id}` - Literature review
- `POST /api/v1/assistant/chat` - AI assistant chat
- `POST /api/v1/hypothesis/test` - Test research hypothesis
- `GET /api/v1/analytics/{id}` - Research analytics
- `POST /api/v1/export/workspace/{id}` - Export workspace

---

## License

MIT

---

*Built with the mindset that this could evolve into a real startup — not just a portfolio project.*
