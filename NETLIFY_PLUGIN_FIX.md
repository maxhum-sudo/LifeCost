# Fix Netlify Next.js Plugin Error

## Error
```
Plugin "@netlify/plugin-nextjs" failed
Error: Your publish directory cannot be the same as the base directory
```

## Root Cause
Netlify is trying to set a publish directory that conflicts with the Next.js plugin. The plugin handles the output directory automatically.

## Solution

### Step 1: Update Netlify UI Settings

Go to **Netlify Dashboard → Your Site → Site settings → Build & deploy → Build settings**:

**CRITICAL SETTINGS:**

1. **Base directory**: Leave **EMPTY** (or delete any value)
2. **Publish directory**: Leave **EMPTY** (or delete any value) 
3. **Build command**: `npm run build`
4. **Node version**: `18` (set in Environment variables)

**The Next.js plugin will handle the publish directory automatically - DO NOT set it manually!**

### Step 2: Verify Plugin Installation

Go to **Site settings → Plugins**:

- Ensure `@netlify/plugin-nextjs` is listed
- If not, it should install automatically on next deploy
- You can also manually install it from the Netlify UI

### Step 3: Clear Build Settings

If you previously set a publish directory in the UI:

1. Go to **Build & deploy → Build settings**
2. **Delete** the "Publish directory" field (make it empty)
3. **Delete** the "Base directory" field (make it empty)
4. Save changes

### Step 4: Redeploy

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Clear cache and deploy site"**
3. Watch the build logs

## Why This Happens

The `@netlify/plugin-nextjs` plugin:
- Automatically detects Next.js
- Handles the build output directory
- Sets up serverless functions for API routes
- Configures routing for App Router

If you manually set a publish directory, it conflicts with the plugin's automatic configuration.

## Verification

After fixing, your build logs should show:
- ✅ "Installing dependencies"
- ✅ "Running build command"
- ✅ "Next.js plugin detected"
- ✅ "Deploy site"

No errors about publish directory!

## Alternative: If Plugin Still Fails

If the plugin continues to fail, you can try removing it and using manual configuration:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
```

But this is NOT recommended - the plugin provides better Next.js support.

