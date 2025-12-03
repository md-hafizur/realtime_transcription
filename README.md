# Real-Time Transcription Service

This project is a real-time audio transcription service that uses a WebSocket-based backend powered by FastAPI and a modern Next.js frontend.

## Features

- **Real-Time Transcription**: Transcribe audio from the microphone in real-time.
- **WebSocket Communication**: Low-latency communication between the frontend and backend.
- **Vosk Integration**: Utilizes the Vosk toolkit for accurate speech recognition.
- **Dockerized**: Comes with a `docker-compose` setup for easy development and deployment.

## Tech Stack

- **Backend**:
  - Python 3.11+
  - FastAPI
  - Vosk
  - PostgreSQL
  - SQLAlchemy
  - Alembic
  - `uv` for package management

- **Frontend**:
  - Next.js (React)
  - TypeScript
  - Tailwind CSS

- **Deployment**:
  - Docker & Docker Compose

---

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/en/) (v20.x or later)
- [Python](https://www.python.org/downloads/) (v3.11 or later)
- `uv` (Python package manager): `pip install uv`

### 1. Download the Speech Recognition Model

The backend service requires a Vosk speech recognition model. A script is provided to download the recommended small English model.

```bash
# From the project root
./scripts/download_vosk_model.sh
```
This will download and extract the model into the `backend/models_data` directory, which is required for the application to run.

### 2. Docker Compose (Recommended Method)

Using Docker Compose is the easiest way to get the entire application stack (backend, frontend, and database) running.

1.  **Build and Run**:
    ```bash
    docker-compose up --build
    ```
    *Note: The `frontend` service is commented out in the `docker-compose.yml` file. You will need to uncomment it and ensure the context points to `./frontend-next`.*

2.  **Access the application**:
    - Frontend: `http://localhost:3000`
    - Backend API: `http://localhost:8000/docs`

### 3. Manual Installation

If you prefer to run the services manually without Docker.

#### Backend Setup

1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```

2.  **Install dependencies**:
    This command installs the packages specified in `pyproject.toml` (and `uv.lock` if it exists).
    ```bash
    uv sync
    ```

3.  **Set up environment variables**:
    Create a `.env` file in the `backend` directory. You'll need to provide the database URL. For a local Postgres instance, it would look like this:
    ```env
    # backend/.env
    DATABASE_URL=postgresql://transcribe_user:transcribe_pass@localhost:5432/transcription_db
    ```

4.  **Database Migrations**:
    Alembic is used for database migrations. Ensure your PostgreSQL server is running and the database exists.
    - To create a new migration:
      ```bash
      alembic revision --autogenerate -m "Add description for your migration"
      ```
    - To apply pending migrations:
      ```bash
      alembic upgrade head
      ```

5.  **Run the server**:
    Use `uv run` to start the FastAPI server.
    ```bash
    uv run uvicorn app.main:app --reload
    ```
    The API will be available at `http://localhost:8000`.

#### Frontend Setup

1.  **Navigate to the frontend directory**:
    ```bash
    cd frontend-next
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up environment variables**:
    Create a file named `.env.local` in the `frontend-next` directory.
    ```env
    # frontend-next/.env.local
    NEXT_PUBLIC_WS_URL=ws://localhost:8000
    NEXT_PUBLIC_API_URL=http://localhost:8000
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

---

## Folder Structure

```
.
├── backend/         # FastAPI backend source code
├── docs/            # Project documentation
├── frontend-next/   # Next.js frontend source code
├── scripts/         # Helper scripts (e.g., model download)
├── docker-compose.yml
└── README.md
```
