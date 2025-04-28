# The Nest Exchange Backend

This is the backend codebase for **The Nest Exchange**, a community-driven platform designed to facilitate item sharing among users. The backend is built using **FastAPI** and **SQLAlchemy**, with a PostgreSQL database for data storage.

## Features

- **User Management**: Registration, login, and role-based access control.
- **Listings**: Create, update, and delete item listings.
- **Claims**: Claim items listed by other users.
- **Reports**: Report inappropriate listings.
- **Support Messages**: Submit support requests to administrators.

## How to Run

Follow these steps to set up and run the project locally:

### Prerequisites

- Python 3.10+
- Node.js and npm
- PostgreSQL
- Redis (optional, if caching is implemented)

### Backend Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-repo-url.git
   cd Backend
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set Up the Database**:
   - Create a PostgreSQL database.
   - Update the database connection string in `config.py`:
     ```python
     DATABASE_URL = "postgresql://username:password@localhost:5432/your_database_name"
     ```

4. **Run the Backend**:
   Start the FastAPI server using `uvicorn`:
   ```bash
   uvicorn main:app --reload
   ```

5. **Access the Backend API**:
   Open your browser and navigate to:
   - Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - ReDoc: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### Frontend Setup

1. **Navigate to the Frontend Directory**:
   ```bash
   cd ../frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run the Frontend**:
   Start the development server:
   ```bash
   npm run dev
   ```

4. **Access the Frontend**:
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000).