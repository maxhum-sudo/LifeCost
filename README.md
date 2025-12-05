# LifeCost Quiz App

A Next.js quiz application that calculates annual cost of living estimates based on user lifestyle choices.

## Features

- Interactive quiz with multiple choice and slider questions
- Conditional cost calculations based on location and preferences
- Housing cost calculator with mortgage calculations (25 years, 4% interest)
- Transportation cost calculator with usage-based adjustments
- Visual cost breakdown with pie charts
- Pre-tax income calculator (30% flat tax)
- Housing costs comparison table

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd LifeCost
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and add your DATABASE_URL
```

4. Set up the database:
```bash
npm run db:generate
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Configuration

Edit `config/quiz-config.json` to modify:
- Questions and options
- Cost values
- Conditional rules
- Location pricing
- Housing types and square footage

## Deployment

See `NETLIFY_DEPLOY.md` for Netlify deployment instructions.

## Project Structure

```
LifeCost/
├── app/              # Next.js app router pages and API routes
├── components/       # React components
├── config/          # Quiz configuration (JSON)
├── lib/             # Utility functions and quiz engine
├── prisma/          # Database schema
└── public/          # Static assets
```

## License

Private project

