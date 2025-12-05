# GitHub Deployment Guide

## The Problem
Your zip file is 500MB because it includes `node_modules` (451MB) and `.next` (175MB). These should NEVER be uploaded to GitHub.

## Solution: Use Git (Recommended)

Git automatically excludes files in `.gitignore`, so your repository will be much smaller (~1-2MB).

### Step 1: Initialize Git Repository

```bash
cd /Users/max/Documents/LifeCost
git init
git add .
git commit -m "Initial commit"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (don't initialize with README)
3. Copy the repository URL

### Step 3: Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

**Result**: Only source code is uploaded (~1-2MB), not `node_modules` or `.next`

## Alternative: Create Zip Without Excluded Files

If you must use a zip file, create it using git archive:

```bash
# Create a zip excluding .gitignore files
git archive -o LifeCost-source.zip HEAD

# Or if git isn't initialized yet:
# Use this command to create zip excluding common folders:
zip -r LifeCost-source.zip . -x "node_modules/*" ".next/*" ".env*" "*.log" ".DS_Store"
```

## What Gets Uploaded to GitHub

✅ **Included** (~1-2MB):
- Source code (`app/`, `components/`, `lib/`, `config/`)
- Configuration files (`package.json`, `tsconfig.json`, etc.)
- Prisma schema (`prisma/schema.prisma`)

❌ **Excluded** (via `.gitignore`):
- `node_modules/` (451MB) - installed via `npm install`
- `.next/` (175MB) - built via `npm run build`
- `.env` files - use GitHub Secrets or Netlify env vars
- Build artifacts

## After Pushing to GitHub

1. **Connect Netlify to GitHub**:
   - Go to Netlify Dashboard
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select your repository
   - Netlify will automatically build and deploy

2. **Set Environment Variables**:
   - In Netlify: Site settings → Environment variables
   - Add `DATABASE_URL` with your production database URL

3. **Deploy!**
   - Netlify will run `npm install` and `npm run build` automatically
   - No need to upload `node_modules` - it's installed during build

## File Size Comparison

- **With node_modules**: ~500MB ❌
- **Without node_modules** (using git): ~1-2MB ✅
- **GitHub limit**: 100MB per file, but repositories can be larger

## Quick Commands

```bash
# Check what will be committed (excludes .gitignore files)
git status

# See repository size
du -sh .git

# Create clean zip for backup (excludes gitignored files)
git archive -o backup.zip HEAD
```

