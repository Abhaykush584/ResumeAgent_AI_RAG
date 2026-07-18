# ResumeAgent AI

[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Flask](https://img.shields.io/badge/Backend-Flask-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Pinecone](https://img.shields.io/badge/Vector_DB-Pinecone-000000?logo=pinecone&logoColor=white)](https://www.pinecone.io/)
[![Vercel](https://img.shields.io/badge/Hosting-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Hosting-Render-46E3B7?logo=render&logoColor=white)](https://render.com/)

ResumeAgent AI is a **full-stack AI-powered resume analysis platform** that acts as an elite Career Advisor. It performs deep Retrieval-Augmented Generation (RAG) by comparing a candidate's resume against a job description and generating **structured, highly-actionable career feedback**.

It is designed as a **portfolio-grade engineering project** to showcase **Advanced Prompt Engineering, RAG implementation, full-stack development, serverless deployment, and CI/CD workflow design**.

## Features

- **Authentication:** Secure user accounts via JWT.
- **Persistent Chat History:** Seamlessly revisit past resume analysis sessions saved in PostgreSQL.
- **State-of-the-art RAG:** Extracts text from PDFs/DOCX, chunks it, embeds it via Gemini, and stores it in **Pinecone** for extremely fast, persistent semantic search.
- **Advanced Prompt Engineering:** Instructs the LLM using Few-Shot prompting and Chain of Thought reasoning for structured Markdown outputs.
- **Cloud-Native Deployment:** Separated frontend (Vercel) and backend (Render) for infinite scalability and zero local port conflicts.

## Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- Vercel (Hosting)

### Backend
- Python (Flask)
- PostgreSQL (User & Chat Data)
- Redis (Session Caching)
- Render (PaaS Hosting)

### AI / LLM
- Google Gemini API (Embeddings & Generation)
- Pinecone (Cloud Vector Database)
- LangChain

## Architecture

```text
User Browser
    |
    v
Vercel (React Frontend)
    |
    +--> Proxy/API Requests
             |
             v
        Render (Flask Backend)
             |
             +--> Gemini API (LLM & Embeddings)
             +--> Pinecone (Vector Search)
             +--> PostgreSQL (Chat History)
```

## Local Development (Docker Compose)

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd ResumeAgent_AI_RAG
   ```
2. Create `.env` from `.env.example` and add your keys:
   ```bash
   APP_API_KEY=your_gemini_api_key
   PINECONE_API_KEY=your_pinecone_api_key
   ```
3. Run the project:
   ```bash
   docker-compose up -d --build
   ```
4. Access the app at `http://localhost:8080`

## Deployment Guides

### 1. Frontend (Vercel)
1. Push this repository to GitHub.
2. Log into [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. Set the Framework Preset to **Vite**.
5. Once your Render backend is live, update the `vercel.json` file's `destination` URLs to match your Render backend URL, and commit the change to trigger an auto-deploy!

### 2. Backend (Render)
1. Log into [Render](https://render.com/) and go to **Blueprints**.
2. Connect your GitHub repository.
3. Render will automatically read the `render.yaml` file in this repository and provision a PostgreSQL database, a Redis cache, and the Flask backend web service!
4. Go to your new Web Service on the Render dashboard -> Environment, and manually add your `APP_API_KEY` and `PINECONE_API_KEY`.

### CI/CD Workflow
Because we are utilizing Vercel and Render's native GitHub integrations, **CI/CD is handled automatically**. 
Every time you `git push origin main`:
1. Vercel detects the change and builds/deploys the React frontend.
2. Render detects the change and builds/deploys the Flask backend.

## Author
**Abhay Kush**
> [GitHub](https://github.com/abhaykush584)
> [LinkedIn]
