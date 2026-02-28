# News Aggregator API 📰

A professional RESTful API built with **Node.js** and **Express.js** that delivers personalized news feeds. This project implements secure authentication, user preference management, and a high-performance caching system.

---

## 🛠️ Project Implementation (Steps 1-7)

### 1. Project Setup (Step 1)
- Initialized Node.js environment and installed core dependencies: `express`, `dotenv`, and `axios`.

### 2. Authentication System (Step 2)
- **User Registration**: `POST /api/register` hashes passwords using **bcrypt** (10 salt rounds) before storage.
- **User Login**: `POST /api/login` verifies credentials and issues a **JWT (JSON Web Token)** for secure session management.

### 3. User Preferences & Security (Step 3)
- **Middleware**: Created a custom `verifyToken` function to protect routes.
- **Preference Management**: Users can `GET` and `PUT` their news interests (categories like technology, sports, etc.).

### 4. External API Integration (Step 4 & 5)
- Integrated **NewsAPI** using `axios` with full **async/await** support.
- **Validation**: Added `express-validator` to ensure correct email formats and password lengths.
- **Error Handling**: Implemented a global error-handling middleware for centralized debugging.

### 5. Advanced Features (Step 6)
- **Caching**: Used `node-cache` to store news results, reducing external API latency.
- **User Interaction**: Endpoints to mark articles as **Read** or **Favorite**.
- **Background Tasks**: Used `node-cron` to automatically refresh the news cache every 30 minutes.

---

## 🚀 Installation & Usage

1. **Install Dependencies**:
   ```bash
   npm install
