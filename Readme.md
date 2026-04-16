# ResumeAgent AI

[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Flask](https://img.shields.io/badge/Backend-Flask-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Cache-Redis-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/DevOps-Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![AWS EC2](https://img.shields.io/badge/Cloud-AWS%20EC2-FF9900?logo=amazonaws&logoColor=white)](https://aws.amazon.com/ec2/)

ResumeAgent AI is a **full-stack AI-powered resume analysis platform** that compares a candidate's resume against a job description and generates **structured, career-focused feedback**.

It is designed as a **portfolio-grade engineering project** to showcase **LLM integration, document processing, full-stack development, Dockerized deployment, AWS hosting, and CI/CD workflow design**.

## Live Demo

**Live App:** `http://3.87.127.127:8080`

## Features

- Upload resume in `PDF`, `DOCX`, `TXT`, or image-based formats
- Upload or paste a job description
- Extract and clean text from uploaded files
- Chunk resume and JD content for better prompt structuring
- Generate AI-based qualification analysis using Gemini
- Return clear, structured responses instead of vague long-form output
- Support adaptive response depth:
  - Short answers by default
  - Detailed guidance when explicitly requested
- Render AI output cleanly in Markdown
- Run the full stack using Docker Compose
- Support deployment on AWS EC2 with containerized services

## How It Works

1. The user uploads a resume and job description.
2. The backend extracts text from both documents.
3. The content is cleaned, sectioned, and chunked.
4. The system stores relevant session-level data.
5. The user asks a question such as:
   - `Am I qualified for this role?`
   - `What are my gaps?`
   - `How can I improve my chances?`
6. Resume and JD chunks are injected into a structured Gemini prompt.
7. The model returns a focused analysis with verdict, strengths, gaps, and improvement guidance.
8. The frontend displays the result in a readable Markdown format.

## Tech Stack

### Frontend
- React
- Vite
- Fetch API
- React Markdown
- Nginx

### Backend
- Python
- Flask
- Flask-CORS
- Gunicorn
- Background threading

### AI / LLM
- Google Gemini API
- Prompt engineering
- Response-mode control through prompts

### Database / Cache
- PostgreSQL
- Redis

### DevOps / Deployment
- Docker
- Docker Compose
- AWS EC2
- Amazon ECR
- GitHub Actions
- Linux / Ubuntu CLI

## Architecture

```text
User Browser
    |
    v
Nginx (Frontend Container)
    |
    +--> React App
    |
    +--> Proxy/API Requests
             |
             v
        Flask Backend
             |
             +--> Gemini API
             +--> PostgreSQL
             +--> Redis
```
## Project Structure 
```text
├── backend/
│   ├── app.py
│   ├── extraction/
│   ├── processing/
│   ├── matching/
│   ├── utils/
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   └── Resume2Job.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml
├── .env.example
├── scripts/
└── README.md
```
### Local Setup
1. Clone the repository
git clone <your-repo-url>
cd Resume2Job
2. Create environment variables
cp .env.example .env
3. Add your values in .env
APP_API_KEY=your_gemini_api_key
POSTGRES_USER=resume2job
POSTGRES_PASSWORD=your_password
POSTGRES_DB=resume2job_db
REDIS_PASSWORD=your_redis_password
FRONTEND_PORT=8080
4. Run the project
docker-compose up -d --build
5. Access the app
http://localhost:8080

### AWS EC2 Deployment

1. Connect to EC2
ssh -i /path/to/key.pem ubuntu@<EC2_PUBLIC_IP>
2. Clone the project
git clone <your-repo-url> ~/resume2job
cd ~/resume2job
3. Create .env
cp .env.example .env
nano .env
4. Start containers
sudo docker-compose up -d --build
5. Open the app
http://<EC2_PUBLIC_IP>:8080
6. Useful debug commands
sudo docker ps
sudo docker-compose ps
sudo docker logs --tail 100 resume2job_backend
sudo docker logs --tail 100 resume2job_frontend
df -h
sudo docker system prune -af
sudo docker builder prune -af

### CI/CD Workflow
This project includes a CI/CD design with:

1.GitHub Actions for linting, testing, and build automation
2.Amazon ECR for Docker image storage
3.EC2 deployment through SSH
4.Environment variable injection through secrets
5.Typical pipeline flow
6.Push code to main
7.Run backend lint/tests
8.Run frontend lint/build
9.Build Docker images
Push images to ECR
SSH into EC2 and redeploy containers

### Key Engineering Highlights

1.Built a full-stack AI application with clear frontend-backend separation
2.Integrated Gemini for structured career-response generation
3.Added Dockerized multi-service deployment using React, Flask, Postgres, and Redis
4.Deployed and debugged the application on AWS EC2
5.Worked with Linux server commands, logs, networking, and Docker runtime issues
6.Designed CI/CD workflow using GitHub Actions and ECR-based deployment

### Solved real deployment issues such as:
1.Port conflicts
2.Dependency mismatches
3.Service restart failures
4.Security group access
5.Disk space exhaustion on cloud instances

### Limitations
1.No embeddings-based semantic similarity search
2.Session handling is lightweight and not production-grade persistent memory
3.Output quality depends on resume and JD input quality
4.Not optimized for large-scale concurrent traffic
5.Built primarily as a learning and portfolio project

### Future Improvements
1.Add authentication and user accounts
2.Add persistent session history
3.Introduce embeddings-based similarity search
4.Add async task queue for document processing
5.Use custom domain + HTTPS
6.Improve production hardening and monitoring

#### Author
Abhay Kush


> github.com/abhaykush584
> LinkedIn link



