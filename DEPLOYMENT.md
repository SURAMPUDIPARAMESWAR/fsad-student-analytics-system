# Fullstack Deployment Guide (Student Analytics System)

This project is deployed as 2 services:

1. Backend (Spring Boot API)
1. Frontend (Vite React app)

Recommended setup:

1. MySQL database: Railway, PlanetScale, or Aiven
1. Backend: Render Web Service
1. Frontend: Vercel

## 1) Deploy the Database (MySQL)

Create a MySQL instance and collect:

1. Host
1. Port
1. Database name
1. Username
1. Password

Build JDBC URL:

```text
jdbc:mysql://<HOST>:<PORT>/<DB_NAME>?sslMode=REQUIRED
```

If your provider does not require TLS, remove `?sslMode=REQUIRED`.

## 2) Deploy the Backend (Render)

Service root directory:

```text
backend/student-system
```

Build command:

```bash
./mvnw clean package -DskipTests
```

Start command:

```bash
java -jar target/student-system-0.0.1-SNAPSHOT.jar
```

Set environment variables in Render:

```text
PORT=8080
SPRING_DATASOURCE_URL=jdbc:mysql://<HOST>:<PORT>/<DB_NAME>?sslMode=REQUIRED
SPRING_DATASOURCE_USERNAME=<DB_USERNAME>
SPRING_DATASOURCE_PASSWORD=<DB_PASSWORD>
JWT_SECRET=<A_LONG_RANDOM_SECRET_MIN_32_CHARS>
APP_CORS_ALLOWED_ORIGINS=https://<your-frontend-domain>,http://localhost:5173,http://localhost:5174
```

After deploy, copy your backend URL:

```text
https://<your-backend>.onrender.com
```

## 3) Deploy the Frontend (Vercel)

Project root directory:

```text
frontend/student-analytics-system
```

Framework preset: `Vite`

No frontend API environment variable is needed now. The app uses `/api` paths and Vercel rewrites them to the backend.

Deploy and get frontend URL:

```text
https://<your-frontend>.vercel.app
```

## 4) Final CORS Update

Update backend env var `APP_CORS_ALLOWED_ORIGINS` to include the deployed frontend URL and any local Vite ports you use:

```text
APP_CORS_ALLOWED_ORIGINS=https://<your-frontend>.vercel.app,http://localhost:5173,http://localhost:5174
```

Redeploy backend after this update.

## 5) Health and Smoke Test

Test backend route (example):

```text
GET https://<your-backend>.onrender.com/api/students
```

Open frontend and verify:

1. Login/Register works
1. Student list loads
1. Marks and attendance screens load without CORS errors

## Local Development Env Values

Frontend no longer needs `VITE_API_BASE_URL`; requests are routed through `/api`.

Backend (defaults from `application.properties`):

1. `server.port` defaults to `8080` unless `PORT` is set.
1. DB defaults to local MySQL unless `SPRING_DATASOURCE_*` env vars are set.
1. `APP_CORS_ALLOWED_ORIGINS` defaults to `http://localhost:5173,http://localhost:5174`.

