# Netlify Deployment Guide

## What to Deploy

Deploy the **entire project folder** (the `LifeCost` directory), but Netlify will automatically exclude files listed in `.gitignore`.

## Security Checklist

### ✅ Safe to Deploy (Already in .gitignore):
- Source code (`app/`, `components/`, `lib/`, `config/`)
- Configuration files (`package.json`, `tsconfig.json`, `next.config.js`, etc.)
- Prisma schema (`prisma/schema.prisma`) - schema is safe, database is not

### ❌ NEVER Deploy (Already excluded by .gitignore):
- `.env` files (contains database credentials)
- `node_modules/` (will be installed by Netlify)
- `.next/` build folder (will be generated)
- Database files or connection strings

## Netlify Setup Steps

### 1. Build Settings
In Netlify dashboard, configure:
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: 18.x or 20.x (set in Netlify environment variables)

### 2. Environment Variables (CRITICAL)
Go to **Site settings → Environment variables** and add:

```
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
```

**Important**: 
- Use Netlify's environment variables, NOT a `.env` file
- Never commit `.env` files to git
- Use different database credentials for production

### 3. Prisma Setup
Add a build command that generates Prisma client:

**Build command**: 
```bash
npm run db:generate && npm run build
```

Or add to `package.json` scripts:
```json
"build": "prisma generate && next build"
```

### 4. Database Migration
For production database, run migrations separately:
```bash
npx prisma migrate deploy
```

Or use Netlify's build command:
```bash
npm run db:generate && npx prisma migrate deploy && npm run build
```

## Files Structure for Deployment

```
LifeCost/
├── app/                    ✅ Deploy
├── components/             ✅ Deploy
├── config/                 ✅ Deploy (quiz-config.json is safe)
├── lib/                    ✅ Deploy
├── prisma/
│   └── schema.prisma      ✅ Deploy (schema only, not database)
├── package.json            ✅ Deploy
├── package-lock.json       ✅ Deploy
├── tsconfig.json           ✅ Deploy
├── next.config.js          ✅ Deploy
├── tailwind.config.ts      ✅ Deploy
├── postcss.config.js       ✅ Deploy
├── .gitignore              ✅ Deploy
└── .env                    ❌ NEVER deploy (use Netlify env vars)
```

## Quick Deploy Checklist

1. ✅ Ensure `.env` is in `.gitignore` (already done)
2. ✅ Commit all code to git repository
3. ✅ Connect Netlify to your git repository
4. ✅ Set `DATABASE_URL` in Netlify environment variables
5. ✅ Configure build command: `npm run db:generate && npm run build`
6. ✅ Set publish directory: `.next`
7. ✅ Deploy!

## Security Best Practices

1. **Never commit `.env` files** - Use Netlify environment variables
2. **Use different database** for production (don't use local dev database)
3. **Rotate credentials** regularly
4. **Enable Netlify's security headers** in `netlify.toml` (optional)
5. **Review what's in your repository** before deploying

## Optional: Create netlify.toml

Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run db:generate && npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "18"
```

