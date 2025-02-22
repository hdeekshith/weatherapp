# WeatherApp - NestJS API

## ✨ Project Overview
WeatherApp is a **NestJS-based API** that fetches current weather and forecasts using a third-party weather API. It provides user authentication and allows users to save favorite locations.

---

## 🚀 Setup Instructions
### 1️⃣ Prerequisites
- **Node.js v16+**
- **PostgreSQL**
- **Redis** (for caching; optional for local testing as NestJS provides in-memory cache fallback)

### 2️⃣ Installation
```sh
# Clone the repository
git clone <repository_url>

# Install dependencies for development
npm install

# Install dependencies for production
npm install --omit-dev
```

### 3️⃣ Database Setup
Before running the application, manually create the database:
```sh
psql -U postgres -c "CREATE DATABASE weather_db;"
```

### 4️⃣ Environment Configuration
Rename `example.env` to `.env` and update it as needed:
```
NODE_ENV=development
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=weather_db
WEATHER_API_KEY=your_api_key
WEATHER_API_URL=https://api.openweathermap.org/data/2.5
JWT_SECRET=mysecretkey
JWT_EXPIRY_TIME=24h
THROTTLE_TTL=60000
THROTTLE_LIMIT=10
REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_TTL=60000
```

### 5️⃣ Running Migrations
Run this command to create database schemas
```sh
npm run migration:run
```
If you need to revert the migration:
```sh
npm run migration:revert
```

### 6️⃣ Starting the Application
```sh
# Start in development mode
npm run start:dev

# Start in production mode
npm run start:prod
```

After starting the server, use the `/auth` endpoints to create a user and authenticate.

### 7️⃣ Running Tests
```sh
# Run unit tests
npm run test

# Test coverage
npm run test:cov
```

---

## 📄 API Documentation
### **REST Endpoints**
#### **Weather APIs**
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/weather/:city` | Fetch current weather for a city |
| `GET` | `/forecast/:city` | Fetch 5-day weather forecast |

#### **Favorite Locations**
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/locations` | Add a favorite location |
| `GET` | `/locations` | Retrieve the user’s favorite locations |
| `DELETE` | `/locations/:id` | Remove a favorite location |

#### **Authentication**
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/auth/signup` | Register a new user |
| `POST` | `/auth/login` | Authenticate and get a JWT token |

### **Swagger Documentation**
Swagger documentation is available at `/api/docs`.

### **GraphQL Support**
GraphQL API is available at `/graphql` for `/locations` and `/weather` endpoints and supports queries such as:
```graphql
query GetWeather {
    getWeather(input: { city: "London" }) {
        id
        weather {
            description
            icon
            id
            main
        }
    }
}
```

---

## 🚀 Caching Strategy
- **Redis** is used to reduce external API calls.
- **Cache Expiry:**
  - Weather data: **5 minutes**
  - Forecast data: **6 hours** (Updated every 3 hours via cron job)
- **Cache Invalidation:**
  - Data is refreshed periodically by a background cron job.
  - Cache is NOT cleared when users modify favorite locations, as weather data is not user-specific.

---

## 💡 Design Decisions & Assumptions

### 1️⃣ API Rate Limiting & Security
- **Rate Limiting:** Implemented via **NestJS ThrottlerModule** to prevent API abuse.
  - **General API Access:** Limited to **10 requests per minute**.
  - **Login & Signup:** More restrictive rate limiting (**6 requests per hour**) to **prevent brute-force attacks and spam account creation**.
  - If the limit is exceeded, API access is **blocked for 6 hours**.
- **Authentication:** Uses **JWT-based authentication** for secure user actions.
  - **Refresh token implementation is intentionally skipped** for simplicity. Users must **log in again after token expiry**.

---

### 2️⃣ Caching Strategy & Data Persistence

#### **Why Redis?**
- **Optimizes API calls** by reducing redundant network requests.
- Improves response times by **caching frequently accessed data**.

#### **Cache Expiry & Auto-Refresh**
| Data Type        | Cache Expiry | Reasoning |
|-----------------|-------------|------------|
| **Weather Data** | 5 minutes | Frequently changes, short-lived cache. |
| **Forecast Data** | 6 hours | Less frequent updates, long retention. |
| **Favorite Locations** | Not Cached | Queried from the database by cron job every **3 hours** for freshness. |

#### **Cache Invalidation Strategy**
| Data Type | Invalidation Method |
|-----------|---------------------|
| **Weather & Forecast Data** | **Auto-refreshed via a cron job** (runs every **3 hours**). |
| **Favorite Locations** | Fetched from the database periodically, **not stored in Redis**. |

#### **Why No Caching for Favorite Locations?**
- **User requests for this endpoint are expected to be infrequent**.
- If needed, caching could be implemented using:
  - **Cache Key Format:** `favorites_user_{userID}`
  - **Cache Invalidation Rules:**
    - **Adding a Location** (`POST /locations`) → Invalidate cache.
    - **Removing a Location** (`DELETE /locations/:id`) → Invalidate cache.

---

### 3️⃣ Logging & Error Handling

#### **Custom Logger Implementation**
- **Logs are structured based on environment**:
  - **Production Logs:** Only logs **errors & essential info**.
  - **Development Logs:** Includes **debug, verbose, and full stack traces** for better debugging.

#### **Error Handling Strategy**
| Status Code | Description |
|------------|-------------|
| **404 (Not Found)** | If the city does not exist in the third-party API. |
| **409 (Conflict)** | If a favorite location **already exists**. |
| **502 (Bad Gateway)** | If the external weather API is **down or unreachable**. |
| **500 (Internal Server Error)** | Generic internal errors. |
| **429 (Too Many Requests)** | When the rate limit is exceeded. |

---

### 4️⃣ Background Job Handling

- **Cron Job Frequency:** Runs **every 3 hours** to update weather forecasts for **favorite locations**.
- **Error Handling in Cron Job**:
  - If **one city fetch fails**, it logs the error but **continues processing the other cities**.
  - This ensures that **invalid cities do not stop execution**.

---

### 5️⃣ GraphQL & REST API Coexistence

- **GraphQL Schema Generation**:
  - **Auto-generated in development.**
  - **Disabled in production** to prevent unintended schema changes.
- **REST & GraphQL Support**:
  - **/weather and /locations** endpoints are **available in both REST & GraphQL**.
  - Users can **choose how they interact with the API**.

---

### ✅ Key Assumptions

✔ **Users will not frequently update their favorite locations**.  
✔ **Redis is available in production for caching** (not required for local development).  
✔ **Weather data changes frequently, but forecast data is relatively stable**.  
✔ **The application does not store past weather data—only the latest**.  
✔ **If needed, location validation (checking if a city exists before adding) can be introduced**.  

