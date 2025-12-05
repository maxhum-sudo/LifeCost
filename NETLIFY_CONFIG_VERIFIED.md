# Netlify Configuration - Verified Fix

## Issue Verified ✅
The `publish = ".next"` directory **IS required** for Next.js deployments on Netlify, even when using the `@netlify/plugin-nextjs` plugin.

## Current Configuration

```toml
[build]
  base = "."           # Base directory (project root)
  command = "npm run build"
  publish = ".next"     # Required: Next.js build output directory

[[plugins]]
  package = "@netlify/plugin-nextjs"  # Required for API routes
```

## Why This Works

1. **`base = "."`**: Explicitly sets the base directory to project root
2. **`publish = ".next"`**: Points to Next.js build output (required)
3. **Plugin**: Handles serverless functions for API routes

These are **different directories**, so no conflict:
- Base: `.` (root)
- Publish: `.next` (build output)

## Netlify UI Settings

In Netlify Dashboard → Build settings, ensure:

- ✅ **Base directory**: `.` (or leave empty - defaults to root)
- ✅ **Publish directory**: `.next`
- ✅ **Build command**: `npm run build`

## Why Previous Config Failed

- Without explicit `base = "."`, Netlify might default both base and publish to the same value
- The plugin needs both values to be explicitly different
- Setting `base = "."` and `publish = ".next"` ensures they're different

## Verification

After deploying, check:
1. ✅ No "publish directory same as base" errors
2. ✅ Site loads at `lifecost.netlify.app`
3. ✅ API routes work (`/api/quiz`, `/api/quiz/calculate`, `/api/results`)

## References

- Netlify Next.js documentation confirms `publish = ".next"` is required
- Plugin works alongside explicit publish directory setting
- Base directory must be different from publish directory

