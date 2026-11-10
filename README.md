# FITTRACK – Personal Fitness & Workout Tracking Application

> A complete MERN stack fitness SaaS application with role-based dashboards, workout tracking, goal management, analytics and full DevOps pipeline.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, Lucide React |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| DevOps | Docker, Docker Compose, Kubernetes |

---

## Project Structure

```
FITTRACK/
├── backend/          # Express API server
├── frontend/         # React application
├── k8s/              # Kubernetes manifests
├── docker-compose.yml
└── README.md
```

---

## Demo Credentials

| Role    | Email                   | Password     |
|---------|-------------------------|--------------|
| Admin   | admin@fittrack.com      | Admin@123    |
| Trainer | trainer@fittrack.com    | Trainer@123  |
| User    | user@fittrack.com       | User@123     |

> ⚠️ These are local development credentials only. Never use them in production.

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- MongoDB (running locally on port 27017)
- npm

### 1. Clone and install

```bash
# Navigate to backend
cd FITTRACK/backend
npm install

# Navigate to frontend
cd ../frontend
npm install
```

### 2. Configure environment

```bash
# Copy the example env file
cd backend
copy .env.example .env
```

Edit `.env` with your values:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/fittrack
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

### 3. Seed the database

```bash
cd backend
npm run seed
```

This creates 20 exercises, 5 user accounts and 45 days of workout logs.

### 4. Start the backend

```bash
cd backend
npm run dev
```

Backend runs at: http://localhost:5000  
Health check: http://localhost:5000/api/health

### 5. Start the frontend

```bash
cd frontend
npm run dev
```

Frontend runs at: http://localhost:5173

---

## Application Features

### 10 Screens

| # | Screen | Role |
|---|--------|------|
| 1 | Login & Registration | Public |
| 2 | User Profile | All |
| 3 | Fitness Goals | User |
| 4 | Exercise Library | All |
| 5 | Workout Planner | User |
| 6 | Daily Workout Tracking | User |
| 7 | Fitness Dashboard | User |
| 8 | Trainer Dashboard | Trainer |
| 9 | Reports & Analytics | User |
| 10 | Admin Dashboard | Admin |

### 3 User Roles

- **Admin** – Manage users/trainers, assign trainers, activate/deactivate accounts
- **Trainer** – View assigned clients, monitor progress, submit feedback
- **User** – Full workout tracking, goal management, analytics

---

## Docker Setup

### Build and run all services

```bash
# From the FITTRACK root directory
docker-compose up --build
```

App available at: http://localhost  
Backend at: http://localhost:5000

### Run seed inside Docker

```bash
docker exec fittrack-backend node seed/seedData.js
```

### Stop all containers

```bash
docker-compose down
```

---

## Kubernetes Setup

### Prerequisites
- minikube or any local Kubernetes cluster
- kubectl configured

### Step 1: Create the secret (do NOT commit this)

```bash
kubectl create secret generic fittrack-secrets \
  --from-literal=JWT_SECRET=your_production_jwt_secret_here
```

### Step 2: Build images (minikube)

```bash
# Point Docker to minikube's daemon
minikube docker-env | Invoke-Expression   # PowerShell
eval $(minikube docker-env)              # Bash/Mac

# Build images
docker build -t fittrack-backend:latest ./backend
docker build -t fittrack-frontend:latest ./frontend
```

### Step 3: Deploy

```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/mongodb-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
```

### Step 4: Verify

```bash
kubectl get pods
kubectl get services
```

### Step 5: Access the app

```bash
minikube service frontend-service
```

Or manually: http://$(minikube ip):30080

---

## API Reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login |
| GET | /auth/me | Get current user |
| GET | /users/profile | Get profile |
| PUT | /users/profile | Update profile |
| GET | /goals | Get all goals |
| POST | /goals | Create goal |
| PUT | /goals/:id | Update goal |
| DELETE | /goals/:id | Delete goal |
| GET | /exercises | Get exercises |
| GET | /workout-plans | Get plans |
| POST | /workout-plans | Create plan |
| GET | /workout-logs | Get logs |
| POST | /workout-logs | Log workout |
| GET | /dashboard/stats | Dashboard stats |
| GET | /reports/weekly | Weekly report |
| GET | /reports/export-csv | Export CSV |
| GET | /trainer/clients | Trainer's clients |
| POST | /trainer/feedback | Submit feedback |
| GET | /admin/dashboard | Admin stats |
| GET | /admin/users | All users |

---

## Git Workflow

```bash
cd FITTRACK
git init
git add .
git commit -m "feat: initial FITTRACK MERN application"
git remote add origin https://github.com/yourusername/fittrack.git
git push -u origin main
```

---

## Known Limitations

- Images in Exercise Library use emoji illustrations (no external image URLs required)
- MongoDB persistent volume in Kubernetes uses `emptyDir` for local demo (use PVC in production)
- Push notifications are UI-only (bell icon) — backend events not implemented
- No email verification for new registrations

---

## License

This project is developed for academic and demonstration purposes.
