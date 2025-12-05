# Quick Fix for Netlify "Page Not Found" Error

## The Issue
Netlify is showing "Page Not Found" because the publish directory is incorrectly configured for Next.js.

## Quick Fix Steps

### 1. Update Netlify Build Settings

Go to **Netlify Dashboard → Your Site → Site settings → Build & deploy → Build settings**:

**Change these settings:**

- **Build command**: `npm run build`
- **Publish directory**: **DELETE THIS** (leave it empty - the Next.js plugin handles it)
- **Node version**: Set to `18` (in Environment variables section)

### 2. Verify Environment Variables

Go to **Site settings → Environment variables**:

Make sure you have:
```
DATABASE_URL=your_production_database_url
```

### 3. Check Build Logs

1. Go to **Deploys** tab
2. Click on the latest deploy
3. Check the build logs for errors

**Look for:**
- ✅ "Build successful" 
- ❌ Any Prisma errors
- ❌ Missing DATABASE_URL errors
- ❌ Build failures

### 4. Redeploy

After fixing settings:
1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Clear cache and deploy site"**
3. Wait for build to complete

## What Changed

I updated `netlify.toml` to remove the `publish = ".next"` line because:
- The `@netlify/plugin-nextjs` plugin automatically handles the output directory
- Specifying `.next` manually can cause routing issues with Next.js App Router
- Next.js 14 on Netlify needs the plugin to handle server-side rendering correctly

## If Still Not Working

Check these in Netlify:

1. **Plugins**: Ensure `@netlify/plugin-nextjs` is installed
2. **Build logs**: Look for specific error messages
3. **Functions**: Next.js API routes should appear in Functions tab
4. **Deploy URL**: Try accessing `/api/quiz` to test API routes

## Test Your Deployment

After redeploy:
- Homepage: `https://your-site.netlify.app/`
- API test: `https://your-site.netlify.app/api/quiz`

If API works but homepage doesn't, it's a routing issue. If nothing works, check build logs.

