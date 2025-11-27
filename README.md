# DayMate - AI Daily Planning Assistant

![DayMate Banner](https://img.shields.io/badge/DayMate-AI%20Assistant-blue?style=for-the-badge&logo=openai)
![Python](https://img.shields.io/badge/Python-3.11+-green?style=flat-square&logo=python)
![React](https://img.shields.io/badge/React-18.2-blue?style=flat-square&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-teal?style=flat-square&logo=fastapi)

An AI-powered assistant that helps users plan their day by combining real-time weather data, local news, and intelligent recommendations.

## Live Application URLs

| Service           | URL                                         |
| ----------------- | ------------------------------------------- |
| Frontend          | `https://daymate-frontend.vercel.app`       |
| Backend API       | `https://daymate-backend.onrender.com`      |
| API Documentation | `https://daymate-backend.onrender.com/docs` |

> **Note:** Replace the URLs above with your actual deployed URLs after deployment.

## Features

### Core Features

- **Real-time Weather Integration** - Fetches current weather data from Open-Meteo API (FREE, no key needed)
- **Real-time Traffic Updates** - Shows road congestion levels and incidents using TomTom Traffic API (Open Traffic - World Bank)
- **News Aggregation** - Retrieves local news via NewsAPI
- **AI Planning Agent** - Generates personalized daily recommendations using Google Gemini
- **Clean User Interface** - Modern React UI with Tailwind CSS styling

### Bonus Features

- **Docker Containerization** - Ready-to-deploy Dockerfiles
- **Unit Tests** - Comprehensive test coverage for backend services
- **Fallback Mechanisms** - Rule-based plans when AI is unavailable

## Technology Choices

### Backend: FastAPI

- **Why FastAPI?**
  - High performance with async support
  - Automatic OpenAPI documentation
  - Built-in data validation with Pydantic
  - Easy to test and deploy

### Frontend: React + Vite

- **Why React?**

  - Component-based architecture for maintainability
  - Large ecosystem and community support
  - Excellent developer experience with hooks

- **Why Vite?**
  - Lightning-fast development server
  - Optimized production builds
  - Modern ES modules support

### Styling: Tailwind CSS

- **Why Tailwind?**
  - Utility-first approach for rapid development
  - Highly customizable design system
  - Small production bundle with purging

## Project Structure

```
DayMate/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # Application entry point
│   │   ├── models.py          # Pydantic data schemas
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── weather.py     # Open-Meteo integration (FREE)
│   │       ├── news.py        # NewsAPI integration
│   │       └── ai_agent.py    # OpenAI integration
│   ├── tests/
│   │   └── test_services.py   # Unit tests
│   ├── .env.example           # Environment template
│   ├── requirements.txt       # Python dependencies
│   └── Dockerfile             # Container configuration
│
├── frontend/                   # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── WeatherCard.jsx
│   │   │   ├── NewsFeed.jsx
│   │   │   ├── PlanDisplay.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ErrorMessage.jsx
│   │   ├── App.jsx            # Main application
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Tailwind styles
│   ├── .env.example           # Environment template
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── README.md                   # This file
```

## Local Setup Instructions

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm or yarn

### API Keys Required (All FREE - No Credit Card Needed)

1. **Weather API** - Using [Open-Meteo](https://open-meteo.com/) - **NO API KEY NEEDED!** Completely free.
2. **NewsAPI Key** - [Get FREE key here](https://newsapi.org/) - Free for development
3. **Google Gemini API Key** - [Get FREE key here](https://aistudio.google.com/app/apikey) - Free tier available

### Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Create environment file
copy .env.example .env  # Windows
# cp .env.example .env  # macOS/Linux

# 6. Edit .env and add your API keys (Weather is FREE - no key needed!)
# NEWS_API_KEY=your_key
# GEMINI_API_KEY=your_key

# 7. Run the server
uvicorn app.main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`

- API Documentation: `http://localhost:8000/docs`

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Create environment file
copy .env.example .env  # Windows
# cp .env.example .env  # macOS/Linux

# 4. Run development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Running Tests

```bash
# Navigate to backend directory
cd backend

# Run tests
pytest tests/ -v
```

## API Endpoints

| Method | Endpoint              | Description           |
| ------ | --------------------- | --------------------- |
| GET    | `/`                   | Health check          |
| GET    | `/health`             | Service health status |
| POST   | `/api/plan`           | Generate daily plan   |
| GET    | `/api/weather/{city}` | Get weather for city  |
| GET    | `/api/news/{city}`    | Get news for city     |

### Example Request

```bash
curl -X POST "http://localhost:8000/api/plan" \
     -H "Content-Type: application/json" \
     -d '{"city": "London"}'
```

### Example Response

```json
{
  "weather": {
    "temp": 15.5,
    "feels_like": 14.2,
    "humidity": 72,
    "condition": "Clouds",
    "description": "overcast clouds",
    "icon": "04d",
    "wind_speed": 5.2,
    "city_name": "London",
    "country": "GB"
  },
  "news": [
    {
      "title": "Local News Headline",
      "description": "News description...",
      "url": "https://...",
      "source": "BBC News",
      "published_at": "2024-01-01T12:00:00Z"
    }
  ],
  "ai_plan": "## Daily Plan for London\n\n### Morning\n- ...",
  "city": "London"
}
```

## Deployment Instructions

### Backend Deployment (Render)

1. Push your code to GitHub

2. Create a new Web Service on [Render](https://render.com)

3. Connect your GitHub repository

4. Configure settings:

   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory:** `backend`

5. Add Environment Variables in Render dashboard:

   - `NEWS_API_KEY`
   - `GEMINI_API_KEY`
   - (Weather uses Open-Meteo - NO KEY NEEDED!)

6. Deploy!

### Frontend Deployment (Vercel)

1. Import your GitHub repository on [Vercel](https://vercel.com)

2. Configure settings:

   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`

3. Add Environment Variable:

   - `VITE_API_URL` = Your Render backend URL (e.g., `https://daymate-backend.onrender.com`)

4. Deploy!

### Docker Deployment

```bash
# Backend
cd backend
docker build -t daymate-backend .
docker run -p 8000:8000 --env-file .env daymate-backend

# Or use docker-compose (create docker-compose.yml first)
```

## Screenshots

### Home Page

![Home Page](screenshots/home.png)

### Results View

![Results](screenshots/results.png)

> Add your screenshots to a `screenshots/` folder

## Architecture Diagram

```
┌─────────────────┐     ┌─────────────────┐
│   React App     │────▶│   FastAPI       │
│   (Frontend)    │◀────│   (Backend)     │
└─────────────────┘     └────────┬────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Open-Meteo    │     │    NewsAPI      │     │  Google Gemini  │
│   (FREE!)       │     │                 │     │      API        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Environment Variables

### Backend (.env)

```env
# Weather: Uses Open-Meteo - NO API KEY NEEDED!
# Traffic: Uses TomTom Traffic API (Open Traffic - World Bank)
# Based on OSM and Telenav data - Free developer tier available
TOMTOM_API_KEY=your_tomtom_api_key
NEWS_API_KEY=your_newsapi_key
GEMINI_API_KEY=your_gemini_api_key
ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Open-Meteo](https://open-meteo.com/) for FREE weather data (no API key!)
- [NewsAPI](https://newsapi.org/) for news aggregation
- [Google Gemini](https://ai.google.dev/) for AI-powered recommendations
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
