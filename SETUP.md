# PostgreSQL Setup Guide for LifeCost Quiz App

## Option 1: Install PostgreSQL using Homebrew (Recommended for macOS)

### Step 1: Install Homebrew (if not already installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Step 2: Install PostgreSQL
```bash
brew install postgresql@15
```

### Step 3: Start PostgreSQL service
```bash
brew services start postgresql@15
```

### Step 4: Create the database
```bash
# Connect to PostgreSQL
psql postgres

# In the PostgreSQL prompt, create the database:
CREATE DATABASE lifecost;

# Create a user (optional, or use default 'postgres' user)
CREATE USER lifecost_user WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE lifecost TO lifecost_user;

# Exit PostgreSQL
\q
```

### Step 5: Update .env file
Update the `DATABASE_URL` in your `.env` file:
```
DATABASE_URL="postgresql://lifecost_user:your_password_here@localhost:5432/lifecost?schema=public"
```

Or if using the default postgres user:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/lifecost?schema=public"
```

---

## Option 2: Install PostgreSQL using Postgres.app (Easiest for macOS)

### Step 1: Download Postgres.app
Visit https://postgresapp.com/ and download the app.

### Step 2: Install and Launch
1. Drag Postgres.app to your Applications folder
2. Open Postgres.app
3. Click "Initialize" to create a new server

### Step 3: Create the database
1. Click "Open psql" in Postgres.app
2. Run:
```sql
CREATE DATABASE lifecost;
```

### Step 4: Update .env file
```
DATABASE_URL="postgresql://localhost:5432/lifecost?schema=public"
```

---

## Option 3: Use Docker (If you have Docker installed)

### Step 1: Run PostgreSQL in Docker
```bash
docker run --name lifecost-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=lifecost \
  -p 5432:5432 \
  -d postgres:15
```

### Step 2: Update .env file
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/lifecost?schema=public"
```

---

## After Installing PostgreSQL

### Step 1: Generate Prisma Client
```bash
npm run db:generate
```

### Step 2: Push the schema to the database
```bash
npm run db:push
```

### Step 3: Start the development server
```bash
npm run dev
```

---

## Troubleshooting

### If you get "connection refused" error:
- Make sure PostgreSQL is running: `brew services list` (for Homebrew) or check Postgres.app
- Verify the port (default is 5432)
- Check your DATABASE_URL format

### If you get authentication errors:
- Verify your username and password in the DATABASE_URL
- For Postgres.app, you might not need a password (try without password)
- For Homebrew installation, the default user is usually your macOS username

### To check if PostgreSQL is running:
```bash
# For Homebrew
brew services list

# For Postgres.app
# Check the app icon in your menu bar
```

### To connect and test:
```bash
psql -d lifecost
# Or
psql postgresql://localhost:5432/lifecost
```

