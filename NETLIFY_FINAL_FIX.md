# Final Netlify Fix - Step by Step

## The Problem
- Site shows blank page at lifecost.netlify.app
- Plugin error about publish directory
- You can't find site settings in Netlify UI

## Solution: Fix via Netlify UI OR netlify.toml

### Option 1: Fix via Netlify Dashboard (Recommended)

Even if you can't find "Site settings", try this:

1. **Go to your site**: https://app.netlify.com/sites/lifecost
   (Replace "lifecost" with your actual site name)

2. **Look for these options**:
   - Click on your site name/URL at the top
   - Look for a **"Configuration"** or **"Settings"** link
   - Or try the URL directly: `https://app.netlify.com/sites/YOUR_SITE_NAME/configuration/deploys`

3. **In Build settings**, set:
   - **Base directory**: `.` (just a dot)
   - **Publish directory**: LEAVE EMPTY (delete any value)
   - **Build command**: `npm run build`

4. **Save and redeploy**

### Option 2: Use netlify.toml (Already Done)

I've updated `netlify.toml` to set `base = "."` which should make it different from the publish directory (which the plugin handles).

**Push the changes:**
```bash
cd /Users/max/Documents/LifeCost
./force-push.sh
```

Then trigger a new deploy in Netlify.

### Option 3: Direct URL to Settings

Try going directly to:
```
https://app.netlify.com/sites/YOUR_SITE_NAME/configuration/deploys
```

Replace `YOUR_SITE_NAME` with your site name (check the URL when viewing your site).

## What Changed

- ✅ Re-added Next.js plugin (required for API routes)
- ✅ Set `base = "."` in netlify.toml
- ✅ Removed manual publish directory (plugin handles it)

## Verify It Works

After deploying, check:
1. Site loads: `https://lifecost.netlify.app`
2. No plugin errors in deploy logs
3. API routes work (quiz should function)

## If Still Not Working

Check the deploy logs in Netlify:
1. Go to **Deploys** tab
2. Click on the latest deploy
3. Look for errors in the build logs
4. Share the error message

