# System Jobs Setup Skill

## Purpose
Automatically verify and set up all system jobs in the database when they're missing or misconfigured.

## When to Use
- New cron job added to `convex/crons.ts` but not in database
- System job shows "paused" or "never run" incorrectly
- After database migration or reset
- When jobs are missing from System Jobs dashboard

## How It Works

### 1. Check for Migration Functions
First, check if there's a migration function in `convex/systemJobs.ts`:
```bash
grep -n "export const add.*Job = mutation" convex/systemJobs.ts
```

### 2. Run the Migration
Execute the migration using Convex CLI:
```bash
npx convex run systemJobs:addAIProxyOrchestratorJob
# Or for other jobs:
npx convex run systemJobs:addScreenshotCaptureJob
npx convex run systemJobs:addTrafficSyncJob
```

### 3. Verify Job Was Added
Check the systemJobs table:
```bash
npx convex run systemJobs:getByKey '{"jobKey": "ai-proxy-orchestrator"}'
```

### 4. Common Migration Functions

**Current migrations available:**
- `addAIProxyOrchestratorJob` - AI Proxy Orchestrator (every 5 min)
- `addScreenshotCaptureJob` - Device screenshot capture (every 30 sec)
- `addTrafficSyncJob` - Decodo traffic sync (every 15 min)
- `addSessionRenewalJob` - Proxy session renewal (every 10 min)

### 5. If No Migration Exists

Create the job manually using the pattern:
```typescript
// In convex/systemJobs.ts
export const addNewJob = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("systemJobs")
      .withIndex("by_job_key", (q) => q.eq("jobKey", "new-job-key"))
      .first();

    if (existing) {
      return { message: "Job already exists", jobId: existing._id };
    }

    const jobId = await ctx.db.insert("systemJobs", {
      jobKey: "new-job-key",
      name: "New Job Name",
      description: "Description here",
      category: "ai", // or "proxies", "accounts", etc.
      interval: { type: "minutes", value: 5 },
      enabled: true,
      totalRuns: 0,
      successCount: 0,
      errorCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { message: "Job added successfully", jobId };
  },
});
```

## Troubleshooting

### Job Shows "Paused" or "Never Run"
**Cause:** Job exists in `crons.ts` but not in database
**Fix:** Run migration function (step 2 above)

### Job Not Running
**Cause:** Job might be disabled
**Fix:**
```bash
# Enable the job
npx convex run systemJobs:enable '{"jobKey": "ai-proxy-orchestrator"}'
```

### Wrong Discord Channel
**Cause:** Job uses hardcoded webhook instead of discordSettings
**Fix:** Update job code to use `getDiscordWebhook()` helper

## Example Workflow

```bash
# 1. Check what's in crons.ts
grep "crons.interval" convex/crons.ts

# 2. List all jobs in database
npx convex run systemJobs:listAll

# 3. Compare and find missing jobs

# 4. Run migrations for missing jobs
npx convex run systemJobs:addAIProxyOrchestratorJob
npx convex run systemJobs:addTrafficSyncJob

# 5. Verify all jobs are running
# Go to /system-jobs in dashboard and check status
```

## Best Practices

1. **Always create migration function** when adding new cron job
2. **Test migration** on dev environment first
3. **Document the job** in systemJobs.ts comments
4. **Set proper category** for organization
5. **Enable by default** unless job requires setup first

## Related Files
- `convex/crons.ts` - Cron job definitions
- `convex/systemJobs.ts` - System jobs management + migrations
- `app/(protected)/system-jobs/page.tsx` - Dashboard UI
