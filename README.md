# Kaskrout v2 - Minimal ERP

Kaskrout v2 is a simple, efficient, and responsive ERP system designed for managing daily operations of a small business, focusing on consumables tracking, earnings, product/consumable prices, and basic reporting.

## Features

-   **Dashboard**: Overview of daily consumables usage, baguettes tracking, daily earnings, calculated consumables cost, and net profit.
-   **Management**: CRUD operations for daily consumable usage, baguettes counts, and earnings.
-   **Prices**: Manage (add, edit, delete) consumables and products with their respective prices.
-   **Reports**: Weekly aggregated reports for performance overview.
-   **Authentication**: Secure user login with JWT.
-   **Responsive Design**: Optimized for various screen sizes, from desktops to mobile phones.

## Technologies Used

### Backend

-   **Node.js**: JavaScript runtime environment.
-   **Express.js**: Web application framework.
-   **PostgreSQL**: Relational database.
-   **Prisma ORM**: Next-generation ORM for Node.js and TypeScript.
-   **JWT (JSON Web Tokens)**: For secure authentication.
-   **Bcrypt.js**: For password hashing.
-   **Zod**: For input validation.

### Frontend

-   **React.js**: JavaScript library for building user interfaces (Vite for tooling).
-   **React Router DOM v6**: For client-side routing.
-   **Axios**: Promise-based HTTP client.
-   **Date-fns**: For date manipulation.
-   **Global CSS**: Minimalist and responsive styling.

## Getting Started

Follow these steps to set up and run the Kaskrout v2 application locally.

### Prerequisites

-   Node.js (LTS version recommended)
-   npm (Node Package Manager)
-   PostgreSQL database (e.g., via pgAdmin 17)

### 1. Database Setup (PostgreSQL)

1.  **Create a PostgreSQL User and Database:**
    Open your PostgreSQL client (e.g., pgAdmin Query Tool) and run the following commands:

    ```sql
    CREATE USER kaskrout_user WITH PASSWORD 'kaskrout_pass';
    CREATE DATABASE kaskrout_dev OWNER kaskrout_user;
    ALTER USER kaskrout_user CREATEDB;
    ```

2.  **Configure Environment Variables:**
    In the `kaskrout-v2/` directory, create a new file named `.env`.
    Copy the contents of `env.example` into `.env` and fill in your database URL and JWT secret:

    ```
    DATABASE_URL="postgresql://kaskrout_user:kaskrout_pass@localhost:5432/kaskrout_dev"
    JWT_SECRET="your_jwt_secret_key_here"
    PORT=5000
    ```
    *Make sure to replace `your_jwt_secret_key_here` with a strong, random string.*

3.  **Run Prisma Migrations:**
    Navigate to the `backend` directory:
    ```bash
    cd kaskrout-v2/backend
    ```
    Install dependencies and run Prisma migrations:
    ```bash
    npm install
    npx prisma migrate dev --name init --schema prisma/schema.prisma
    ```
    *This will create the necessary tables in your `kaskrout_dev` database.*

4.  **Seed Initial Data (Optional):**
    To populate your database with initial consumables and products, use the `backend/test/seed-data.http` file with an HTTP client like [Thunder Client](https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client) or [Rest Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client).

    First, ensure your backend is running (see Backend Setup below). Then, send the POST requests defined in `seed-data.http`.

### 2. Backend Setup and Run

1.  **Navigate to Backend Directory:**
    ```bash
    cd kaskrout-v2/backend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Run the Backend Server:**
    ```bash
    npm run dev
    ```
    The backend server will start on `http://localhost:5000` (or the `PORT` specified in your `.env` file).

### 3. Frontend Setup and Run

1.  **Navigate to Frontend Directory:**
    ```bash
    cd kaskrout-v2/frontend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Configure API URL:**
    Create a `.env` file in the `kaskrout-v2/frontend` directory:
    ```
    VITE_API_URL=http://localhost:5000/api
    ```

4.  **Run the Frontend Application:**
    ```bash
    npm run dev
    ```
    The frontend application will typically open in your browser at `http://localhost:5173`.

## Project Structure

```
kaskrout-v2/
├── backend/             # Node.js Express API
│   ├── prisma/          # Database schema and migrations
│   ├── src/             # Backend source code
│   │   ├── middleware/  # Authentication and authorization middleware
│   │   ├── routes/      # API route definitions
│   │   ├── lib/         # Prisma client setup
│   │   ├── utils/       # Utility functions (e.g., Zod validation)
│   │   └── app.js       # Express app setup
│   └── test/            # API test and seed data (HTTP files)
├── frontend/            # React.js client application
│   ├── public/          # Static assets
│   ├── src/             # Frontend source code
│   │   ├── api/         # API service calls
│   │   ├── assets/      # Static assets (images, etc.)
│   │   ├── auth/        # Authentication context and protected routes
│   │   ├── components/  # Reusable UI components (Layout)
│   │   ├── pages/       # Application pages (Dashboard, Management, Prices, Reports, Login)
│   │   └── index.css    # Global styles and CSS variables
│   └── package.json     # Frontend dependencies and scripts
├── .env.example         # Example environment variables
├── .gitignore           # Git ignore rules
├── package.json         # Root package (if monorepo setup)
└── README.md            # Project documentation
```

## Deployment (Future Steps)

This application is designed for a simple VPS deployment. Future steps would involve:

-   **Nginx**: As a reverse proxy to serve the frontend and proxy API requests to the backend.
-   **PM2**: To manage the Node.js backend process, ensuring it runs continuously and restarts on crashes.
-   **Certbot**: For easily setting up SSL/TLS certificates (HTTPS) with Let's Encrypt.

*No Docker or Kubernetes is required for this deployment strategy.*

## Contributing

Feel free to fork the repository and contribute. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the LICENSE file for details. (Note: A LICENSE file is not yet included in this project.)
