# News API - Backend Assessment

Welcome to the production-ready **News API**. This project is a robust, scalable backend where authors publish content and readers engage with it. It features a custom **Analytics Engine** to track and aggregate user engagement data efficiently.

## Tech Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** MySQL
- **ORM:** Drizzle ORM (Lightweight & type-safe)
- **Validation:** Zod (Centralized schema validation)
- **Security:** JWT (Authentication) & BCrypt (Password hashing)
- **Testing:** Jest & Supertest

## Setup and Installation

### 1. Prerequisites

- Node.js v18+
- MySQL Server running locally or on a cloud instance

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=3000
DATABASE_URL="mysql://root:your_password@localhost:3306/news_api"
JWT_SECRET="your_super_secret_key"
NODE_ENV=development
```

3. Installation

```
npm install
```

4. Database Setup

Ensure your MySQL server is running and the database specified in DATABASE_URL exists. Then, push the schema:

```
npx drizzle-kit push
```

5. Running the Application

# Development mode (with auto-restart)

```
npm run dev

# Run unit tests
npm test
```

Security & Authentication
JWT for user authentication
BCrypt for password hashing

Role-based access control (RBAC) implemented via middlewares

🧪 Testing

Unit and integration tests are written using Jest and Supertest.

Run tests with:

```
npm test
```

Notes

The project follows a feature-based layered architecture for easier scaling.

The Analytics Engine aggregates engagement metrics efficiently for authors.
