# Fix Netlify "Page Not Found" Error

## The Problem
You uploaded a zip file to GitHub, but Netlify needs to connect to a **Git repository**, not a zip file.

## Solution: Connect Netlify to GitHub Repository

### Step 1: Push Your Code to GitHub (Properly)

Your code needs to be in a Git repository on GitHub, not just a zip file.

**Option A: If you already pushed via git:**
- Your code should already be at: https://github.com/maxhum-sudo/LifeCost
- Skip to Step 2

**Option B: If you only uploaded a zip:**
1. Extract the zip file contents
2. Initialize git in that folder:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/maxhum-sudo/LifeCost.git
git push -u origin main
```

### Step 2: Connect Netlify to GitHub

1. Go to Netlify Dashboard: https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **"Deploy with GitHub"**
4. Authorize Netlify to access your GitHub
5. Select repository: **`maxhum-sudo/LifeCost`**
6. Click **"Deploy site"**

### Step 3: Configure Build Settings

Netlify should auto-detect Next.js, but verify these settings:

**In Netlify Dashboard → Site settings → Build & deploy:**

- **Build command**: `npm run build` (or leave default)
- **Publish directory**: Leave empty (Next.js plugin handles this)
- **Node version**: `18` (set in Environment variables)

### Step 4: Set Environment Variables (CRITICAL)

**In Netlify Dashboard → Site settings → Environment variables:**

Add:
```
DATABASE_URL=your_production_database_url_here
```

**Important**: Use a production database, not your local one!

### Step 5: Install Netlify Next.js Plugin

The `netlify.toml` already includes the plugin, but make sure it's installed:

1. Go to **Site settings → Plugins**
2. Ensure **"@netlify/plugin-nextjs"** is installed
3. If not, Netlify will install it automatically on first deploy

### Step 6: Redeploy

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Watch the build logs for any errors

## Common Issues & Fixes

### Issue: "Page Not Found" or 404 errors

**Causes:**
- Netlify connected to zip file instead of git repo
- Build failed silently
- Publish directory misconfigured

**Fix:**
- Make sure you connected to the **GitHub repository**, not uploaded a zip
- Check build logs in Netlify for errors
- Ensure `netlify.toml` doesn't specify publish directory (let plugin handle it)

### Issue: Build fails

**Check build logs for:**
- Missing `DATABASE_URL` environment variable
- Prisma client not generated
- Node version mismatch

**Fix:**
- Set `DATABASE_URL` in Netlify environment variables
- Ensure `package.json` has `"build": "prisma generate && next build"`
- Set Node version to 18 in environment variables

### Issue: Database connection errors

**Fix:**
- Make sure `DATABASE_URL` is set in Netlify environment variables
- Use a production database (not localhost)
- Ensure database allows connections from Netlify's IPs

## Verify Deployment

After deployment, check:
1. **Build logs**: Should show successful build
2. **Deploy URL**: Should show your app (not 404)
3. **Console errors**: Check browser console for runtime errors

## Quick Checklist

- [ ] Code is in GitHub repository (not just zip file)
- [ ] Netlify connected to GitHub repository
- [ ] `DATABASE_URL` set in Netlify environment variables
- [ ] Build command: `npm run build` (includes Prisma generate)
- [ ] Publish directory: Empty (handled by Next.js plugin)
- [ ] Node version: 18
- [ ] Build succeeded (check logs)
- [ ] Site is accessible (not 404)

