# Onboarding Loop Fix

## The Problem

You're being redirected to onboarding after deployment because:

**Your development and production Convex databases are separate!**

- **Development database** (local): Has your profile with `setupCompleted: true` ✓
- **Production database** (deployed): Has NO profile data ✗

When you visit the production URL, it queries the production database which doesn't have your profile.

## The Solution

You have 3 options:

### Option 1: Complete Setup on Production (Recommended for New Users)
Just go through the setup wizard once on your production URL. This will create your profile in the production database.

**Steps:**
1. Visit your production URL
2. Complete the onboarding flow
3. Done! Your profile is now in the production database

### Option 2: Use Development Database for Production (Quick Fix)
If you want to use your dev database for production temporarily:

1. Update your Vercel environment variables:
   - Set `NEXT_PUBLIC_CONVEX_URL` to: `https://harmless-lobster-961.convex.cloud`

2. Redeploy on Vercel

**Warning:** This is NOT recommended for long-term use. Dev and prod should be separate.

### Option 3: Deploy a Production Convex Database (Proper Setup)
Set up a proper production Convex deployment:

1. Run: `npx convex deploy`
2. This creates a production Convex deployment
3. Copy the production URL
4. Update Vercel environment variables with the production Convex URL
5. Re-run setup on production

## Debug Page

I've created a debug page to help you understand what's happening:

Visit: `/debug` on both your local and production URLs

This page shows:
- Authentication status
- Profile existence
- Setup completion status
- Environment configuration

## Files Changed

1. **app/(auth)/setup/page.tsx** - Added redirect protection (prevents re-showing setup if already completed)
2. **app/page.tsx** - Added console logging for debugging
3. **app/debug/page.tsx** - NEW: Debug information page
4. **convex/debug.ts** - NEW: Debug query for troubleshooting

## Next Steps

1. Visit `/debug` on your production URL to confirm the issue
2. Choose one of the 3 options above
3. If you choose Option 1, just complete the setup wizard once
4. The issue will be resolved!

## Why This Happened

When you:
1. Ran `npm run dev` - Used development Convex database
2. Completed onboarding locally - Saved to development database
3. Deployed to Vercel - Production uses a different Convex database
4. Visited production URL - No profile found in production database
5. Got redirected to onboarding - Because `setupCompleted` is `false` (no profile exists)

This is actually **correct behavior** - dev and production should be separate!
