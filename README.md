## How to Run

### Prerequisites

* Node.js v18+
* npm
* MongoDB connection string *(optional — without one, the server uses a temporary in-memory database)*

### 1. Clone the repository

```bash
git clone https://github.com/kanishkasahal24/LabLens.git
cd LabLens
```

### 2. Set up the server

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
MONGODB_URI=
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
```

Start the server:

```bash
npm run dev
```

### 3. Set up the client

Open a new terminal:

```bash
cd client
npm install
cp .env.example .env
```

Edit `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_DEMO_EMAIL=john@example.com
VITE_DEMO_PASSWORD=Password123!
```

Start the client:

```bash
npm run dev
```

### 4. Open the application

Open:

```text
http://localhost:5173
```

The server runs on:

```text
http://localhost:5000
```

If `MONGODB_URI` is left empty, LabLens automatically uses an in-memory MongoDB database for development.
